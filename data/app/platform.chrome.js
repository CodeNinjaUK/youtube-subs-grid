var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

	platform.getStorageItem = function(item, callback)
	{
		chrome.storage.sync.get(item, callback);
	};

	platform.setStorageItem = function(key, data, callback)
	{
		var object = {};
		object[key] = data;
		chrome.storage.sync.set(object, callback);
	};

	return platform;
}(YTG, YTG.platform || {}));