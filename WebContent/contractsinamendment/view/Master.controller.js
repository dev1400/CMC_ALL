jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("dia.cmc.common.util.Formatter");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.DateRangeSelection");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.table.Table");
sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {
    	
        _oTable = this.getView().byId("idTable");        
        _oLayout = this.getView().byId("idMatrixLayout");
        _oLayout.setVisible(false); 
        
        // Model Helper reference
        this.ModelHelper = dia.cmc.common.helper.ModelHelper;
        // Common Controller reference
        this.CommonController = dia.cmc.common.helper.CommonController;       
      
    },
    handleAmendmentDateRangeChange : function(oEvent){    	
    	
    	this._sDateFrom = oEvent.getParameter("from");
    	this._sDateTo = oEvent.getParameter("to");
    	
    },
    handleAmendmentDateRangePress : function(oEvent){    	
    	
    	if(this._sDateFrom !== undefined | this._sDateTo !== undefined){
    		
    	var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateFrom);
    	var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateTo);
    	console.log(sFromDate+" "+sToDate);
    	var oBinding = _oTable.getBinding("items"),sFilter;
        _oTable.setVisible(true);         
     
        oBinding.filter([new sap.ui.model.Filter("StartDate", sap.ui.model.FilterOperator.GE, sFromDate), 
                         new sap.ui.model.Filter("EndDate", sap.ui.model.FilterOperator.LT, sToDate)]);
    	}
        else{
        	sap.m.MessageToast.show(this.ModelHelper.getText("EmptyDateRangeToast"));
        }
    },
    /**
     * Show amendment details based on icon tab bar selection.
     */
    handleAmendmentIconTabBarSelect: function(oEvent) {    	
    	
        var oBinding = _oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;
       
        if (sKey === "Created") {
        	
        	_oTable.setVisible(true);
        	_oLayout.setVisible(false);         	
           
            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "CRTD");
            oBinding.filter([oFilter]);
            
           
        } else if (sKey === "Released") {        	
           
        	_oLayout.setVisible(false);  
        	_oTable.setVisible(true);           	
            
            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "RELE");
            oBinding.filter([oFilter]);         
           
           
        } else if (sKey === "Executed") {  
        	
        	_oLayout.setVisible(true); 
        	_oTable.setVisible(false);
        	
        
        } else {
        	
        	_oLayout.setVisible(false); 
        	_oTable.setVisible(true);
        	
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
    handleAmendmentItemPress: function(oEvent) {
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
    handleAmendmentCancelPress: function(evt) {
        var fnClose = function(oResult) {
                if (oResult) {
                    /*
                     * console.log("isConfirmed:" + oResult.isConfirmed); if
                     * (oResult.sNote) { console.log(oResult.sNote); }
                     */
                }
            }
            /**
             * Opens the confirmation dialog
             */
        sap.ca.ui.dialog.confirmation.open({
            question: this.ModelHelper.getText(
                "AmendmentCancellationMessage"),
            title: this.ModelHelper.getText(
                "CancelAmendment"),
            confirmButtonLabel: this.ModelHelper.getText(
                "Ok")
        }, fnClose);
    },
    /**
     * Navigate to Amendment Flow.
     */
    handleAmendmentWorkFlowPress: function(oEvent) {
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
     * Display pop-up with amendment decription.
     */
    handleAmendmentPopoverPress: function(oEvent) {
        var oButton = oEvent.getSource();
        //added amendment description and amendmetId in popup
        this._oPopover = new sap.m.Popover({
            title: "{i18n>AmendmentDescription}",
            content: [new sap.m.VBox({
                    justifyContent: sap.m.FlexJustifyContent
                        .Center,
                    alignItems: sap.m.FlexAlignItems
                        .Center,
                    items: new sap.m.Text({
                        text: oEvent.getSource()
                            .getBindingContext()
                            .getObject().Description
                    })
                })]
                /*oEvent.getSource().getBindingContext().getObject().AmendmentId
		         * content : [new sap.m.Text({
				   text : oEvent.getSource().getBindingContext().getObject().Description})]*/
        });
        this.getView().addDependent(this._oPopover);
        this._oPopover.openBy(oButton);
    },
});