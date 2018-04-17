$(document).ready(function () {
	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};
	
	/*
	if($(".ACA_LoginBox").length && !isMobile.any()) {
		//$(".header").css("position","fixed");
		//$(".aca_wrapper").before("<div id='bigPic'><div><table style='background: rgba(255,255,255,0.9); cellpadding=2 cellspacing=2; width: 80%; margin-left: auto; margin-right: auto;'><tr><td><p style ='font-weight: bold; font-size: 34px; text-align: left; color: black'>Welcome to CalCannabis<br/>Cultivation Licensing</p><p style='font-weight: bold; font-size: 18px; text-align: left; color: black'>This is where you can create an account and apply for a California state cannabis cultivation license.<br/><br/>You can look up existing state cannabis cultivation licenses without registering for an account.<br/></p><p style='font-weight: bold; font-size: 14px; text-align: left; color: black' class='loginDiv' onClick=\"$('#bigPic').css({'visibility': 'hidden', 'height': '170px','padding':'0'})\"><br>Get Started<i class='material-icons'>&#xE5DB;</i></p></td></tr></table></div>");

		$('html, body').animate({scrollTop : 0},800);
	} else if($(".ACA_LoginBox").length && isMobile.any()){
		//$(".header").css("position","fixed");
		//$(".aca_wrapper").before("<div id='smallPic'>Cultivation Licensing<br><a href='account/RegisterDisclaimer.aspx' class='bigButton'>SIGN UP NOW</a><br><div class='loginDiv' onClick=\"$('#smallPic').css({'visibility': 'hidden', 'height': '170px','padding':'0'})\">Sign In</div></div>");

		$('html, body').animate({scrollTop : 0},800);
	}
	*/
});
