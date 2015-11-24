YTG = (function (self) {

	self.currentPage = '';

	self.ytInit = function()
	{
		YTG.platform.getStorageItem('watchHistory', function(data)
		{
			YTG.history.setHistory(data.watchHistory);
		});
	};

	self.gridInit = function(isClassicGridMode)
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
				YTG.grid.setup(isClassicGridMode);
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

            YTG.platform.getStorageItem('classicGridMode', function(data)
            {
                var isGridable = YTG.grid.isGridable(url);

                if (YTG.grid.isSubsSection(url))
                {
                    self.buildGridNavigation(data.classicGridMode, isGridable);

                    if (isGridable)
                    {
                        self.gridInit(data.classicGridMode);
                    }
                }
            });
		}

		self.currentPage = url;
	};

    self.buildGridNavigation = function(isClassicGridMode, isGridable)
    {
        // This is pretty horrible code and will probably break at the earliest opportunity. The better
        // alternative might be to replace this markup with my own selector entirely instead of basing it on theirs.

        var subsGridLink = $('.menu-container.shelf-title-cell .feed-item-action-menu li:has(a)').first().clone();
        var subsGridButton = $('.menu-container.shelf-title-cell .feed-item-action-menu li:has(button)').first().clone();

        var selectors = {
            subsGridSelector: subsGridLink.find('a').attr('href', '/feed/subscriptions?flow=1').parent().clone(),
            ytGridView: subsGridLink.find('a').attr('href', '/feed/subscriptions?flow=1').parent().clone(),
            ytListView: subsGridLink.find('a').attr('href', '/feed/subscriptions?flow=2').parent().clone()
        };

        if (isClassicGridMode)
        {
            selectors.subsGridSelector = subsGridButton.clone();
        }
        else
        {
            if (isGridable)
            {
                selectors.ytGridView = subsGridButton.clone();
            }
            else
            {
                selectors.ytListView = subsGridButton.clone();
            }
        }

        selectors.subsGridSelector.find('a,button').attr('title', 'Classic subs grid');
        selectors.subsGridSelector.find('a,button').attr('data-tooltip-text', 'Classic subs grid');
        selectors.subsGridSelector.find('.yt-uix-button-icon').removeClass().addClass('yt-uix-button-icon yt-sprite ytg-subs-grid-selector-icon');

        selectors.ytGridView.find('a,button').attr('title', 'Grid');
        selectors.ytGridView.find('a,button').attr('data-tooltip-text', 'Grid');
        selectors.ytGridView.find('.yt-uix-button-icon').removeClass().addClass('yt-uix-button-icon yt-uix-button-icon-view-module yt-sprite');

        selectors.ytListView.find('a,button').attr('title', 'List');
        selectors.ytListView.find('a,button').attr('data-tooltip-text', 'List');
        selectors.ytListView.find('.yt-uix-button-icon').removeClass().addClass('t-uix-button-icon yt-uix-button-icon-view-list yt-sprite');

        $('.menu-container.shelf-title-cell .feed-item-action-menu ul').empty().prepend(selectors.subsGridSelector, selectors.ytGridView, selectors.ytListView);

        $('.menu-container.shelf-title-cell .feed-item-action-menu a').on('click', function(e)
        {
            e.preventDefault();

            var classicGridMode = !!$(this).find('.ytg-subs-grid-selector-icon').length;
            var link = $(this).attr('href');

            YTG.platform.setStorageItem('classicGridMode', classicGridMode, function(data)
            {
                window.location.href = link;
            });
        });
    };

	self.fireEvent = function(elem, eventType)
	{
		var evObj = document.createEvent('Events');
		evObj.initEvent(eventType, true, false);

		elem.dispatchEvent(evObj);
	}

	return self;
}(YTG || {}));