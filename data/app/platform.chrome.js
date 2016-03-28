var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

	platform.getStorageItem = function(item, callback)
	{
		chrome.storage.sync.get(item, callback);
	};

    platform.getLocalStorageItem = function(item, callback)
    {
        chrome.storage.local.get(item, callback);
    };

	platform.setStorageItem = function(object, callback)
	{
		chrome.storage.sync.set(object, callback);
	};

    platform.setLocalStorageItem = function(object, callback)
    {
        chrome.storage.local.set(object, callback);
    };

    platform.getControlMarkup = function(callback)
    {
        $.ajax({
            url: chrome.extension.getURL("data/assets/control.html"),
            dataType: "html",
            success: callback
        });
    };

    platform.broadcastVideoWatched = function()
    {
        chrome.runtime.sendMessage({videoWatched: true});
    };

	return platform;
}(YTG, YTG.platform || {}));

chrome.runtime.onMessage.addListener(function(request) {

    if (request.videoHistoryUpdated)
    {
        YTG.grid.updateWatchedVideos();
    }

});