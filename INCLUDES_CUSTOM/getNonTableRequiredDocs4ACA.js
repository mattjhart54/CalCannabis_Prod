function getNonTableRequiredDocs4ACA() {

    var requirementArray = new Array();

    /*------------------------------------------------------------------------------------------------------/
    | Load up Record Types : NEEDS REVIEW, map variables to record types
    /------------------------------------------------------------------------------------------------------*/

    //Global requirements cross discipline
    var isConversionRequest                    = appMatch("Licenses/Cultivator/Conversion Request/NA");
	var isRenewal			                   = appMatch("Licenses/*/License/Renewal");
 

    /*------------------------------------------------------------------------------------------------------/
    | Load up Standard Requirements : NEEDS REVIEW, map variable to standard condition
    /------------------------------------------------------------------------------------------------------*/

    //License documentation requirements
    var premisesDiagram                        		= "Cultivation Plan - Detailed Premises Diagram";
    var lightingDiagram                             = "Cultivation Plan - Lighting Diagram";
	var pestManagementPlan							= "Cultivation Plan - Pest Management Plan";
	var wasteManagementPlan							= "Cultivation Plan - Waste Management Plan"; 
	var ceqaCompliance								= "Local - Evidence of CEQA Compliance";
	var electricityUsgae							= "Electricity Usage";
	var waterLakeStream								= "Water - Lake and Streambed Alteration Document";
	var waterQuality								= "Water - Water Quality Protection Permit";
	//spatel CLS 7710 for LPA Updates:
	var LPA_signaturePage							= "Business - Labor Peace Agreement Signature Page";
	var LPA_notarizedStatement						= "Business - Labor Peace Agreement Notarized Statement";


	//Remove all conditions first
	removeAllCapConditions();
	
	//Global documentation requirements

    if (isConversionRequest) {
		requirementArray.push(premisesDiagram);
		requirementArray.push(lightingDiagram);
		requirementArray.push(pestManagementPlan);
		requirementArray.push(wasteManagementPlan);
		requirementArray.push(ceqaCompliance);
		requirementArray.push(waterLakeStream);
		requirementArray.push(waterQuality);
    }
	
	if (isRenewal) {
		AInfo = [];
		loadAppSpecific4ACA(AInfo);
		if(AInfo["License Change"] == "Yes") {
			requirementArray.push(premisesDiagram);
		}
		if (AInfo["Number of Employees"] == "10+ employees and has entered into a labor peace agreement") {
			requirementArray.push(LPA_signaturePage);
		}
		if (AInfo["Number of Employees"] == "10+ employees and has not yet entered into a labor peace agreement" || AInfo["Number of Employees"] == "0-9 employees - not yet required to enter into a labor peace agreement") {
			requirementArray.push(LPA_notarizedStatement);
		}
    }

    return requirementArray;

}