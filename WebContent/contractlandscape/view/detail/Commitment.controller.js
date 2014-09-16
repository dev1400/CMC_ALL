jQuery.sap.require("openui5.googlemaps.MapUtils");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");

sap.ui.controller("dia.cmc.contractlandscape.view.detail.Commitment", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf view.detail.Partner
	 */
	onInit : function() {
		// Model Helper reference
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;

		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onBeforeRendering: function() {
	// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onAfterRendering: function() {
	// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources
	 * and finalize activities.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onExit: function() {
	// }
	
	/***************************************************************************
	 * Start - Amendment related code
	 **************************************************************************/

	/**
	 * Event Handler for Commitment Amendment(Add or Change) button. It will open Commitment Amendment popup window
	 * @param oEvent
	 */
	handleAmendCommitmentPopup : function (oEvent){
		
	  	var bEnable = false;
	  	
	  	var sButtonId = oEvent.getSource().getId();
	  	
	  	if ( sButtonId.indexOf("AddChange") > 0 ){			// Add / Change Commitment
	  		bEnable = true;
	  		sTitle = this.ModelHelper.getText("AddChangeCommitment");
	  	}
	  	else if ( sButtonId.indexOf("Add") > 0){			// Add Commitment
	  		bEnable = true;
	  		sTitle = this.ModelHelper.getText("AddCommitment");
	  	}
	  	else{											// Change Commitment
	  		bEnable = false;
	  		sTitle = this.ModelHelper.getText("ChangeCommitment");
	  		
			var oSelectedContext = oEvent.getSource().getBindingContext("DealDetailModel");
			
		  	// Set selected item details in Model so that it can be passed to Popup window.  ( tried to set context binding for popup window but its not working so using this work around)
		  	this.ModelHelper.setSelectedItem(oSelectedContext.getPath(), "/SelectedCommitmentItem");
//		  	this._amendComitment.setBindingContext(oSelectedContext);
	  	}
	  	
  		
	  	// Set enable property for Material field in popup
	  	this.ModelHelper.setProperty("MaterialEnable", bEnable);
	  	
		// Set title property for commitment amendment popup
		this.ModelHelper.setProperty("AmendCommitmentTitle", sTitle);
		
	    // create Amend Validity Change popup only once
	    if (!this._amendComitment) {
	      this._amendComitment = new sap.ui.xmlfragment(
	        "dia.cmc.contractlandscape.fragments.amendment.Commitment",
	        this
	      );
	      
	      this.getView().addDependent(this._amendComitment);
	    }

	    this._amendComitment.open();

	},

	
	
	/**
	 * Event handler for Commitment Amendment - Validate the Commitment Amendment input
	 * and Post it to SAP
	 * 
	 * @param oEvent
	 */
	handleAmendCommitmentPost : function(oEvent) {

		// Array of controls on Commitment Amendment popup with OData service field names
		var oControlList = [{id:"idCAPartner", 		uiType:"TB",	value:"", 	mandatory:true, 	field:"CallOffPartner" },
		                    {id:"idCAProduct", 		uiType:"TB",	value:"", 	mandatory:true, 	field:"Material" },
		                    {id:"idCANewQuantity", 	uiType:"TB",	value:"", 	mandatory:true, 	field:"Quantity" },
		                    {id:"idCANewUOM", 		uiType:"TB",	value:"", 	mandatory:true, 	field:"Uom" },
		                    {id:"idCAValidFrom", 	uiType:"DT",	value:"", 	mandatory:true, 	field:"ValidFrom" },
		                    {id:"idCAValidTo", 		uiType:"DT",	value:"", 	mandatory:true, 	field:"ValidTo" }];
		
		// Validate the commitment amendment input
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, "C");

		if (canContinue == false) // Validation failed, return
			return;

		// Get reference of selected material price item
		var oCommitmentAmendDetail = this.ModelHelper
				.getSelectedItem("/SelectedCommitmentItem");

		// Set the value in model
		jQuery.each(oControlList, function(i, el) {

			if (el.value) {
				oCommitmentAmendDetail[el.field] = el.value;
			}
		});

		// Call Helper class method to update Deal Details to SAP
		oCommitmentAmendDetail = this.ModelHelper
				.postCommitmentAmendment(oCommitmentAmendDetail);

		// Display Success or Error message. It will be passed from SAP
		sap.m.MessageBox.alert(oCommitmentAmendDetail.Message, {
			title : "Amendment Result"
		});

		// Close popup window if Amendment was successful
		if (oCommitmentAmendDetail.MessageType != "E") { // Message will not be "E" if Amendment is created successfully

			this.CommonController.closePopupWindow(oEvent);

		}
	},

	/**
	 * Event handler for Amendment popup close button
	 * 
	 * @param oEvent
	 */
	handleAmendPopupClose : function(oEvent) {
		this.CommonController.closePopupWindow(oEvent);
	}

/*******************************************************************************
 * End - Amendment related code
 ******************************************************************************/
});