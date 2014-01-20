YTG = (function (self) {

	self.currentPage = '';

	self.ytInit = function()
	{
		YTG.platform.getStorageItem('watchHistory', function(data)
		{
			YTG.history.setHistory(data.watchHistory);

			// Record all links leading to videos.
			$('#page').on('click', '[data-context-item-type="video"] a:not(.ytg-channel-link)', YTG.history.addToHistoryHandler);

			// Is this a video watch page? Make sure we store that in the history
			// in case the user came from an external source.
			if ($('meta[itemprop="videoId"]').length)
			{
				YTG.history.addToHistory($('meta[itemprop="videoId"]').attr('content'));
			}
		});
	};

	self.gridInit = function()
	{
		// Are we on the subs page and havn't previous successfully initiated the grid?
		if (!$('body').hasClass('ytg-gridable'))
		{
			$('body').addClass('ytg-gridable');

			// selector fun - yolo
			$('#page').on('click', '.ytg-mark-watched:not(.watched .ytg-mark-watched)', YTG.history.toggleWatchedHandler);

			YTG.platform.getStorageItem('hideVideos', function(data)
			{
				YTG.grid.setHideVideos(data.hideVideos);
				YTG.grid.setup();
			});

			/* CSS fix for the subs page */
			$('.branded-page-v2-primary-col').addClass('clearfix');
		}

		return false;
	};

	self.checkPage = function(url)
	{
		if (self.currentPage != url)
		{
			// Remove it until we've checked and can add it back in.
			$('body').removeClass('ytg-gridable');

			if (YTG.grid.isGridable(url))
			{
				// Drop in to a loop until the page has finished loading.
				var loopId = window.setInterval(function()
				{
					if ($('#progress').length === 0)
					{
						self.gridInit();
						window.clearInterval(loopId);
					}
				});
			}
		}

		self.currentPage = url;
	};

	return self;
}(YTG || {}));