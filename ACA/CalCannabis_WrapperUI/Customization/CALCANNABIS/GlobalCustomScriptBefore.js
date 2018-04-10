$(document).ready(function () {
	$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');
	$("head link[rel='stylesheet']").last().after("<link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>");
	$("head link[rel='stylesheet']").last().after("<link rel='shortcut icon' href='/CALCANNABIS/favicon.ico'>");
	$("head link[rel='stylesheet']").last().after("<link rel='apple-touch-icon' href='/CALCANNABIS/icon_180.png'>");
	$("head link[rel='stylesheet']").last().after("<link rel='icon' type='image/png' href='/CALCANNABIS/icon_196.png'>");
	$("head link[rel='stylesheet']").last().after("<link rel='manifest' href='/CALCANNABIS/manifest.json'>");
	$("<div class='menu'><i class='material-icons'>settings</i></div>").insertBefore(".ACA_RegisterLogin");
	
	var pathname = window.location.pathname;
	pathArray = pathname.split("/");
	rootDir = "/" + pathArray[1];
	$(".aca_wrapper").before("<div class='header'></div>");
	$(".header").load(rootDir + "/header.html");
	$(".aca_wrapper").after("<div class='footer'></div>");
	$(".footer").load(rootDir + "/footer.html");
	
	if ($("#ctl00_HeaderNavigation_lblLogin").length) {
		anonymous = true;		
	} else {
		anonymous = false;
	}
	
	if (anonymous) {
		$("#ctl00_PlaceHolderMain_areaNotLoggedIn").load(rootDir + "/anon_content.html");
		$("#ctl00_HeaderNavigation_divNavigation").hide();
		$("#ctl00_PlaceHolderMain_com_welcome_text_startInfo").hide();
		if ($("#ctl00_PlaceHolderMain_areaNotLoggedIn").length) {
			$(".ACA_LoginBox").hide();
			
			}
	} else {
		$("#ctl00_PlaceHolderMain_com_welcome_text_startInfo").load(rootDir + "/reg_content.html");
	}

	$(".aca_wrapper .welcome-page.ACA_Content > table > tbody > tr > td:first-child").css({backgroundColor: (anonymous) ? '#162500' : 'white'});
	
	document.title = "CalCannabis";
});

