chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.videoWatched)
    {
        chrome.tabs.query({url: "*://*.youtube.com/*"}, function(tabs) {

            // Broadcast the watched event to those who are interested.
            tabs.forEach(function(tab)
            {
                chrome.tabs.sendMessage(tab.id, {videoHistoryUpdated: true});
            });

        });
    }

});