sap.ui.controller("dia.cmc.contractlandscape.view.ProductSearchHelp", {

	metadata: {

	    events: {
	      productSelected : {},  //new event definition for product selection
	      
	      cancelSelected : {},  //new event definition for cancel action
	    }

	  },

	  
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf contractlandscape.view.ProductSearchHelp
*/
	onInit: function() {
		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf contractlandscape.view.ProductSearchHelp
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf contractlandscape.view.ProductSearchHelp
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf contractlandscape.view.ProductSearchHelp
*/
//	onExit: function() {
//
//	}

	
	 /**
     * Close material selection dialog
     */
    handleProductSelectDialogClosePress: function(oEvent) {
        //this._productSelectDialog.close();
        
        oProductSelectDialog = this.CommonController.getUIElement("idProductSelectDialog", this.getView());
        
        oProductSelectDialog.close();
        
//    	this.fireCancelSelected();
    	
    	this.fireEvent("cancelSelected");
    	
    },
    
    /**
     * Search materials with in Table.
     */
    handleMaterialSearchButtonPress: function(oEvent){
    	var oMaterialNumberInput = this.getView().byId("idMaterialNumber");
    	var oMaterialDescriptionInput = this.getView().byId("idMaterialDescription");
    		
    	var oTable = this.getView().byId("idProductSearchTable");
    	var oBinding = oTable.getBinding("items");
    		
//    	oBinding.filter([new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, "4950"),
//    	                 new sap.ui.model.Filter("MaterialNo", sap.ui.model.FilterOperator.EQ, oMaterialNumberInput.getValue()), 
//    			 new sap.ui.model.Filter("MaterialDesc", sap.ui.model.FilterOperator.EQ, oMaterialNumberInput.getValue()) ]);
    	
    	oBinding.filter([new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, "4950"),
    	                 new sap.ui.model.Filter("MaterialNo", sap.ui.model.FilterOperator.EQ, oMaterialNumberInput.getValue()), 
    	                 ]);
    	
    },
    
    /**
     * Select material with in Table.
     */
    handleTableRowSelect: function(oEvent) {
    	
    	var oContext = oEvent.getParameter("listItem").getBindingContext("ODataModel");	
    	
    	var oODataModel = this.getView().getModel("ODataModel");
    	var oSelectedProduct = oODataModel.getProperty(oContext.getPath());
    	
//    	this.fireProductSelected({"SelectedProduct" : oSelectedProduct});
    	
    	this.fireEvent("productSelected", {"SelectedProduct" : oSelectedProduct});
    }
    
    
});