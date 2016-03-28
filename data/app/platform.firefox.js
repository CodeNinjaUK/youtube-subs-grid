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

    platform.getLocalStorageItem = function(key, callback)
    {
        platform.getStorageItem(key, callback);
    };

	platform.setStorageItem = function(object, callback)
	{
        object.callbackName = null;

		if (typeof(callback) == 'function')
        {
            object.callbackName = 'storageSetCallback' + Math.random();
            self.port.once(object.callbackName, callback);
        }

		self.port.emit("setStorage", object);
	};

    platform.setLocalStorageItem = function(object, callback)
    {
        platform.setStorageItem(object, callback);
    };

    platform.removeStorageItem = function(keys, callback)
    {
        var payload = {keys: keys};

        payload.callbackName = null;

        if (typeof(callback) == 'function')
        {
            payload.callbackName = 'storageRemoveCallback' + Math.random();
            self.port.once(payload.callbackName, callback);
        }

        self.port.emit("removeStorage", payload);
    };

    platform.removeLocalStorageItem = function(keys, callback)
    {
        platform.removeStorageItem(keys, callback);
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