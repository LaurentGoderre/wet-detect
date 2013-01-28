var wetdetect_chrome = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		init : function () {
			
		},
		
		run : function () {
			gBrowser.selectedTab = gBrowser.addTab("chrome://wetdetect/content/wetdetect.html");
			var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.selectedTab);
			newTabBrowser.addEventListener("load", wetdetect_chrome._onTabLoaded, true);
		},
		
		_onTabLoaded : function(){
			
		},
		
	};
}(jQuery);
window.addEventListener("load", wetdetect_chrome.init, false);
