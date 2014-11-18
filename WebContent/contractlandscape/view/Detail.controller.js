jQuery.sap.require("dia.cmc.common.util.Formatter");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("openui5.googlemaps.MapUtils");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");

// jQuery.sap.require("sap.m.URLHelper");

sap.ui.controller("dia.cmc.contractlandscape.view.Detail", {

	/***************************************************************************
	 * Start - Standard hook events
	 **************************************************************************/

	onInit : function(oEvent) {

		// Model Helper reference
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;

		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;

		// Search location suggestions
		this.locations = [];

		// Attached event handler for route match event
		this.CommonController.getRouter(this).attachRouteMatched(this.handleRouteMatched, this);
		
	
		
		
		

        
	},
	
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.detail.Partner
	 */
	 onAfterRendering: function(oEvent) {
		 
//		 window.rootView.addStyleClass("sapUiSizeCompact");
//		 
//	        $(document).ready(function() {
//	            $("#__xmlview2--idHeaderTable-tblHeader").css("height","0");
//	            $("#__xmlview1--idHeaderTable-tblHeader").css("background-color","yellow");
//	        	
////	            $("#__xmlview2--idHeaderTable-tblHeader").hide();
////	            $("#__xmlview1--idHeaderTable-tblHeader").hide();
//	            
//	        });

	 },
	 
	/** Event handler for Route Matched event 
	 * It will check for deal id and if available, reads the deal details
	 * @param oEvent
	 */
	handleRouteMatched : function(oEvent) {
		
		var oView = this.getView();
		
		if (oEvent.getParameter("name") === "dealDetail") {		// check route name

			var sDealId = oEvent.getParameter("arguments").dealId;
			
			var oDealDetailModel = this.ModelHelper.readDealDetail(sDealId);

			oView.setModel(oDealDetailModel,"DealDetailModel");
			
		}
	},
	
	/***************************************************************************
	 * End - Standard hook events
	 **************************************************************************/

	/***************************************************************************
	 * Start - Header Section related Code
	 **************************************************************************/

	/** Event handler for Back button
	 * @param oEvent
	 */
	handleNavButtonPress : function(oEvent) {
//		this.nav.back("Master");
		// This is only relevant when running on phone devices
		this.CommonController.getRouter(this).myNavBack("main");
	},

	handleShowHideMasterList : function(oEvent){
		
		if(window.globalapp.isMasterShown()){
			window.globalapp.hideMaster();
		}
		else{
			window.globalapp.showMaster();
		}
	},
	
	
	/** Event handler for Contract Term link. It will display contract term detail in popup window
	 * @param oEvent
	 */
	handleContractTermPress : function(oEvent) {
		
		// create Contract Term popup only once
		if (!this._contractTerm) {
			this._contractTerm = new sap.ui.xmlfragment(
					"idContractTermFragment", "dia.cmc.contractlandscape.fragment.ContractTerm",
					this);

			this.getView().addDependent(this._contractTerm);
		}

		// Get reference of Contract Term Link
		var oContractTermLink = oEvent.getSource();
		
		// Open Contract Term fragment
		this._contractTerm.openBy(oContractTermLink);

	},

	/** Event handler for Deal Status link. It will display Amendment details in popup window
	 * @param oEvent
	 */
	handleDealStatusPress : function(oEvent) {

		// Read amendment details
		var oAmendmentDetailModel = this.ModelHelper.readAmendmentDetail();

		// Bind amendment detail model
		this.getView().setModel(oAmendmentDetailModel,"AmendmentDetail");

		if (!this._amendmentStatusDetail) {
			this._amendmentStatusDetail = new sap.ui.xmlfragment(
					"idAmendmentStatusFragment", "dia.cmc.contractlandscape.fragment.amendment.AmendmentStatusDetail",
					this);

			this.getView().addDependent(this._amendmentStatusDetail);
		}

		// Get reference of Contract Term Link
		var oStatusLink = oEvent.getSource();
		
		// Open Contract Term fragment
		this._amendmentStatusDetail.openBy(oStatusLink);

	},
	
	/***************************************************************************
	 * End - Header Section related Code
	 **************************************************************************/
	
	
	
	 /**********************************************************************************************************************************
	 * Start - Landscape & Partner Facet Filter related Code 
	 ***********************************************************************************************************************************/
	
	/** Event handler for Facet Filter List close event. 
	 * It is common for both Landscape and Partner Facet Filter
	 */
	  handleFacetFilterListClose: function(oEvent) {
		  
	    // Get the Facet Filter lists and construct a (nested) filter for the binding
	
	    var oFacetFilter = oEvent.getSource().getParent();    
	    var sId = oFacetFilter.getId();

	    var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
	        return oList.getSelectedItems().length;
	      });

	    if(mFacetFilterLists.length) {
	    	
	      // Build the nested filter with ORs between the values of each group and
	      // ANDs between each group    
	      var oFilter = new sap.ui.model.Filter(mFacetFilterLists.map(function(oList) {
	    	  
	        return new sap.ui.model.Filter(oList.getSelectedItems().map(function(oItem) {
	          return new sap.ui.model.Filter(oList.getKey(), "EQ", oItem.getText());
	        }), false);
	        
	      }), true);
	      
	      // Apply the Facet Filter on data
	      this._applyFacetFilter(sId,oFilter);
	      
	    } else {
	    	
	      this._applyFacetFilter(sId,[]);
	    }
	    
	  },

//		/** Event handler for Facet Filter List Reset event. 
//		 * It is common for both Landscape and Partner Facet Filter
//		 */
//	  handleFacetFilterReset: function(oEvent) {
//		  
//		// Get reference of Facet Filter and List. 
//	    var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
//	    var aFacetFilterLists = oFacetFilter.getLists();
//	    
//	    // Clear all selected filter values
//	    for(var i=0; i < aFacetFilterLists.length; i++) {
//	      aFacetFilterLists[i].setSelectedKeys();
//	    }
//	    
//	    this._applyFacetFilter(oEvent.getParameter("id"),[]);
//	  },

	  
	/**Method for applying the Facet Filter on data source. It is common for both Landscape and Partner Facet Filter
	 */
	_applyFacetFilter: function(sIdFacetFilter, oFilter) {
	    
		// Get the id of data source from Facet Filter Id
		 if(sIdFacetFilter.indexOf("Landscape") > 0)
		    sId = "idLandscapeTable";
	    else if(sIdFacetFilter.indexOf("Partner") > 0)
	    	sId = "idPartnerList";
	    else
	    	return;

			// Get the table and apply the filter
		var oTable = this.getView().byId(sId);
	    oTable.getBinding("items").filter(oFilter);
	  },
	  
 
	 /**********************************************************************************************************************************
	 * End - Facet Filter related Code 
	 ***********************************************************************************************************************************/
	  
	  
	 /**********************************************************************************************************************************
	 * Start - Landscape Tab - System Detail related Code 
	 ***********************************************************************************************************************************/
	  
	  /** Event handler for System line item selection. It will navigate to System Detail page
	   */
	  handleSystemLineItemPress : function(oEvent){
		  
//		  var oDetailView = sap.ui.getCore().byId("Detail");
//		  
//		  oDetailView.nav.to("SystemDetail",null);
		  this.nav.to("SystemDetail",null);
	  },
		
	 /**********************************************************************************************************************************
	 * End - Other Code 
	 ***********************************************************************************************************************************/
	  
	  
	  /***************************************************************************
	 * Start - Partner Link Action related Code
	 **************************************************************************/

	/**
	 * Event handler for Partner Number. It will open default calling
	 * application.
	 */
	handlePartnerNumber : function(oEvent) {

		// Get the reference of link
		var oLink = this.getView().byId(oEvent.getSource().getId());

		// Trigger Telephone call
		sap.m.URLHelper.triggerTel(oLink.getText());
	},

	/**
	 * Event handler for Partner Email. It will open default email application.
	 */
	handlePartnerEmail : function(oEvent) {

		// Get the reference of link
		var oLink = this.getView().byId(oEvent.getSource().getId());

		// Trigger Email
		sap.m.URLHelper.triggerEmail(oLink.getText(), "Info Request");
	},

	/***************************************************************************
	 * End - Partner Link Action related Code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Google Map related code
	 **************************************************************************/

	/**
	 * Event handler for Partner Address link press. It will display Map window
	 * with address location
	 */
	handlePartnerAddressPress : function(oEvent) {

		// sap.ui.getCore().loadLibrary("openui5.googlemaps",
		// "lib/openui5/googlemaps/");

		// jQuery.sap.require("openui5.googlemaps.MapUtils");

		// Get reference of Map Util class of google map library
		this.oMapUtils = openui5.googlemaps.MapUtils;

		// Get Partner address
		var sPartnerAddress = oEvent.getSource().getText();

		// Search location
		this._searchLocationOnMap(sPartnerAddress, true);

	},

	// Event handler for Suggest event for Search Address field
	handleSearchAddressSuggest : function(oEvent) {
		// this.locations = [];
		var sValue = oEvent.getParameter("suggestValue");

		if (sValue.length > 3) {
			this.oMapUtils.search({
				'address' : sValue
			}).done(
					jQuery.proxy(this._searchAddressSuggestions, oEvent
							.getSource()));
		}
	},

	// Event handler for Search Address change
	handleSearchAddressChange : function(oEvent) {
		var sAddress = oEvent.getParameters('newValue').newValue;

		// var oCtxt = oEvent.getSource().getBindingContext();

		// var oMapModel = this.getView().getModel("MapModel");

		// this.locations.forEach(function(oLocation) {
		// if (oLocation.value === sAddress) {
		// // oCtxt.getModel().setProperty('lat', oLocation.lat, oCtxt);
		// // oCtxt.getModel().setProperty('lng', oLocation.lng, oCtxt);
		// // oCtxt.getModel().setProperty('name', oLocation.value, oCtxt);
		// oMapModel.setProperty("/Locations", oLocation);

		// }
		// });

		this._searchLocationOnMap(sAddress, false);
	},

	/* get my location */
	handleSearchAddress : function() {

	},

	handleLocateAddressAfterOpen : function(oEvent) {
		var oMapModel = this.getView().getModel("MapModel");
		var location = oMapModel.getProperty("/Locations/0");

		var oMapUI = sap.ui.getCore().byId("idMap");

		oMapUI.setLat(location.lat);
		oMapUI.setLng(location.lng);

	},

	/**
	 * Method for searching the suggestions for address
	 */
	_searchAddressSuggestions : function(results, status) {
		var that = this;
		this.destroySuggestionItems();
		// this.locations = [];

		this.locations = jQuery.map(results, function(item) {
			var location = {};
			location.value = item.formatted_address;
			location.lat = item.geometry.location.lat();
			location.lng = item.geometry.location.lng();
			return location;
		});

		this.locations.forEach(function(item) {
			that.addSuggestionItem(new sap.ui.core.ListItem({
				text : item.value,
			}));
		});
	},

	/**
	 * Method for searching Geocode of address and displaying it on Map.
	 */
	_searchLocationOnMap : function(sAddress, bMapWind) {

		var oView = this.getView();
		var oMapModel = this.getView().getModel("MapModel");
		var oController = this;

		// Call serach method to get the Geocode for partner address
		this.oMapUtils.search({
			'address' : sAddress
		}).done(
				function(results, status) {

					this.locations = [];

					this.locations = jQuery.map(results, function(item) {
						var location = {};
						location.name = item.formatted_address;
						location.lat = item.geometry.location.lat();
						location.lng = item.geometry.location.lng();
						return location;
					});

					oMapModel.setProperty("/Locations", locations);

					if (bMapWind) {
						if (!this._locateAddress) {
							this._locateAddress = sap.ui.xmlfragment(
									"dia.cmc.contractlandscape.fragment.LocateAddress",
									oController);

							oView.addDependent(this._locateAddress);
						}

						this._locateAddress.open();
					}

					var oMapUI = sap.ui.getCore().byId("idMap");
					oMapUI.setLat(results[0].geometry.location.lat());
					oMapUI.setLng(results[0].geometry.location.lng());

				});

	},

	/*******************************************************************************
	 * End - Google Map related code
	 ******************************************************************************/
	  
	/***************************************************************************
	 * Start - Pricing tab - Search & Filter Code
	 **************************************************************************/

	/**
	 * Event handler for Pricing search
	 * 
	 * @param oEvent
	 */
	handlePricingSearch : function(oEvent) {
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
						new sap.ui.model.Filter("NumberOfTests",
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
						new sap.ui.model.Filter("NumberOfTests",
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

		// Set visibility of Price and Discount Amendment buttons
		if (sSelectedKey === "MatPrice" || sSelectedKey === "TestPrice"){
			this.ModelHelper.setProperty("PricingActionButtonVisi", true);
			this.ModelHelper.setProperty("DiscountActionButtonVisi", false);
		}
		else{
			this.ModelHelper.setProperty("DiscountActionButtonVisi", true);
			this.ModelHelper.setProperty("PricingActionButtonVisi", false);
		}
			
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
	 * Start - Price Amendment related code
	 **************************************************************************/

	/**
	 * Event Handler for Price Amendment button. It will open Price
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

			// Initialize the new material price object
	  		var oSelectedItem = this.ModelHelper.initalizeNewPriceItem("/MaterialPriceCollection/0", true);
	  		
	  		// Set new price object to DealDetailModel
	  		this.ModelHelper.setSelectedItem("/NewPriceItem", oSelectedItem);
			
		} else { // Change Price button clicked
			bEnable = false;
			sTitle = this.ModelHelper.getText("ChangePrice");

			// Set selected item details in Model so that it can be passed to
			// Popup window. ( tried to set context binding for popup window but
			// its not working so using this work around)
			
			// Initialize the new material price object
	  		var oSelectedItem = this.ModelHelper.initalizeNewPriceItem(oSelectedContext.getPath(), false);
	  		
	  		// Set new price object to DealDetailModel
	  		this.ModelHelper.setSelectedItem("/NewPriceItem", oSelectedItem);
	  		
//			this.ModelHelper.setSelectedItem("/NewPriceItem", oSelectedContext.getPath());
			// this._amendAddChangePrice.setBindingContext(oSelectedContext[0]);

		}

		// Set enable property for Material field in popup
		this.ModelHelper.setProperty("MaterialEnable", bEnable);

		// Set title property for price amendment popup
		this.ModelHelper.setProperty("AmendPriceTitle", sTitle);

		// create Amend Add Change Price popup only once
		if (!this._amendAddChangePrice) {
			this._amendAddChangePrice = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.AddChangePrice", this);

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
			id : "idPANewPriceCurrency",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "NumberOfTests"
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
			id : "idPAValidity",
			uiType : "DRF",
			value : "",
			mandatory : true,
			field : "ValidFrom"
		}, {
			id : "idPAValidity",
			uiType : "DRT",
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
		
//		var oValidFromUI = this.CommonController.getUIElement("idPAValidFrom");
//		var dValidFrom = new Date(oValidFromUI.getValue());
//		var dToday = new Date();
//		
//		if( dValidFrom < dToday){
//			var sMsg = this.ModelHelper.getText("InvalidFromDate");
//			sap.m.MessageToast.show(sMsg);
//			oValidFromUI.setValueState("Error");
//			canContinue = false;
//		}
//		else {
//			oValidFromUI.setValueState("None");
//		}
		
	
		var oValidityUI = this.CommonController.getUIElement("idPAValidity");
		var dValidFrom = new Date(oValidityUI.getDateValue());
		var dToday = new Date((new Date().toJSON().slice(0,10) + " 00:00:00"));
		
		if( dValidFrom < dToday){
			var sMsg = this.ModelHelper.getText("InvalidFromDate");
			sap.m.MessageToast.show(sMsg);
			oValidityUI.setValueState("Error");
			canContinue = false;
		}
		else {
			oValidityUI.setValueState("None");
		}
		
		
		if (canContinue == false) // Validation failed, return
			return;
		

		// Get reference of selected material price item
		var oPriceAmendDetail = this.ModelHelper
				.oDealDetailModel.getProperty("/NewPriceItem");
		
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

		// Refresh details and Close popup window if Amendment was successful
		if (oPriceAmendDetail.MessageType != "E") { // Message will not be "E"
													// if Amendment is created
													// successfully

			
			// Refresh the details 
			this._refreshDealDetailModel();
			
			this.CommonController.closePopupWindow(oEvent);

		}
	},

/*******************************************************************************
 * End - Price Amendment related code
 ******************************************************************************/
	
	
	/***************************************************************************
	 * Start - Discount Amendment related code
	 **************************************************************************/

	/**
	 * Event Handler for Discount Add/Change button. 
	 * It will open Discount Add/Change popup window
	 */
	handleAmendDiscountPopup : function(oEvent) {

		var oPricingTabBar = this.getView().byId("idPricingTabBar");
		var sSelectedTab = oPricingTabBar.getSelectedKey();

		var sDiscountFieldTextId = null;

		// Get Material Price table reference
		if (sSelectedTab === "MatDisc") {
			sDiscountFieldTextId = "Product";
		} else if (sSelectedTab === "HierDisc") {
			sDiscountFieldTextId = "Hierarchy";
		}else if (sSelectedTab === "GrpDisc") {
			sDiscountFieldTextId = "Group";
		}

		// Get text
		var sDiscountFieldLabel = this.ModelHelper.getText(sDiscountFieldTextId);

		// Set property in Model for Discount Field Label
		this.ModelHelper.setProperty("DiscountFieldLabel", sDiscountFieldLabel);

		// Get Selected item context reference
		var oSelectedContext = oEvent.getSource().getBindingContext("DealDetailModel");

		var bEnable = false;
		var sTitle = "";

		var sButtonId = oEvent.getSource().getId();

		if (sButtonId.indexOf("Add") > 0) { // Add Discount button clicked
			bEnable = true;
			sTitle = this.ModelHelper.getText("AddDiscount");

			// Initialize the new discount object
	  		var oSelectedItem = this.ModelHelper.initalizeNewDiscountItem("/MaterialDiscountCollection/0", true);
	  		
	  		// Set new discount object to DealDetailModel
	  		this.ModelHelper.setSelectedItem("/NewDiscountItem", oSelectedItem);
			
		} else { // Change Discount button clicked
			bEnable = false;
			sTitle = this.ModelHelper.getText("ChangeDiscount");

			// Set selected item details in Model so that it can be passed to
			// Popup window. ( tried to set context binding for popup window but
			// its not working so using this work around)
			
			// Initialize the new discount object
	  		var oSelectedItem = this.ModelHelper.initalizeNewDiscountItem(oSelectedContext.getPath(), false);
	  		
	  		// Set new discount object to DealDetailModel
	  		this.ModelHelper.setSelectedItem("/NewDiscountItem", oSelectedItem);

		}

		// Set enable property for Discount field in popup
		this.ModelHelper.setProperty("DiscountFieldEnable", bEnable);

		// Set title property for disount amendment popup
		this.ModelHelper.setProperty("AmendDiscountTitle", sTitle);

		// create Amend Add/Change discount popup only once
		if (!this._amendAddChangeDiscount) {
			this._amendAddChangeDiscount = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.AddChangeDiscount", this);

			this.getView().addDependent(this._amendAddChangeDiscount);
		}

		this._amendAddChangeDiscount.open();

	},

	/**
	 * Event handler for Discount Amendment - Validate the Discount Amendment input
	 * and Post it to SAP
	 * @param oEvent
	 */
	handleAmendDiscountPost : function(oEvent) {

		// Array of controls on Discount Amendment popup with OData service field names
		var oControlList = [ {
			id : "idDADiscountField",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "Material"
		}, {
			id : "idDANewDiscount",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "Discount"
		}, {
			id : "idPAValidity",
			uiType : "DRF",
			value : "",
			mandatory : true,
			field : "ValidFrom"
		}, {
			id : "idPAValidity",
			uiType : "DRT",
			value : "",
			mandatory : true,
			field : "ValidTo"
		} ];

		// Validate the price amendment input
		var canContinue = this.CommonController.validateInput(oEvent,
				oControlList, "D");

		if (canContinue == false) // Validation failed, return
			return;

		
		var oValidityUI = this.CommonController.getUIElement("idDAValidity");
		var dValidFrom = new Date(oValidityUI.getDateValue());
		var dToday = new Date((new Date().toJSON().slice(0,10) + " 00:00:00"));
		
		if( dValidFrom < dToday){
			var sMsg = this.ModelHelper.getText("InvalidFromDate");
			sap.m.MessageToast.show(sMsg);
			oValidityUI.setValueState("Error");
			canContinue = false;
		}
		else {
			oValidityUI.setValueState("None");
		}
		
		if (canContinue == false) // Validation failed, return
			return;

		
		// Get reference of selected discount item
		var oDiscountAmendDetail = this.ModelHelper
			.oDealDetailModel.getProperty("/NewDiscountItem");

		// Set the value in model
		jQuery.each(oControlList, function(i, el) {
			if (el.value) {
				oDiscountAmendDetail[el.field] = el.value;
			}
		});

		// Call Helper class method to update Deal Details to SAP
		oDiscountAmendDetail = this.ModelHelper
				.postDiscountAmendment(oDiscountAmendDetail);

		// Display Success or Error message. It will be passed from SAP
		sap.m.MessageBox.alert(oDiscountAmendDetail.Message, {
			title : "Amendment Result"
		});

		// Refresh details and Close popup window if Amendment was successful
		if (oDiscountAmendDetail.MessageType != "E") { // Message will not be "E"
													// if Amendment is created
													// successfully

			
			// Refresh the details 
			this._refreshDealDetailModel();
			
			this.CommonController.closePopupWindow(oEvent);

		}
	},

/*******************************************************************************
 * End - Discount Amendment related code
 ******************************************************************************/
	
	
	/***************************************************************************
	 * Start - oValidFromUI tab - Search & Filter Code
	 **************************************************************************/

	/**
	 * Event handler for Commitment search
	 * 
	 * @param oEvent
	 */
	handleCommitmentSearch : function(oEvent) {
		// create model filter
		var filters = [];
		var sQuery = oEvent.getSource().getValue();

		if (sQuery && sQuery.length > 0) {

			filters = new sap.ui.model.Filter([
					new sap.ui.model.Filter("Material",
							sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("CallOffPartner",
							sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("MaterialDescription",
							sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("PartnerName",
							sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("Quantity",
							sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("Uom",
							sap.ui.model.FilterOperator.Contains, sQuery) ],
					false);

		}

		// Update table binding
		var oTable = this.getView().byId("idCommitmentTable");
		var oBinding = oTable.getBinding("items");
		oBinding.filter(filters);
	},

	/**
	 * Event handler for Commitment Filter Change event
	 * 
	 * @param oEvent
	 */
	handleCommitmentFilterChange : function(oEvent) {

		// Get the selected key value from Select Control
		var oSelect = this.getView().byId("idCommitmentFilterSelect");
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

			this._filterCommitmentData(filters);
		} else { // None

			this._filterCommitmentData(null);
		}

		// Get reference of Commitment Valid On Date element
		var oValidOnDate = this.getView().byId("idCommitmentValidOnDate");

		// Set the visibility of Valid On Date
		oValidOnDate.setVisible(bValidOnDateVisi);

		if (oValidOnDate.getDateValue() === null)
			oValidOnDate.setDateValue(new Date()); // Set current date as
		// default date

		if (bValidOnDateVisi)
			this.handleCommitmentValidOnDateChange(oEvent); // Call Valid On
		// Change event
		// handler to filter
		// the data
	},

	/**
	 * Event handler for Valid On Date change event
	 * 
	 * @param oEvent
	 */
	handleCommitmentValidOnDateChange : function(oEvent) {

		// Get the Valid on Date value
		var oValidOnDate = this.getView().byId("idCommitmentValidOnDate");
		var oDate = new Date(oValidOnDate.getDateValue());

		// Create filter array
		filters = new sap.ui.model.Filter([
				new sap.ui.model.Filter("ValidFrom",
						sap.ui.model.FilterOperator.LE, oDate),
				new sap.ui.model.Filter("ValidTo",
						sap.ui.model.FilterOperator.GE, oDate), ], true);

		// Filter the table data
		this._filterCommitmentData(filters);

	},


	/**
	 * Filter pricing data base on passed Filters and bind it to Table
	 * 
	 * @param oFilters -
	 *            Filter object array
	 */
	_filterCommitmentData : function(oFilters) {

		// Update table binding
		var oTable = this.getView().byId("idCommitmentTable");
		var oBinding = oTable.getBinding("items");
		oBinding.filter(oFilters);
	},

	/***************************************************************************
	 * End - Commitment tab - Search & Filter Code
	 **************************************************************************/
	
	
	/***************************************************************************
	 * Start - Commitment Amendment related code
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
	  		
//	  		// Clear selected item details, if any
	  		var oSelectedItem = this.ModelHelper.initalizeNewCommitmentItem("/CommitmentCollection/0", true);
	  		this.ModelHelper.setSelectedItem("/NewCommitmentItem",oSelectedItem);
	  	}
	  	else{											// Change Commitment
	  		bEnable = false;
	  		sTitle = this.ModelHelper.getText("ChangeCommitment");
	  		
			var oSelectedContext = oEvent.getSource().getBindingContext("DealDetailModel");
			
			var oSelectedItem = this.ModelHelper.initalizeNewCommitmentItem(oSelectedContext.getPath(), false);
			
	  		this.ModelHelper.setSelectedItem("/NewCommitmentItem",oSelectedItem);
	  		
//		  	this.ModelHelper.setSelectedItem("/NewCommitmentItem", oSelectedContext.getPath());
//		  	this._amendComitment.setBindingContext(oSelectedContext);
		  	
	  	}
	  	
  		
	  	// Set enable property for Material field in popup
	  	this.ModelHelper.setProperty("MaterialEnable", bEnable);
	  	
		// Set title property for commitment amendment popup
		this.ModelHelper.setProperty("AmendCommitmentTitle", sTitle);
		
	    // create Amend Validity Change popup only once
	    if (!this._amendComitment) {
	      this._amendComitment = new sap.ui.xmlfragment(
	        "dia.cmc.contractlandscape.fragment.amendment.Commitment",
	        this
	      );
	      
	      this.getView().addDependent(this._amendComitment);
	      
	      var oItem = new sap.ui.core.Item();
	      oItem.setKey("");
	      oItem.setText("All Customer");
	      
	      var oPartnerUI = this.CommonController.getUIElement("idCAPartner");
	      
	      oPartnerUI.addItem(oItem);
	      
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
		var oControlList = [{id:"idCAPartner", 		uiType:"DDB",	value:"", 	mandatory:false, 	field:"CallOffPartner" },
		                    {id:"idCAProduct", 		uiType:"TB",	value:"", 	mandatory:true, 	field:"Material" },
		                    {id:"idCAQty",		 	uiType:"TB",	value:"", 	mandatory:true, 	field:"Quantity" },
		                    {id:"idCAUOM",	 		uiType:"TB",	value:"", 	mandatory:false, 	field:"Uom" },
		                    {id:"idCAValidFrom", 	uiType:"DT",	value:"", 	mandatory:true, 	field:"ValidFrom" },
		                    {id:"idCAValidTo", 		uiType:"DT",	value:"", 	mandatory:true, 	field:"ValidTo" }];
		
		// Validate the commitment amendment input
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, "C");

		if (canContinue == false) // Validation failed, return
			return;

		// Valid from date should not be in pass
		var oValidFromUI = this.CommonController.getUIElement("idCAValidFrom");
		var dValidFrom = new Date(oValidFromUI.getDateValue());
		var dToday = new Date((new Date().toJSON().slice(0,10) + " 00:00:00"));
		
		if( oValidFromUI.getEnabled() && dValidFrom < dToday){
			var sMsg = this.ModelHelper.getText("InvalidFromDate");
			sap.m.MessageToast.show(sMsg);
			oValidFromUI.setValueState("Error");
			canContinue = false;
		}
		else {
			oValidFromUI.setValueState("None");
		}
		
		var oValidToUI = this.CommonController.getUIElement("idCAValidTo");
		var dValidTo = new Date(oValidToUI.getDateValue());
		
		if( dValidFrom > dValidTo){
			var sMsg = this.ModelHelper.getText("InvalidToDate");
			sap.m.MessageToast.show(sMsg);
			oValidToUI.setValueState("Error");
			canContinue = false;
		}
		else {
			oValidToUI.setValueState("None");
		}
		
		
		if (canContinue == false) // Validation failed, return
			return;

		
		// Get reference of selected commitment item
		var oCommitmentAmendDetail = this.ModelHelper
				.oDealDetailModel.getProperty("/NewCommitmentItem");

		// Set the value in model
		jQuery.each(oControlList, function(i, el) {

			if (el.value) {
				oCommitmentAmendDetail[el.field] = el.value;
			}
		});

		if ( oValidFromUI.getEnabled() ){		// In case of Add Commitment
			oCommitmentAmendDetail.IsNew = "X";
		}
		
		// Temporary hard coded for testing... need to remove it..
		/////////////////////////////////
		oCommitmentAmendDetail.Uom = "PC";
		/////////////////////////////////////
		
		
		// Check for overlapping
		
		var oCommitmentCollection = this.ModelHelper.oDealDetailModel.getProperty("/CommitmentCollection");
		
		var that = this;
		var bIsOverlapping = false;
		
		$.each(oCommitmentCollection, function(i, el){
			
		    if(oCommitmentAmendDetail.CallOffPartner === el.CallOffPartner  &&
		       oCommitmentAmendDetail.Material === el.Material &&
		       dValidFrom.getTime() != el.ValidFrom.getTime()){
		    	
		    	if( ( dValidFrom >= el.ValidFrom && dValidFrom <= el.ValidTo ) ||
		    		( dValidTo >= el.ValidFrom && dValidTo <= el.ValidTo )){
		    		
//		    		that._NewCommitmentDetail = oCommitmentAmendDetail;
		    		
		    		if( oValidFromUI.getEnabled() ){
		    			
		    			bIsOverlapping = true;
		    					            
			            sap.m.MessageBox.confirm(that.ModelHelper.getText("OverlappingConfirmation"), {
			            	title: that.ModelHelper.getText("Confirmation"),
			            	actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
		            	    onClose: function(oAction){
		            	    	if(oAction === sap.m.MessageBox.Action.YES){
		            				that.postCommitment(oCommitmentAmendDetail);	
		            			}
		            	    },
		            	    styleClass: ""                         // default
			            });
		    		}
		    		else{
		    			
		    			bIsOverlapping = true;
		    			
		    			// Display Success or Error message. It will be passed from SAP
		    			sap.m.MessageBox.alert(that.ModelHelper.getText("OverlappingError"), {
		    				title : "Overlapping"
		    			});
		    		}
		    		
		    		return false;
		    	}
		    }
		         
		});
		
		if( bIsOverlapping === false ){
			this.postCommitment(oCommitmentAmendDetail);	
		}
		
	},


	/***
	 * Post commitment to backend
	 * @param oCommitmentAmendDetail - Commitment details
	 */
	postCommitment : function (oCommitmentAmendDetail){
		
		// Call Helper class method to update Deal Details to SAP
		oCommitmentAmendDetail = this.ModelHelper
				.postCommitmentAmendment(oCommitmentAmendDetail);

		// Display Success or Error message. It will be passed from SAP
		sap.m.MessageBox.alert(oCommitmentAmendDetail.Message, {
			title : "Amendment Result"
		});

		// Referesh Deal details and Close popup window if Amendment was successful
		if (oCommitmentAmendDetail.MessageType != "E") { // Message will not be "E" if Amendment is created successfully

			this._refreshDealDetailModel();
			
			this._amendComitment.close();
			
//			this.CommonController.closePopupWindow(oEvent);

		}
	},
	
/*******************************************************************************
 * End - Commitment Amendment related code
 ******************************************************************************/
	

	/***************************************************************************
	 * Start - Amendment related code
	 **************************************************************************/

	/** Event handler for Amendment button. It will display Amendment Action Sheet
	 * @param oEvent
	 */
	handleAmend : function(oEvent) {

		// Get reference of Amendment button
		var oAmendButton = oEvent.getSource();

		// create action sheet only once
		if (!this._actionSheet) {
			this._actionSheet = sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.AmendActionSheet", this);
			this.getView().addDependent(this._actionSheet);
		}

		this._actionSheet.openBy(oAmendButton);
	},

	/** Event Handler for Amend Recalculation button. It will open Recalculation Amendment popup window
	 * @param oEvent
	 */
	handleAmendRecalculationPopup : function(oEvent) {

		// create Amend Recalulation popup only once
		if (!this._amendRecalculation) {
			this._amendRecalculation = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.Recalculation", this);

			this.getView().addDependent(this._amendRecalculation);
			
			// Set quick help for radio buttons
			var oAmendRB = this.CommonController.getUIElement("idAmendContract");
			this.CommonController.setQuickHelp(oAmendRB,"AmendContractDesc",false);
			
			var oRenewRB = this.CommonController.getUIElement("idRenewContract");
			this.CommonController.setQuickHelp(oRenewRB,"RenewContractDesc",false);
		}

		this._amendRecalculation.open();

	},

//	/** Event Handler for Add Price button. It will open Add Price popup window
//	 * @param oEvent
//	 */
//	handleAmendPricePopup : function(oEvent) {
//
//		var oPricingViewController = this
//				._getChildViewController("idPricingView");
//
//		oPricingViewController.handleAmendPricePopup(oEvent);
//	},

//	/** Event Handler for Commitment Amendment button. It will open Commitment Amendment popup window
//	 * @param oEvent
//	 */
//	handleAmendCommitmentPopup : function(oEvent) {
//
//		var oCommitmentViewController = this
//				._getChildViewController("idCommitmentView");
//
//		oCommitmentViewController.handleAmendCommitmentPopup(oEvent);
//
//	},

	/** Event Handler for Validity Change Amendment button. It will open Validity Change Amendment popup window
	 * @param oEvent
	 */
	handleAmendValidityChangePopup : function(oEvent) {

		// create Amend Validity Change popup only once
		if (!this._amendValidity) {
			this._amendValidity = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.ValidityChange", this);

			this.getView().addDependent(this._amendValidity);
		}

		this._amendValidity.open();

	},

	/** Event Handler for Contract Termination button. It will open Contract Termination Amendment popup window
	 * @param oEvent
	 */
	handleAmendContractTermPopup : function(oEvent) {

		// create Amend Contract Termination popup only once
		if (!this._amendContractTerm) {
			this._amendContractTerm = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.ContractTermination", this);

			this.getView().addDependent(this._amendContractTerm);
		}

		this._amendContractTerm.open();

	},

	/** Event Handler for Close button on Amendment popup window. It will close the Amendment popup window
	 * @param oEvent
	 */
	handleAmendPopupClose : function(oEvent) {
		
		this.CommonController.closePopupWindow(oEvent);
		
	},

	/** Event handler for Selected Items radio button in Validity Change Amendment
	 * @param oEvent
	 */
	handleAmentValidityItemsSelect : function(oEvent) {

		// // Get the reference of Selected Items radio button
		// var oSelectedItems =
		// sap.ui.getCore().byId(oEvent.getSource().getId());

		// alert(oEvent.getSource().getId());

		// Get the reference of Selected Items VBox which contains item
		// checkboxs
		var oSelectedItemsVBox = sap.ui.getCore().byId("idSelectedItemsVBox");

		if (oEvent.getSource().getId().indexOf("idValiditySelectedItems")) {
			oSelectedItemsVBox.setVisible(false);
		} else {
			oSelectedItemsVBox.setVisible(true);
		}

	},

	/** Event handler for Recalculation Amendment
	 * @param oEvent
	 */
	handleAmendRecalculationPost : function(oEvent) {

		// Array of controls on Recalculation Amendment popup with OData service field names
		var oControlList = [ {
			id : "idAmendContract",
			uiType : "RB",
			value : "AMENDMENT",
			mandatory : false,
			field : "RequestType"
		}, {
			id : "idRenewContract",
			uiType : "RB",
			value : "RENEWAL",
			mandatory : false,
			field : "RequestType"
		}, {
			id : "idDesc",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "RequestDesc",
			minLength : 50
		} ];

		// Validate and post amendment to SAP
		this._validateAndPostAmendment("URC", oControlList, oEvent);

	},

	
	/** Event handler for Cancel Recalculation Amendment
	 * @param oEvent
	 */
	handleCancelRecalculationPost : function(oEvent) {
		
		that = this;
		
		var oAmendDetail = {};
		oAmendDetail.DealId = this.ModelHelper.sSelectedDealId;
		oAmendDetail.Action = "UCA";
		
		sap.m.MessageBox.confirm(that.ModelHelper.getText("CancelRecalculationConfirmation"), {
        	title: that.ModelHelper.getText("Confirmation"),
        	actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
    	    onClose: function(oAction){
    	    	if(oAction === sap.m.MessageBox.Action.YES){
    	    		
//    	    		var shell = sap.ui.getCore().byId("idMainShell");
//    	    		shell.setBusy(true);
    	    		
    	    		// Cancel recalculation amendment request
    				that.ModelHelper.updateAmendment(oAmendDetail);	
    				
//    				 jQuery.sap.delayedCall(5000, this, function () {
//    					 shell.setBusy(false);
//    				    });
//    				 
    				
    				// Display Success or Error message.
    				if(oAmendDetail.Message){
    					sap.m.MessageBox.alert(oAmendDetail.Message, {
        					title : "Amendment Result"
        				});    					
    				}
    			}
    	    }});
	
	},
	
	
	/** Event handler for Validity Amendment
	 * @param oEvent
	 */
	handleAmendValidityPost : function(oEvent) {

		// Array of controls on Validity Amendment popup with OData service
		// field names
		var oControlList = [ {
			id : "idContractEndDate",
			uiType : "DT",
			value : "",
			mandatory : true,
			field : "EndDate"
		}, {
			id : "idHeaderLevel",
			uiType : "RB",
			value : "X",
			mandatory : false,
			field : "Level"
		}, {
			id : "idValiditySelectedItems",
			uiType : "RB",
			value : "X",
			mandatory : false,
			field : "Level"
		}, {
			id : "idServiceItems",
			uiType : "CBGRP",
			value : "X",
			mandatory : false,
			field : "IsService"
		}, {
			id : "idInstrumentItems",
			uiType : "CBGRP",
			value : "X",
			mandatory : false,
			field : "IsInstrument"
		}, {
			id : "idPricingAgreeItems",
			uiType : "CBGRP",
			value : "X",
			mandatory : false,
			field : "IsPriceAgree"
		}, ];

		// Validate and post amendment to SAP
		this._validateAndPostAmendment("UVC", oControlList, oEvent);

	},

	/** Event handler for Contract Termination Amendment
	 * @param oEvent
	 */
	handleAmendContractTermPost : function(oEvent) {

		// Array of controls on Contract Termination Amendment popup with OData
		// service field names
		var oControlList = [ {
			id : "idTermReason",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "RequestDesc"
		}, {
			id : "idTermEndDate",
			uiType : "DT",
			value : "",
			mandatory : true,
			field : "EndDate"
		} ];

		// Validate and post amendment to SAP
		this._validateAndPostAmendment("UCT", oControlList, oEvent);

	},


	// Validate the Amendment input and Post it to SAP
	_validateAndPostAmendment : function(sAmendType, oControlList, oEvent) {

		// Validate the amendment input
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, sAmendType);

		if (canContinue == false) // Validation failed, return
			return;

		// Get DealDetail object reference
		var oAmendDetail = {}; // this.getView().getModel("DealDetailModel").getProperty("/DealDetail");

		// Set the update action
		oAmendDetail.Action = sAmendType;

		// Set the value in model
		jQuery.each(oControlList, function(i, el) {

			if (el.value) {
				oAmendDetail[el.field] = el.value;
			}
		});

		// Call Helper class method to update Deal Details to SAP
		oAmendDetail = this.ModelHelper.postAmendment(oAmendDetail);

		// Display Success or Error message. It will be passed from SAP
		sap.m.MessageBox.alert(oAmendDetail.Message, {
			title : "Amendment Result"
		});

		// Close popup window if Amendment was successful
		if (oAmendDetail.MessageType != "E") { // Message will not be "E" if
												// Amendment is created
												// successfully

			this.handleAmendPopupClose(oEvent);

		}

	},

	/***************************************************************************
	 * End - Code Related to Amendment
	 **************************************************************************/

	/***************************************************************************
	 * Start - Favorite & Further Action related Code
	 **************************************************************************/

	/** Event handler for Further Action button. It will display Further Action Sheet
	 * @param oEvent
	 */
	handleFurtherAction : function(oEvent) {

		var oFurtherActionButton = oEvent.getSource();

		// create action sheet only once
		if (!this._furtherActionSheet) {
			this._furtherActionSheet = sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.FurtherActionSheet", this);
			this.getView().addDependent(this._furtherActionSheet);
		}

		this._furtherActionSheet.openBy(oFurtherActionButton);

	},

	/** Event handler for Timeline button. It will navigate to timeline view
	 * @param oEvent
	 */
	handleGetTimeline : function(oEvent){
		
		
		this.CommonController.getRouter(this).navTo("dealTimeline", {
			from: "Detail",
			dealId: this.ModelHelper.sSelectedDealId,
		}, false);
		
	},
	
	/** Event handler for DownloadToExcel button
	 * @param oEvent
	 */
	handleDownloadToExcel : function(oEvent) {

		sap.m.MessageToast
				.show("This feature will be available in the next version");
	},

	/** Event handler for Favorite/De-Favorite button. It will change the Favorite status and will update to SAP backend
	 */
	handleFavorite : function() {

		var sSuccessMsg = null;

		// Get DealDetail object reference
		var oDealDetail = this.getView().getModel("DealDetailModel")
				.getProperty("/DealDetail");

		// Update the fields in DealDetail object
		if (oDealDetail.IsFavorite === "X") {
			oDealDetail.IsFavorite = '';
			sSuccessMsg = "Passed: CMS Deal " + oDealDetail.DealId + " successfully removed from favorites!";
		} else {
			oDealDetail.IsFavorite = 'X';
			sSuccessMsg = "Passed: CMS Deal " + oDealDetail.DealId + " successfully added to favorites!";
		}

		// Set the update action
		oDealDetail.Action = "UFV";			// Update Favorite

		// Call Helper class method to update Deal Details to SAP
		oDealDetail = this.ModelHelper.updateDeal(oDealDetail);

		if (oDealDetail.MessageType != "E") { // Update is successful

			// Change Favorite icon color and tooltip in Detail view
			this.ModelHelper.setDealDetailElementsProperties(oDealDetail, true);
			
			oDealDetail.Message = sSuccessMsg;
		} 
		
		// Show message
		sap.m.MessageToast.show(oDealDetail.Message);

	},

	/** Event handler for Flag/De-Flag button. It will change the Flag status and will update to SAP backend
	 */
	handleFlag : function() {

		var sSuccessMsg = null;

		// Get DealDetail object reference
		var oDealDetail = this.getView().getModel("DealDetailModel")
				.getProperty("/DealDetail");

		// Update the fields in DealDetail object
		if (oDealDetail.IsFlagged === "X") {
			oDealDetail.IsFlagged = '';
			sSuccessMsg = "Passed: CMS Deal " + oDealDetail.DealId + " successfully unflagged!";
		} else {
			oDealDetail.IsFlagged = 'X';
			sSuccessMsg = "Passed: CMS Deal " + oDealDetail.DealId + " successfully flagged!";
		}

		// Set the update action
		oDealDetail.Action = "UFL"; 	// Update Flag

		// Call Helper class method to update Deal Details to SAP
		oDealDetail = this.ModelHelper.updateDeal(oDealDetail);

		if (oDealDetail.MessageType != "E") { // Update is successful

			// Change Favorite icon color and tooltip in Detail view
			this.ModelHelper.setDealDetailElementsProperties(oDealDetail, true);

			oDealDetail.Message = sSuccessMsg;
		}
		
		// Show message
		sap.m.MessageToast.show(oDealDetail.Message);
		
	},

	/***************************************************************************
	 * End - Favorite & Further Action related Code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Other Code
	 **************************************************************************/

//	/**
//	 * Get View controller
//	 * 
//	 * @param oParent :
//	 *            Parent View reference
//	 * @param sViewId :
//	 *            View Id
//	 */
//	_getChildViewController : function(sViewId) {
//
//		var oView = this.getView().byId(sViewId);
//
//		if (oView != undefined && oView != null) {
//			return oView.getController();
//		}
//	},

	
	/** Read deal details and refresh model
	 */
	_refreshDealDetailModel : function (sFilter){
		//Read Deal Collection and bind it to View
		var oDealDetailModel = this.getView().getModel();
		
		oDealDetailModel = this.ModelHelper.readDealDetail(this.ModelHelper.sSelectedDealId);
		
//		this.getView().setModel(oDealDetailModel);
	},
	
	
	// Event handler for main tab select event
	handleMainTabSelect : function(oEvent) {

		var bPricingActionButtonVisi = false;
		var bCommitmentActionButtonVisi = false;

		// Get selected tab's key
		var sSelectedTabKey = oEvent.getParameter("key");

		// To reduce the initial application load, load google map library when
		// user select any contract from least instead of loading at start of
		// application
		if (sSelectedTabKey === "Partners") {
			// sap.ui.getCore().loadLibrary("openui5.googlemaps",
			// "lib/openui5/googlemaps/");
			// jQuery.sap.require("openui5.googlemaps.MapUtils");
		}
		// If pricing tab is select, make visibility = true
		else if (sSelectedTabKey === "Pricing") { // Pricing tab is selected

			// Set first tab ( Product Prices ) as selected by default
			var oPricingTabBarUI = this.CommonController.getUIElement("idPricingTabBar", this.getView());
//			var oPricingTabBarUI = this.getView().byId("idPricingTabBar");
			oPricingTabBarUI.setSelectedKey("MatPrice");
			
			// Set flag to show Add Price button
			bPricingActionButtonVisi = true;

			// Filter pricing data
			this.handlePricingFilterChange(oEvent);
			
		} else if (sSelectedTabKey === "Commitments") { // Commitment tab is
															// selected

			bCommitmentActionButtonVisi = true;

			this.handleCommitmentFilterChange(oEvent);
		} else if (sSelectedTabKey === "Documents"){
			
			this.ModelHelper.readDocumentList();
		}

		// Set property value in model
		this.ModelHelper.setProperty("PricingActionButtonVisi",
				bPricingActionButtonVisi);
		
		// Set property value in model
		this.ModelHelper.setProperty("CommitmentActionButtonVisi",
				bCommitmentActionButtonVisi);

		// Hide Add Discount button, if its visable
		this.ModelHelper.setProperty("DiscountActionButtonVisi", false);
		
	},
	
	// Event handler for Document selected items. It will open selected document.
	handleDocumentDisplay : function() {
		// Temporary code
			var url='http://help.sap.com/hana/SAP_HANA_Master_Guide_en.pdf';  
			window.open(url,'Download');
	},
/*******************************************************************************
 * End - Other Code
 ******************************************************************************/
	/**
	 * Material search using value help dialog
	 */
	handleMaterialSearchValueHelpRequest : function(oEvent){
		
		
        
        this.theTokenInput= sap.ui.getCore().byId("multiInput");

	    this.aKeys= ["MaterialNo", "MaterialDescription"];

	    var token1= new sap.m.Token({key: "0001", text:"SAP A.G. (0001)"});
	    var token2= new sap.m.Token({key: "0002", text: "SAP Labs India (0002)"});
	    var rangeToken1= new sap.m.Token({key: "i1", text: "ID: a..z"}).data("range", { "exclude": false, "operation": "BT", "keyField": "MaterialNo", "value1": "a", "value2": "z"});
	    var rangeToken2= new sap.m.Token({key: "i2", text: "ID: =foo"}).data("range", { "exclude": false, "operation": "EQ", "keyField": "MaterialNo", "value1": "foo", "value2": ""});
	    var rangeToken3= new sap.m.Token({key: "e1", text: "ID: !(=foo)"}).data("range", { "exclude": true, "operation": "EQ", "keyField": "MaterialNo", "value1": "foo", "value2": ""});
	    this.aTokens= [token1, token2, rangeToken1, rangeToken2, rangeToken3];
	    
	    /*this.theTokenInput.setTokens(this.aTokens);*/

	    this.aItems= [{MaterialNo: "0001", MaterialDescription: "SAP A.G.", UOM: "Walldorf", NumberOfTests:"1"},
	                   {MaterialNo: "0002", MaterialDescription: "SAP Laps India", UOM: "Bangalore", NumberOfTests:"2"},
	                   {MaterialNo: "0003", MaterialDescription: "SAP China LAB", UOM: "Beijing", NumberOfTests:"3"},
	                   {MaterialNo: "0100", MaterialDescription: "SAP1", UOM: "Berlin", NumberOfTests:"4"},
	                   {MaterialNo: "0101", MaterialDescription: "SAP2", UOM: "Berlin", NumberOfTests:"5"},
	                   {MaterialNo: "0102", MaterialDescription: "SAP3", UOM: "Berlin", NumberOfTests:"6"},
	                   {MaterialNo: "0103", MaterialDescription: "SAP4", UOM: "Berlin", NumberOfTests:"7"},
	                   {MaterialNo: "0104", MaterialDescription: "SAP5", UOM: "Berlin", NumberOfTests:"8"},
	                   {MaterialNo: "0105", MaterialDescription: "SAP6", UOM: "Berlin", NumberOfTests:"9"},
	                   {MaterialNo: "0106", MaterialDescription: "SAP7", UOM: "Berlin", NumberOfTests:"10"},
	                  
	                   ];
	        
	    
        
		
		var that= this;
	    
		 var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
		      basicSearchText: this.theTokenInput.getValue(),
		      modal: true,
		      supportMultiselect: false,
		      supportRanges: false,
		      supportRangesOnly: false,
		      key: this.aKeys[0],        
		      descriptionKey: this.aKeys[1],

		      ok: function(oControlEvent) {
		        that.aTokens = oControlEvent.getParameter("tokens");
		        that.theTokenInput.setTokens(that.aTokens);

		        oValueHelpDialog.close();
		      },

		      cancel: function(oControlEvent) {
		        sap.m.MessageToast.show("Cancel pressed!");
		        oValueHelpDialog.close();
		      },

		      afterClose: function() {
		        oValueHelpDialog.destroy();
		      }
		    });

	      var oColModel = new sap.ui.model.json.JSONModel();
	      oColModel.setData({
	        cols: [
	                {label: "Material No", template: "MaterialNo"},
	                {label: "Material Description", template: "MaterialDescription"},
	                {label: "UOM", template: "UOM"},
	                {label: "No. of Tests", template: "NumberOfTests"}
	              ]
	      });
	      oValueHelpDialog.setModel(oColModel, "columns");

	      
	      var oRowsModel = new sap.ui.model.json.JSONModel();
	      oRowsModel.setData(this.aItems);
	      oValueHelpDialog.setModel(oRowsModel);
	      oValueHelpDialog.theTable.bindRows("/"); 
	    
	     /* oValueHelpDialog.setKey(this.aKeys[0]);
	      oValueHelpDialog.setKeys(this.aKeys);

	      oValueHelpDialog.setRangeKeyFields([{label: "Material No", key: "MaterialNo"}, {label : "Material Description", key:"MaterialDescription"}]); 

*/	      //oValueHelpDialog.setUpdateSingleRowCallback( function(sKey, fncCallback) {} );
	        
	     /* oValueHelpDialog.setTokens(this.aTokens);      */
	      
	      oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
	        advancedMode:  true,
	        filterItems: [new sap.ui.comp.filterbar.FilterItem({ name: "s1", control: new sap.m.SearchField()})],
	        /*filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "Material No", control: new sap.m.Input()}),
	                           new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "Material Description", control: new sap.m.Input()}),
	                           new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n3", label: "No. of Tests", control: new sap.m.Input()})],*/
	        search: function() {
	          sap.m.MessageToast.show("Search pressed");
	        }
	      }));      
	          
	      if (this.theTokenInput.$().closest(".sapUiSizeCompact").length > 0) { // check if the Token field runs in Compact mode
	        oValueHelpDialog.addStyleClass("sapUiSizeCompact");
	      }
	      
	      oValueHelpDialog.open();


		
	}
});