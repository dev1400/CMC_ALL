jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("dia.cmc.common.util.Formatter");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.DateRangeSelection");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.commons.SearchField");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {

        this._oTable = this.getView().byId("idTable");
        this._oLayout = this.getView().byId("idMatrixLayout");
        this._oSearchField = this.getView().byId("idSearchField");
        this._oLayout.setVisible(false);
        this._oAmend = {
            DealId: "",
            AmendmentId: "",
            RequestDesc: "",
            Action: "UCA"
        };
        this._oAmendmentIdforCancellation = null;
        this._oDealIdforCancellation = null;

        // Model Helper reference
        this.ModelHelper = dia.cmc.common.helper.ModelHelper;
        // Common Controller reference
        this.CommonController = dia.cmc.common.helper.CommonController;

        this._setDefaultDateRange();

        // create action sheet only once
        if (!this._actionSheet) {
            this._actionSheet = sap.ui.xmlfragment(
                "dia.cmc.contractsinamendment.fragment.AdditionalActionsActionSheet", this);
            this.getView().addDependent(this._actionSheet);
        }

        this._bindDealsInAmendmentCollectionModel();

        $(document).ready(function() {
            $("#__xmlview1--idIconTabBar-content").remove();
        });
    },
    /**
     * Called when the View has been rendered.
     */
    onAfterRendering: function(oEvent) {
        $("#__xmlview1--idIconTabBar-content").remove();
        // Load user parameters and deal collection
		this._loadInitialData(oEvent);
    },
    /** Load check user default values, if available load Deal collection or ask user to select the default values
	 */
	_loadInitialData : function (oEvent){		
		// Read user default parameters
		var oRequestFinishedDeferred = this.ModelHelper.readDefaultParameters();
		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDefaultParameters) {			
			// if not available, ask user to select it
			if ( oDefaultParameters.MessageType === "E"){	
				this.handleDefaultParameterPopup(oEvent);
			}
			else{
				// Create model and bind it to view
				var oDefaultParameterModel =  new sap.ui.model.json.JSONModel( oDefaultParameters );
				this.getView().setModel(oDefaultParameterModel, "DefaultParameters");
				
				//Read Deal Collection and bind it to View
				this._readAndBindDealCollection(null);
			}
		
		}, this));

	},
	
	/** Read deal collection and bind model to view
	 */
	_readAndBindDealCollection : function (sFilter,oEvent,bClosePopup){
		//Read Deal Collection and bind it to View		
		var oSearchButtonEvent = jQuery.extend({}, oEvent);
		
		var oRequestFinishedDeferred = this.ModelHelper.readDealCollection(sFilter);
		
		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDealCollectionModel) {
		
			var sMsg = "";
			
			if(oDealCollectionModel.getData().DealCollection.length > 0){	// Some Deals found 
				
				// Set model to view
				this.getView().setModel(oDealCollectionModel);
				  
				// If Search popup is open, close it
				if(bClosePopup){
					
					this.handleSearchPopupClose(oSearchButtonEvent);
					
					// Show default screen and remove selection
					this._showDefaultDetailView();
					sMsg = 'Deal Contracts are filtered';
				}
			}else{
				sMsg = 'No Deal Contract found';
			}
			
			// Show message
			if(sMsg != ""){
				sap.m.MessageToast.show(sMsg);	
			}
			
		}, this));
	},

    /**
     * Get From and To date when date range is selected.
     */
    handleAmendmentDateRangeChange: function(oEvent) {

        this._sDateFrom = oEvent.getParameter("from");
        this._sDateTo = oEvent.getParameter("to");

    },
    /**
     * Show amendments based on selected date range.
     */
    handleAmendmentDateRangePress: function() {

        if (this._sDateFrom !== undefined | this._sDateTo !== undefined) {

            var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateFrom);
            var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateTo);

            var oBinding = this._oTable.getBinding("items");
            this._oTable.setVisible(true);
            var ofilters = [];
            ofilters = new sap.ui.model.Filter(
                [new sap.ui.model.Filter("StartDate", sap.ui.model.FilterOperator.GE, sFromDate),
                    new sap.ui.model.Filter("StartDate", sap.ui.model.FilterOperator.LE, sToDate)
                ], true);

            oBinding.filter(ofilters);
        } else {
            sap.m.MessageToast.show(this.ModelHelper.getText("PleaseSelectaDateRange"));
        }
    },
    /**
     * Show amendment details based on icon tab bar selection.
     */
    handleAmendmentIconTabBarSelect: function(oEvent) {

        this._oSearchField.clear();

        var oBinding = this._oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;

        if (sKey === "Created") {

            this._oTable.setVisible(true);
            this._oLayout.setVisible(false);
            sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(true);
            sap.ui.getCore().byId("idButtonCancelAmendment").setEnabled(true);

            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "CRTD");
            oBinding.filter([oFilter]);


        } else if (sKey === "Released") {

            this._oLayout.setVisible(false);
            this._oTable.setVisible(true);
            sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(false);

            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "RELE");
            oBinding.filter([oFilter]);


        } else if (sKey === "Executed") {

            this._oLayout.setVisible(true);
            this._oTable.setVisible(false);
            sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(false);
            this.handleAmendmentDateRangePress();

        } else {
            this._oLayout.setVisible(false);
            this._oTable.setVisible(true);

            sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(true);
            sap.ui.getCore().byId("idButtonCancelAmendment").setEnabled(false);


            oBinding.filter([new sap.ui.model.Filter("Status", sap.ui
                    .model.FilterOperator.EQ, "CRTD"), new sap
                .ui.model.Filter("Status", sap.ui.model.FilterOperator
                    .EQ, "RELE")
            ]);
        }
    },
    /**
     * Navigate to Deal Detail.
     */
    handleDealIdLinkPress: function(oEvent) {
        var oContext = oEvent.getSource().getBindingContext();
        // set selected Deal path to helper class
        this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();
        // If we're on a phone, include nav in history; if not, don't.
        var bReplace = jQuery.device.is.phone ? false : true;
        var oDealDetail = this.getView().getModel().getProperty(
            oContext.getPath());
        this.CommonController.getRouter(this).navTo("dealDetail", {
            from: "master",
            dealId: oDealDetail.DealId,
        }, false);
    },

    /**
     * Handle amendment cancellation.
     */
    handleAmendmentCancelPress: function(oEvent) {

        var oAmendTableUI = this.CommonController.getUIElement("idTable", this.getView());
        var oSelectedContexts = oAmendTableUI.getSelectedContexts();
        if (oSelectedContexts.length > 0) {
            var oDealDetail = this.getView().getModel().getProperty(oSelectedContexts[0].getPath());

            this._oAmend.DealId = oDealDetail.DealId;
            this._oAmend.AmendmentId = oDealDetail.AmendmentId;
            var oParentContext = this;

            /**
             * Opens the confirmation message box.
             */
            sap.m.MessageBox.confirm(this.ModelHelper.getText("AmendmentCancellationMessage"), {
                icon: sap.m.MessageBox.Icon.QUESTION,
                title: this.ModelHelper.getText("CancelAmendment"),
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                onClose: function(oAction) {
                    if (oAction === oParentContext.ModelHelper.getText("OK")) {
                        oParentContext.ModelHelper.updateAmendment(oParentContext._oAmend);
                    }
                }
            });

        } else {
            sap.m.MessageToast.show(this.ModelHelper.getText("SelectAnAmendmentForCancellation"));
        }
    },
    /**
     * Navigate to WorkFlow overview page.
     */
    handleProcessIconPress: function(oEvent) {
        var oContext = oEvent.getSource().getBindingContext();
        this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();
        // If we're on a phone, include nav in history; if not, don't.
        var bReplace = jQuery.device.is.phone ? false : true;
        var oDealDetail = this.getView().getModel().getProperty(
            oContext.getPath());
        this.CommonController.getRouter(this).navTo("AmendmentFlow", {
            from: "master"
        }, bReplace);
    },

    /**
     * Show options when Additional Actions button is pressed.
     */
    handleAdditionalActionsButtonPress: function(oEvent) {
        // Get reference of Further Actions Button
        var oAdditionalActionsButton = oEvent.getSource();
        this._actionSheet.openBy(oAdditionalActionsButton);
    },
    /**
     * Show pop up window with amendment description.
     */
    handlePopupWindowIconPress: function(oEvent) {

        sap.m.MessageBox.show(oEvent.getSource().getBindingContext().getObject().Description, {
            title: this.ModelHelper.getText("AmendmentDescription"),
            actions: [sap.m.MessageBox.Action.OK]
        });
    },
    /**
     * Show pop up window with amendment description.
     */
    handleAmendmentDescriptionMoreLinkPress: function(oEvent) {

        var oMoreLink = oEvent.getSource();

        // create pop over fragment only once
        if (!this._popOverFragment) {
            this._popOverFragment = sap.ui.xmlfragment(
                "dia.cmc.contractsinamendment.fragment.AmendmentDescriptionPopup", this.getView().getController());
            this.getView().addDependent(this._popOverFragment);
        }

        var fragmentTextView = sap.ui.getCore().byId("idFragmentTextView");
        fragmentTextView.setText(oEvent.getSource().getBindingContext().getObject().Description);

        this._popOverFragment.openBy(oMoreLink);
    },
    /**
     * Set default date range for executed amendments.
     */
    _setDefaultDateRange: function() {

        var oPeriodUI = this.CommonController.getUIElement("idExecutedAmendmentsDateRange", this.getView());

        this._sDateFrom = new Date();
        this._sDateTo = new Date();

        this._sDateFrom.setMonth(this._sDateFrom.getMonth() - 3);

        oPeriodUI.setDateValue(this._sDateFrom);
        oPeriodUI.setSecondDateValue(this._sDateTo);

    },
    /**
     * Event handler for Search control's search and liveSearch event
     */
    handleSearchFieldPress: function(oEvent) {
        var oIconTabBar = this.getView().byId("idIconTabBar");
        var sSelectedTab = oIconTabBar.getSelectedKey();

        // create model filter

        var filters = [];
        var query = oEvent.getSource().getValue();
        if (query && query.length > 0) {

            var oOptionalFilters = new sap.ui.model.Filter(
                [
                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("CustomerCity", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("CustomerCountry", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("CustomerZip", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("CustomerId", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("AmendmentType", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("TriggeredByUserName", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("DealDescription", sap.ui.model.FilterOperator.Contains, query),
                    new sap.ui.model.Filter("DealId", sap.ui.model.FilterOperator.Contains, query),

                ],
                false);
            var oAmendmentList = this.getView().byId("idTable");
            var binding = oAmendmentList.getBinding("items");

            if (sSelectedTab === "All deals") {

                filters = new sap.ui.model.Filter([oOptionalFilters], false);

                binding.filter(filters);
            } else if (sSelectedTab === "Created") {

                filters = new sap.ui.model.Filter([oOptionalFilters, new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "CRTD")], true);

                binding.filter(filters);
            } else if (sSelectedTab === "Released") {

                filters = new sap.ui.model.Filter([oOptionalFilters, new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "RELE")], true);

                binding.filter(filters);
            } else if (sSelectedTab === "Executed") {

                filters = new sap.ui.model.Filter([oOptionalFilters, new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "EXEC")], true);

                binding.filter(filters);
            }
        }

    },

    /** Read deals in amendment collection and bind model to view
     */
    _bindDealsInAmendmentCollectionModel: function() {

        var oDealsInAmendmentCollectionModel = this.ModelHelper.readDealsInAmendmentCollection();

        this._oTable.setModel(oDealsInAmendmentCollectionModel);
    },
    /**
     * Table row selected.
     */
    handleTableRowSelect: function(oEvent) {

        if (oEvent.getSource().getSelectedItem().getBindingContext().getObject().Status === 'CRTD') {
            sap.ui.getCore().byId("idButtonCancelAmendment").setEnabled(true);
        } else {
            sap.ui.getCore().byId("idButtonCancelAmendment").setEnabled(false);
        }

    },

    /**
     * Generate Excel report
     */
    handleDownLoadToExcelButtonPress: function() {

        this.CommonController.JSONToCSVConvertor(this._oTable.getBinding("items").oModel.oData.DealsInAmendmentCollection,
            this.ModelHelper.getText("ContractsInAmendmentReport"), true);

    },
   
	
	/***************************************************************************
	 * Start - Default Parameter related code
	 **************************************************************************/
    
    /** Event handler for Default Parameter button
	 * It will open Default Parameter popup window
	 * @param oEvent
	 */
	handleDefaultParameterPopup : function (oEvent){
				
		if (!this._defaultParameters) {
			this._defaultParameters = new sap.ui.xmlfragment(
					"dia.cmc.contractsinamendment.fragment.DefaultParameters",
					this
			);

			this.getView().addDependent(this._defaultParameters);
			
			this.handleSalesOrgChange(oEvent);
			
			this.handleDistChannelChange(oEvent);
		}

		this._defaultParameters.open();
	},
	
	/** Event hanlder for Sales Org. Combo box ( In User Default Parameters screen ) selection change event.
	 * It will load Distribution Channels
	 * @para oEvent 
	 */
	handleSalesOrgChange : function(oEvent){

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
		var oFilters = new sap.ui.model.Filter("SalesOrgCode", sap.ui.model.FilterOperator.EQ, sSelectedSalesOrg);

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
		
		var oButtonEvent = jQuery.extend({}, oEvent);
		
		// Get user default parameters
		var oDefaultParameters = this.getView().getModel("DefaultParameters");

		// Update default parameters to SAP
		var oRequestFinishedDeferred = this.ModelHelper.updateDefaultParameters(oDefaultParameters.getData());

		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDefaultParameters) {
			
			// Display message and close popup window if update is successful
			if (oDefaultParameters.MessageType != "E") { 
				
				sap.m.MessageToast.show(oDefaultParameters.Message);	
				this.CommonController.closePopupWindow(oButtonEvent);
				
	
				//Read Deal Collection and bind it to View
				this._readAndBindDealCollection(null);
					
				// Show default screen and remove selection if no search result found
				this._showDefaultDetailView();
				
//					this._bLoadingDealListPending = false;
//				}
			}
			else{
				// Display Error message 
				sap.m.MessageBox.alert(oDefaultParameters.Message, {
					title : this.ModelHelper.getText("UpdateResult")
				});
			}

		}, this));
	},

	/**
	 * Event Handler for Close button on Search popup window. It will close the Search popup window
	 */
	handleSearchPopupClose: function (oEvent) {

		this.CommonController.closePopupWindow(oEvent);

	},
	
	/***************************************************************************
	 * End - Default Parameter related code
	**************************************************************************/

});