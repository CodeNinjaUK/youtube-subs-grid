var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

	platform.getStorageItem = function(item, callback)
	{
		console.log(item);
		callback({});
	};

	platform.setStorageItem = function(key, data)
	{
		console.log(key, data);
	};

	return platform;
}(YTG, YTG.platform || {}));