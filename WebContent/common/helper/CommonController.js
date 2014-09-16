/**
 * This is a common controller between all the views. It contains methods and
 * functionality which is common between all the views
 */

jQuery.sap.require("dia.cmc.common.helper.ModelHelper");

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

		var canContinue = true;
		var atLeastOneSelected = false;

		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by
		// changes
		jQuery.each(oControlList, function(i, el) {

			oControl = sap.ui.getCore().byId(el.id);

			if (el.uiType === "TB") { // Text Box or other String type control
				el.value = oControl.getValue();
			} else if (el.uiType === "DT" || el.uiType === "DRF") { // Date Field or Date Range From 
				
				el.value = dia.cmc.common.util.Formatter.convertToEDMDate(oControl.getDateValue());
				
//				el.value = oControl.getValue();
//
//				if (el.value)
//					el.value = el.value + "T00:00:00"; // Add time portion
			}
			else if (el.uiType === "DRT") { // Date Range To Date
				
				el.value = dia.cmc.common.util.Formatter.convertToEDMDate(oControl.getSecondDateValue());
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
						atLeastOneSelected = true;
					}
				}
			}

			if (el.mandatory === true) {

				if (!el.value) {
					oControl.setValueState("Error");
					canContinue = false;
				} else {
					oControl.setValueState("None");
				}
			}

		});

		// Exception case for Validity Amendment. Check at least one service
		// item is selected
		if (sAmendType === "V" && atLeastOneSelected === false) {
			
			canContinue = false;
			sap.m.MessageToast.show(this.ModelHelper.getText("MandatoryServiceItem"));
			
		} else if (!canContinue) {
			sap.m.MessageToast.show(this.ModelHelper.getText("MandatoryFields"));
		}

		return canContinue;

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
	}
};