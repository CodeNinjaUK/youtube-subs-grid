YTG = (function (self) {

	self.currentPage = '';

	self.ytInit = function()
	{
		YTG.platform.getStorageItem('watchHistory', function(data)
		{
			YTG.history.setHistory(data.watchHistory);
		});
	};

	self.gridInit = function()
	{
		// Are we on the subs page and haven't previous successfully initiated the grid?
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
                self.gridInit();
			}
		}

		self.currentPage = url;
	};

	self.fireEvent = function(elem, eventType)
	{
		var evObj = document.createEvent('Events');
		evObj.initEvent(eventType, true, false);

		elem.dispatchEvent(evObj);
	}

	return self;
}(YTG || {}));