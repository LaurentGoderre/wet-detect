(function($){
	wetdetect = {
		title : "WET Detection",

		sites_count: 0,
		sites: null,
		results: null,
		concurrent: 20,

		exec : function () {
			wetdetect.results = [];
			$(wetdetect).on("testscomplete", wetdetect._onTestsComplete);
			wetdetect._loadSites();
		},

		_loadSites : function(){
			$.ajax({
				url: "sites.json",
				dataType:"text",
				mimeType: 'text/plain', 
				statusCode: {
					0:wetdetect._onSitesLoaded,
					200:wetdetect._onSitesLoaded
				 }
			})
		},

		_processSites : function(){
			try{
				if (wetdetect.sites.length > 0){
					site = wetdetect.sites.pop();
					if (site.url != undefined && site.url.match(/^http/gi)){
						var r = $.ajax({
							type:'GET',
							url:site.url,
							context:site,
							dataType: "html",
							contentType: "text/html; charset=ISO-8859-1",
							timeout:20000
						}).always(wetdetect._onSiteLoaded);
						if (wetdetect.sites.length > 0){
							r.always(wetdetect._processSites);
						}
					}else{
						wetdetect._testSite(site, {error:400});
						if (wetdetect.sites.length > 0){
							wetdetect._processSites();
						}
					}
				}
			}catch(e){
				$("title").text(wetdetect.title + " - An error occured");
			}
		},

		_testSite : function(site, data){
			var site = $.extend(site, {r:"UNKNOWN"});
			if (typeof(data) == "string"){
				if (data.match(/gcwu-fegc/gi)){
					site.r = "GCWU/WET";
				}else if (data.match(/Web Experience Toolkit \(WET\)/gi)){
					site.r = "WET";
				}else if (data.match(/PE\.progress/gi) && data.match(/CLF 2.0 TEMPLATE VERSION/gi)){
					site.r = "CLF2+WET"
				}else if (data.match(/PE\.progress/gi)){
					site.r = "WET/NL"
				}else if (data.match(/CLF 2.0 TEMPLATE VERSION/gi)){
					site.r = "CLF2"
				}
			}else{
				site.r = data.error;
			}
			wetdetect.results.push(site);
		},

		_showResults : function(results){
			$("body").append("<h2>Results</h2><p id=\"summary\"></p><h2>Dump</h2><table id=\"dump\"><tr><th>Site ID</th><th>URL</th><th>Status</th></tr></table>");

			var summary = $("#summary");
			var details = $("#dump");

			var wet=0, gcwuwet=0, clfwet=0, wetnl=0, clf=0, secure=0, notfound=0, error=0, unknown=0;
			for (r=0;r<wetdetect.results.length; r++){
				result = wetdetect.results[r]
				if (result.r == "UNKNOWN"){
					unknown++;
				}else if (result.r == "WET" || result.r == "GCWU/WET"){
					wet++;
					if (result.r == "GCWU/WET")
						gcwuwet++;
				}else if (result.r == "CLF2+WET"){
					clfwet++;
				}else if (result.r == "WET/NL"){
					wetnl++
				}else if (result.r == "CLF2"){
					clf++
				}else if(result.r == "401" || result.r == "403"){
					secure++
				}else if(result.r == "404"){
					notfound++
				}else{
					error++;
				}

				details.append("<tr><td>" + result.id + "</td><td>" + result.url + "</td><td>" + result.r + "</td></tr>");
			}
			summary.text("WET: " + wet + "(GCWU:" + gcwuwet + "), CLF2/WET Hybrid: " + clfwet + ", WET Components (Unknown template): " + wetnl + ", CLF2: " +  clf + ", Secure: " + secure + ", Not Found: " + notfound + ", Other Error: " + error  + ", Unknown: " + unknown);
		},

		_showProgress : function(){
			var p = Math.floor(wetdetect.results.length/wetdetect.sites_count*100) + "%";
			$("#progress").text("Tested " + wetdetect.results.length + " out of " + wetdetect.sites_count + " sites (" + p + ")");
			try{$("title").text(wetdetect.title + " - " + p);}catch(e){}
		},

		_onSitesLoaded : function(response){
			var jsonText = (typeof response == "string") ? response : response.responseText;
			wetdetect.sites = $.parseJSON(jsonText);
			wetdetect.sites_count = wetdetect.sites.length;
			for (t = 0; t <= wetdetect.concurrent; t++){
				wetdetect._processSites();
			}
		},

		_onSiteLoaded : function(data){
			if (typeof(data) == "string"){
				wetdetect._testSite(this, data);
			}else{
				wetdetect._testSite(this, {error: data.status});
			}
			wetdetect._showProgress();
			
			if (wetdetect.results.length == wetdetect.sites_count){
				$(wetdetect).trigger("testscomplete");
			}
		},

		_onTestsComplete : function(e){
			wetdetect._showResults(e.results);
		}
	}
})(jQuery);

$(document).ready(function(){
	wetdetect.exec();
});
