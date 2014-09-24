jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.DateRangeSelection");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.table.Table");


sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {

        // Model Helper reference
        this.ModelHelper = dia.cmc.common.helper.ModelHelper;

        // Common Controller reference
        this.CommonController = dia.cmc.common.helper.CommonController;

//        // set i18n model
//        var i18nModel = new sap.ui.model.resource.ResourceModel({
//            bundleUrl: "contractsinamendment/i18n/messageBundle.properties"
//        });
//        this.getView().setModel(i18nModel, "i18n");

        // set explored app's demo model on this sample
       /* var oModel = new sap.ui.model.json.JSONModel("contractsinamendment/model/products.json");
        this.getView().setModel(oModel);*/
        
       /* var oODataModel = dia.cmc.common.helper.ModelHelper.getODataModel();
	    
		// Set OData Model
		this.getView().setModel(oODataModel ,"ODataModel");*/
        
        
        this._oLabel = new sap.ui.commons.Label({text:"Select date range:", labelFor: this._oDateRangeSelection});
        this._oDateRangeSelection = new sap.m.DateRangeSelection({id:"idExecutedAmendments",from:"{path:'/fromidExecutedAmendments'}", 
    		to:"{path:'/toidExecutedAmendments'}", displayFormat:"{i18n>DateFormat}"});
        this._oButton = new sap.m.Button({type:"Accept",text:"{i18n>Go}"});
        this._oLayout = new sap.ui.commons.layout.MatrixLayout({id : "idMatrixLayout", layoutFixed : false});

	    //layout reference
		this._oRespFlowLayout = this.getView().byId("idRespFlowLayout");
		
		/*this._oButton = new sap.m.Button({type:"Accept",text:"{i18n>Go}"});
		this._oDateRangeSelection = new sap.m.DateRangeSelection({id:"idExecutedAmendments",from:"{path:'/fromidExecutedAmendments'}", 
    		to:"{path:'/toidExecutedAmendments'}"});
		this._oTextView  = new sap.ui.commons.TextView({text:"Select date range", textAlign: "Center"});
*/
        $(document).ready(function() {
        	
        	  $("[id$='idIconTabBar-content']").remove();
//            $("#__xmlview1--idIconTabBar-content").remove();
        });

    },

    handleIconTabBarSelect: function(oEvent) {
        this._oTable = this.getView().byId("idTable");
        var oBinding = this._oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;
       

        if (sKey === "Created") {
    
        	this._oRespFlowLayout.removeAllContent();
        	
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Created");
            oBinding.filter([oFilter]);
        } else if (sKey === "Released") {
       
        	this._oRespFlowLayout.removeAllContent();
        	
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Released");
            oBinding.filter([oFilter]);
        } else if (sKey === "Executed") {
       
        	this._oRespFlowLayout.removeAllContent();
        	
        	this._oLayout.createRow( this._oLabel, this._oDateRangeSelection, this._oButton );	
        	
        	this._oRespFlowLayout.addContent(this._oLayout);

            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Executed");
            oBinding.filter([oFilter]);
        } else {
        
        	this._oRespFlowLayout.removeAllContent();
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