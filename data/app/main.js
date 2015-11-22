$(document).ready(function(){

    YTG.ytInit();

    YTG.checkPage(window.location.href);

    // spfdone is a YT event in what ever JS page switch thing
    // they have going on.
    document.addEventListener("spfdone", function(e)
    {
        YTG.checkPage(window.location.href);
    });


});