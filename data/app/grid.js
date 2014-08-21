var YTG = YTG || {};

YTG.grid = (function (YTG, grid) {
	grid.setup = function()
	{
		YTG.grid.markYTVideos();
		YTG.grid.markVideos();


		// Monitor the page contstant for changes
		YTG.grid.timedVideoMark(500, true);


		// Append our show/hide toggle
		$('#channel-navigation-menu').append('<li><p> Watched videos: <span class="yt-uix-button-group vm-view-toggle" data-button-toggle-group="required"><button aria-label="Show watched videos" type="button" class="start view-toggle-button yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-empty" data-button-toggle="true" role="button" id="showVideos"><span class="yt-uix-button-content">Show</span></button></span><span class="yt-uix-button-group vm-view-toggle" data-button-toggle-group="required"><button aria-label="Hide watched videos" type="button" class="end view-toggle-button yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-empty" data-button-toggle="true" role="button" id="hideVideos"><span class="yt-uix-button-content">Hide</span></button></p></li>');

		$('#channel-navigation-menu').on('click', '.view-toggle-button', YTG.grid.toggleVideos);

		YTG.grid.setViewToggle();

		// Add mark all videos as watched button.
		$('#channel-navigation-menu').append('<li><p><button aria-label="Show watched videos" type="button" class="yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-empty" role="button" id="markAllVideos"><span class="yt-uix-button-content">Mark all videos as watched</span></button></p></li>');

		$('#channel-navigation-menu').on('click', '#markAllVideos', YTG.grid.markAllVisibleVideos);


		// Load more videos, then load some more
		$('.load-more-button').trigger('click');

		setTimeout(function()
		{
			$('.load-more-button').trigger('click');
		}, 2000);

	};

	grid.markAllVisibleVideos = function()
	{
		var videos = $('.feed-item-container');

		var videoArray = [];
		videos.each(function(idx, video)
		{
			var videoId = $(video).find('.addto-watch-later-button').attr('data-video-ids');

			videoArray.push(videoId);
		});

		YTG.history.massAddToHistory(videoArray);
	};

	// Get all videos marked as watched on the
	// YT side of things, remove them from our
	// internal history
	grid.markYTVideos = function()
	{
		var videos = [];
		$('.watched').each(function(idx, elm)
		{
			var videoId = $(elm).parents('.feed-item-container').find('.addto-watch-later-button').attr('data-video-ids');
			videos.push(videoId);
		});

		YTG.history.massRemoveFromHistory(videos);
	};

	grid.markVideos = function()
	{
		var videos = $('.feed-item-container');

		videos.each(function(idx, video)
		{
			grid.cleanVideo(video);
			grid.markVideo(video);
		});
	};

	grid.markVideo = function(videoElm)
	{
		var videoId = $(videoElm).find('.addto-watch-later-button').attr('data-video-ids');

		var videoLinkElm = $(videoElm).find('.yt-lockup-thumbnail a.ux-thumb-wrap');

		if (!videoLinkElm.hasClass('ytg-watched') && YTG.history.videoIsInHistory(videoId))
		{
			videoLinkElm.addClass('ytg-watched');
			videoLinkElm.prepend('<div class="watched-badge">WATCHED</div>');
			videoLinkElm.find('.ytg-mark-watched').attr('data-tooltip-text', 'Mark as unwatched');
		}
		else if(videoLinkElm.hasClass('ytg-watched') && !YTG.history.videoIsInHistory(videoId))
		{
			videoLinkElm.removeClass('ytg-watched');
			videoLinkElm.find('.watched-message').remove();
			videoLinkElm.find('.ytg-mark-watched').attr('data-tooltip-text', 'Mark as watched');
		}

		// Can't unmark these ones.
		if (videoLinkElm.hasClass('watched'))
		{
			videoLinkElm.find('.ytg-mark-watched').attr('data-tooltip-text', 'Cannot changed watched status');
		}

		if (videoLinkElm.hasClass('ytg-watched') || videoLinkElm.hasClass('watched'))
		{
			videoLinkElm.parents('.feed-item-container').addClass('ytg-contains-watched');
		}
		else
		{
			videoLinkElm.parents('.feed-item-container').removeClass('ytg-contains-watched');
		}
	};

	grid.cleanVideo = function(videoElm)
	{
		if (!$(videoElm).hasClass('ytg-cleaned'))
		{
			// Fix formatting
			var metaInfo       = $(videoElm).find('.yt-lockup-meta-info');

			if ($('.individual-feed').length)
			{
				var uploadUserLink = $(videoElm).find('.feed-author-bubble').attr('href');
				var uploadString   = metaInfo.find('li:first').text() + ' by <a class="ytg-channel-link" href="'+uploadUserLink+'">' + $(videoElm).find('.feed-author-bubble img').attr('alt')+'</a>';
			}
			
			$(videoElm).find('.feed-item-header').remove();

			var views = $(videoElm).find('.yt-lockup-meta-info li:contains("views")').text()
			var badges = $(videoElm).find('.yt-lockup-badges').html() || '';

			$(videoElm).find('.item-badge-line').remove();

			if ($('.individual-feed').length)
			{
				metaInfo.html('<li><p>'+uploadString+'</p></li>');
				metaInfo.append('<li><p class="ytg-views">'+views+'</p>'+badges+'</li>');
				$(videoElm).find('.yt-user-name-icon-verified').remove();
			}


			if ($(videoElm).find('.yt-badge').text() == 'UPCOMING EVENT')
			{
				$(videoElm).find('.yt-badge').parents('.item-badge-line').remove();
			}

			grid.addMarkWatchedBtn(videoElm);

			// Fix the thumbnail if its broken.
			$('.yt-thumb-clip img[src*="pixel"]').each(function(idx, elm) 
			{ 
				$(this).attr('src', $(this).attr('data-thumb')); 
			});

			$(videoElm).addClass('ytg-cleaned');
		}
	};

	grid.addMarkWatchedBtn = function(videoElm)
	{
		// Set up the mark as watched button.
		var button = $(videoElm).find('.addto-watch-later-button').clone();

		button.removeClass('addto-watch-later-button');
		button.addClass('ytg-mark-watched');
		button.attr('data-tooltip-text', 'Mark as watched');

		$(videoElm).find('.contains-addto').append(button);
	};

	grid.timedVideoMark = function(ms, loop)
	{
		setTimeout(function()
		{
			if ($('body').hasClass('ytg-gridable'))
			{
				// Refetch the watch history in case it changed
				YTG.platform.getStorageItem('watchHistory', function(data)
				{
					YTG.history.setHistory(data.watchHistory);
					YTG.grid.markVideos();

					if (loop)
					{
						grid.timedVideoMark(ms, loop);
					}
				});
			}
		}, ms);
	};

	grid.setHideVideos = function(hideVideos)
	{
		grid.hideVideos = hideVideos || false;
	};

	grid.toggleVideos = function()
	{
		if ($(this).hasClass('yt-uix-button-toggled'))
		{
			return false;
		}

		grid.hideVideos = !grid.hideVideos;
		grid.setViewToggle();

		YTG.platform.setStorageItem('hideVideos', grid.hideVideos);
	};

	grid.setViewToggle = function()
	{
		$('#channel-navigation-menu .view-toggle-button').removeClass('yt-uix-button-toggled');

		if (grid.hideVideos)
		{
			$('#hideVideos').addClass('yt-uix-button-toggled');
			$('#page').addClass('ytg-hide-watched-videos');
		}
		else
		{
			$('#showVideos').addClass('yt-uix-button-toggled');
			$('#page').removeClass('ytg-hide-watched-videos');
		}
	};

	// Is a subs page, a collection page,
	// watch history or watch later page
	// and not an activty page.
	grid.isGridable = function(url)
	{
		var gridablePages = ['/feed/subscriptions', '/feed/SC']; // '/feed/watch_later', '/feed/history',

		// First off, we never ever (yet) want to
		// gridify an activity page.
		if (url.indexOf('/activity') !== -1)
		{
			return false;
		}

		var gridable = gridablePages.some(function(gridCheck)
		{
			if (url.indexOf(gridCheck) >= 0)
			{
				return true;
			}
		});

		return gridable;
	};

	return grid;
}(YTG, YTG.grid || {}));