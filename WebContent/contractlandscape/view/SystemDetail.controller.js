jQuery.sap.require("dia.cmc.common.helper.CommonController");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
sap.ui.controller("dia.cmc.contractlandscape.view.SystemDetail", {


    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf view.SystemDetail
     */
    onInit: function() {
    	
        // Model Helper reference
        this.ModelHelper = dia.cmc.common.helper.ModelHelper;

        // Common Controller reference
        this.CommonController = dia.cmc.common.helper.CommonController;
        
        this.CommonController.getRouter(this).attachRouteMatched(this.handleSystemDetailRouteMatched, this);

       
    },
    
   
    handleSystemDetailRouteMatched: function(oEvent) {
        if (oEvent.getParameter("name") === "systemDetail") { // check route name
        	
			this._sDealId = oEvent.getParameter("arguments").dealId;
			this._sSystemModuleSerial = oEvent.getParameter("arguments").systemModuleSerial;
			this._sSystemModule = oEvent.getParameter("arguments").systemModule;
			
			
			var oRequestFinishedDeferred = this.ModelHelper.readSystemDetailCollection(this._sDealId, this._sSystemModuleSerial , this._sSystemModule);

			jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oSystemDetailModel) {
				
				this.getView().setModel(oSystemDetailModel,"SystemDetailModel");			
				
			}, this));	
        	
        }
    },
    
    /**
     * On back button press
     */
    handleSystemDetailNavButtonPress: function(oEvent) {
    	
    	this.CommonController.getRouter(this).myNavBack("main");
    }

   
});