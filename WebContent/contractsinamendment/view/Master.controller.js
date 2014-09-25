jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.DateRangeSelection");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.require("sap.ui.ux3.ToolPopup");


sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
	onInit : function() {

		// Model Helper reference
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;

		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;

		// // set i18n model
		// var i18nModel = new sap.ui.model.resource.ResourceModel({
		// bundleUrl: "contractsinamendment/i18n/messageBundle.properties"
		// });
		// this.getView().setModel(i18nModel, "i18n");

		// set explored app's demo model on this sample
		/*
		 * var oModel = new
		 * sap.ui.model.json.JSONModel("contractsinamendment/model/products.json");
		 * this.getView().setModel(oModel);
		 */

	

		this._oLabel = new sap.ui.commons.Label({
			text : "Select date range:",
			labelFor : this._oDateRangeSelection
		});
		this._oDateRangeSelection = new sap.m.DateRangeSelection({
			id : "idExecutedAmendments",
			from : "{path:'/fromidExecutedAmendments'}",
			to : "{path:'/toidExecutedAmendments'}",
			displayFormat : "{i18n>DateFormat}"
		});
		this._oButton = new sap.m.Button({
			type : "Accept",
			text : "{i18n>Go}"
		});
		
	/*	this._oLayout1 = new sap.m.HBox({id : "idHbox", setAlignItems : sap.ui.commons.layout.VAlign.Middle});*/
		
		this._oLayout = this.getView().byId("idMatrixLayout");
		
		$(document).ready(function() {

			$("[id$='idIconTabBar-content']").remove();
			// $("#__xmlview1--idIconTabBar-content").remove();
		});

	},

	handleIconTabBarSelect : function(oEvent) {
		this._oTable = this.getView().byId("idTable");
		var oBinding = this._oTable.getBinding("items"), sKey = oEvent
				.getParameter("selectedKey"), oFilter;

		if (sKey === "Created") {
			
			this._oLayout.removeAllRows();

			oFilter = new sap.ui.model.Filter("Status", "EQ",
					"CRTD");
			oBinding.filter([ oFilter ]);
		} else if (sKey === "Released") {
			
			this._oLayout.removeAllRows();
			
			oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ",
					"Released");
			oBinding.filter([ oFilter ]);
		} else if (sKey === "Executed") {
			
			this._oLayout.removeAllRows();
			var oInput1Column1 = new sap.ui.commons.layout.MatrixLayoutCell();
            oInput1Column1.setColSpan(1);
            oInput1Column1.setRowSpan(1);
            oInput1Column1.setVAlign(sap.ui.commons.layout.VAlign.Middle);
            oInput1Column1.setHAlign(sap.ui.commons.layout.HAlign.Right);
            oInput1Column1.addContent(this._oLabel);
            
            var oInput1Column2 = new sap.ui.commons.layout.MatrixLayoutCell();
            oInput1Column2.setColSpan(1);
            oInput1Column2.setRowSpan(1);
            oInput1Column2.setVAlign(sap.ui.commons.layout.VAlign.Middle);
            oInput1Column2.setHAlign(sap.ui.commons.layout.HAlign.Center);
            oInput1Column2.addContent(this._oDateRangeSelection);
            
            var oInput1Column3 = new sap.ui.commons.layout.MatrixLayoutCell();
            oInput1Column3.setColSpan(1);
            oInput1Column3.setRowSpan(1);
            oInput1Column3.setVAlign(sap.ui.commons.layout.VAlign.Middle);
            oInput1Column3.setHAlign(sap.ui.commons.layout.HAlign.Left);
            oInput1Column3.addContent(this._oButton);
            
            
			this._oLayout.createRow(oInput1Column1, oInput1Column2, oInput1Column3);
          
			oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ",
					"Executed");
			oBinding.filter([ oFilter ]);
		} else {

			this._oLayout.removeAllRows();
			oBinding.filter([]);
		}

	},
	/**
	 * Navigate to Deal Detail.
	 */
	handleLineItemPress : function(oEvent) {
		
		var oContext = oEvent.getSource().getBindingContext();
		// set selected Deal path to helper class
		this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();

		// If we're on a phone, include nav in history; if not, don't.
		var bReplace = jQuery.device.is.phone ? false : true;

		var oDealDetail = this.getView().getModel().getProperty(
				oContext.getPath());

		this.CommonController.getRouter(this).navTo("dealDetail", {
			from : "master",
			dealId : oDealDetail.DealId,
		}, bReplace);
	},

	/**
	 * Cancel an Amendment handler.
	 */
	handleCancelPress : function(evt) {

		var fnClose = function(oResult) {
			if (oResult) {
				/*
				 * console.log("isConfirmed:" + oResult.isConfirmed); if
				 * (oResult.sNote) { console.log(oResult.sNote); }
				 */
			}
		}

		/**
		 * Opens the confirmation dialog
		 */
		sap.ca.ui.dialog.confirmation.open(
				{
					question : this.ModelHelper
							.getText("AmendmentCancellationMessage"),
					title : this.ModelHelper.getText("CancelAmendment"),
					confirmButtonLabel : this.ModelHelper.getText("Ok")
				}, fnClose);
	},

	/**
	 * Navigate to Amendment Flow.
	 */
	handleWorkFlowPress : function(oEvent) {

		var oContext = oEvent.getSource().getBindingContext();

		this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();

		// If we're on a phone, include nav in history; if not, don't.
		var bReplace = jQuery.device.is.phone ? false : true;

		var oDealDetail = this.getView().getModel().getProperty(
				oContext.getPath());

		this.CommonController.getRouter(this).navTo("AmendmentFlow", {
			from : "master",
			dealId : oDealDetail.DealId,
		}, bReplace);
	},
	/**
	 * Display pop-up.
	 */
	handlePopoverPress : function(oEvent) {
		
		var oButton = oEvent.getSource();

		// create popover
		if (!this._oPopover) {		
		
		this._oPopover = sap.ui.xmlfragment(
				"dia.cmc.contractsinamendment.fragments.AmendmentDescription",
				this);
		
		this.getView().addDependent(this._oPopover);		
		
		var test = this.getView().byId("idOI1");
		console.dir(test);
		console.log(test.getId());
		console.log(test.getTitle());
		this._oPopover.bindElement("/DealInAmendmentCollection/");
		}
		
		this._oPopover.openBy(oButton);
		
	},

});