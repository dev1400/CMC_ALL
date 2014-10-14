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
    	
        this._oTable = this.getView().byId("idTable");        
        this._oLayout = this.getView().byId("idMatrixLayout");
        this._oLayout.setVisible(false); 
        this._oAmend = { DealId : "", AmendmentId : "", RequestDescr : "", Action : "C" };
        
        // Model Helper reference
        this.ModelHelper = dia.cmc.common.helper.ModelHelper;
        // Common Controller reference
        this.CommonController = dia.cmc.common.helper.CommonController;       
      
    },
    /**
     * Get From and To date when date range is selected.
     */
    handleAmendmentDateRangeChange : function(oEvent){    	
    	
    	this._sDateFrom = oEvent.getParameter("from");
    	this._sDateTo = oEvent.getParameter("to");
    	
    },
    /**
     * Show amendments based on selected date range.
     */
    handleAmendmentDateRangePress : function(oEvent){    	
    	
    	if(this._sDateFrom !== undefined | this._sDateTo !== undefined){
    		
    	var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateFrom);
    	var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateTo);
    	
    	var oBinding = this._oTable.getBinding("items");
        this._oTable.setVisible(true);
        var ofilters =[];
        ofilters = new sap.ui.model.Filter(
				[new sap.ui.model.Filter("StartDate", sap.ui.model.FilterOperator.GE, sFromDate),
				 new sap.ui.model.Filter("StartDate", sap.ui.model.FilterOperator.LE, sToDate)], true);
        
        oBinding.filter(ofilters);
    	}
        else{
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
    handleAmendmentCancelPress: function(oEvent) {
    
    	this._oAmend.DealId =  oEvent.getSource().getBindingContext().getObject().DealId;
    	this._oAmend.AmendmentId = oEvent.getSource().getBindingContext().getObject().AmendmentId;
    	var oParentContext = this;
        var fnClose = function(oResult) {
                if (oResult) {                    
                     
                     if(oResult.sNote) { 
                    	 oParentContext._oAmend.RequestDescr = oResult.sNote;
                    	 oParentContext.ModelHelper.updateAmendment(oParentContext._oAmend);
                    	 }
                }
            }
            /**
             * Opens the confirmation dialog
             */
        sap.ca.ui.dialog.confirmation.open({
            question: this.ModelHelper.getText(
                "AmendmentCancellationMessage"),
            noteMandatory : true,
            title: this.ModelHelper.getText(
                "CancelAmendment"),
            confirmButtonLabel: this.ModelHelper.getText(
                "Ok")
        }, fnClose);
    },
    /**
     * Navigate to Amendment Flow.
     */
   /* handleAmendmentWorkFlowPress: function(oEvent) {
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
    },*/
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
                
        });
        this.getView().addDependent(this._oPopover);
        this._oPopover.openBy(oButton);
    },
    /**
     * Navigate to WorkFlow overview page. 
     */
    handleWorkflowOverviewLinkPress: function (oEvent) {
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
     * Show options when Further Actions button is pressed.
     */
    handleFurtherActionsButtonPress : function(oEvent) {
  		// Get reference of Amendment button
  		var oFurtherActionsButton = oEvent.getSource();

  		// create action sheet only once
  		if (!this._actionSheet) {
  			this._actionSheet = sap.ui.xmlfragment(
  					"dia.cmc.contractsinamendment.fragment.FurtherActionsActionSheet", this);
  			this.getView().addDependent(this._actionSheet);
  		}

  		this._actionSheet.openBy(oFurtherActionsButton);
  	},
});