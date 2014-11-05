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

            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "CRTD");
            oBinding.filter([oFilter]);


        } else if (sKey === "Released") {

            this._oLayout.setVisible(false);
            this._oTable.setVisible(true);

            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "RELE");
            oBinding.filter([oFilter]);


        } else if (sKey === "Executed") {

            this._oLayout.setVisible(true);
            this._oTable.setVisible(false);
            this.handleAmendmentDateRangePress();

        } else {

            this._oLayout.setVisible(false);
            this._oTable.setVisible(true);

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
            from: "master",
            dealId: oDealDetail.DealId,
        }, bReplace);
    },

    /**
     * Show options when Additional Actions button is pressed.
     */
    handleAdditionalActionsButtonPress: function(oEvent) {
        // Get reference of Further Actions Button
        var oAdditionalActionsButton = oEvent.getSource();

        // create action sheet only once
        if (!this._actionSheet) {
            this._actionSheet = sap.ui.xmlfragment(
                "dia.cmc.contractsinamendment.fragment.AdditionalActionsActionSheet", this);
            this.getView().addDependent(this._actionSheet);
        }

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
	handleSearchFieldPress : function (oEvent) {

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

});