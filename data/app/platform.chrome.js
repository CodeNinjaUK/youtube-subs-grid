var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

	platform.getStorageItem = function(item, callback)
	{
		chrome.storage.sync.get(item, callback);
	};

	platform.setStorageItem = function(key, data)
	{
		var object = {};
		object[key] = data;
		chrome.storage.sync.set(object);
	};

	return platform;
}(YTG, YTG.platform || {}));