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
       /* this._oLabel = new sap.ui.commons.Label({
            text: "Select date range:",
            labelFor: this._oDateRangeSelection
        });
        this._oDateRangeSelection = new sap.m.DateRangeSelection({
            id: "idExecutedAmendments",
            from: "{path:'/fromidExecutedAmendments'}",
            to: "{path:'/toidExecutedAmendments'}",
            displayFormat: "{i18n>DateFormat}",
            change: function(oEvent) {
                _sFrom = oEvent.getParameter("from");
                _sTo = oEvent.getParameter("to");
            }
        });
        this._oButton = new sap.m.Button({
            type: "Accept",
            text: "{i18n>Go}",
            press: function() {
                 console.log("\nFrom: " + dia.cmc.common.util.Formatter.date(_sFrom) );
            	 console.log("\nTo: " + dia.cmc.common.util.Formatter.date(_sTo) );
            	 
            	 console.log("\nFrom: " + _sFrom.toJSON().slice(0,10) + "T00:00:00");
            	 console.log("\nTo: " + _sTo.toJSON().slice(0,10) + "T00:00:00" );
            	  
            	 var i=_sTo.toJSON().slice(0,10) + "T00:00:00";
            	 
                  var oBinding = _oTable.getBinding("items"),oFilter;
                  _oTable.setVisible(true); 
                  oFilter = new sap.ui.model.Filter("StartDate", sap.ui.model
                          .FilterOperator.EQ, _sFrom.toJSON().slice(0,10) + "T00:00:00");
                  oBinding.filter([oFilter]);
                  
        		
            }
        });*/
       
        $(document).ready(function() {
            $("[id$='idIconTabBar-content']").remove();
        });
    },
    handleAmendmentDateRangeChange : function(oEvent){
    	
    	
    	this._sDateFrom = oEvent.getParameter("from");
    	this._sDateTo = oEvent.getParameter("to");
    	
    },
    handleAmendmentDateRangePress : function(oEvent){    	
    	
    	var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateFrom);
    	var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(this._sDateTo);
    	
    	var oBinding = _oTable.getBinding("items"),sFilter;
        _oTable.setVisible(true); 
        sFilter = new sap.ui.model.Filter("StartDate", sap.ui.model.FilterOperator.EQ, sFromDate);
        oBinding.filter([sFilter]);
    },
    /**
     * Show amendment details based on icon tab bar selection.
     */
    handleAmendmentIconTabBarSelect: function(oEvent) {
//    	 this._oTable = this.getView().byId("idTable");
        var oBinding = _oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;
       
        if (sKey === "Created") {
        	_oTable.setVisible(true);
        	_oLayout.setVisible(false); 
        	
           
            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "CRTD");
            oBinding.filter([oFilter]);
            
            $(document).ready(function() {
                $("[id$='idIconTabBar-content']").remove();
            });
        } else if (sKey === "Released") {
        	_oLayout.setVisible(false);  
        	_oTable.setVisible(true);     
        	
            
            oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "RELE");
            oBinding.filter([oFilter]);
            
            $(document).ready(function() {
                $("[id$='idIconTabBar-content']").remove();
            });
           
        } else if (sKey === "Executed") {
        	_oLayout.setVisible(true); 
        	_oTable.setVisible(false);
        	
        	 
        	
          /*  this._oLayout.removeAllRows();
            var oLabelColumn1 = new sap.ui.commons.layout.MatrixLayoutCell();
            oLabelColumn1.setColSpan(1);
            oLabelColumn1.setRowSpan(1);
            oLabelColumn1.setVAlign(sap.ui.commons.layout.VAlign.Middle);
            oLabelColumn1.setHAlign(sap.ui.commons.layout.HAlign.Right);
            oLabelColumn1.addContent(this._oLabel);
            var oDateRangeSelectionColumn2 = new sap.ui.commons.layout
                .MatrixLayoutCell();
            oDateRangeSelectionColumn2.setColSpan(1);
            oDateRangeSelectionColumn2.setRowSpan(1);
            oDateRangeSelectionColumn2.setVAlign(sap.ui.commons.layout
                .VAlign.Middle);
            oDateRangeSelectionColumn2.setHAlign(sap.ui.commons.layout
                .HAlign.Center);
            oDateRangeSelectionColumn2.addContent(this._oDateRangeSelection);
            var oButtonColumn3 = new sap.ui.commons.layout.MatrixLayoutCell();
            oButtonColumn3.setColSpan(1);
            oButtonColumn3.setRowSpan(1);
            oButtonColumn3.setVAlign(sap.ui.commons.layout.VAlign.Middle);
            oButtonColumn3.setHAlign(sap.ui.commons.layout.HAlign.Left);
            oButtonColumn3.addContent(this._oButton);
            this._oLayout.createRow(oLabelColumn1,
                oDateRangeSelectionColumn2, oButtonColumn3);*/
            /*oFilter = new sap.ui.model.Filter("Status", sap.ui.model
                .FilterOperator.EQ, "EXEC");
            oBinding.filter([oFilter]);*/
            
          
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