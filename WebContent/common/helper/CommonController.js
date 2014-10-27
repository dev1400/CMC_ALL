/**
 * This is a common controller between all the views. It contains methods and
 * functionality which is common between all the views
 */

jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("sap.ui.commons.RichTooltip");

jQuery.sap.declare("dia.cmc.common.helper.CommonController");

dia.cmc.common.helper.CommonController = {

	// Model Helper reference
	ModelHelper : dia.cmc.common.helper.ModelHelper,
		
	/** Close the popup window
	 * @param oEvent
	 */
	closePopupWindow : function(oEvent) {
		oEvent.getSource().getParent().close();
	},


	
	/** Validate the Amendment inputs
	 * @param oEvent
	 * @param oControlList : Array of UI Control on Amendment screen
	 * @param sAmendType : Amendment Type ( R - Recalculation, P - Pricing, V - Validity Change, T - Termination
	 */
	validateInput : function(oEvent, oControlList, sAmendType) {

		var bCanContinue = true;
		var bAtLeastOneSelected = false;
		var sErrorMsg = null;
		var that = this;
		
		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by
		// changes
		jQuery.each(oControlList, function(i, el) {

			oControl = sap.ui.getCore().byId(el.id);

			if (el.uiType === "TB") { // Text Box or other String type control
				el.value = oControl.getValue();
			} else if (el.uiType === "DT" || el.uiType === "DRF") { // Date Field or Date Range From 
				
				el.value = dia.cmc.common.util.Formatter.convertToEDMDate(oControl.getDateValue());
			}
			else if (el.uiType === "DRT") { // Date Range To Date
				
				el.value = dia.cmc.common.util.Formatter.convertToEDMDate(oControl.getSecondDateValue());
			}
			else if(el.uiType === "DDB"){			// Dropdown / Combo Box UI Control
				el.value = oControl.getSelectedKey();
			}
			else {

				if (oControl.getSelected() === false) { // If Radio and Check
														// box is not selected,
														// clear the default
														// value
					el.value = "";
				} else {
					if (sAmendType === "V" && ( el.id === "idHeaderLevel" || el.uiType === "CBGRP" )) { // Exception
																									// case
																									// for
																									// Validity
																									// Amendment
						bAtLeastOneSelected = true;
					}
				}
			}

			if (el.mandatory === true) {

				if (!el.value) {
					oControl.setValueState("Error");
					bCanContinue = false;
					
					sErrorMsg = that.ModelHelper.getText("MandatoryFields");
					
				} else {
					oControl.setValueState("None");
				}
			}
			
			if (bCanContinue && el.minLength > 0) {

				if (el.value.length < el.minLength ) {
					oControl.setValueState("Error");
					bCanContinue = false;
					
					sErrorMsg = that.ModelHelper.getText("MinLengthError", el.minLength);
					
				} else {
					oControl.setValueState("None");
				}
			}
			

		});

		// Exception case for Validity Amendment. Check at least one service
		// item is selected
		if (sAmendType === "V" && bAtLeastOneSelected === false) {
			
			bCanContinue = false;
			sap.m.MessageToast.show(this.ModelHelper.getText("MandatoryServiceItem"));
			
		} else if (!bCanContinue) {
			sap.m.MessageToast.show(sErrorMsg);
		}

		return bCanContinue;

	},

	/** Get UI element reference
	 * @param sId : UI Element Id
	 * @param oView : View reference
	 */
	getUIElement: function(sId, oView){
		if(oView != undefined || oView != null ){
			return oView.byId(sId);
		}
		else{
			return sap.ui.getCore().byId(sId);
		}
	},
	
	/** Get Router reference
	 * @param oView : View reference
	 */
	getRouter: function (oView){
		return sap.ui.core.UIComponent.getRouterFor(oView);
	},
	
	getBrowserLanguage : function(){
		var sLang = null;
		
		if (navigator.userLanguage){ 			// Explorer
			sLang = navigator.userLanguage;
			
		}else{ // FF & Chrome
			sLang = navigator.language;
		} 
		
		return sLang;
	},
	
	
	/**
	 * Helper function that decorates a given control with a RichTooltip showing a quick help text 
	 */
	setQuickHelp: function (oControl, sTextId, bCustomize) {
		
		var sText = this.ModelHelper.getText(sTextId);
		
		// create the RichTooltip control 
		var oRichTooltip = new sap.ui.commons.RichTooltip({
			text : sText,
			title: this.ModelHelper.getText("QuickHelp"),
			imageSrc : "common/mime/Tip.png"
		});
		//Change position and durations if required 
		if (bCustomize) {
			oRichTooltip.setMyPosition("begin top");
			oRichTooltip.setAtPosition("end top");
			oRichTooltip.setOpenDuration(300);
			oRichTooltip.setCloseDuration(300);
		}
		// add it to the control
		oControl.setTooltip(oRichTooltip);
		// return the control itself (makes this function a decorator function)
		return oControl;
	}
};