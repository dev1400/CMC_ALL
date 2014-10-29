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
        this._oPopupWindowIcon = this.getView().byId("idPopupWindowIcon");
        this._oPopupWindowIcon.setVisible(true);
        
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

    },
    onAfterRendering : function() {
        console.log("onAfterRendering");
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
    handleAmendmentDateRangePress: function(oEvent) {

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
    	
    	if (this._oAmendmentIdforCancellation !== null & this._oDealIdforCancellation !== null) {

            this._oAmend.DealId = this._oDealIdforCancellation;
            this._oAmend.AmendmentId = this._oAmendmentIdforCancellation;
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
    		      }
    		    );
    },
    /**
     * Get context of selected table row.
     */
    handleTableRowPress: function(oEvent) {
    	
        this._oAmendmentIdforCancellation = oEvent.getSource().getBindingContext().getObject().AmendmentId;
        this._oDealIdforCancellation = oEvent.getSource().getBindingContext().getObject().DealId;

    }
    
});