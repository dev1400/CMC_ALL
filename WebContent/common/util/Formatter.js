jQuery.sap.declare("dia.cmc.common.util.Formatter");

jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("sap.ui.core.format.DateFormat");

dia.cmc.common.util.Formatter = {

	/** Convert value to boolean
	 * 'X' -> true
	 * '' -> false
	 * @param oValue : Value which needs to be converted
	 */
	convertBoolean : function(oValue) {
		return oValue == 'X';
	},
		
    /** Convert Date format to "dd-MM<-yyyy"
     * @param oValue : Date which needs to be formated
     */
	date : function(oValue) {
		if (oValue) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "dd-MMM-yyyy"
					});
			return oDateFormat.format(new Date(oValue));
		} else {
			return oValue;
		}
	},
	
	dateTime : function(oValue){
		if (oValue) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "dd-MMM-yyyy HH:mm:ss"
					});
			return oDateFormat.format(new Date(oValue),true);
		} else {
			return oValue;
		}
	},
		
 
	/** Display Deal Status text 
     * @param oValue : Deal Status Id
     */
	dealStatus : function(oValue) {
		var sStatusTxt = null;
		
		switch (oValue) {
			case "PROPO":
				sStatusTxt = "InProposal";
				break;
			case "ESTAB":
				sStatusTxt = "InEffect";
				break;
			case "AMEND":
				sStatusTxt = "InAmendment";
				break;
			case "RELEA":
				sStatusTxt = "InEstablishment";
				break;
		}
		
		return dia.cmc.common.helper.ModelHelper.getText(sStatusTxt);
	},
	
	
	/** Display Amendment Status text 
     * @param oValue : Deal Status Id
     */
	amendmentStatus : function(oValue) {
		var sStatusTxt = null;
		
		switch (oValue) {
			case "CRTD":
				sStatusTxt = "AmendStatusCreated";
				break;
			case "RELE":
				sStatusTxt = "AmendStatusReleased";
				break;
			case "CANC":
				sStatusTxt = "AmendStatusAborted";
				break;
			case "EXEC":
				sStatusTxt = "AmendStatusExecuted";
				break;
		}
		
		return dia.cmc.common.helper.ModelHelper.getText(sStatusTxt);
	},
	
	/** Enable Cancel Amendment button, if amendment status is "Created".
	 * @param oValue : Amendment Status
	 */
	isCancelAmendBtnEnable: function(oValue){
		
		if(oValue === "CRTD"){
			return true;
		}else{
			return false;
		}
	},
	
	/** Returns True if Deal Status is "In Amendment", else false 
     * @param oValue : Deal Status Id
     */
	isDealInAmend : function(oValue) {
		
		if(oValue === "AMEND") {
			return true;
		}else{
			return false;
		}
	},
	
	/** Returns True if Deal Status is other than "In Amendment", else false 
     * @param oValue : Deal Status Id
     */
	isDealNotInAmend : function(oValue) {
		
		if(oValue !== "AMEND") {
			return true;
		}else{
			return false;
		}
	},
	
	
	/** Returns True if Price Amendment Type, else false 
     * @param oValue : Amendment Type
     */
	isPriceOrCommitAmendCat : function(oValue) {
		
		// Read selection parameter from Timeline selection screen
		var oAmendDetailItemsUI = dia.cmc.common.helper.CommonController.getUIElement("idTLAmendDetailItems");
	    var bAmendDetailItems = oAmendDetailItemsUI.getSelected();
	    
		if(bAmendDetailItems === false && (oValue === "PR" || oValue === "CM" )) {
			return true;
		}else{
			return false;
		}
	},
	
	/** Returns True if Amendment details description is available 
     */
	isTimelineAmendDetailVisi : function(oValue) {
		
		if(oValue && oValue.length > 0){
			return true;
		}else{
			return false;
		}
	},
	
	
    /** Format System Install Date and add the prefix
     * @param oValue : System Installation Date
     */
	systemInstallDate : function(oValue) {
		if (oValue) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "dd-MMM-yyyy"
					});
			
			var sInstalledOn = dia.cmc.common.helper.ModelHelper.getText("InstalledOn");
			return sInstalledOn + " " + oDateFormat.format(new Date(oValue));
		} else {
			return dia.cmc.common.helper.ModelHelper.getText("NotYetInstalled"); 
		}
	},
	

	serviceFrom : function(dFromDate){
		if(dFromDate == undefined){
			return dia.cmc.common.helper.ModelHelper.getText("NA");
		}
		
		var sServiceFrom = dia.cmc.common.util.Formatter.date(dFromDate);
		
		sServiceFrom +=  " " + dia.cmc.common.helper.ModelHelper.getText("To") + " ";

		return sServiceFrom;
	},
	
    /** Convert Date field to EDM Format which Odate service can understand.
     * EDM Format is "yyyy-MM-dd T HH:mm:dd
     * @param oValue : Date which needs to be formated
     */
	convertToEDMDate : function (oValue) {
		
		if(oValue === undefined || oValue === null || oValue === "")
			return;
		
		var oDateFormat = sap.ui.core.format.DateFormat
		.getDateTimeInstance({
			pattern : "yyyy-MM-dd"
		});
		
		var oTimeFormat = sap.ui.core.format.DateFormat
		.getDateTimeInstance({
			pattern : "HH:mm:ss"
		});
		
		var sDate = oDateFormat.format(new Date(oValue)) + "T" + oTimeFormat.format(new Date(oValue));
		
		return sDate;

//
//        var myDate = new Date(jsonDate.match(/\d+/)[0] * 1);
//        myDate.add(4).hours();  //using {date.format.js} to add time to compensate for timezone offset
//        return myDate.format(returnFormat); //using {date.format.js} plugin to format :: EDM FORMAT='yyyy-MM-ddTHH:mm:ss'
    },
	
    /** Base on ValidTo date return the visiblity for Edit button.
     *  Edit button should only be visible if Item is still vaild ( ValidTo > Current Date )
     *  @param dToDate : Valid To Date
     */
    amendmentChangeBtnVisi : function(dToDate){
    	var dToday = new Date();
    	if(dToDate < dToday){
    		return Boolean(false);
    	}
    	else{
    		return Boolean(true);
    	}
    },


    
    /** Returns True if Amendment description is more than 30 characters 
     * @param oValue : Amendment description
     */
	isMoreAmendDescription : function(oValue) {
		
		if(oValue.length > 40) {
			return true;
		}else{
			return false;
		}
	},
	
    /** if description is long, return only 30 characters 
     * @param oValue : Amendment description
     */
	shortAmendDescription : function(oValue) {

		if(oValue.length > 40) {
			return oValue.substring(0, 40);	
		}
		else{
			return oValue;
		}
	},
	
	/**Format thousand and decimal point as per user's default setting in SAP
	 * @param oValue: Price or Qty
	 */
	formatDecimal : function(oValue){
		
		if(oValue === undefined || oValue === null || oValue === ""){
			return;
		}
			
		var sDecimalFormat = "";
		var sThousandFormat = "";
		var oValueArr = [];
		
		// User's default decimal format setting from SAP
		var sDecimalFormatCode = dia.cmc.common.helper.ModelHelper.oDefaultParameterModel.getProperty("/DecimalFormat");
	
		// Base of setting, set the decimal format
		if(sDecimalFormatCode === "X"){
			sThousandFormat = ",";
			sDecimalFormat = ".";
		}else if(sDecimalFormatCode === ""){
			sThousandFormat = ".";
			sDecimalFormat = ",";
		}else if(sDecimalFormatCode === "Y"){
			sThousandFormat = ",";
			sDecimalFormat = " ";
		}
		
		oValueArr = oValue.toString().split(".");
		oValueArr[0] = oValueArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, sThousandFormat); 
		oValue = oValueArr[0] + (oValueArr[1] ? sDecimalFormat  + oValueArr[1] : "");
		
		return oValue;
	},
	
	
//	fileSize : function(oValue){
//		
//		var sSize = oValue + "KB";
//		return sSize;
//	}
    
    //
//	quantity : function(oValue) {
//		try {
//			return (oValue) ? parseFloat(oValue).toFixed(0) : oValue;
//		} catch (err) {
//			return "Not-A-Number";
//		}
//	},
//

	
};