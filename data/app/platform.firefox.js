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

	return platform;
}(YTG, YTG.platform || {}));