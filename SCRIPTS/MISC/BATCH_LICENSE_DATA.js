/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LICENSE_DATA
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
|  Script to update license data from application data on existing license records.
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 4.5 * 60;
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


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/* test parameters

aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendToEmail", "mhart@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA_purge");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "Medical,Adult Use");
aa.env.setValue("recordCategory", "License,Provisional");
*/
var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appCategory = getJobParam("recordCategory");
var sArray = getJobParam("recordSubType").split(",");
var cArray = getJobParam("recordCategory").split(",");

if(appTypeType=="*") appTypeType="";
if(appCategory=="*") appCategory="";

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var rcdsUpdated = 0;
	var recSkip = 0;
	var capList = new Array();
	for (i in sArray) {
		for(c in cArray) {
			capListResult = aa.cap.getByAppType(appGroup,appTypeType,sArray[i],cArray[c]);
			if (capListResult.getSuccess()) {
				tempcapList = capListResult.getOutput();
				logDebug(sArray[i] + " - " + cArray[c] + " Type Count: " + tempcapList.length);
				if (tempcapList.length > 0) {
					capList = capList.concat(tempcapList);
				}
			}else{
				logDebug("Error retrieving records: " + capListResult.getErrorMessage());
			}
		}
	}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
		capId = capList[myCapsXX].getCapID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		altId =	 capId.getCustomID();
		AInfo = new Array();
		loadAppSpecific(AInfo);
//		if(altId != "CAL18-0000044") continue;
		loadASITables();
		logDebug("Processing License Record " + altId);
		if (typeof(OWNERS) == "object" && OWNERS.length>0) {
			logDebug("Skipping Record already updated");
			recSkip++;
			continue;
		}
		 rcdsUpdated++;
		cId = getChildren("Licenses/Cultivator/"+appTypeArray[2]+"/Application");
		for(x in cId) {
/*			holdId = capId;
			capId = cId[x];
			appInfo = new Array();
			loadAppSpecific(appInfo);
			capId = holdId;
			editAppSpecificB("Business Entity Structure",appInfo["Business Entity Structure"]);
			editAppSpecificB("Other Entity",appInfo["Other Entity"]);
			editAppSpecificB("Foreign Corporation",appInfo["Foreign Corporation"]);
			editAppSpecificB("Legal Business Name",appInfo["Legal Business Name"]);
			editAppSpecificB("EIN/ITIN",appInfo["EIN/ITIN"]);
			editAppSpecificB("SSN/ITIN",appInfo["SSN/ITIN"]);
			editAppSpecificB("Secretary of State Registration Entity",appInfo["Secretary of State Registration Entity"]);
			editAppSpecificB("Grid",appInfo["Grid"]);
			editAppSpecificB("Solar",appInfo["Solar"]);
			editAppSpecificB("Generator",appInfo["Generator"]);
			editAppSpecificB("Generator Under 50 HP",appInfo["Generator Under 50 HP"]);
			editAppSpecificB("Other",appInfo["Other"]);
			editAppSpecificB("Other Source Description",appInfo["Other Source Description"]);
			editAppSpecificB("Local Authority Type",appInfo["Local Authority Type"]);
			editAppSpecificB("Local Authority Name",appInfo["Local Authority Name"]);
			editAppSpecificB("Local Authorization Number",appInfo["Local Authorization Number"]);
			editAppSpecificB("Expiration Date",appInfo["Expiration Date"]);
			editAppSpecificB("Local Authority Address",appInfo["Local Authority Address"]);
			editAppSpecificB("Local Authority City",appInfo["Local Authority City"]);
			editAppSpecificB("Local Authorization State",appInfo["Local Authorization State"]);
			editAppSpecificB("Local Authorizaton Zip",appInfo["Local Authorizaton Zip"]);
			editAppSpecificB("Local Authority County",appInfo["Local Authority County"]);
			editAppSpecificB("Local Authority Phone",appInfo["Local Authority Phone"]);
			loadASITables();
			*/
//			if (typeof(OWNERS) == "object")
				copyASITablesT(cId[x],capId,"DEFICIENCIES","DENIAL REASONS");
//			else 
//				logDebug("Record " + altId + " tables were not updated");
				
		}
			
	}		
	logDebug("Total Records qualified : " + capList.length);
	logDebug("Toat Records skipped: " + recSkip);
	logDebug("Toat Records Processed: " + rcdsUpdated);

}catch(err){
		logDebug("An error has occurred in Batch License Update: " + err.message);
		logDebug(err.stack);
}
}

function addASITableT(tableName, tableValueArray) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	var itemCap = capId
		if (arguments.length > 2)
			itemCap = arguments[2]; // use cap ID specified in args

		var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

		if (!tssmResult.getSuccess()) {
			logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
			return false
		}

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var fld_readonly = tsm.getReadonlyField(); // get Readonly field

	for (thisrow in tableValueArray) {

		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();

			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}
			
			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				fld_readonly.add(null);
			} else // we are passed a string
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
				fld_readonly.add(null);
			}
		}

		tsm.setTableField(fld);

		tsm.setReadonlyField(fld_readonly);

	}

	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
	} else
		logDebug("Successfully added record to ASI Table: " + tableName);

}
function copyASITablesT(pFromCapId, pToCapId) {
	// Function dependencies on addASITable()
	// par3 is optional 0 based string array of table to ignore
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++)
				if (ignoreArr[i] == tn) {
					ignore = true;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
			var numrows = 1;
			while (tsmfldi.hasNext()) // cycle through fields
			{
				if (!tsmcoli.hasNext()) // cycle through columns
				{
					var tsmcoli = tsm.getColumns().iterator();
					tempArray.push(tempObject); // end of record
					var tempObject = new Array(); // clear the temp obj
					numrows++;
				}
				var tcol = tsmcoli.next();
				var tval = tsmfldi.next();

				var readOnly = 'N';
				if (readOnlyi.hasNext()) {
					readOnly = readOnlyi.next();
				}

				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject); // end of record
		}

		addASITableT(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
} 

function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}

function getJobParam(pParamName){ //gets parameter value and logs message showing param value
try{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"),pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
			}	

		ret = ret ? "" + ret : "";   // convert to String
		
		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
		}
	else {
			ret = "" + aa.env.getValue(pParamName);
			logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
		}
	return ret;
}catch (err){
	logDebug("ERROR: getJobParam: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}

function editAppSpecificB(itemName,itemValue)  // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	
   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);

	if (appSpecInfoResult.getSuccess())
	 {
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue; 
	} 	
}
function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}