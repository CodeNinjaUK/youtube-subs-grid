var YTG = YTG || {};

YTG.grid = (function (YTG, grid) {

    grid.setup = function (isClassicGridMode) {

        YTG.grid.markYTVideos();
        YTG.grid.markVideos();

        grid.isClassicGridMode = isClassicGridMode;

        if (grid.isClassicGridMode)
        {
            $('.ytg-gridable').addClass('ytg-classic-mode');
            grid.classicModeCleanup();
        }

        $('body').on('click', '.load-more-button', grid.onLoadMore);

        // Append our show/hide toggle
        grid.buildHistoryControls();

        grid.loadMoreVideos();
    };

    grid.updateWatchedVideos = function()
    {
        YTG.platform.getStorageItem('watchHistory', function (data) {
            YTG.history.setHistory(data.watchHistory);
            YTG.grid.markVideos();
        });
    };


    grid.allVideos = function()
    {
        return $('.yt-shelf-grid-item');
    };

    grid.onLoadMore = function()
    {
        var videoCount = grid.allVideos().length;

        // Drop in to a high freq loop and wait for the data to finish loading.
        // This won't have to run for long so can run more often and be more responsive.
        var loopId = setInterval(function()
        {
            if (grid.allVideos().length > videoCount)
            {
                clearInterval(loopId);

                videoCount = grid.allVideos().length;

                YTG.grid.markVideos();

                // Are we in Classic mode? Fire cleanup for that too.
                if (grid.isClassicGridMode)
                {
                    grid.classicModeCleanup();
                }
            }
        }, 10);
    };

    grid.classicModeCleanup = function()
    {
        $('.shelf-content').first().html($('.yt-shelf-grid-item').detach());

        $('h2.shelf-title-cell').remove();
        $('ol.section-list > li:not(:first-child)').remove();
    };

    grid.loadMoreVideos = function () {

        // Load more videos, then load some more
        // Note: don't use jquery here because it messes with the event dispatch stuff.
        YTG.fireEvent(document.querySelector('.load-more-button'), 'click');
        setTimeout(function () {
            YTG.fireEvent(document.querySelector('.load-more-button'), 'click');
        }, 2000);
    }

    grid.markAllVisibleVideos = function () {

        if (window.confirm('Are you sure you want to mark all videos as watched?')) {
            var videoArray = [];
            grid.allVideos().each(function (idx, video) {
                var videoId = $(video).find('.addto-watch-later-button').attr('data-video-ids');

                videoArray.push(videoId);
            });

            YTG.history.massAddToHistory(videoArray);
        }
    };

    // Get all videos marked as watched on the
    // YT side of things, remove them from our
    // internal history
    grid.markYTVideos = function () {
        var videos = [];
        YTG.grid.allVideos().find('.watched [data-video-ids]').each(function (idx, elm) {
            var videoId = $(elm).attr('data-video-ids');
            videos.push(videoId);
        });

        YTG.history.massRemoveFromHistory($.unique(videos));
    };

    grid.markVideos = function () {
        grid.allVideos().each(function (idx, video) {
            grid.cleanVideo(video);
            grid.markVideo(video);
        });
    };

    grid.markVideo = function (videoElm) {
        videoElm = $(videoElm);
        var videoId = videoElm.find('.addto-watch-later-button').attr('data-video-ids');

        var videoLinkElm = videoElm.find('.yt-lockup-thumbnail a');

        // Can't unmark these ones.
        if (videoElm.find('.watched').length > 0) {
            videoElm.addClass('watched');
            videoElm.find('.ytg-mark-watched').attr('data-tooltip-text', 'Cannot changed watched status');
        }
        else if (!videoElm.hasClass('ytg-watched') && YTG.history.videoIsInHistory(videoId)) {
            videoElm.addClass('ytg-watched');
            videoLinkElm.append('<div class="watched-badge">WATCHED</div>');
            videoElm.find('.ytg-mark-watched').attr('data-tooltip-text', 'Mark as unwatched');
        }
        else if (videoElm.hasClass('ytg-watched') && !YTG.history.videoIsInHistory(videoId)) {
            videoElm.removeClass('ytg-watched');
            videoElm.find('.watched-badge').remove();
            videoElm.find('.ytg-mark-watched').attr('data-tooltip-text', 'Mark as watched');
        }


        if (videoElm.hasClass('ytg-watched') || videoElm.hasClass('watched') || videoElm.find('.watched').length) {
            videoElm.addClass('ytg-contains-watched');
        }
        else {
            videoElm.removeClass('ytg-contains-watched');
        }
    };

    grid.cleanVideo = function (videoElm) {
        if (!$(videoElm).hasClass('ytg-cleaned')) {

            grid.addMarkWatchedBtn(videoElm);

            // Fix the thumbnail if its broken.
            $('.yt-thumb-clip img[src*="pixel"]').each(function (idx, elm) {
                $(this).attr('src', $(this).attr('data-thumb'));
            });

            $(videoElm).addClass('ytg-cleaned');
        }
    };

    grid.addMarkWatchedBtn = function (videoElm) {
        // Set up the mark as watched button.
        var button = $(videoElm).find('.addto-watch-later-button').clone();

        button.removeClass('addto-watch-later-button addto-button');
        button.addClass('ytg-mark-watched');
        button.attr('data-tooltip-text', 'Mark as watched');

        $(videoElm).find('.contains-addto').append(button);
    };

    grid.setHideVideos = function (hideVideos) {
        grid.hideVideos = hideVideos || false;
    };

    grid.toggleVideos = function () {
        if ($(this).hasClass('yt-uix-button-toggled')) {
            return false;
        }

        grid.hideVideos = !grid.hideVideos;
        grid.setViewToggle();

        YTG.platform.setStorageItem('hideVideos', grid.hideVideos);
    };

    grid.setViewToggle = function () {
        $('#hideVideos,#showVideos').removeClass('yt-uix-button-toggled');

        if (grid.hideVideos) {
            $('#hideVideos').addClass('yt-uix-button-toggled');
            $('#page').addClass('ytg-hide-watched-videos');
        }
        else {
            $('#showVideos').addClass('yt-uix-button-toggled');
            $('#page').removeClass('ytg-hide-watched-videos');
        }
    };

    // Is a subs page, a collection page,
    // watch history or watch later page
    // and not an activty page.
    grid.isSubsSection = function (url) {
        var gridablePages = ['/feed/subscriptions', '/feed/SC']; // '/feed/watch_later', '/feed/history',

        return gridablePages.some(function (gridCheck) {
            if (url.indexOf(gridCheck) >= 0) {
                return true;
            }
        });
    };

    grid.isGridable = function (url) {

        if (grid.isSubsSection(url)) {
            return grid.allVideos().length > 0;
        }

        return false;
    };

    grid.buildHistoryControls = function() {
        var headerContainer = $('.shelf-title-table').first();

        YTG.platform.getControlMarkup(function(markup)
        {
            headerContainer.prepend(markup);

            headerContainer.on('click', '.view-toggle-button', YTG.grid.toggleVideos);
            headerContainer.on('click', '#markAllVideos', YTG.grid.markAllVisibleVideos);
            YTG.grid.setViewToggle();

            // Move the grid selector in to our markup for better style control.
            $('.ytg-grid-selector').append($('.shelf-title-row').detach());
        });
    };

    return grid;
}(YTG, YTG.grid || {}));