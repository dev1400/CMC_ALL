jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("sap.ca.ui.dialog.factory");
sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {

        // Model Helper reference
        this.ModelHelper = dia.cmc.common.helper.ModelHelper;

        // Common Controller reference
        this.CommonController = dia.cmc.common.helper.CommonController;

        // set i18n model
        var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl: "contractsinamendment/i18n/messageBundle.properties"
        });
        this.getView().setModel(i18nModel, "i18n");

        // set explored app's demo model on this sample
        var oModel = new sap.ui.model.json.JSONModel("contractsinamendment/model/products.json");
        this.getView().setModel(oModel);

        $(document).ready(function() {
            $("#__xmlview1--idIconTabBar-content").remove();
        });

    },

    handleIconTabBarSelect: function(oEvent) {
        this._oTable = this.getView().byId("idTable");
        var oBinding = this._oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;

        if (sKey === "Created") {
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Created");
            oBinding.filter([oFilter]);
        } else if (sKey === "Released") {
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Released");
            oBinding.filter([oFilter]);
        } else if (sKey === "Executed") {
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Executed");
            oBinding.filter([oFilter]);
        } else {
            oBinding.filter([]);
        }

    },
    /**
     * Navigate to Deal Detail.
     */
    handleLineItemPress: function(oEvent) {
        console.log("This will navigate to details page");
        var oContext = oEvent.getSource().getBindingContext();
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

    /**
     * Cancel an Amendment handler.
     */
    handleCancelPress: function(evt) {

        var fnClose = function(oResult) {
            if (oResult) {
                /*console.log("isConfirmed:" + oResult.isConfirmed);
                if (oResult.sNote) {
                    console.log(oResult.sNote);
                }*/
            }
        }
        
        /**
         * Opens the confirmation dialog
         */
        sap.ca.ui.dialog.confirmation.open({
            question: this.ModelHelper.getText("AmendmentCancellationMessage"),
            title: this.ModelHelper.getText("CancelAmendment"),
            confirmButtonLabel: this.ModelHelper.getText("Ok")
        }, fnClose);
    },

    /**
     * Navigate to Amendment Flow.
     */
    handleWorkFlowPress: function(oEvent) {

        var oContext = oEvent.getSource().getBindingContext();

        this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();

        // If we're on a phone, include nav in history; if not, don't.
        var bReplace = jQuery.device.is.phone ? false : true;

        var oDealDetail = this.getView().getModel().getProperty(oContext.getPath());

        this.CommonController.getRouter(this).navTo("AmendmentFlow", {
            from: "master",
            dealId: oDealDetail.DealId,
        }, bReplace);
    },
    /**
     * Display pop-up.
     */
    handlePopoverPress: function(oEvent) {
        var local = oEvent.getParameters();
        var lastChar = local.id;
        lastChar = lastChar.substr(lastChar.length - 1);

        // create popover
        // if (!this._oPopover) {
        this._oPopover = sap.ui.xmlfragment(
            "dia.cmc.contractsinamendment.fragments.AmendmentDescription", this);
        this.getView().addDependent(this._oPopover);
        this._oPopover.bindElement("/AmendmentsCollection/" + lastChar);
        // }

        var oButton = oEvent.getSource();
        jQuery.sap.delayedCall(0, this, function() {
            this._oPopover.openBy(oButton);
        });
    },


});