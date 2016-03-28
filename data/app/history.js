var YTG = YTG || {};

YTG.history = (function (YTG, history) {

	// We don't have unlimited storage
	// so there needs to be a limit on
	// how big this history is.
	history.maxVideoHistorySyncSlabSize = 200;
	history.maxVideoHistorySyncSlabs = 10;
	history.maxVideoHistoryCount = 5000;

    history.watchHistory = [];
	history.watchHistoryIndex = [];
	history.extendedWatchHistory = [];

	history.historySlabKeys = [];
	for (var i = 0;i < history.maxVideoHistorySyncSlabs; i++)
	{
		history.historySlabKeys.push('watchHistorySlab_' + i);
	}


	history.populateHistory = function(callback)
	{
		YTG.platform.getStorageItem(YTG.history.historySlabKeys, function (syncData) {
			YTG.platform.getLocalStorageItem('extendedWatchHistory', function (localData) {

				YTG.history.setHistory(syncData, localData.extendedWatchHistory);

				callback();
			});
		});
	};

	history.setHistory = function(watchHistory, extendedWatchHistory)
	{
        extendedWatchHistory = extendedWatchHistory || [];

		history.watchHistory = [];

		for (var slabName in watchHistory)
		{
			history.watchHistory = history.watchHistory.concat(watchHistory[slabName]);
		}

		history.watchHistory = history.watchHistory.concat(extendedWatchHistory);

		//YTG.history.reOrderHistory();

		YTG.history.reIndexHistory();
	};

	history.recordVideo = function(videoId)
	{
		history.watchHistory.push({v: videoId, d: Math.ceil(Date.now())});
		history.watchHistoryIndex.push(videoId);
	};

	history.addToHistory = function(videoId)
	{
		if (!history.videoIsInHistory(videoId))
		{
			history.recordVideo(videoId);
			history.saveHistory();
		}
	};

	history.massAddToHistory = function(videoIdArray)
	{
		videoIdArray.forEach(function(videoId)
		{
			history.recordVideo(videoId);
		});

		history.saveHistory();
	};

	history.saveHistory = function()
	{
		YTG.history.cullHistory();

		var syncCount = YTG.history.maxVideoHistorySyncSlabSize * YTG.history.maxVideoHistorySyncSlabs;

		var watchHistorySyncRaw = YTG.history.watchHistory.slice(0, syncCount);
		var watchHistoryLocal = YTG.history.watchHistory.slice(syncCount);

		var slabs = [];
		while (watchHistorySyncRaw.length > 0) {
			slabs.push(watchHistorySyncRaw.splice(0, YTG.history.maxVideoHistorySyncSlabSize));
		}

		var watchHistorySync = {};
		history.historySlabKeys.forEach(function(slabKey, i) {
			watchHistorySync[slabKey] = slabs[i] || [];
		});

		YTG.platform.setStorageItem(watchHistorySync, function()
		{
			YTG.platform.setLocalStorageItem({ extendedWatchHistory : watchHistoryLocal }, function()
			{
				YTG.platform.broadcastVideoWatched();
			});
		});
	};

	history.massRemoveFromHistory = function(videoIdArray)
	{
		for(var i = 0; i < history.watchHistory.length; i++) {
			if(videoIdArray.indexOf(history.watchHistory[i].v) !== -1) {
				history.watchHistory.splice(i, 1);
			}
		}

		// Don't trigger subs update for this save.
		history.saveHistory();
	};

    history.resetWatchHistory = function()
    {
        history.watchHistory = [];
        history.extendedWatchHistory = [];
		history.watchHistoryIndex = [];
        history.saveHistory();
    };

    history.resetWatchHistoryHandler = function()
    {
       if (window.confirm('Are you sure you want to reset your Subs Grid watch history? This cannot be undone.'))
       {
           history.resetWatchHistory();
       }
    };

	// DEPRECIATED
	history.updateSubscriptions = function()
	{
		if (YTG.grid && YTG.grid.isGridable(window.location.href))
		{
			YTG.grid.markVideos();
		}
	};

	history.cullHistory = function()
	{
		YTG.history.reOrderHistory();

		YTG.history.watchHistory = YTG.history.watchHistory.slice(0, YTG.history.maxVideoHistoryCount);
	};

	history.reOrderHistory = function()
	{
		// http://stackoverflow.com/a/1129270/615519
		YTG.history.watchHistory = YTG.history.watchHistory.sort(function(a,b) {
			return (a.d - b.d);// ? 1 : ((b.d < a.d) ? -1 : 0);
		});

		YTG.history.watchHistory.reverse();
	};

	history.reIndexHistory = function()
	{
		// Re-index!
		YTG.history.watchHistoryIndex = [];
		YTG.history.watchHistory.forEach(function(video)
		{
			YTG.history.watchHistoryIndex.push(video.v);
		});
	};

	history.removeFromHistory = function(videoId)
	{
		if (history.videoIsInHistory(videoId))
		{
			for(var i = 0; i < history.watchHistory.length; i++) {
				if(history.watchHistory[i].v == videoId) {
					history.watchHistory.splice(i, 1);
					break;
				}
			}

			history.saveHistory();
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
		var videoId = $(this).attr('data-video-ids');

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
        return !$(target).hasClass('addto-button') && !$(target).parents('button.addto-button').length && !$(target).hasClass('yt-user-name');
    };


	history.videoIsInHistory = function(videoId)
	{
		return history.watchHistoryIndex.indexOf(videoId) !== -1;
	};

	return history;
}(YTG, YTG.history || {}));