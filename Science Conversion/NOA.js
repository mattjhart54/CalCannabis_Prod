
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_NOA Update
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
|  
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("NOA DATA"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

var emailAddress = "mhart@trustvip.com";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var AInfo = new Array();
var NOA = NOAData();
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

try {
	mainProcess();
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
	if (emailAddress.length) {
		aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);
		if(errLog != "") {
			aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Errors", errLog);
		}
	}
} catch (err) {
	logDebug("ERROR: BATCH_NOA Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in NOA) {
		if(!matches(NOA[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(NOA[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("NOA row for " + NOA[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(NOA[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("NOA row for " + NOA[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
		
		if(!matches(NOA[i]["WDID"],null,"",undefined)) {
			editAppSpecific("WDID",NOA[i]["WDID"]);
		}
		if(!matches(NOA[i]["APN_Matches_Premises"],null,"",undefined)) {
		editAppSpecific("APN Matches Premises",NOA[i]["APN_Matches_Premises"]);
		}
		if(!matches(NOA[i]["Issue_Date"],null,"",undefined)) {	
			editAppSpecific("Issue Date",NOA[i]["Issue_Date"]);
		}
		if(!matches(NOA[i]["Expiration_Date"],null,"",undefined)) {
			editAppSpecific("Expiration Date",NOA[i]["Expiration_Date"]);
		}
		if(!matches(NOA[i]["General_Order?"],null,"",undefined)) {
			editAppSpecific("General Order",NOA[i]["General_Order?"]);
		}
		if(!matches(NOA[i]["Order_Number"],null,"",undefined)) {
			editAppSpecific("Order Number",NOA[i]["Order_Number"]);
		}
		if(!matches(NOA[i]["NOA Review Status"],null,"",undefined)) {
			editAppSpecific("Enrollment Level",NOA[i]["Enrollment_level"]);
		}
		if(!matches(NOA[i]["WDID"],null,"",undefined)) {
			editAppSpecific("NOA Review Status",NOA[i]["NOA Review Status"]);
		}
	}
	logDebug("Total Records Processed : " + NOA.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_NOA: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
