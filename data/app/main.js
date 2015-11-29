$(document).ready(function(){

    YTG.ytInit();
});

// spfdone is a YT event in what ever JS page switch thing
// they have going on.
document.addEventListener("spfdone", function(e)
{
    YTG.ytInit();
});

// We bind this right up here because of the way YT moves between pages this can otherwise get bound multiple times.
$(document).on('click', '.ytg-mark-watched:not(.watched .ytg-mark-watched)', YTG.history.toggleWatchedHandler);
