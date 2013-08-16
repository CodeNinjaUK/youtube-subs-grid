var YTG = YTG || {};

YTG.history = (function (YTG, history) {

	history.setHistory = function(watchHistory)
	{
		history.watchHistory = watchHistory || [];
	};

	history.addToHistory = function(videoId)
	{
		if (!history.videoIsInHistory(videoId))
		{
			history.watchHistory.push(videoId);

			YTG.platform.setStorageItem('watchHistory', history.watchHistory);

			if (YTG.subscritpions)
			{
				YTG.subscritpions.markVideos();
			}
		}
	};

	history.addToHistoryHandler = function(e)
	{
		var videoId = $(this).parents('[data-context-item-id]').attr('data-context-item-id');
		history.addToHistory(videoId);
	};

	history.videoIsInHistory = function(videoId)
	{
		if (history.watchHistory.indexOf(videoId) !== -1)
		{
			return true;
		}

		return false;
	};

	return history;
}(YTG, YTG.history || {}));