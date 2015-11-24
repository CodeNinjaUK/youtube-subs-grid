var YTG = YTG || {};

YTG.grid = (function (YTG, grid) {
    grid.setup = function (isClassicGridMode) {

        YTG.grid.markYTVideos();
        YTG.grid.markVideos();

        if (isClassicGridMode)
        {
            $('.ytg-gridable').addClass('ytg-classic-mode');
            grid.classicModeCleanup();
        }

        $('body').on('click', '.load-more-button', function(e)
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
                    if (isClassicGridMode)
                    {
                        grid.classicModeCleanup();
                    }
                }
            }, 10);
        });


        // Append our show/hide toggle
        var headerContainer = $('.shelf-title-table').first();

        headerContainer.prepend(`<div class="ytg-controls"> <h2 class="branded-page-module-title"> Watched videos:
                                        <span class="yt-uix-button-group vm-view-toggle" data-button-toggle-group="required">
                                    <button
                                        aria-label="Show watched videos" type="button"
                                        class="start view-toggle-button yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-empty"
                                        data-button-toggle="true" role="button" id="showVideos">
                                    <span class="yt-uix-button-content">Show</span>
                                    </button>
                                    </span>
                                    <span class="yt-uix-button-group vm-view-toggle" data-button-toggle-group="required">
                                    <button
                                        aria-label="Hide watched videos"
                                        type="button"
                                        class="end view-toggle-button yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-empty"
                                        data-button-toggle="true" role="button" id="hideVideos">
                                    <span class="yt-uix-button-content">Hide</span>
                                    </button>
                                    </span>
                                    &nbsp;&nbsp;
                                    <button aria-label="Show watched videos"
                                        type="button"
                                        class="yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-empty"
                                        role="button"
                                        id="markAllVideos">
                                        <span class="yt-uix-button-content">Mark all videos as watched</span>
                                    </button></h2>
                                    </div>
                                `);
        headerContainer.on('click', '.view-toggle-button', YTG.grid.toggleVideos);
        headerContainer.on('click', '#markAllVideos', YTG.grid.markAllVisibleVideos);
        YTG.grid.setViewToggle();


        grid.loadMoreVideos();
    };

    grid.allVideos = function()
    {
        return $('.yt-shelf-grid-item');
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
        var videoArray = [];
        grid.allVideos().each(function (idx, video) {
            var videoId = $(video).find('.addto-watch-later-button').attr('data-video-ids');

            videoArray.push(videoId);
        });

        YTG.history.massAddToHistory(videoArray);
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

    return grid;
}(YTG, YTG.grid || {}));