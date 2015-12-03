var documentElement = $(document);
documentElement.ready(YTG.ytInit);

// spfdone is a YT event in what ever JS page switch thing
// they have going on.
documentElement.on("spfdone", YTG.ytInit);

// We bind these right up here because of the way YT moves between pages
// means these events can otherwise get bound multiple times, which could
// be a Very Bad Thing™.
documentElement.on('click', '.ytg-mark-watched:not(.watched .ytg-mark-watched)', YTG.history.toggleWatchedHandler);
documentElement.on('click', '.ytg-reset-mark-all-watched', YTG.history.resetWatchHistoryHandler);
documentElement.on('click', '.ytg-subs-grid-settings-button, .ytg-exit-settings', YTG.grid.settingsClickedHandler);
documentElement.on('click', '.ytg-settings .ytg-setting', YTG.grid.settingCheckboxClickedHandler)

$(window).scroll(YTG.grid.scrollHandler);