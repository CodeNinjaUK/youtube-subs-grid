var pageMod = require("sdk/page-mod");
// Import the self API
var self = require("sdk/self");
var storageObject = require("sdk/simple-storage");

var workers = [];

pageMod.PageMod({
	include: "*.youtube.com",
	contentScriptFile: [
		self.data.url("assets/jquery.min.js"),
		self.data.url("app/platform.firefox.js"),
		self.data.url("app/grid.js"),
		self.data.url("app/history.js"),
		self.data.url("app/ytg.js"),
		self.data.url("app/main.js")
	],
	contentStyleFile: self.data.url("assets/youtube.css"),
	'contentScriptWhen' : 'start',
	onAttach: function(worker)
	{
        workers.push(worker);

        worker.on('detach', function () {
            handleDetach(this);
        });


        worker.port.on("getControlMarkup", function(callbackName){

            worker.port.emit(callbackName, self.data.load('assets/control.html'));
        });

		worker.port.on('setStorage', function(payload)
        {
            var callbackName = payload.callbackName;
            delete payload.callbackName;

            for (var key in payload)
            {
                if (payload.hasOwnProperty(key)) {
                    storageObject.storage[key] = payload[key];
                }
            }

            //storageObject.storage[payload.key] = payload.value;

            if (callbackName)
            {
                worker.port.emit(callbackName);
            }
        });

        worker.port.on('getStorage', function(payload)
        {
            var storageKeys = payload.key;
            var defaultValues = {};

            // This is a dictionary/hash rather than a simple array.
            if (typeof(storageKeys) === 'object' && Array.isArray(storageKeys) == false)
            {
                defaultValues = storageKeys;
                storageKeys = Object.keys(storageKeys);    
            }
            else // String or simple array, this works for either.
            {
                storageKeys = [].concat(storageKeys);
            }

            var response = {};

            storageKeys.forEach(function(key)
            {
                var value = storageObject.storage[key];
                
                if (value == undefined && defaultValues[key])
                {
                    value = defaultValues[key];
                }

                response[key] = value;
            });

            worker.port.emit(payload.callbackName, response);
        });

        worker.port.on('removeStorage', function(payload)
        {
            var storageKeys = payload.keys;

            // String or simple array, this works for either.
            storageKeys = [].concat(storageKeys);

            storageKeys.forEach(function(key)
            {
                delete storageObject.storage[key];
            });

            if (payload.callbackName)
            {
                worker.port.emit(callbackName);
            }
        });

        worker.port.on('videoWatched', function()
        {
            // Broadcast the watched event to those who are interested.
            workers.forEach(function(worker)
            {
                worker.port.emit('videoHistoryUpdated');
            });

        });
    }
});

function handleDetach(worker)
{
    var index = workers.indexOf(worker);
    if(index != -1)
    {
        workers.splice(index, 1);
    }
}