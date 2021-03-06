jQuery.sap.require("dia.cmc.common.util.Formatter");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("openui5.googlemaps.MapUtils");
jQuery.sap.require("sap.ca.ui.dialog.factory");
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
		
		if (oEvent.getParameter("name") === "dealDetail") {		// check route name

			this._sDealId = oEvent.getParameter("arguments").dealId;
			
			this._readAndBindDealDetails(true);
		}
	},
	
	
	_readAndBindDealDetails: function(bResetControls){
		
		var oRequestFinishedDeferred = this.ModelHelper.readDealDetail(this._sDealId);

		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDealDetailModel) {
			
			this.getView().setModel(oDealDetailModel,"DealDetailModel");
		
			if(bResetControls){
				this._resetViewControls(true);	
			}
			
//			this._disableSimpleAmend();
		}, this));		
		
		return oRequestFinishedDeferred;
	},
	
	/***************************************************************************
	 * End - Standard hook events
	 **************************************************************************/

	/** 
	 * Reset all the controls to default setting
	 */
	_resetViewControls: function(bResetMainTabBar){

		// Reset main tab bar only if it has been told as this method is also getting called from Main TabBar change event
		if(bResetMainTabBar){
			// Set Landscape as default tab
			var oMainTabBarUI = this.CommonController.getUIElement("idMainDetailTab", this.getView());
			oMainTabBarUI.setSelectedKey("Landscape");
			
			// Set property value in model
			this.ModelHelper.setProperty("PricingActionButtonVisi",	false);
			
			// Set property value in model
			this.ModelHelper.setProperty("CommitmentActionButtonVisi", false);

			// Hide Add Discount button, if its visible
			this.ModelHelper.setProperty("DiscountActionButtonVisi", false);
		}
		
		
		// Set Material Price as default tab
		var oPricingTabBarUI = this.CommonController.getUIElement("idPricingTabBar", this.getView());
		oPricingTabBarUI.setSelectedKey("MatPrice");
 
		// Reset Landscape Facet Filter control
		this._facetFilterReset("idLandscapeFacetFilter");
		
		// Reset Partner Facet Filter control
		this._facetFilterReset("idPartnerFacetFilter");
		
		// Set default value for price filter
		var oSelect = this.getView().byId("idPriceFilterSelect");
		oSelect.setSelectedKey("1");
		
		// Set default value for commitment filter
		var oSelect = this.getView().byId("idCommitmentFilterSelect");
		oSelect.setSelectedKey("1");

		// Reset Pricing Search Field
		var oPricingSearchUI = this.CommonController.getUIElement("idPricingSearchField", this.getView());
		oPricingSearchUI.setValue("");
		
		// Reset Commitment Search Field
		var oCommitSearchUI = this.CommonController.getUIElement("idCommitmentSearchField", this.getView());
		oCommitSearchUI.setValue("");
		
		// Reset Pricing Valid As On Date
		var oPriceValidOnDateUI = this.getView().byId("idPriceValidOnDate");
		oPriceValidOnDateUI.setDateValue(new Date());
		oPriceValidOnDateUI.setVisible(true);
		
		// Reset Commitment Valid As On Date
		var oCommitValidOnDateUI = this.getView().byId("idCommitmentValidOnDate");
		oCommitValidOnDateUI.setDateValue(new Date()); 
		oCommitValidOnDateUI.setVisible(true);
		
	},
	
	
//	/**Disable simple amendment button when contract is expired or is In Amendment.
//	 * 
//	 */
//	_disableSimpleAmend:function(){
//		var oDealDetail = this.getView().getModel("DealDetailModel").getData().DealDetail;
//		
//		var bSimpleAmendEnable = true;
//		
//		if(oDealDetail.ValidTo < (new Date()) || oDealDetail.DealStatus === "AMEND"){
//			bSimpleAmendEnable = false;
//		}
//		
//		this.ModelHelper.setProperty("SimpleAmendEnable", bSimpleAmendEnable);
//	},
	
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
		this.getView().setModel(oAmendmentDetailModel,"AmendmentDetailModel");

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
	  
	  
		/** 
		 * It is common for both Landscape and Partner Facet Filter
		 */
	  _facetFilterReset: function(sIdFacetFilter) {
		  
		// Get reference of Facet Filter and List. 
	    var oFacetFilter = this.CommonController.getUIElement(sIdFacetFilter, this.getView());
	    var aFacetFilterLists = oFacetFilter.getLists();
	    
	    // Clear all selected filter values
	    for(var i=0; i < aFacetFilterLists.length; i++) {
	      aFacetFilterLists[i].setSelectedKeys();
	    }
	    
	    this._applyFacetFilter(sIdFacetFilter,[]);
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
		  var oContext = oEvent.getSource().getBindingContext("DealDetailModel");			 
	      var oODataModel = this.getView().getModel("DealDetailModel");
	      var oSystemDetail = oODataModel.getProperty(oContext.getPath());
		  this.CommonController.getRouter(this).navTo("systemDetail", {
				from: "dealDetail", dealId : oSystemDetail.DealId, systemModuleSerial : oSystemDetail.SystemModuleSerial, 
				systemModule : oSystemDetail.SystemModule
			}, false);
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
						new sap.ui.model.Filter("MaterialDescription",
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
						new sap.ui.model.Filter("Material",
								sap.ui.model.FilterOperator.Contains, sQuery),
						new sap.ui.model.Filter("MaterialDescription",
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
								new sap.ui.model.Filter("MaterialDescription",
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
								new sap.ui.model.Filter("Hierarchy",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("HierarchyDescription",
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
								new sap.ui.model.Filter("MatGroup",
										sap.ui.model.FilterOperator.Contains,
										sQuery),
								new sap.ui.model.Filter("MatGroupDescription",
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

//		if (oValidOnDate.getDateValue() === null)
//			oValidOnDate.setDateValue(new Date()); // Set current date as
//		// default date

		if (bValidOnDateVisi){
			
			oValidOnDate.setDateValue(new Date()); // Set current date as
			// default date
			
			this.handlePricingValidOnDateChange(oEvent); // Call Valid On
			// Change event
			// handler to filter
			// the data
		}
	},

	/**
	 * Event handler for Valid On Date change event
	 * 
	 * @param oEvent
	 */
	handlePricingValidOnDateChange : function(oEvent) {

		// Get the Valid on Date value
		var oValidOnDateUI = this.getView().byId("idPriceValidOnDate");

		var oValidDate = oValidOnDateUI.getDateValue();

		if(oValidDate.getHours() <= 0){
			oValidDate.setDate(oValidOnDateUI.getDateValue().getDate() + 1);	
		}
		
		oDate = new Date(oValidDate.toJSON().slice(0,10) + "T00:00:00");
		
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

		// Set current date as default Valid as on Date
		var oValidOnDate = this.getView().byId("idPriceValidOnDate");
		oValidOnDate.setDateValue(new Date()); 
		
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
		var sCondType = "";
		var sPath = "";
		
		// Get Material Price table reference
		if (sSelectedTab === "MatPrice") {
			oPriceTable = this.getView().byId("idMatPriceTable");
			sMaterialText = "Product";
			sCondType = "YIMP";
			sPath = "/MaterialPriceCollection/0";
		} else {
			oPriceTable = this.getView().byId("idTestPriceTable");
			sMaterialText = "Test";
			sCondType = "YSPX";
			sPath = "/TestPriceCollection/0";
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
	  		var oSelectedItem = this.ModelHelper.initalizeNewPriceItem(sPath, true, sCondType);
	  		
	  		// Set new price object to DealDetailModel
	  		this.ModelHelper.setSelectedItem("/NewPriceItem", oSelectedItem);
			
		} else { // Change Price button clicked
			bEnable = false;
			sTitle = this.ModelHelper.getText("ChangePrice");

			// Set selected item details in Model so that it can be passed to
			// Popup window. ( tried to set context binding for popup window but
			// its not working so using this work around)
			
			// Initialize the new material price object
	  		var oSelectedItem = this.ModelHelper.initalizeNewPriceItem(oSelectedContext.getPath(), false, sCondType);
	  		
	  		// Set new price object to DealDetailModel
	  		this.ModelHelper.setSelectedItem("/NewPriceItem", oSelectedItem);
	  		
//			this.ModelHelper.setSelectedItem("/NewPriceItem", oSelectedContext.getPath());
			// this._amendAddChangePrice.setBindingContext(oSelectedContext[0]);

		}

		// Set enable property for Material field in popup
		this.ModelHelper.setProperty("MaterialEnable", bEnable);

		// Set title property for price amendment popup
		this.ModelHelper.setProperty("AmendPriceTitle", sTitle);

		
		// Destroy popup if its already there
		if (this._amendAddChangePrice) {
			this._amendAddChangePrice.destroy(true);
		}
		
//		if (!this._amendAddChangePrice) {
			this._amendAddChangePrice = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.AddChangePrice", this);

			this.getView().addDependent(this._amendAddChangePrice);
			
//		}

		this._amendAddChangePrice.open();

	},

	/**
	 * Event handler for Price Amendment - Validate the Price Amendment input
	 * and Post it to SAP
	 * 
	 * @param oEvent
	 */
	handleAmendPricePost : function(oEvent) {

		var that = this;
		
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
			uiType : "NBQ",
			value : 0,
			mandatory : true,
			field : "Rate"
		}, {
			id : "idPANewPriceCurrency",
			uiType : "TB",
			value : "",
			mandatory : true,
			field : "CurrencyCode"
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
				
				if(el.uiType === "NBQ"){
					el.value = that.CommonController.reverseDecimalFormat(el.value);
				}
				
				oPriceAmendDetail[el.field] = el.value;
			}
		});

		var oButtonEvent = jQuery.extend({}, oEvent);

		
		// Call Helper class method to update Deal Details to SAP
//		oPriceAmendDetail = this.ModelHelper
//				.postPriceAmendment(oPriceAmendDetail);
		var oRequestFinishedDeferred = this.ModelHelper.postPriceAmendment(oPriceAmendDetail);
		
		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oPriceAmendDetail, oDealDetailModel) {
	
			// Refresh details and Close popup window if Amendment was successful
			if (oPriceAmendDetail.MessageType != "E") { // Message will not be "E"
														// if Amendment is created
														// successfully

				// Bind Deal Detail model
				if(oDealDetailModel != undefined){
					this.getView().setModel(oDealDetailModel,"DealDetailModel");	
				}
				
				// Display success message passed from SAP
				sap.m.MessageBox.alert(oPriceAmendDetail.Message, {
					title : "Amendment Result"
				});
				
				that.CommonController.closePopupWindow(oButtonEvent);
				
//				// Refresh the details 
//				var oRequestFinishedDeferred = this._readAndBindDealDetails(false);
//				
//				// Wait for details to be refreshed
//				jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function() {
//					
//					// Display success message passed from SAP
//					sap.m.MessageBox.alert(oPriceAmendDetail.Message, {
//						title : "Amendment Result"
//					});
//					
//					that.CommonController.closePopupWindow(oButtonEvent);
//				}));
				
			}
			else{
				// Display Error message passed from SAP
				sap.m.MessageBox.alert(oPriceAmendDetail.Message, {
					title : "Amendment Result"
				});
			}
			
		}, this));
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

		// Destroy popup if its already there
		if (this._amendAddChangeDiscount) {
			this._amendAddChangeDiscount.destroy(true);
		}
		
//		if (!this._amendAddChangeDiscount) {
			this._amendAddChangeDiscount = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.AddChangeDiscount", this);

			this.getView().addDependent(this._amendAddChangeDiscount);
//		}

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

		var oButtonEvent = jQuery.extend({}, oEvent);
		var that = this;
		
		// Call Helper class method to update Deal Details to SAP
		var oRequestFinishedDeferred = oDiscountAmendDetail = this.ModelHelper
				.postDiscountAmendment(oDiscountAmendDetail);


		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDiscountAmendDetail) {
	
			// Refresh details and Close popup window if Amendment was successful
			if (oDiscountAmendDetail.MessageType != "E") { // Message will not be "E"
														// if Amendment is created
														// successfully
	
				// Refresh the details 
				var oRequestFinishedDeferred = this._readAndBindDealDetails(false);
				
				// Wait for details to be refreshed
				jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function() {
					
					// Display success message passed from SAP
					sap.m.MessageBox.alert(oDiscountAmendDetail.Message, {
						title : "Amendment Result"
					});
					
					that.CommonController.closePopupWindow(oButtonEvent);
				}));
				
			}
			else{
				// Display Error message passed from SAP
				sap.m.MessageBox.alert(oDiscountAmendDetail.Message, {
					title : "Amendment Result"
				});
			}
			
		}, this));
		
//		
//		// Display Success or Error message. It will be passed from SAP
//		sap.m.MessageBox.alert(oDiscountAmendDetail.Message, {
//			title : "Amendment Result"
//		});
//
//		// Refresh details and Close popup window if Amendment was successful
//		if (oDiscountAmendDetail.MessageType != "E") { // Message will not be "E"
//													// if Amendment is created
//													// successfully
//
//			
//			// Refresh the details 
//			this._readAndBindDealDetails(false);
//			
//			this.CommonController.closePopupWindow(oEvent);
//
//		}
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

		//if (oValidOnDate.getDateValue() === null)
//		oValidOnDate.setDateValue(new Date()); // Set current date as
		// default date

		if (bValidOnDateVisi){
			oValidOnDate.setDateValue(new Date()); // Set current date as
			this.handleCommitmentValidOnDateChange(oEvent); // Call Valid On Change event handler to filter the data
		}
			
		// 
	},

	/**
	 * Event handler for Valid On Date change event
	 * 
	 * @param oEvent
	 */
	handleCommitmentValidOnDateChange : function(oEvent) {

		// Get the Valid on Date value
		var oValidOnDateUI = this.getView().byId("idCommitmentValidOnDate");

		var oValidDate = oValidOnDateUI.getDateValue();

		if(oValidDate.getHours() <= 0){
			oValidDate.setDate(oValidOnDateUI.getDateValue().getDate() + 1);	
		}
		
		oDate = new Date(oValidDate.toJSON().slice(0,10) + "T00:00:00");
		
		
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
		
		
		// Destroy popup if its already there
		if (this._amendComitment) {
			this._amendComitment.destroy(true);
		}
		
	      this._amendComitment = new sap.ui.xmlfragment(
	        "dia.cmc.contractlandscape.fragment.amendment.Commitment",
	        this
	      );
	      
	      this.getView().addDependent(this._amendComitment);
	      
	      // Add one extra item for "All Customers"
	      var oItem = new sap.ui.core.Item();
	      oItem.setKey("0000000000");
	      oItem.setText(this.ModelHelper.getText("AllCustomer"));
	      
	      var oPartnerUI = this.CommonController.getUIElement("idCAPartner");
	      oPartnerUI.addItem(oItem);
      

	    this._amendComitment.open();

	},

	
	
	/**
	 * Event handler for Commitment Amendment - Validate the Commitment Amendment input
	 * and Post it to SAP
	 * 
	 * @param oEvent
	 */
	handleAmendCommitmentPost : function(oEvent) {
		
		var that = this;
		
		// Array of controls on Commitment Amendment popup with OData service field names
		var oControlList = [{id:"idCAPartner", 		uiType:"DDB",	value:"", 	mandatory:false, 	field:"CallOffPartner" },
		                    {id:"idCAProduct", 		uiType:"TB",	value:"", 	mandatory:true, 	field:"Material" },
		                    {id:"idCAQty",		 	uiType:"NBQ",	value:"", 	mandatory:true, 	field:"Quantity" },
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
				
				if(el.uiType === "NBQ"){
					el.value = that.CommonController.reverseDecimalFormat(el.value);
				}
				
				oCommitmentAmendDetail[el.field] = el.value;
			}
		});

		if ( oValidFromUI.getEnabled() ){		// In case of Add Commitment
			oCommitmentAmendDetail.IsNew = "X";
		}
		
//		// Temporary hard coded for testing... need to remove it..
//		/////////////////////////////////
//		oCommitmentAmendDetail.Uom = "PC";
//		/////////////////////////////////////
		
		
		// Check for overlapping
		
		var oCommitmentCollection = this.ModelHelper.oDealDetailModel.getProperty("/CommitmentCollection");
		
		var bIsOverlapping = false;
		
		$.each(oCommitmentCollection, function(i, el){
			
		    if(oCommitmentAmendDetail.CallOffPartner === el.CallOffPartner  &&
		       parseInt(oCommitmentAmendDetail.Material) === parseInt(el.Material) &&
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
		var oRequestFinishedDeferred = this.ModelHelper
				.postCommitmentAmendment(oCommitmentAmendDetail);

		var that = this;
		
		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oCommitmentAmendDetail, oDealDetailModel) {
		
			// Referesh Deal details and Close popup window if Amendment was successful
			if (oCommitmentAmendDetail.MessageType != "E") { // Message will not be "E" if Amendment is created successfully
				
				// Bind Deal Detail model
				if(oDealDetailModel != undefined){
					this.getView().setModel(oDealDetailModel,"DealDetailModel");	
				}
				
				// Display Success message return from SAP
				sap.m.MessageBox.alert(oCommitmentAmendDetail.Message, {
					title : "Amendment Result"
				});
				
				that._amendComitment.close();	
				
//				// Refresh the details 
//				var oRequestFinishedDeferred = this._readAndBindDealDetails(false);
//				
//				// Wait for details to be refreshed
//				jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function() {
//					
//					// Display Success message return from SAP
//					sap.m.MessageBox.alert(oCommitmentAmendDetail.Message, {
//						title : "Amendment Result"
//					});
//					
//					that._amendComitment.close();	
//				}));

			}else{
				// Display error message return from SAP
				sap.m.MessageBox.alert(oCommitmentAmendDetail.Message, {
					title : "Amendment Result"
				});
			}
		
		}, this));
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

		// Read amendment details as we need amendment status. If Amendment Status is not 'Created', we need to disable Cancel Amendment button
		var oAmendmentDetailModel = this.ModelHelper.readAmendmentDetail();
		this.getView().setModel(oAmendmentDetailModel, "AmendmentDetailModel");
		
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

		// Destroy popup if its already there
		if (this._amendRecalculation) {
			this._amendRecalculation.destroy(true);
		}

//		if (!this._amendRecalculation) {
			this._amendRecalculation = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.Recalculation", this);

			this.getView().addDependent(this._amendRecalculation);
			
			// Set quick help for radio buttons
			var oAmendRB = this.CommonController.getUIElement("idAmendContract");
			this.CommonController.setQuickHelp(oAmendRB,"AmendContractDesc",false);
			
			var oRenewRB = this.CommonController.getUIElement("idRenewContract");
			this.CommonController.setQuickHelp(oRenewRB,"RenewContractDesc",false);
			
			// If Amend radio button is disabled, select Renew RB button. ( Amend RB will be disable, when contract is expired
			if(oAmendRB.getEnabled() == false){
				oAmendRB.setSelected(false);
				oRenewRB.setSelected(true);
			}
				
//			var bSimpleAmendEnabled = this.ModelHelper.getProperty("SimpleAmendEnable");
//		}

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

		// Destroy popup if its already there
		if (this._amendValidity) {
			this._amendValidity.destroy(true);
		}

//		if (!this._amendValidity) {
			this._amendValidity = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.ValidityChange", this);

			this.getView().addDependent(this._amendValidity);
//		}

		this._amendValidity.open();

	},

	/** Event Handler for Contract Termination button. It will open Contract Termination Amendment popup window
	 * @param oEvent
	 */
	handleAmendContractTermPopup : function(oEvent) {

		// Destroy popup if its already there
		if (this._amendContractTerm) {
			this._amendContractTerm.destroy(true);
		}
		
//		if (!this._amendContractTerm) {
			this._amendContractTerm = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.amendment.ContractTermination", this);

			this.getView().addDependent(this._amendContractTerm);
//		}

		this._amendContractTerm.open();

	},

	/** Event Handler for Close button on Amendment popup window. It will close the Amendment popup window
	 * @param oEvent
	 */
	handleAmendPopupClose : function(oEvent) {
		
		this.CommonController.closePopupWindow(oEvent);
		
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

		// Validate the amendment input
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, "URC");

		if (canContinue == false) // Validation failed, return
			return;
		
		// Validate and post amendment to SAP
		this._validateAndPostAmendment("URC", oControlList, oEvent);

	},

	
	/** Event handler for Cancel Recalculation Amendment
	 * @param oEvent
	 */
	handleCancelRecalculationPost : function(oEvent) {
		
		that = this;
		
		var oAmendDetail = {};
//		oAmendDetail.DealId = this.ModelHelper.sSelectedDealId;
		oAmendDetail.DealId = this._sDealId;
		oAmendDetail.Action = "UCA";
		
		sap.m.MessageBox.confirm(that.ModelHelper.getText("CancelRecalculationConfirmation"), {
        	title: that.ModelHelper.getText("Confirmation"),
        	actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
    	    onClose: function(oAction){
    	    	if(oAction === sap.m.MessageBox.Action.YES){

    	    		var oRequestFinishedDeferred = that.ModelHelper.updateAmendment(oAmendDetail);	
    				
    	    		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDealCollectionModel) {
    	    			
	    				// Display Success or Error message.
	    				if(oAmendDetail.Message){
	    					sap.m.MessageBox.alert(oAmendDetail.Message, {
	        					title : "Amendment Result"
	        				});    					
	    				}
	    				
    	    		}, this));
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
			id : "idVCContractEndDate",
			uiType : "DT",
			value : "",
			mandatory : true,
			field : "EndDate"
		}, {
			id : "idVCFill",
			uiType : "RB",
			value : "X",
			mandatory : false,
			field : "IsFull"
		}, {
			id : "idVCHeader",
			uiType : "RB",
			value : "X",
			mandatory : false,
			field : "IsHeader"
		}, {
			id : "idVCPricing",
			uiType : "CBGRP",
			value : "X",
			mandatory : false,
			field : "IsPricing"
		}, ];

		// Validate the amendment input
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, "UVC");

		if (canContinue == false) // Validation failed, return
			return;
		
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

		// Validate the amendment input
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, "UCT");

		if (canContinue == false) // Validation failed, return
			return;
		
		// Contract Termination end date should not be in pass
		var oEndDateUI = this.CommonController.getUIElement("idTermEndDate");
		var dEndDate = new Date(oEndDateUI.getDateValue());
		var dToday = new Date((new Date().toJSON().slice(0,10) + " 00:00:00"));
		
		if( dEndDate < dToday){
			var sMsg = this.ModelHelper.getText("InvalidTermEndDate");
			sap.m.MessageToast.show(sMsg);
			oEndDateUI.setValueState("Error");
			canContinue = false;
		}
		else {
			oEndDateUI.setValueState("None");
		}
		
		if (canContinue == false) // Validation failed, return
			return;
		
		// Validate and post amendment to SAP
		this._validateAndPostAmendment("UCT", oControlList, oEvent);

	},


	// Validate the Amendment input and Post it to SAP
	_validateAndPostAmendment : function(sAmendType, oControlList, oEvent) {

//		// Validate the amendment input
//		var canContinue = this.CommonController.validateInput(oEvent, oControlList, sAmendType);
//
//		if (canContinue == false) // Validation failed, return
//			return;

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

		var oButtonEvent = jQuery.extend({}, oEvent);
		
		// Call Helper class method to update Deal Details to SAP
//		oAmendDetail = this.ModelHelper.postAmendment(oAmendDetail);
		var oRequestFinishedDeferred = this.ModelHelper.postAmendment(oAmendDetail);
	
		// Wait till asynchronous call has finished
		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oAmendDetail) {
			
			// Display Success or Error message. It will be passed from SAP
			sap.m.MessageBox.alert(oAmendDetail.Message, {
				title : "Amendment Result"
			});
	
			// Close popup window if Amendment was successful
			if (oAmendDetail.MessageType != "E") { // Message will not be "E" if
													// Amendment is created
													// successfully
	
				this.handleAmendPopupClose(oButtonEvent);
	
			}
		}, this));
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
		
//		this.CommonController.openTimelineSelectionPopup(this);
		
////		var oTimelineView = sap.ui.xmlview("idTimelineView", 
////											"dia.cmc.contractlandscape.view.Timeline");
//				
//		// Destroy popup if its already there
//		if (this._timelineSelection) {
//			this._timelineSelection.destroy(true);
//		}
//		
//		this._timelineSelection = new sap.ui.xmlfragment(
//				"dia.cmc.contractlandscape.fragment.TimelineSelection", oTimelineView.getController());
//
//		this.getView().addDependent(this._timelineSelection);
//
//		this._timelineSelection.open();
//
//		

//		var oTimelineView = sap.ui.getCore().byId("__xmlview2");
		
//	var oTimelineView = sap.ui.getCore().byId("idTimelineView");
//		
//	oTimelineView.destroy(true);
	
		this.CommonController.getRouter(this).navTo("dealTimeline", {
			from: "Detail",
			dealId: this._sDealId,
		}, false);

		
//		if(oTimelineView){
//			oTimelineView.fireAfterRendering();	
//		}
		
		
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

	
//	/** Read deal details and refresh model
//	 */
//	_refreshDealDetailModel : function (sFilter){
//		//Read Deal Collection and bind it to View
//		var oDealDetailModel = this.getView().getModel();
//		
//		oDealDetailModel = this.ModelHelper.readDealDetail(this.ModelHelper.sSelectedDealId);
//		
////		this.getView().setModel(oDealDetailModel);
//	},
	
	
	// Event handler for main tab select event
	handleMainTabSelect : function(oEvent) {

		var bPricingActionButtonVisi = false;
		var bCommitmentActionButtonVisi = false;

		// Reset all the search and filter controls
		this._resetViewControls(false);
		
		
		// Get selected tab's key
//		var sSelectedTabKey = oEvent.getParameter("key");
		var oMainTabBarUI = this.CommonController.getUIElement("idMainDetailTab", this.getView());
		var sSelectedTabKey = oMainTabBarUI.getSelectedKey();
		
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
			var aCollections = ["/MaterialPriceCollection", 
			                    "/TestPriceCollection", 
			                    "/MaterialDiscountCollection", 
			                    "/HierarchyDiscountCollection",
			                    "/GroupDiscountCollection"];
			var oPricingIconTabBars = ["idMatPrice", 
			                    "idTestPrice", 
			                    "idMatDisc", 
			                    "idHierDisc",
			                    "idGrpDisc"];
			var oPricingTables = ["idMatPriceTable", 
					                    "idTestPriceTable", 
					                    "idMatDiscTable", 
					                    "idHierDiscTable",
					                    "idGrpDiscTable"];
			this._hidePricingIconTabBars(aCollections, oPricingIconTabBars, oPricingTables);

//			// Set first tab ( Product Prices ) as selected by default
//			var oPricingTabBarUI = this.CommonController.getUIElement("idPricingTabBar", this.getView());
////			var oPricingTabBarUI = this.getView().byId("idPricingTabBar");
//			oPricingTabBarUI.setSelectedKey("MatPrice");
			
			// Set flag to show Add Price button
			bPricingActionButtonVisi = true;

			// Filter pricing data
			this.handlePricingFilterChange(oEvent);
			
		} else if (sSelectedTabKey === "Commitments") { // Commitment tab is selected

			bCommitmentActionButtonVisi = true;

			this.handleCommitmentFilterChange(oEvent);
			
		} else if (sSelectedTabKey === "Documents"){
			this._bindDocumentList();
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
	/**
	 * Hide Icon Tab Bar when there is no data
	 */
	_hidePricingIconTabBars : function(aCollections, oPricingIconTabBars, oPricingTables){
		var bAllCollectionsAreEmpty = true;
		for(var i = 0; i < oPricingIconTabBars.length; i++){
			if(!this.ModelHelper.oDealDetailModel.getProperty(aCollections[i]).length > 0){
				this.getView().byId(oPricingIconTabBars[i]).setVisible(false);
				this.getView().byId(oPricingTables[i]).setVisible(false);
			}else{
				bAllCollectionsAreEmpty = false;
				this.getView().byId(oPricingIconTabBars[i]).setVisible(true);
				this.getView().byId(oPricingTables[i]).setVisible(true);
			}
		}
		if(bAllCollectionsAreEmpty){
			this.getView().byId("idPricingTabBar").setVisible(false);
			this.getView().byId("idEmptyPricingLabel").setVisible(true);
		}else{
			this.getView().byId("idPricingTabBar").setVisible(true);
			this.getView().byId("idEmptyPricingLabel").setVisible(false);
		}
	},
	/**
	 * Set Model bind for Document List
	 */
	_bindDocumentList : function(){
		
		// Get Document List reference
		var oDocumentListUI = this.CommonController.getUIElement("idDocumentList", this.getView());
		
		// Check if ODataModel is already bind
		if (oDocumentListUI.getItems().length > 0){
			return;
		}
		
		// Get selected path
		var sPath = "ODataModel>" + this.ModelHelper.sSelectedDealPathKey + "/DocumentCollection";
		
		// Prepare item template
		  var oItemTemplate = new sap.m.StandardListItem({  
	          title : "{ODataModel>DocumentTitle}, {ODataModel>Type}",  
	          icon: "sap-icon://document",  
	          description: "{ODataModel>DocumentDescription}",
	          type: "Active",
	          iconDensityAware: false,
	          info: "Updated by {ODataModel>UpdatedBy} On {	path: 'ODataModel>UpdatedOn', formatter: 'dia.cmc.common.util.Formatter.date'}",
			  press: this.handleDocumentPress
	      });  
		  
		  // Bind to items
		  oDocumentListUI.bindItems(sPath, oItemTemplate, null,null);
	},
	
	// Event handler for Document selected items. It will open selected document.
	handleDocumentPress : function(oEvent) {
		var oSelectedContext = oEvent.getSource().getBindingContext("ODataModel");
		
		var oItemData= oEvent.getSource().getModel("ODataModel").getProperty(oSelectedContext.getPath());
		
		window.open(oItemData.DocumentUrl,'Download');
	},
/*******************************************************************************
 * End - Other Code
 ******************************************************************************/

	
	/*******************************************************************************
	 * Start - Product Search help related code
	 ******************************************************************************/
	
	/***
	 * Event handler for ValueHelpRequest event. It will show value help dialog
	 */   
    handleProductValueHelpRequest: function(oEvent, bFromChangeEvent) {
    	
    	this._sProductValueHelpActiveFor = oEvent.getSource().getId();
    	
    	// Get the material entered by user if any
    	var sEnteredMaterial = this.CommonController.getUIElement(oEvent.getSource().getId()).getValue();
    	
    	// if user has not entered any material and this event is called by Change event, just return no action is required
    	if(bFromChangeEvent === true && (sEnteredMaterial == undefined || sEnteredMaterial.length <= 0)){
    		return;
    	}

        // create value help dialog
        if (this._productSelectDialog) {
        	this._productSelectDialog.destroy(true);
        }
        
        this._productSelectDialog = sap.ui.xmlfragment(
            "dia.cmc.contractlandscape.fragment.amendment.ProductValueHelp",
            this
        );
        this.getView().addDependent(this._productSelectDialog);

        // open value help dialog
        this._productSelectDialog.open();

        // Copy entered material in value help screen
    	if(sEnteredMaterial){
    		var oMaterialNumberUI = this.CommonController.getUIElement("idMaterialNumber");
        	oMaterialNumberUI.setValue(sEnteredMaterial);	
    	}
    	
    	// Call Search button press event handler so that by default it can serach for products
       	this.handleProductSearchPress(oEvent,true,bFromChangeEvent);
    },
          
    /**
     * Event handler for Product Input field change event. It will fired when user press enter or tab
     * @param oEvent
     */
    handleProductChange: function(oEvent){
    	
    	// Call value help event handler to open the value help
    	this.handleProductValueHelpRequest(oEvent, true);
    },
    
    /**
     * Event hander for Search button on Product Value help dialog. It will search for products
     */
    handleProductSearchPress: function(oEvent, bNoError, bFromChangeEvent){
    	
    	var oFilters = [];
    	
    	var oMaterialNumberUI = this.CommonController.getUIElement("idMaterialNumber");
    	var oMaterialDescriptionUI = this.CommonController.getUIElement("idMaterialDescription");
    	
    	// At-least one search criteria must be there
    	if (bNoError == undefined && oMaterialNumberUI.getValue() === "" && oMaterialDescriptionUI.getValue() === "") {

    		sap.m.MessageToast.show(this.ModelHelper.getText("AtleastOneField"));	
    		return;
    	}
    	
//    	// At-least one search criteria must be there
//    	if (oMaterialNumberUI.getValue().length < 5  && oMaterialDescriptionUI.getValue().length < 5) {
//    		
//    		sap.m.MessageToast.show(this.ModelHelper.getText("MinLengthError"));
//    		
////    		if(!bNoError){
////    			sap.m.MessageToast.show(this.ModelHelper.getText("MinLengthError"));	
////    		}
//    		
//    		return;
//    	}
    	
    	// Build Filter object as per the entered serach criteria
		if (oMaterialNumberUI.getValue() !== ""){
			oFilters.push(new sap.ui.model.Filter("MaterialNo", sap.ui.model.FilterOperator.EQ, oMaterialNumberUI.getValue()));
		}
		
		if(oMaterialDescriptionUI.getValue() !== ""){
			oFilters.push(new sap.ui.model.Filter("MaterialDesc", sap.ui.model.FilterOperator.EQ, oMaterialDescriptionUI.getValue()));	
		}

		// Create filter object with default Sales Org parameter
		oFilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, this.ModelHelper.oDefaultParameterModel.getData().SalesOrg ));

		// Set filter binding to product table
    	var oProductTableUI = this.CommonController.getUIElement("idProductTable");
    	var oBinding = oProductTableUI.getBinding("items");
    	oBinding.filter(oFilters);

    	// If it is from Product field change event ( user press enter )
    	if(bFromChangeEvent){
	    	oProductTableUI.attachEventOnce("updateFinished", function() {
	        	
	    		// Check if there is only one product found, select it by default
	    		
	    		var oProducts = oProductTableUI.getItems();
	
	        	if(oProducts.length === 1){
	        		this._showSelectedProductDetail(oProducts[0].getBindingContext("ODataModel"));
	        	}
	        	
			}, this);
    	}
    },
    
    
//    /**
//     * Event hander for Search button on Product Value help dialog. It will search for products
//     */
//    handleSuggest: function(oEvent){
//    	
//    	var oFilters = [];
//    	
////    	var oMaterialNumberUI = this.CommonController.getUIElement("idMaterialNumber");
////    	var oMaterialDescriptionUI = this.CommonController.getUIElement("idMaterialDescription");
////    	
////    	// At-least one search criteria must be there
////    	if (oMaterialNumberUI.getValue() === "" && oMaterialDescriptionUI.getValue() === "") {
////    		sap.m.MessageToast.show(this.ModelHelper.getText("SelectOnlyOneField"));
////    		return;
////    	}
////    	
////    	// Build Filter object as per the entered serach criteria
////		if (oMaterialNumberUI.getValue() !== ""){
////			oFilters.push(new sap.ui.model.Filter("MaterialNo", sap.ui.model.FilterOperator.EQ, oMaterialNumberUI.getValue()));
////		}
////		
////		if(oMaterialDescriptionUI.getValue() !== ""){
////			oFilters.push(new sap.ui.model.Filter("MaterialDesc", sap.ui.model.FilterOperator.EQ, oMaterialDescriptionUI.getValue()));	
////		}
//
//		// Create filter object with default Sales Org parameter
//		oFilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, this.ModelHelper.oDefaultParameterModel.getData().SalesOrg ));
//
//		// Set filter binding to product table
//    	var oProductTableUI = this.CommonController.getUIElement("idPAProduct");
//    	var oBinding = oProductTableUI.getBinding("suggestionItems");
//    	oBinding.filter(oFilters);
//    },
//    
    
	 /**
     * Event handler for Close button on Product value help dialog.
     * 
     * */
    handleProductSelectDialogClosePress: function(oEvent) {
        this._productSelectDialog.close();
    },

    
    /**
     * Event handler for Product Table's selectionChange event 
     * It will set the selected product details to new item
     */
    handleProductSelectionChange: function(oEvent) {
    	
    	// Get selected product context binding
    	var oSelectedProductContext = oEvent.getParameter("listItem").getBindingContext("ODataModel");	

    	this._showSelectedProductDetail(oSelectedProductContext);
    	
    },
    
    /***
     * Show selected product detail to calling screen
     * @param oSelectedProductContext: Context of selected item from Product List
     */
    _showSelectedProductDetail: function(oSelectedProductContext){
    	
    	// Get ODate Model object reference
    	var oODataModel = this.getView().getModel("ODataModel");
    	
    	// Get selected product record
    	var oSelectedProduct = oODataModel.getProperty(oSelectedProductContext.getPath());
    	
    	// Base on source who called Product Search help, read the new item object
    	var sNewItemPath = "";
    	if(this._sProductValueHelpActiveFor === "idPAProduct"){	// Price Amendment
    		sNewItemPath = "/NewPriceItem";
    	}else if(this._sProductValueHelpActiveFor === "idCAProduct"){	// Commitment Amendment
    		sNewItemPath = "/NewCommitmentItem";
    	}
    	
    	// Get Deal Detail Model object
    	var oDealDetailModel = this.getView().getModel("DealDetailModel");
    	var oNewItem = oDealDetailModel.getProperty(sNewItemPath);

    	// Set selected product details in new item and bind it again to Deal Detail Model
    	oNewItem.Material = oSelectedProduct.MaterialNo;
    	oNewItem.MaterialDescription = oSelectedProduct.MaterialDesc;
    	oNewItem.Uom = oSelectedProduct.Uom;
    	
    	oDealDetailModel.setProperty(sNewItemPath,oNewItem);
    	
    	// Close the dialog
    	this.handleProductSelectDialogClosePress();
    },
    
/*******************************************************************************
 * Start - Product Search help related code
 ******************************************************************************/


});