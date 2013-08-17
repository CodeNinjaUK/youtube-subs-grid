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

			if (YTG.subscriptions)
			{
				YTG.subscriptions.markVideos();
			}
		}
	};

	history.removeFromHistory = function(videoId)
	{
		var index = history.watchHistory.indexOf(videoId);
		removed = history.watchHistory.splice(index, 1);
		YTG.platform.setStorageItem('watchHistory', history.watchHistory);

		if (YTG.subscriptions)
		{
			YTG.subscriptions.markVideos();
		}
	};

	history.addToHistoryHandler = function(e)
	{
		// If we clicked on the watch later button we dont want to
		// mark it as watched now, do we?

		if (history.isValidHistoryTarget(e.target))
		{
			var videoId = $(this).parents('[data-context-item-id]').attr('data-context-item-id');
			history.addToHistory(videoId);
		}
	};

	history.toggleWatchedHandler = function(e)
	{
		var videoId = $(this).parents('[data-context-item-id]').attr('data-context-item-id');
		
		if (history.videoIsInHistory(videoId))
		{
			history.removeFromHistory(videoId);
			return;
		}

		history.addToHistory(videoId);
	};

	history.isValidHistoryTarget = function(target)
	{
		// So pretty.
		// This is because FF and Chrome have different ideas about what the target actually is.
		if (!$(target).hasClass('addto-button') && !$(target).parents('button.addto-button').length && !$(target).hasClass('yt-user-name'))
		{
			return true;
		}

		return false;
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