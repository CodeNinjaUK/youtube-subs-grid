var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

    platform.callbacks = [];

	platform.getStorageItem = function(key, callback)
	{
        var callbackName = 'storageGetCallback' + Math.random();

        var payload = {key: key, callbackName: callbackName};

        // Listen for the callback from firefox.js
        self.port.once(callbackName, callback);

        self.port.emit("getStorage", payload);
	};

	platform.setStorageItem = function(key, value, callback)
	{
        var payload = {key: key, value: value, callbackName: null};

		if (typeof(callback) == 'function')
        {
            payload.callbackName = 'storageSetCallback' + Math.random();
            self.port.once(payload.callbackName, callback);
        }

		self.port.emit("setStorage", payload);
	};

    platform.broadcastVideoWatched = function()
    {
        self.port.emit("videoWatched");
    };

    platform.getControlMarkup = function(callback)
    {
        var callbackName = 'controlMarkupCallback' + Math.random();

        self.port.once(callbackName, callback);

        self.port.emit("getControlMarkup", callbackName);
    };

	return platform;
}(YTG, YTG.platform || {}));

self.port.on('videoHistoryUpdated', function()
{
    YTG.grid.updateWatchedVideos();
});