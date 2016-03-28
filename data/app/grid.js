var YTG = YTG || {};

YTG.grid = (function (YTG, grid) {

    grid.settings = {
        'acknowledgedVersion': 0,
        'scrollAutoLoadVideos': true
    };

    grid.setup = function (isClassicGridMode) {

        grid.videoCount = grid.allVideos().length;

        YTG.grid.markYTVideos();
        YTG.grid.markVideos();

        grid.isClassicGridMode = isClassicGridMode;

        if (grid.isClassicGridMode)
        {
            $('.ytg-gridable').addClass('ytg-classic-mode');
            grid.classicModeCleanup();
        }

        // Append our show/hide toggle
        grid.buildHistoryControls();

        grid.watchForGridChanges();
    };

    grid.updateWatchedVideos = function()
    {
        YTG.history.populateHistory(function() {
            YTG.grid.markVideos();
        });
    };


    grid.allVideos = function(excludeWatched)
    {
        var videos = $('.yt-shelf-grid-item');

        if (excludeWatched)
        {
            videos = videos.not('.watched, .ytg-watched');
        }

        return videos;
    };

    // "What the hell" I hear you thinking, "why do you need this?"
    // Youtube has a "load more" button at the bottom of your list of
    // subscriptions you can click, as well as autoloading a set of videos as you
    // scroll. There's no event I can find that YT
    // fires for the loading of videos, and short of intercepting
    // all AJAX calls (which I didn't seem to work anyway) this seemed
    // the best way with out resorting to constantly running loops.
    grid.watchForGridChanges = function()
    {
        // select the target node
        var target = document.querySelector('#browse-items-primary');

        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
            if (grid.allVideos().length > grid.videoCount)
            {
                grid.videoCount = grid.allVideos().length;

                YTG.grid.markVideos();

                // Are we in Classic mode? Fire cleanup for that too.
                if (YTG.grid.isClassicGridMode)
                {
                    YTG.grid.classicModeCleanup();
                }
            }
        });

        // configuration of the observer:
        var config = { childList: true, subtree: true };

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
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
    };

    grid.markAllVisibleVideos = function () {

        if (window.confirm('Are you sure you want to mark all videos as watched?')) {
            var videoArray = [];
            var excludeWatched = true;
            grid.allVideos(excludeWatched).each(function (idx, video) {
                var videoId = $(video).find('.ytg-mark-watched').attr('data-video-ids');

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

        if (! YTG.grid.allVideos().find(':visible').length)
        {
            grid.loadMoreVideos();
        }
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

        YTG.platform.setStorageItem({ hideVideos: grid.hideVideos });
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
    // and not an activity page.
    grid.isSubsSection = function (url) {
        var gridablePages = ['/feed/subscriptions', '/feed/SC'];

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
            $('.ytg-grid-selector').append($('.shelf-title-row .menu-container').first().detach());

            YTG.platform.getStorageItem(grid.settings, function(data) {

                // Override our defaults.
                grid.settings = data;

                if (data.acknowledgedVersion < YTG.internalFeatureVersion)
                {
                    $('.ytg-subs-grid-settings-button').addClass('ytg-has-updates');
                }

                $('.ytg-settings input[name="scrollAutoLoadVideos"]').prop('checked', data.scrollAutoLoadVideos);
            });
        });
    };

    grid.settingsClickedHandler = function()
    {
        $('.ytg-settings').slideToggle({
            complete: function () {
                if ($('.ytg-subs-grid-settings-button').hasClass('ytg-has-updates'))
                {
                    $('.ytg-subs-grid-settings-button').removeClass('ytg-has-updates');
                    YTG.platform.setStorageItem({ acknowledgedVersion: YTG.internalFeatureVersion });
                }
            }
        });
    };

    grid.settingCheckboxClickedHandler = function(e)
    {
        var settingElement = $(this);
        var name = settingElement.attr('name');
        var val = settingElement.prop('checked'); // Ignore the value just get the opposite of its checked status.

        settingElement.prop('disabled', true);

        YTG.platform.setStorageItem({ name: val }, function()
        {
            grid.settings.scrollAutoLoadVideos = val;
            settingElement.prop('checked', val);

            settingElement.prop('disabled', false);
        });
    };

    grid.scrollHandler = function()
    {
        var s = $(window).scrollTop(),
            d = $(document).height(),
            c = $(window).height();

        var scrollPercent = (s / (d-c)) * 100;

        if (scrollPercent > 85 && grid.settings.scrollAutoLoadVideos)
        {
            grid.loadMoreVideos();
        }
    };

    return grid;
}(YTG, YTG.grid || {}));