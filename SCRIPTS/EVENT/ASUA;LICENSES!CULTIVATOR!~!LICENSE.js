//Sends license to CAT when status becomes 'Inactive'
try{
	if (appTypeArray[2] != "Temporary") {
		if(matches(appStatus, "Revoked", "Suspended", "Inactive")){
			addToCat(capId);
		}
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/LICENSE: Adding to CAT Set: " + err.message);
	logDebug(err.stack);
}
//Mhart 04/23/2019 story 5977 revoke license
try {
	if(capStatus == "Revoked") {
		var childId = getChildren("Licenses/Cultivator/*/Application");
		for (x in childId) {}
			updateAppStatus("Revoked",childId[x])
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/APPLICATION: Status Revoked: " + err.message);
	logDebug(err.stack);
}
