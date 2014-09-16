jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");

sap.ui.controller("dia.cmc.contractlandscape.view.detail.Pricing", {

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
	 * Start - Pricing tab - Search & Filter Code
	 **************************************************************************/

	/**
	 * Event handler for Pricing live search
	 * 
	 * @param oEvent
	 */
	handlePricingLiveSearch : function(oEvent) {
		this._clientsideSearchPricing(oEvent);
	},

	/**
	 * Event handler for Pricing search
	 * 
	 * @param oEvent
	 */
	handlePricingSearch : function(oEvent) {
		this._clientsideSearchPricing(oEvent);
	},

	/**
	 * Event handler for Pricing Filter Change event
	 * 
	 * @param oEvent
	 */
	handlePricingFilterChange : function(oEvent) {

		// Get the selected key value from Select Control
		var oSelect = this.getView().byId("idPriceFilterSelect");
		var sSelectedKey = oSelect.getSelectedKey();

		var dToday = new Date();
		var filters = [];
		var bValidOnDateVisi = false;

		// Build the filter array base on selected filter criteria
		if (sSelectedKey == "1") { // Valid On

			bValidOnDateVisi = true;
		} else if (sSelectedKey == "2") { // Expired
			filters = new sap.ui.model.Filter([
					// new sap.ui.model.Filter("ValidFrom",
					// sap.ui.model.FilterOperator.GT, dToday),
					new sap.ui.model.Filter("ValidTo",
							sap.ui.model.FilterOperator.LT, dToday), ], false);

			this._filterPricingData(filters);
		} else { // None

			this._filterPricingData(null);
		}

		// Get reference of Price Valid On Date element
		var oValidOnDate = this.getView().byId("idPriceValidOnDate");

		// Set the visibility of Valid On Date
		oValidOnDate.setVisible(bValidOnDateVisi);

		if (oValidOnDate.getDateValue() === null)
			oValidOnDate.setDateValue(new Date()); // Set current date as
		// default date

		if (bValidOnDateVisi)
			this.handlePricingValidOnDateChange(oEvent); // Call Valid On
		// Change event
		// handler to filter
		// the data
	},

	/**
	 * Event handler for Valid On Date change event
	 * 
	 * @param oEvent
	 */
	handlePricingValidOnDateChange : function(oEvent) {

		// Get the Valid on Date value
		var oValidOnDate = this.getView().byId("idPriceValidOnDate");
		var oDate = new Date(oValidOnDate.getDateValue());

		// Create filter array
		filters = new sap.ui.model.Filter([
				new sap.ui.model.Filter("ValidFrom",
						sap.ui.model.FilterOperator.LE, oDate),
				new sap.ui.model.Filter("ValidTo",
						sap.ui.model.FilterOperator.GE, oDate), ], true);

		// Filter the table data
		this._filterPricingData(filters);

	},

	/**
	 * Event handler for Pricing Tab select event
	 * 
	 * @param oEvent
	 */
	handlePricingTabSelect : function(oEvent) {

		// Clear value of search field
		var oPricingSearchField = this.getView().byId("idPricingSearchField");
		oPricingSearchField.setValue("");

		// Set default value of Filter
		var oSelect = this.getView().byId("idPriceFilterSelect");
		oSelect.setSelectedKey("1");

		// Call Filter the data
		this.handlePricingFilterChange(oEvent);

		// // Get the default data without any filter
		// this._filterPricingData(null);

		var sSelectedKey = oEvent.getParameter("key"); // Get selected tab key

		// Set visibility of Price Amendment buttons
		if (sSelectedKey === "MatPrice" || sSelectedKey === "TestPrice")
			this.ModelHelper.setProperty("PricingActionButtonVisi", true);
		else
			this.ModelHelper.setProperty("PricingActionButtonVisi", false);
	},

	/**
	 * Search data in Pricing Collections at client side
	 * 
	 * @param oEvent
	 */
	_clientsideSearchPricing : function(oEvent) {

		// create model filter
		var filters = [];
		var sQuery = oEvent.getSource().getValue();

		var oPricingTabBar = this.getView().byId("idPricingTabBar");
		var sSelectedTab = oPricingTabBar.getSelectedKey();

		if (sQuery && sQuery.length > 0) {

			if (sSelectedTab === "MatPrice") { // Material Price tab is
				// selected

				filters = new sap.ui.model.Filter([
						new sap.ui.model.Filter("AgreementTypeDesc",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Material",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Description",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Rate",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Unit",
								sap.ui.model.FilterOperator.EQ, sQuery),
						new sap.ui.model.Filter("CurrencyCode",
								sap.ui.model.FilterOperator.EQ, sQuery) ],
						false);

			} else if (sSelectedTab === "TestPrice") { // Test Price tab is
				// selected

				filters = new sap.ui.model.Filter([
						new sap.ui.model.Filter("AgreementTypeDesc",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Test",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Description",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Rate",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("Unit",
								sap.ui.model.FilterOperator.EQ, sQuery),
						new sap.ui.model.Filter("CurrencyCode",
								sap.ui.model.FilterOperator.EQ, sQuery) ],
						false);

			} else if (sSelectedTab === "MatDisc") { // Material Discount tab
				// is selected

				filters = new sap.ui.model.Filter(
						[
								new sap.ui.model.Filter("AgreementTypeDesc",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Material",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Description",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Discount",
										sap.ui.model.FilterOperator.Contains,
										sQuery), ], false);

			} else if (sSelectedTab === "HierDisc") { // Hierarchy Discount
				// tab is selected

				filters = new sap.ui.model.Filter(
						[
								new sap.ui.model.Filter("AgreementTypeDesc",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Material",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Description",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Discount",
										sap.ui.model.FilterOperator.Contains,
										sQuery), ], false);

			} else if (sSelectedTab === "GrpDisc") { // // Group Discount tab
				// is selected

				filters = new sap.ui.model.Filter(
						[
								new sap.ui.model.Filter("AgreementTypeDesc",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Group",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Description",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("Discount",
										sap.ui.model.FilterOperator.Contains,
										sQuery), ], false);
			}
		}

		// Update table binding
		var sTableId = "id" + sSelectedTab + "Table";
		var oTable = this.getView().byId(sTableId);
		var oBinding = oTable.getBinding("items");
		oBinding.filter(filters);

	},

	/**
	 * Filter pricing data base on passed Filters and bind it to Table
	 * 
	 * @param oFilters -
	 *            Filter object array
	 */
	_filterPricingData : function(oFilters) {

		var oPricingTabBar = this.getView().byId("idPricingTabBar");
		var sSelectedTab = oPricingTabBar.getSelectedKey();

		var sTableId = "id" + sSelectedTab + "Table";

		// Update table binding
		var oTable = this.getView().byId(sTableId);
		var oBinding = oTable.getBinding("items");
		oBinding.filter(oFilters);

	},

	/***************************************************************************
	 * End - Pricing tab - Search & Filter Code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Amendment related code
	 **************************************************************************/

	/**
	 * Event Handler for Amend Recalculation button. It will open Recalculation
	 * Amendment popup window
	 * 
	 */
	handleAmendPricePopup : function(oEvent) {

		var oPricingTabBar = this.getView().byId("idPricingTabBar");
		var sSelectedTab = oPricingTabBar.getSelectedKey();

		var sMaterialText = null;

		// Get Material Price table reference
		if (sSelectedTab === "MatPrice") {
			oPriceTable = this.getView().byId("idMatPriceTable");
			sMaterialText = "Product";
		} else {
			oPriceTable = this.getView().byId("idTestPriceTable");
			sMaterialText = "Test";
		}

		// Get text
		var sMaterialLabel = this.ModelHelper.getText(sMaterialText);

		// Set property in Model for Add / Change popup Material Lable
		this.ModelHelper.setProperty("MaterialLabel", sMaterialLabel);

		// Get Selected item context reference
		var oSelectedContext = oEvent.getSource().getBindingContext(
				"DealDetailModel");

		var bEnable = false;
		var sTitle = "";

		var sButtonId = oEvent.getSource().getId();

		if (sButtonId.indexOf("AddChange") > 0) { // Add/Change Price button
			// clicked
			bEnable = true;
			sTitle = this.ModelHelper.getText("AddChangePrice");
		} else if (sButtonId.indexOf("Add") > 0) { // Add Price button clicked
			bEnable = true;
			sTitle = this.ModelHelper.getText("AddPrice");
		} else { // Change Price button clicked
			bEnable = false;
			sTitle = this.ModelHelper.getText("ChangePrice");

			// Set selected item details in Model so that it can be passed to
			// Popup window. ( tried to set context binding for popup window but
			// its not working so using this work around)
			this.ModelHelper.setSelectedItem(oSelectedContext.getPath(),
					"/SelectedPriceItem");
			// this._amendAddChangePrice.setBindingContext(oSelectedContext[0]);

		}

		// Set enable property for Material field in popup
		this.ModelHelper.setProperty("MaterialEnable", bEnable);

		// Set title property for price amendment popup
		this.ModelHelper.setProperty("AmendPriceTitle", sTitle);

		// create Amend Add Change Price popup only once
		if (!this._amendAddChangePrice) {
			this._amendAddChangePrice = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragments.amendment.AddChangePrice", this);

			this.getView().addDependent(this._amendAddChangePrice);
		}

		this._amendAddChangePrice.open();

	},

	/**
	 * Event handler for Price Amendment - Validate the Price Amendment input
	 * and Post it to SAP
	 * 
	 * @param oEvent
	 */
	handleAmendPricePost : function(oEvent) {

		// Array of controls on Price Amendment popup with OData service field
		// names
		var oControlList = [ {
			id : "idPAProduct",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "Material"
		}, {
			id : "idPANewPrice",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "Rate"
		}, {
			id : "idPANewPricePerX",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "Unit"
		}, {
			id : "idPANewPriceUOM",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "Uom"
		}, {
			id : "idPAValidFrom",
			uiType : "DT",
			value : "",
			mandatory : true,
			field : "ValidFrom"
		}, {
			id : "idPAValidTo",
			uiType : "DT",
			value : "",
			mandatory : true,
			field : "ValidTo"
		} ];

		// Validate the price amendment input
		var canContinue = this.CommonController.validateInput(oEvent,
				oControlList, "P");

		if (canContinue == false) // Validation failed, return
			return;
		
		// Check - Valid From date should be greater than current date
		var oValidFromUI = this.CommonController.getUIElement("idPAValidFrom");
		var dValidFrom = new Date(oValidFromUI.getValue());
		var dToday = new Date();
		
		if( dValidFrom < dToday){
			var sMsg = this.ModelHelper.getText("InvalidFromDate");
			sap.m.MessageToast.show(sMsg);
			oValidFromUI.setValueState("Error");
			canContinue = false;
		}
		else {
			oValidFromUI.setValueState("None");
		}
		
		if (canContinue == false) // Validation failed, return
			return;
		
		// Get reference of selected material price item
		var oPriceAmendDetail = this.ModelHelper
				.getSelectedItem("/SelectedPriceItem");

		// Set the value in model
		jQuery.each(oControlList, function(i, el) {

			if (el.value) {
				oPriceAmendDetail[el.field] = el.value;
			}
		});

		// Call Helper class method to update Deal Details to SAP
		oPriceAmendDetail = this.ModelHelper
				.postPriceAmendment(oPriceAmendDetail);

		// Display Success or Error message. It will be passed from SAP
		sap.m.MessageBox.alert(oPriceAmendDetail.Message, {
			title : "Amendment Result"
		});

		// Close popup window if Amendment was successful
		if (oPriceAmendDetail.MessageType != "E") { // Message will not be "E"
													// if Amendment is created
													// successfully

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