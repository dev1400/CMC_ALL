jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("dia.cmc.common.util.Formatter");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.DateRangeSelection");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {

        this._oTable = this.getView().byId("idTable");
        this._oLayout = this.getView().byId("idMatrixLayout");
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
    onAfterRendering: function(){
    	 $("#__xmlview1--idIconTabBar-content").remove();
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

        var oBinding = this._oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;

        if (sKey === "Created") {

            this._oTable.setVisible(true);
            this._oLayout.setVisible(false);
            sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(true);

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
        // create model filter
        var filters = [];
        var query = oEvent.getSource().getValue();
        if (query && query.length > 0) {
            filters = new sap.ui.model.Filter(
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
                    new sap.ui.model.Filter("DealId", sap.ui.model.FilterOperator.Contains, query)
                ],
                false);
        }
        // update list binding
        var oAmendmentList = this.getView().byId("idTable");
        var binding = oAmendmentList.getBinding("items");
        binding.filter(filters);
    },
    
    /** Read deals in amendment collection and bind model to view
	 */
    _bindDealsInAmendmentCollectionModel : function (){
		
		var oDealsInAmendmentCollectionModel = this.ModelHelper.readDealsInAmendmentCollection();
				
		this._oTable.setModel(oDealsInAmendmentCollectionModel); 
	},
	/**
	 * Table row selected. 
	 */
	handleTableRowSelect: function(oEvent){		
        
        if(oEvent.getSource().getSelectedItem().getBindingContext().getObject().Status === 'CRTD'){
        	sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(true);
        }else{
        	sap.ui.getCore().byId("idButtonCancelAmendment").setVisible(false);
        }
        
	},
	
    /**
     * Generate Excel report
     */
    handleDownLoadToExcelButtonPress: function(){
    	
      this.JSONToCSVConvertor(this.ModelHelper.readDealsInAmendmentCollection().getProperty("/DealsInAmendmentCollection"), 
    		  this.ModelHelper.getText("ContractsInAmendmentReport"), true);
    	
    },
    /**
     * Convert JSON data to Excel file. 
     */

    JSONToCSVConvertor: function(JSONData, ReportTitle, ShowLabel) {
	    //If JSONData is not an object then JSON.parser will parse the JSON string in an Object
	    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
	    
	    var CSV = '';    
	    //Set Report title in first row or line
	    
	    CSV += ReportTitle + '\r\n\n';

	    //This condition will generate the Label/Header
	    if (ShowLabel) {
	        var row = "";
	        
	        //This loop will extract the label from 1st index of on array
	        for (var index in arrData[0]) {
	            
	            //Now convert each value to string and comma-seprated
	            row += index + ',';
	        }

	        row = row.slice(0, -1);
	        
	        //append Label row with line break
	        CSV += row + '\r\n';
	    }
	    
	    //1st loop is to extract each row
	    for (var i = 0; i < arrData.length; i++) {
	        var row = "";
	        
	        //2nd loop will extract each column and convert it in string comma-seprated
	        for (var index in arrData[i]) {
	            row += '"' + arrData[i][index] + '",';
	        }

	        row.slice(0, row.length - 1);
	        
	        //add a line break after each row
	        CSV += row + '\r\n';
	    }

	    if (CSV == '') {        
	        alert("Invalid data");
	        return;
	    }   
	    
	    //Generate a file name
	    var fileName = "_";
	    //this will remove the blank-spaces from the title and replace it with an underscore
	    fileName += ReportTitle.replace(/ /g,"_");   
	    
	    //Initialize file format we want csv or xls
	    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
	    
	    
	    var link = document.createElement("a");    
	    link.href = uri;
	    
	    //set the visibility hidden so it will not effect on  web-layout
	    link.style = "visibility:hidden";
	    link.download = fileName + ".csv";
	    
	    //this part will append the anchor tag and remove it after automatic click
	    document.body.appendChild(link);
	    link.click();
	    document.body.removeChild(link);
	}

});