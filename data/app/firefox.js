var pageMod = require("sdk/page-mod");
// Import the self API
var self = require("sdk/self");
var storageObject = require("sdk/simple-storage");

// Create a page mod
// It will run a script whenever a ".org" URL is loaded
// The script replaces the page contents with a message
pageMod.PageMod({
	include: ["http://www.youtube.com/feed/*", "https://www.youtube.com/feed/*"],
	contentStyleFile: self.data.url("assets/youtube.css")
});

// Include the grid-only CSS as well so we don't get the flicker.
pageMod.PageMod({
	include: ["http://www.youtube.com/feed/subscriptions", "https://www.youtube.com/feed/subscriptions"],
	contentStyleFile: self.data.url("assets/youtube.css")
});

var workers = [];

pageMod.PageMod({
	include: "*.youtube.com",
	contentScriptFile: [
		self.data.url("assets/jquery.min.js"),
		self.data.url("app/platform.firefox.js"),
		self.data.url("app/grid.js"),
		self.data.url("app/history.js"),
		self.data.url("app/main.js")
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