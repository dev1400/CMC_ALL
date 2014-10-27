jQuery.sap.require("dia.cmc.common.util.Formatter");
jQuery.sap.require("dia.cmc.common.util.Grouper");

jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");

jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");


sap.ui.controller("dia.cmc.contractlandscape.view.Master", {

	_bLoadingDealListPending : false,
	
	/***************************************************************************
	 * Start - Initialization and Loading Data related code
	 **************************************************************************/
	
	onInit : function(oEvent) {

		// Model Helper reference
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;		

		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;

//		// Load user parameters and deal collection
//		this._loadInitialData(oEvent);
		
//		this._oUpdateFinishedDeferred = jQuery.Deferred();

//		this.getView().byId("idDealList").attachEventOnce("updateFinished", function() {
//			this._oUpdateFinishedDeferred.resolve();
//		}, this);
//		
//		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.handleRouteMatched, this);
//		this.getView().attachAfterMasterNavigate(this.handleAfterInit,this);
		
		
//		sap.ui.core.UIComponent.getRouterFor(this).attachViewCreated(this.handleAfterInit, this);
//		
//		var oSplitApp = window.rootView.byId("idAppControl");
//		
//		oSplitApp.attachAfterMasterOpen(this.handleAfterInit,this);
	},
	
	
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf view.detail.Partner
	 */
	 onBeforeRendering: function() {
		 
	 },
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.detail.Partner
	 */
	 onAfterRendering: function(oEvent) {
		 
		// Load user parameters and deal collection
		this._loadInitialData(oEvent);
	 },
	 
	/**
	 * Called when the Controller is destroyed. Use this one to free resources
	 * and finalize activities.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onExit: function() {
	// }
	
	handleRouteMatched : function(oEvent) {

//		var sName = oEvent.getParameter("name");
//		
//		if (sName === "main") {
//			
//			// Load user parameters and deal collection
//			this._loadInitialData(oEvent);
//		}
		
//		var oList = this.getView().byId("idDealList");
//		var sName = oEvent.getParameter("name");
//		var oArguments = oEvent.getParameter("arguments");
//		// Wait for the list to be loaded once
//		jQuery.when(this._oUpdateFinishedDeferred).then(jQuery.proxy(function() {
//			var aItems;
//
//			// On the empty hash select the first item
////			if (sName === "main") {
////				this.selectDetail();
////			}
//
//			// Try to select the item in the list
//			if (sName === "deal") {
//
//				aItems = oList.getItems();
//				for (var i = 0; i < aItems.length; i++) {
//					if (aItems[i].getBindingContext().getPath() === "/" + oArguments.deal) {
//						oList.setSelectedItem(aItems[i], true);
//						break;
//					}
//				}	
//			}	
//
//		}, this));
	},
	
	
	/** Load check user default values, if available load Deal collection or ask user to select the default values
	 */
	_loadInitialData : function (oEvent){
		// Read user default parameters
		var oDefaultParameters = this.ModelHelper.readDefaultParameters();
		
		// if not available, ask user to select it
		if ( oDefaultParameters.MessageType === "E"){	
			
			// Set the flag to indicate loading deal list is still pending
			this._bLoadingDealListPending = true;
			
			// Open user default parameter popup
			this.handleDefaultParameterPopup(oEvent);
		}
		else{
			// Create model and bind it to view
			var oDefaultParameterModel =  new sap.ui.model.json.JSONModel( oDefaultParameters );
			this.getView().setModel(oDefaultParameterModel, "DefaultParameters");
			
			//Read Deal Collection and bind it to View
			this._bindDealCollectionModel(null);
		}
	},
	
	/** Read deal collection and bind model to view
	 */
	_bindDealCollectionModel : function (sFilter){
		//Read Deal Collection and bind it to View
		
//		var oDealCollectionModel = this.getView().getModel();
			
		var oDealCollectionModel = this.ModelHelper.readDealCollection(sFilter);
		this.getView().setModel(oDealCollectionModel);
		
		var oDealList = this.getView().byId("idDealList");
		oDealList.setModel(oDealCollectionModel);
	},
	
	/***************************************************************************
	 * Start - Initialization and Loading Data related code
	 **************************************************************************/
	
	
	// Event handler for Search control's search and liveSearch event
	handleSearch : function (oEvent) {

		// create model filter
		var filters = [];
		//			var query = oEvent.getParameter("query");
		var query = oEvent.getSource().getValue();

		if (query && query.length > 0) {

			filters = new sap.ui.model.Filter(
					[
					 new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, query),
					 new sap.ui.model.Filter("CustomerCity", sap.ui.model.FilterOperator.Contains, query),
					 new sap.ui.model.Filter("DealMasterPO", sap.ui.model.FilterOperator.Contains, query),
					 new sap.ui.model.Filter("DealMasterDescr", sap.ui.model.FilterOperator.Contains, query)
					 //			                new sap.ui.model.Filter("ValidFrom", sap.ui.model.FilterOperator.EQ, query),
					 //			                new sap.ui.model.Filter("ValidTo", sap.ui.model.FilterOperator.EQ, query),
					 ],
					 false);
		}

		// update list binding
		var oDealList = this.getView().byId("idDealList");
		var binding = oDealList.getBinding("items");
		binding.filter(filters);

	},

//	hideMaster : function (oEvent) {
//	// hide master list
//	window.globalapp.hideMaster();

//	},

	
	/***************************************************************************
	 * Start - User Preferences Action related code
	 **************************************************************************/
	
	/** Event handler for User Preferences button
	 *  It opens the Preferences action sheet 
	 * @param oEvent
	 */
	handlePreferencesActionSheet : function(oEvent){
		
		var oButton = oEvent.getSource();
		
		if (!this._preferencesActionSheet) {
			this._preferencesActionSheet = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.PreferencesActionSheet",
					this
			);

			this.getView().addDependent(this._preferencesActionSheet);
		}

		this._preferencesActionSheet.openBy(oButton);
		
	},
	
	/** Event handler for Compact Theme Toggle button
	 *  It will change the theme 
	 * @param oEvent
	 */
	handleCompactThemeToggle: function (oEvent){
		
		if ( window.rootView.hasStyleClass("sapUiSizeCompact") ){
			window.rootView.removeStyleClass("sapUiSizeCompact");
		}
		else{
		
			window.rootView.addStyleClass("sapUiSizeCompact");
			
//			$("input[id*='idHeaderTable-tblHeader']").remove();
//            $("#__xmlview2--idHeaderTable-tblHeader").remove();
		}
			
	},

	/** Event handler for Default Parameter button
	 * It will open Default Parameter popup window
	 * @param oEvent
	 */
	handleDefaultParameterPopup : function (oEvent){
				
		if (!this._defaultParameters) {
			this._defaultParameters = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.DefaultParameters",
					this
			);

			this.getView().addDependent(this._defaultParameters);
			
			this.handleSalesOrgChange(oEvent);
			
			this.handleDistChannelChange(oEvent);
		}

		this._defaultParameters.open();
	},

	/** Event handler for Default Parameter Save button
	 * It will call model helper class to save details to SAP.
	 * @param oEvent
	 */
	handleDefaultParameterSave : function(oEvent){
		
		// Array of controls on Commitment Amendment popup with OData service field names
		var oControlList = [{id:"idDFSalesOrg", 	uiType:"TB",	value:"", 	mandatory:true, 	field:"SalesOrg" },
		                    {id:"idDFDistChannel", 	uiType:"TB",	value:"", 	mandatory:true, 	field:"DistChannel" },
		                    {id:"idDFDivision", 	uiType:"TB",	value:"", 	mandatory:true, 	field:"Division" }
		                   ];
		
		
		// Validate the default parameters
		var canContinue = this.CommonController.validateInput(oEvent, oControlList, "");

		if (canContinue == false) // Validation failed, return
			return;
		
		// Get user default parameters
		var oDefaultParameters = this.getView().getModel("DefaultParameters");

		// Update default parameters to SAP
		oDefaultParameters = this.ModelHelper.updateDefaultParameters(oDefaultParameters.getData());

		// Display message and close popup window if update is successful
		if (oDefaultParameters.MessageType != "E") { 
			
			sap.m.MessageToast.show(oDefaultParameters.Message);	
			this.CommonController.closePopupWindow(oEvent);
			
			// Load deal collection if it is still pending
			if(this._bLoadingDealListPending === true){

				//Read Deal Collection and bind it to View
				this._bindDealCollectionModel(null);
				
				this._bLoadingDealListPending = false;
			}
		}
		else{
			// Display Error message 
			sap.m.MessageBox.alert(oDefaultParameters.Message, {
				title : this.ModelHelper.getText("UpdateResult")
			});
		}
	},
	
	/***************************************************************************
	 * End - User Preferences Action related code
	 **************************************************************************/
	

	/***************************************************************************
	 * Start - Deal selection and detail related code
	 **************************************************************************/

	// Event handler for Deal List item press event - applicabsle for Mobile device
	handleListItemPress : function (oEvent) {

		var oContext = oEvent.getSource().getBindingContext();
		this._displayDealDetail(oContext);
	},


	// Event handler for Deal List select event
	handleListSelect : function (oEvent) {

		var oContext = oEvent.getParameter("listItem").getBindingContext();	
		this._displayDealDetail(oContext);
	},



	// Read selected Deal detail, navigate to detail page and displays Deal's details
	_displayDealDetail: function(oContext){

////		// To reduce the initial application load, load google map library when user select any contract from least instead of loading at start of application
//		sap.ui.getCore().loadLibrary("openui5.googlemaps", "lib/openui5/googlemaps/"); 

//		// Read selected deal details
//		var oDealDetailModel = this.ModelHelper.readDealDetail(oContext.getPath());
//
//		// If Deal detail is successfully fetched and context is build navigate to Detail view
//		if(oDealDetailModel != null && oDealDetailModel != undefined)
//			this.nav.to("Detail", oDealDetailModel);
		
		// set selected Deal path to helper class
		this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();
		
		// If we're on a phone, include nav in history; if not, don't.
		var bReplace = jQuery.device.is.phone ? false : true;
		
		var oDealDetail = this.getView().getModel().getProperty(oContext.getPath());
		
		this.CommonController.getRouter(this).navTo("dealDetail", {
			from: "master",
			dealId: oDealDetail.DealId,
		}, bReplace);
		
		
	},


	/***************************************************************************
	 * End - Deal selection and detail related code
	 **************************************************************************/


	/***************************************************************************
	 * Start - Filter related code
	 **************************************************************************/

	handleDealFilter : function(oEvent){

		// Get the selected key value from Select Control
		var oSelect = this.getView().byId(oEvent.getSource().getId());
		var sSelectedKey = oSelect.getSelectedKey();

		var dToday = new Date();
		var oFilters = [];
		var bValidOnDateVisi = false;

		// Build the filter array base on selected filter criteria
		if( sSelectedKey == "1"){					// Valid

			oFilters = new sap.ui.model.Filter(
					[
					 new sap.ui.model.Filter("ValidFrom", sap.ui.model.FilterOperator.LE, dToday),
					 new sap.ui.model.Filter("ValidTo", sap.ui.model.FilterOperator.GE, dToday),
					 ],
					 true);

			//this._filterPricingData(oFilters);
		}
		else if( sSelectedKey == "2"){			// Expired
			oFilters = new sap.ui.model.Filter(
					[
					//new sap.ui.model.Filter("ValidFrom", sap.ui.model.FilterOperator.GT, dToday),
					new sap.ui.model.Filter("ValidTo", sap.ui.model.FilterOperator.LT, dToday),
					],
					false);

			//this._filterPricingData(oFilters);
		}
		else if(sSelectedKey == "3") {			// Flagged
			oFilters = new sap.ui.model.Filter("IsFlagged", sap.ui.model.FilterOperator.EQ, "X");
		}

		// Update list binding
		var oDealList = this.getView().byId("idDealList");
		var oBinding = oDealList.getBinding("items");
		oBinding.filter(oFilters);  
	},


	/***************************************************************************
	 * End - Filter related code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Backend Search Popup Window related code
	 **************************************************************************/

	// Event hander for backend search
	handleBackendSearch : function (oEvent) {

		var oSearchButton = oEvent.getSource();

		// create action sheet only once
		if (!this._actionSheet) {
			this._actionSheet = sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.search.SearchActionSheet",
					this
			);
			this.getView().addDependent(this._actionSheet);
		}

		this._actionSheet.openBy(oSearchButton);
	},	


	// Event Handler for Search by Customer button. It will open Search by Customer popup window
	handleSearchByCustomerPopup : function (oEvent){

		// create Search By Customer popup only once
		if (!this._searchByCustomer) {
			this._searchByCustomer = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.search.SearchByCustomer",
					this
			);

			this.getView().addDependent(this._searchByCustomer);

			// Bind CountryCollection path to ComboBox
			this._bindCountryList("idCustomerCountry");
		}

		this._searchByCustomer.open();

	},

	//Event Handler for Search by Instrument button. It will open Search by Instrument popup window
	handleSearchByInstrumentPopup : function (oEvent){

		// create Search by Instrument popup only once
		if (!this._searchByInstrument) {
			this._searchByInstrument = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.search.SearchByInstrument",
					this
			);

			this.getView().addDependent(this._searchByInstrument);
		}

		this._searchByInstrument.open();

	},

	// Event Handler for Search by References button. It will open Search by Reference popup window
	handleSearchByReferencesPopup : function (oEvent){

		// create Search by Instrument popup only once
		if (!this._searchByReferences) {
			this._searchByReferences = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.search.SearchByReferences",
					this
			);

			this.getView().addDependent(this._searchByReferences);
		}

		this._searchByReferences.open();

	},

	// Event Handler for Advance Search button. It will open Advance Search popup window
	handleAdvanceSearchPopup : function (oEvent){

		// create Advance Search popup only once
		if (!this._advanceSearch) {
			this._advanceSearch = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.search.AdvanceSearch",
					this
			);

			this.getView().addDependent(this._advanceSearch);

			// Bind CountryCollection path to ComboBox
			this._bindCountryList("idAdvanceCustomerCountry");

		}

		this._advanceSearch.open();

	},		  

	// Event Handler for Close button on Search popup window. It will close the Search popup window
	handleSearchPopupClose: function (oEvent) {

		this.CommonController.closePopupWindow(oEvent);

	},


	/***************************************************************************
	 * End - Backend Search Popup Window related code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Backend Search related code
	 **************************************************************************/

//	// Displays the default Deal list and default detail page
//	handleDefaultSearch : function(oEvent){
//
//		//Read Deal Collection and bind it to View
////		var oDealCollectionModel = this.ModelHelper.readDealCollection(null);
////		this.getView().setModel(oDealCollectionModel);
//
//		this._bindDealCollectionModel(null);
//		
//		// Make sure no item is selected
//		var oDealList = this.getView().byId("idDealList");
//		var oSelectedItem = oDealList.getSelectedItem();
//
//		if(oSelectedItem != undefined && oSelectedItem != null)
//			oDealList.setSelectedItem(oSelectedItem, false);
//
//
//		// Display empty detail page
//		if (!sap.ui.Device.system.phone)
//			this.nav.to("Empty");
//	},

	// Event Handler for Favorite Search button. It will list all the Favorite Deal Contracts
	handleGetFavoriteSearch : function (oEvent){

		// Create filter string with IsFavorite flag

		var sFilter = "IsFavorite eq 'X'";

		// call backend search method to search Deal records and bind the model
		this._backendSearch(sFilter);

	},

	
//	// Event Handler for Get Flagged Search button. It will list all the Flagged Deal Contracts
//	handleGetFlagSearch : function (oEvent){
//
//		// Create filter string with IsFavorite flag
//
//		var sFilter = "IsFlagged eq 'X'";
//
//		// call backend search method to search Deal records and bind the model
//		this._backendSearch(sFilter);
//
//	},
//	
//	// Event Handler for Get Valid Search button. It will list all the Valid Deal Contracts
//	handleGetValidSearch : function (oEvent){
//
//		// Prepare the Array with required values
//		var oControlList = [
//		                    {id:"idValidDeals", uiType:"CB",	dataType:"B", 	value:true, 	field:"ValidDeals", 		filterString: "" },
//		                    ];
//
//		// Build Filter string 
//		var sFilter = this._buildFilterString(oControlList);
//
//		// call backend search method to search Deal records and bind the model
//		this._backendSearch(sFilter);
//
//	},
//	
//	// Event Handler for Favorite Search button. It will list all the Favorite Deal Contracts
//	handleGetExpiredSearch : function (oEvent){
//
//		// Create filter string with IsFavorite flag
//
//		var sFilter = "IsFavorite eq 'X'";
//
//		// call backend search method to search Deal records and bind the model
//		this._backendSearch(sFilter);
//
//	},
	
	// Event Handler for Search by Customer button. It will list all the Deal Contracts by Customer search critera
	handleSearchByCustomer : function (oEvent){

		// Standard OData Filter object array is not working, so created Filter string manually.

		// Prepare the Array with required values
		var oControlList = [{id:"idCustomerNumber", 	uiType:"TB",	dataType:"S", 	value:"", 	field:"CustomerNumber", 	filterString: "" },
		                    {id:"idCustomerName", 		uiType:"TB",	dataType:"S", 	value:"", 	field:"CustomerName", 		filterString: "" },
		                    {id:"idCustomerCity", 		uiType:"TB",	dataType:"S", 	value:"", 	field:"CustomerCity", 		filterString: "" },
		                    {id:"idCustomerRegion", 	uiType:"DDB",	dataType:"SK", 	value:"", 	field:"CustomerRegion", 	filterString: "" },
		                    {id:"idCustomerCountry", 	uiType:"DDB",	dataType:"SK", 	value:"", 	field:"CustomerCountry", 	filterString: "" },
		                    {id:"idCustomerValidDeals", uiType:"CB",	dataType:"B", 	value:"", 	field:"ValidDeals", 		filterString: "" },
		                    ];

		// Build Filter string 
		var sFilter = this._buildFilterString(oControlList);

		if(sFilter === null){	// No search criteria is selected
			return;
		}
		
		// call backend search method to search Deal records and bind the model
		this._backendSearch(sFilter);

		// Close Search Popup
		this.handleSearchPopupClose(oEvent);

	},


	// Event Handler for Search by Instrument button. It will list all the Deal Contracts by Instrument search critera
	handleSearchByInstrument : function (oEvent){

		// Standard OData Filter object array is not working, so created Filter string manually.

		// Prepare the Array with required values
		var oControlList = [{id:"idSystemModule", 				uiType:"TB",	dataType:"S", 	value:"", 	field:"SystemModule", 				filterString: "" },
		                    {id:"idSystemModuleName", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"SystemModuleName", 			filterString: "" },
		                    {id:"idSystemModuleSerialNumber", 	uiType:"TB",	dataType:"S", 	value:"", 	field:"SystemModuleSerialNumber", 	filterString: "" },
		                    {id:"idSystemValidDeals", 			uiType:"CB",	dataType:"B", 	value:"", 	field:"ValidDeals", 				filterString: "" },
		                    ];

		// Build Filter string 
		var sFilter = this._buildFilterString(oControlList);

		if(sFilter === null){	// No search criteria is selected
			return;
		}
		
		// call backend search method to search Deal records and bind the model
		this._backendSearch(sFilter);

		// Close Search Popup
		this.handleSearchPopupClose(oEvent);

	},



	// Event Handler for Search by References button. It will list all the Deal Contracts by Reference search critera
	handleSearchByReferences : function (oEvent){

		// Standard OData Filter object array is not working, so created Filter string manually.

		// Prepare the Array with required values
		var oControlList = [{id:"idSalesforceOpportunity", 	uiType:"TB",	dataType:"S", 	value:"", 	field:"SalesforceOpportunity", 	filterString: "" },
		                    {id:"idDealMasterPO", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"DealMasterPO", 			filterString: "" },
		                    {id:"idGDCDeal", 				uiType:"TB",	dataType:"S", 	value:"", 	field:"GDCDeal", 				filterString: "" },
		                    {id:"idDealMasterContract", 	uiType:"TB",	dataType:"S", 	value:"", 	field:"DealMasterContract", 	filterString: "" },
		                    {id:"idBillingContract", 		uiType:"TB",	dataType:"S", 	value:"", 	field:"BillingContract", 		filterString: "" },
		                    {id:"idAgiloftAgreement", 		uiType:"TB",	dataType:"S", 	value:"", 	field:"AgiloftAgreement", 		filterString: "" },
		                    {id:"idExternalReference", 		uiType:"TB",	dataType:"S", 	value:"", 	field:"ExternalReference", 		filterString: "" },
		                    {id:"idRefValidDeals", 			uiType:"CB",	dataType:"B", 	value:"", 	field:"ValidDeals", 			filterString: "" },
		                    ];

	
		// Build Filter string 
		var sFilter = this._buildFilterString(oControlList,"R");

		if(sFilter === null){	// No search criteria is selected
			return;
		}
		
		// call backend search method to search Deal records and bind the model
		this._backendSearch(sFilter);

		// Close Search Popup
		this.handleSearchPopupClose(oEvent);
	},


	// Event Handler for Advance Search button. It will list all the Deal Contracts by Advance search critera
	handleAdvanceSearch : function (oEvent){

		// Standard OData Filter object array is not working, so created Filter string manually.

		// Prepare the Array with required values
		var oControlList = [{id:"idAdvanceCustomerNumber", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"CustomerNumber", 		filterString: "" },
		                    {id:"idAdvanceCustomerName", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"CustomerName", 			filterString: "" },
		                    {id:"idAdvanceCustomerCity", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"CustomerCity", 			filterString: "" },
		                    {id:"idAdvanceCustomerRegion", 			uiType:"DDB",	dataType:"SK", 	value:"", 	field:"CustomerRegion", 		filterString: "" },
		                    {id:"idAdvanceCustomerCountry", 		uiType:"DDB",	dataType:"SK", 	value:"", 	field:"CustomerCountry", 		filterString: "" },
		                    {id:"idAdvanceSystemModule", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"SystemModule", 			filterString: "" },
		                    {id:"idAdvanceSystemModuleName", 		uiType:"TB",	dataType:"S", 	value:"", 	field:"SystemModuleName", 		filterString: "" },
		                    {id:"idAdvanceSystemModuleSerialNumber",uiType:"TB",	dataType:"S", 	value:"", 	field:"SystemModuleSerialNumber",filterString: "" },
		                    {id:"idAdvanceDealMasterPO", 			uiType:"TB",	dataType:"S", 	value:"", 	field:"DealMasterPO", 			filterString: "" },
		                    {id:"idAdvanceDealMasterDescr",			uiType:"TB",	dataType:"S", 	value:"", 	field:"DealMasterDescr",		filterString: "" },
		                    {id:"idActionAtEnd", 					uiType:"CB",	dataType:"B", 	value:"", 	field:"ActionAtEnd", 			filterString: "" },
		                    {id:"idAdvanceValidDeals", 				uiType:"CB",	dataType:"B", 	value:"", 	field:"ValidDeals", 			filterString: "" },
		                    {id:"idAdvanceValidFrom", 				uiType:"DR",	dataType:"DR", 	value:"", 	field:"ValidFrom", 				filterString: "" },
		                    {id:"idAdvanceValidTo", 				uiType:"DR",	dataType:"DR", 	value:"", 	field:"ValidTo", 				filterString: "" },
		                    ];


		// Build Filter string 
		var sFilter = this._buildFilterString(oControlList);

		if(sFilter === null){	// No search criteria is selected
			return;
		}

		// call backend search method to search Deal records and bind the model
		this._backendSearch(sFilter);

		// Close Search Popup
		this.handleSearchPopupClose(oEvent);

	},

	handleAdvanceValidDetailSelect : function(oEvent){

		var oValidFrom = sap.ui.getCore().byId("idAdvanceValidFrom");
		var oValidTo = sap.ui.getCore().byId("idAdvanceValidTo");

		oValidFrom.setEnabled(!oValidFrom.getEnabled());
		oValidTo.setEnabled(!oValidTo.getEnabled());
	},


	// Build filter string base on passed arrays
	_buildFilterString : function(oControlList,sSearchType){

		var sFilter = "";
		var bAtLeastOneField = false;
		var bOneField = false;
		var bMultipleField = false;
		
		$.each(oControlList, function(i, el){

			if(el.filterString != undefined && el.filterString.length > 0){	// Filter string already supplied

				if(sFilter.length > 0)
					sFilter += " and ";

				sFilter += el.filterString;

			}else{

				if(el.value === ""){					// UI Control Value is not supplied

					var oControl = sap.ui.getCore().byId(el.id);

					if (oControl != undefined && oControl.getEnabled()){

						if(el.uiType === "CB"){			// Check box UI Control
							el.value = oControl.getSelected();
						}
						else if(el.uiType === "DDB"){			// Dropdown / Combo Box UI Control
							el.value = oControl.getSelectedKey();
						}else if(el.uiType === "DR"){	// Date Range
							el.value = oControl.getDateValue();
							el.value2 = oControl.getSecondDateValue();
						}	
						else{
							el.value = oControl.getValue();	
						}
					}
				}

				if(el.value)
				{
					if(sFilter.length > 0)
						sFilter += " and ";

//					if(el.dataType === "S"){			// String
//						sFilter += "substringof('" + el.value + "'," + el.field + ")";
//
//					}else
					if(el.dataType === "D"){		// Date

						var sDate = dia.cmc.common.util.Formatter.convertToEDMDate(el.value);

						sFilter += el.field + " eq datetime'" +  sDate + "'"; 

					}else if(el.dataType === "B"){		// Boolean

						if(el.field === "ValidDeals"){				// Exception for ValidDeal field

							var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(new Date());

							sFilter += "( ValidFrom ge datetime'1900-01-01T00:00:00' and ValidFrom le datetime'" + sFromDate + "' ) and "; 		
							
							sFilter += "( ValidTo ge datetime'" +  sFromDate + "' and ValidTo le datetime'9999-12-31T00:00:00' )"; 	
						}
						else{
							sFilter += el.field + " eq '" +  el.value + "'"; 	
						}
					}
					else if(el.dataType === "DR"){		// Date Range
						
						var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(el.value);
						var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(el.value2);

						sFilter += "( " + el.field + " ge datetime'" +  sFromDate + "' and " + el.field + " le datetime'" + sToDate + "') "; 
						
					}
					else{
						sFilter += el.field + " eq '" +  el.value + "'"; 	
					}

					if(el.field != "CustomerCountry" && el.field != "ValidDeals" ){
						bAtLeastOneField = true;
						
						if(bOneField == true){
							bMultipleField = true;
						}else{
							bOneField = true;
						}
					}
				}
			}
		});

		
		// At-least one search criteria should be specified
		if(bAtLeastOneField === false){
		 
			sap.m.MessageBox.alert(this.ModelHelper.getText("AtleastOneField"), {
				title : this.ModelHelper.getText("SearchCriteriaTitle")
			});
			
			return null;
		}
		
		// Multiple field are selected in Search by Reference
		if(sSearchType == "R" && bMultipleField === true){
		 
			sap.m.MessageBox.alert(this.ModelHelper.getText("SelectOnlyOneField"), {
				title : this.ModelHelper.getText("SearchCriteriaTitle")
			});
			
			return null;
		}
		
		return sFilter;
	},


	// Methods for searching Deal records by calling OData Model Read method with filter parameter 
	_backendSearch : function(sFilter)
	{
		//Read Deal Collection and bind it to View
		this._bindDealCollectionModel(sFilter);
		
		// Display message
		this._displaySearchMessage();
	},


	// Method for displalying search success message base of search result
	_displaySearchMessage : function(){

		// Get List UI element reference
		var oDealList = this.getView().byId("idDealList");

		// Get List item binding reference
		var oBinding = oDealList.getBinding("items");

		var sMsg = "";

		if(oBinding.getLength() <= 0) {
			sMsg = 'No Deal Contract found';
		}else{
			sMsg = 'Deal Contracts are filtered';  
		}

		sap.m.MessageToast.show(sMsg);	

	},

	/***************************************************************************
	 * End - Backend Search related code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Country and Region Combox related code
	 **************************************************************************/

	/** Event hanlder for Customer Country Combo box ( In Search By Customer Screen ) selection change event.
	 * It will load the Regions 
	 * @para oUIElementId : Country UI element id
	 */
	handleCustomerCountryChange : function(oEvent){

		// Get selected country key
		var sSelectedCountryKey = oEvent.getParameter("selectedItem").getKey();

		// Set country flag url
		this._bindCountryFlagUrl(sSelectedCountryKey,"CustomerCountryFlag");

		// Bind RegionCollection path
		this._bindRegionList(sSelectedCountryKey, "idCustomerRegion");
	},

	/** Event hanlder for Customer Country Combo box ( In Advance Search Screen ) selection change event.
	 * It will load the Regions 
	 * @para oUIElementId : Country UI element id
	 */
	handleAdvanceCustomerCountryChange : function(oEvent){

		// Get selected country key
		var sSelectedCountryKey = oEvent.getParameter("selectedItem").getKey();

		// Set country flag url
		this._bindCountryFlagUrl(sSelectedCountryKey,"AdvanceCustomerCountryFlag");

		// Bind RegionCollection path
		this._bindRegionList(sSelectedCountryKey, "idAdvanceCustomerRegion");
	},

	/** Bind Country flag url base on selected country 
	 * @para sCountryKey : Selected Country Key
	 */
	_bindCountryFlagUrl : function(sSelectedCountryKey,sProperty){

		// Build country flag url
		var sCountryFlagUrl = "http://www.geonames.org/flags/x/" + sSelectedCountryKey.toLowerCase() + ".gif";

		// Set flag url in model
		this.ModelHelper.setProperty(sProperty,sCountryFlagUrl);
	},

	/** Bind CountryCollection OData Entity path to Customer Country dropdown 
	 * @para oUIElementId : Country UI element id
	 */
	_bindCountryList : function (oUIElementId){

		var oItems = new sap.ui.core.ListItem({
			key : "{ODataModel>CountryKey}",
			text : "{ODataModel>CountryName}",
		});

		var oCustomerCountry = this.CommonController.getUIElement(oUIElementId);

		var oSorter = new sap.ui.model.Sorter("CountryName",false,false);

		var sLang = this.CommonController.getBrowserLanguage();
		
		var oFilters = new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, sLang.substr(0,1).toUpperCase());

		oCustomerCountry.bindItems("ODataModel>/CountryCollection", oItems, oSorter, oFilters);
		
//		var binding = oCustomerCountry.getBinding("items");
//		binding.sort(oSorter);

	},


	/** Bind RegionCollection OData Entity path to Customer Country dropdown 
	 * @para sCountryKey : Selected Country Key
	 * @para oRegionUIElementId : Region UI element id
	 */
	_bindRegionList : function (sCountryKey, oRegionUIElementId){

		var oItems = new sap.ui.core.ListItem({
			key : "{ODataModel>RegionCode}",
			text : "{ODataModel>RegionDescription}",
		});

		var oRegionUI = this.CommonController.getUIElement(oRegionUIElementId);


		var oSorter = new sap.ui.model.Sorter("RegionDescription",false,false);

		var sLang = this.CommonController.getBrowserLanguage();
		
		var oFilters =  new sap.ui.model.Filter( [
		                                          new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, sLang.substr(0,1).toUpperCase()),
		                                          new sap.ui.model.Filter("CountryKey", sap.ui.model.FilterOperator.EQ, sCountryKey),
		                                          ], 
		                                          true );

		oRegionUI.bindItems("ODataModel>/RegionCollection", oItems, oSorter,oFilters);
	},


	/***************************************************************************
	 * End - Country and Region Combox related code
	 **************************************************************************/

	
	/***************************************************************************
	 * Start - Default Parameter related code
	 **************************************************************************/
	
	/** Event hanlder for Sales Org. Combo box ( In User Default Parameters screen ) selection change event.
	 * It will load Distribution Channels
	 * @para oEvent 
	 */
	handleSalesOrgChange : function(oEvent){

		// Get selected Sales Org
//		var sSelectedSalesOrg = oEvent.getParameter("selectedItem").getKey();

		var oSalesOrgUI = this.CommonController.getUIElement("idDFSalesOrg");
		var sSelectedSalesOrg = oSalesOrgUI.getSelectedKey();
			
		if ( sSelectedSalesOrg === undefined || sSelectedSalesOrg === null  || sSelectedSalesOrg === ""){
			return;
		}
		
		var oItems = new sap.ui.core.ListItem({
			key : "{ODataModel>DistChannelCode}",
			text : "{ODataModel>DistChannelCode} - {ODataModel>DistChannelDescription}",
		});

		// Get Dist Channel Combo box reference
		var oDistChannelUI = this.CommonController.getUIElement("idDFDistChannel");

		// Create sorter object
		var oSorter = new sap.ui.model.Sorter("DistChannelDescription",false, false);

		// Create filter object
		var oFilters = new sap.ui.model.Filter("SalesOrgCode", sSelectedSalesOrg);

		// Bind data to Dist. Channel Combo Box
		oDistChannelUI.bindItems("ODataModel>/DistChannelCollection", oItems, oSorter, oFilters);
	},
	
	
	/** Event hanlder for Dist. Channel Combo box ( In User Default Parameters screen ) selection change event.
	 * It will load the Divisions
	 * @para oEvent 
	 */
	handleDistChannelChange : function(oEvent){
		
		var oDistChannelUI = this.CommonController.getUIElement("idDFDistChannel");
		var sSelectedDistChannel = oDistChannelUI.getSelectedKey();
			
		if ( sSelectedDistChannel === undefined || sSelectedDistChannel === null  || sSelectedDistChannel === ""){
			return;
		}
		
		// Create item object
		var sDivisionText = this.ModelHelper.getText("DefaultDivision");
		
		var oItems = new sap.ui.core.ListItem({
			key : "45",
			text : "45 - " + sDivisionText,
		});
		
		
		//Get Dist Channel Combo box reference
		var oDivisionUI = this.CommonController.getUIElement("idDFDivision");

		var sSelectedDivision = oDivisionUI.getSelectedKey();
		
		// Add item to Division combo box
		oDivisionUI.removeAllItems();
		oDivisionUI.addItem(oItems);
		
		// Set the existing selected key
		if(sSelectedDivision != ""){
			oDivisionUI.setSelectedKey(sSelectedDivision);
		}
		
	}
	
	/***************************************************************************
	 * End - Default Parameter related code
	**************************************************************************/
});