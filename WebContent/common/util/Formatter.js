jQuery.sap.declare("dia.cmc.common.util.Formatter");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
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
			return sInstalledOn +  oDateFormat.format(new Date(oValue));
		} else {
			return dia.cmc.common.helper.ModelHelper.getText("NotYetInstalled"); 
		}
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