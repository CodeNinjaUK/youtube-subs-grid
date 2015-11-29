$(document).ready(function(){

    YTG.ytInit();
});

// spfdone is a YT event in what ever JS page switch thing
// they have going on.
document.addEventListener("spfdone", function(e)
{
    YTG.ytInit();
});

// We bind these right up here because of the way YT moves between pages
// means these events can otherwise get bound multiple times, which could
// be a Very Bad Thing™.
$(document).on('click', '.ytg-mark-watched:not(.watched .ytg-mark-watched)', YTG.history.toggleWatchedHandler);
$(document).on('click', '.ytg-reset-mark-all-watched', YTG.history.resetWatchHistoryHandler);