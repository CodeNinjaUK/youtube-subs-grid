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
            storageObject.storage[payload.key] = payload.value;

            if (payload.callbackName)
            {
                worker.port.emit(payload.callbackName);
            }
        });

        worker.port.on('getStorage', function(payload)
        {
            var response = {};
            response[payload.key] = storageObject.storage[payload.key];

            worker.port.emit(payload.callbackName, response);
        });

        worker.port.on('videoWatched', function()
        {
            // Broadcast the watched event to those who are interested.
            workers.forEach(function(worker)
            {
                console.log(worker);
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