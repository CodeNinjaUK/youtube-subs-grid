$(document).ready(function(){

	// Drop in to a short loop to check for href changes
	window.setInterval(function()
	{
		YTG.checkPage(window.location.href);
	}, 200);

	YTG.ytInit();
});