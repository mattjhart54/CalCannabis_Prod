try {
	// Update alt id on renewal record
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
	if (vLicenseID != null) {
		vLicenseAltId = vLicenseID.getCustomID();
		cIds = getChildren("Licenses/Cultivator/License/Renewal",vLicenseID);
		if(matches(cIds, null, "", undefined)) 
			renewNbr = renewNbr = "0" + 1;
		else {
			cIdLen = cIds.length 
			if(cIds.length <= 9) {
				renewNbr = cIdLen + 1;
				renewNbr = "0" +  renewNbr;
			}else {
				renewNbr = cIdLen + 1;
			}
		}
		newAltId = vLicenseAltId + "-R" + renewNbr;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
	//mhart: 012320: story 6378: check License cases before submittal
	var AInfo = [];
	loadAppSpecific(AInfo);
	var licenseId = AInfo["License Number"];
	var licId = aa.cap.getCapID(licenseId);
	licId = licId.getOutput();
	childIds  = getChildren("Licenses/Cultivator/License Case/*",licId);
	holdId = capId;
	var caseHold = false
	for(c in childIds) {
		capId = childIds[c];
		cCap = aa.cap.getCap(capId).getOutput();
		cStatus = cCap.getCapStatus();
		cInfo = new Array;
		loadAppSpecific(cInfo);
		logDebug(cInfo["Case Renewal Type"] + " - " + cStatus);
		if(cInfo["Case Renewal Type"] == "Renewal Hold") 
			if(!matches(cStatus, "Resolved", "Closed")) {
				caseHold = true;
				break;
			}
	}
	capid = holdId;
	if(caseHold) {
		cancel = true;
		showMessage = true;
//		if(publicUser)
//			logMessage("The renewal of this license has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling (833) CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.");
//		else
			comment("The renewal of this license has been placed on hold. A Renewal record cannot be created.")
	}	
			
}catch (err){
	logDebug("A JavaScript Error occurred: ASB:Licenses/Cultivator/License Case/ " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivator/License Case/ " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}