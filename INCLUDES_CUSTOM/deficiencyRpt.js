function deficiencyRpt() {  // optional parameter wfStatus
try{
	if(arguments.length == 1)
		wfStatus = arguments[0];
	if(matches(wfStatus, "Additional Information Needed", "Local Verification Complete", "Business Review Complete", "Scientific Review Complete", "Recommend for Denial Complete")
			&& (isTaskComplete("Local Verification") || (isTaskStatus("Local Verification", "Additional Information Needed") || isTaskStatus("Local Verification", "10-Day") ||isTaskStatus("Local Verification", "60-Day")))
			&& (isTaskComplete("Administrative Review") || isTaskStatus("Administrative Review", "Additional Information Needed"))
			&& (isTaskComplete("Business Review") || isTaskStatus("Business Review", "Additional Information Needed"))
			&& (isTaskComplete("Scientific Review") || isTaskStatus("Scientific Review", "Additional Information Needed"))) {
		logDebug("capStatus " + capStatus);
		var childAmend = getChildren("Licenses/Cultivator/Medical/Amendment");
		var cntChild = childAmend.length;
		logDebug("cntChild: " + cntChild);
		if(cntChild<10){
			cntChild = "0" +cntChild;
		}
		var newAltId = capIDString +"-DEF"+ cntChild+"T";
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					comment("<font color='purple'>Use this value for the Deficiency Record ID on the report: " + newAltId + "</font>");
				}
			}
		}
// MJH 190222 User Story 5881 - run Defieciency report in async mode
		var scriptName = "asyncRunDeficiencyRpt";
		var envParameters = aa.util.newHashMap();
		envParameters.put("altId",capIDString); 
		envParameters.put("newAltId",newAltId);
		envParameters.put("reportName","Deficiency Letter"); 
		envParameters.put("currentUserID",currentUserID);
		logDebug("altId " + capIDString + " newAltId " + newAltId + " curentUser " + currentUserID)
		aa.runAsyncScript(scriptName, envParameters, 5000);
//		runReportAttach(capId,"Deficiency Report", "p1value", capId.getCustomID(), "p2value",newAltId);
// MJH 190222 User Story 5881 - end
//8825 start send deficiencies as email instead of letter
		logDebug("*************************")
		//get assigned staff for email template
		var genericEmail="info@cannabis.ca.gov";
		var taskItemScriptModel=aa.workflow.getTask(capId, "Administrative Review");
		if(taskItemScriptModel.getSuccess()){
			var taskItemScript = taskItemScriptModel.getOutput();
				var actionByUser=taskItemScript.getTaskItem().getAssignedUser(); // Get action by user, this is a SysUserModel
				logDebug("Assigned To User: " + actionByUser);
				var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
				if(taskUpdaterModel.getSuccess()) {
					var taskUpdater = taskUpdaterModel.getOutput(); 
					var staffEmail = taskUpdater.email;
					var staffName = taskUpdater.firstName+" "+taskUpdater.lastName;
					logDebug("staffEmail: "+staffEmail+" staffName: "+staffName);
					if (staffEmail == "" || staffEmail == null) {
						staffEmail=genericEmail;
						staffName="";
						logDebug("Blank staff email returned. "+genericEmail+" used.");
					}
				}
				else {
					staffEmail=genericEmail;
					staffName="";
					logDebug("No user assigned to Administrative Review task. "+genericEmail+" used.");
				}
		}else{
			logDebug("Error occurred getting taskItemScriptModel: Administrative Review: " + taskItemScriptModel.getErrorMessage());
		}
		var params = aa.util.newHashtable();
		var tblDefic = loadASITable("DEFICIENCIES",capId);
		var priContact = getContactObj(capId,"Designated Responsible Party");
		var drpEmail = priContact.capContact.email;
		var ccEmail = getContactCC(capId);
		var contactFirstName=priContact.capContact.firstName;
		var contactLastName=priContact.capContact.lastName;

		//get list of deficiencies
		var arrDef = [];
		for (row in tblDefic){
			if(tblDefic[row]["Status"]=="Deficient"){
				var defType=tblDefic[row]["Deficiency Type"];
				var defDet=tblDefic[row]["Deficiency Details"];
				//logDebug("defType: "+defType);
				//logDebug("defDet: "+defDet);
				arrDef.push(defType);
				arrDef.push(defDet);
			}
		}
		var defList = arrDef.join("\t\n");
		logDebug("defList: "+defList);
		addParameter(params,"$$defList$$",defList);
		addParameter(params, "$$altID$$", capIDString);
		addParameter(params,"$$contactFirstName$$",contactFirstName);
		addParameter(params, "$$contactLastName$$", contactLastName);
		addParameter(params, "$$staffEmail$$", staffEmail);
		addParameter(params, "$$staffName$$", staffName);
		sendNotification(sysFromEmail, drpEmail, ccEmail, "LCA_DEFICIENCY", params, null);	
		logDebug("*********************************************");
		//emailRptContact("", "LCA_DEFICIENCY", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
//8825 end send deficiencies as email instead of letter
		//only create a record if the owner app task on the parent says you should
		if(taskStatus("Business Review") == "Additional Information Needed") {
			var childOwner = getChildren("Licenses/Cultivator/*/Owner Application");
			for(rec in childOwner){
				//now process the child owner applications for any deficiencies
				var thisOwnCapId = childOwner[rec];
				var ownCap = aa.cap.getCap(thisOwnCapId).getOutput();
				var ownAppStatus = ownCap.getCapStatus();
				var ownAppName = ownCap.getSpecialText();
				if(ownAppStatus=="Additional Information Needed"){
					var newOwnAppName = "Deficiency: " + ownAppName;
					//create child deficiency record for the owner
					ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
					ctm.setGroup("Licenses");
					ctm.setType("Cultivator");
					ctm.setSubType("Owner");
					ctm.setCategory("Amendment");
					var newODefId = aa.cap.createSimplePartialRecord(ctm,newOwnAppName, "INCOMPLETE CAP").getOutput();
					if(newODefId){
						var resOCreateRelat = aa.cap.createAppHierarchy(thisOwnCapId, newODefId); 
						if (resOCreateRelat.getSuccess()){
							logDebug("Child application successfully linked");
						}else{
							logDebug("Could not link applications: " + resOCreateRelat.getErrorMessage());
						}
						logDebug("thisOwnCapId.getCustomID(): " + thisOwnCapId.getCustomID());
						editAppSpecific("ParentCapId", thisOwnCapId.getCustomID(),newODefId);
						//copyASITables(thisOwnCapId,newODefId,["CANNABIS FINANCIAL INTEREST", "CONVICTIONS", "ATTACHMENTS"]);
						var tblODefic = loadASITable("DEFICIENCIES",thisOwnCapId);
						var arrDef = [];
						for (row in tblODefic){
							if(tblODefic[row]["Status"]=="Deficient"){
								arrDef.push(tblODefic[row]);
							}
						}
						addASITable("DEFICIENCIES", arrDef, newODefId);
						copyContacts(thisOwnCapId, newODefId);
						//editContactType("Owner","Primary Contact",newODefId);
						//get the current number of deficiency children to set the AltId
						var currCapId = capId;
						capId = thisOwnCapId;
						var childOAmend = getChildren("Licenses/Cultivator/Owner/Amendment");
						capId = currCapId;
						var cntOChild = childOAmend.length;
						//cntOChild ++;
						//logDebug("childOAmend.length: " + childOAmend.length);
						//logDebug("cntOChild: " + cntOChild);
						if(cntOChild<10){
							cntOChild = "0" +cntOChild;
						}
						var newOAltId = thisOwnCapId.getCustomID() +"-DEF"  + cntOChild;
						var defAltIdT = newOAltId + "T";
						//logDebug("newOAltId: " + newOAltId);
						//lwacht adding a 't' because something quit working 
						var updOAltId = aa.cap.updateCapAltID(newODefId,defAltIdT);
						if(!updOAltId.getSuccess()){
							logDebug("Error updating Owner Alt Id: " + newOAltId + ":: " +updOAltId.getErrorMessage());
						}else{
							logDebug("newOAltId: " + newOAltId);
							editAppSpecific("AltId", newOAltId,newODefId);
							logDebug("Deficiency owner record ID updated to : " + newOAltId);
						}
// mhart 20180214 user story 4873 - Run deficincy report and send notification to the owner.
						var ownerContact = getContactObj(thisOwnCapId,"Owner");
						if(ownerContact){
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ ownerContact.capContact.getPreferredChannel());
							if(!matches(priChannel,"",null,"undefined")){
								if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
									comment("<font color='purple'>Use this value for the Deficiency Record ID on the report: " + newAltId + "</font>");
								}
							}
						}
// MJH 190222 User Story 5881 - run Defieciency report in async mode
						var scriptName = "asyncRunDeficiencyRpt";
						var envParameters = aa.util.newHashMap();
						envParameters.put("altId",thisOwnCapId.getCustomID()); 
						envParameters.put("newAltId",defAltIdT);
						envParameters.put("reportName","Deficiency Report - Owner"); 
						envParameters.put("currentUserID",currentUserID);
						logDebug("altId " + capIDString + " newAltId " + newAltId + " curentUser " + currentUserID)
						aa.runAsyncScript(scriptName, envParameters, 5000);
//						runReportAttach(thisOwnCapId,"Deficiency Report - Owner", "p1value", thisOwnCapId.getCustomID(), "p2value",defAltIdT);
// MJH 190222 User Story 5881 - end
						holdCapId = capId;
						capId = thisOwnCapId;
						emailRptContact("", "LCA_DEFICIENCY_OWNER", "", false, capStatus, thisOwnCapId, "Owner", "p1value", thisOwnCapId.getCustomID());
						capId = holdCapId;
// mhart 20180214 user story 4873 
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	logDebug(err.stack);
}
}
