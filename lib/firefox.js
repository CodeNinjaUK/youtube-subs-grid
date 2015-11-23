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

		worker.port.on('setStorage', handleSetStorage);
        worker.port.on('getStorage', handleGetStorage);

		worker.on('detach', function () {
			handleDetach(this);
		});
    }
});

function handleSetStorage(payload)
{
	storageObject.storage[payload.key] = payload.value;

    returnStorage(payload);
};

function handleGetStorage(payload)
{
    returnStorage(payload);
}

// I feel like there might be a better way to do this?
// Can we bind responses like this to a specific worker?
// Maybe just wait for Mozillas WebExtensions project..
function returnStorage(payload)
{
    workers.forEach(function(worker)
    {
        worker.port.emit('executeCallback', {uuid: payload.uuid, data: storageObject.storage});
    });
}

function handleDetach(worker)
{
	var index = workers.indexOf(worker);
	if(index != -1)
	{
		workers.splice(index, 1);
	}
}