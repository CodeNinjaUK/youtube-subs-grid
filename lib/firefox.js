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
	contentStyleFile: [
		self.data.url("assets/youtube.css"),
		self.data.url("assets/grid.css")
	],
	'contentScriptWhen' : 'start',
	onAttach: function(worker)
	{
		workers.push(worker);

		worker.port.on('storage', handleStorage);
		worker.port.emit("storageObject", storageObject.storage);

		worker.on('detach', function () {
			handleDetach(this);
		});
  }
});

function handleStorage(storage)
{
	storageObject.storage = storage;

	// Send out the good stuff.
	workers.forEach(function(worker)
	{
		worker.port.emit("storageObject", storageObject.storage);
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