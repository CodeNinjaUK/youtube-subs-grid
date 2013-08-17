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
		e.preventDefault();

		// If we clicked on the watch later button we dont want to
		// mark it as watched now, do we?

		// The double test is because FF and Chrome have different ideas about what the target 
		// actually is.
		if (!$(e.target).hasClass('addto-button') && !$(e.target).parents('button.addto-button').length)
		{
			var videoId = $(this).parents('[data-context-item-id]').attr('data-context-item-id');
			history.addToHistory(videoId);
		}
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