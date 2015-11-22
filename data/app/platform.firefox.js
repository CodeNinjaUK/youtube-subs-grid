var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

	platform.getStorageItem = function(key, callback)
	{
		callback(platform.storage);
	};

	platform.setStorageItem = function(key, value)
	{
		platform.storage[key] = value;
		self.port.emit("storage", platform.storage);
	};

	return platform;
}(YTG, YTG.platform || {}));

self.port.on('storageObject', function(storageObject)
{
    YTG.platform.storage = storageObject;
});