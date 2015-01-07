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
    	/*console.dir(oEvent.getSource().getBindingContext().getObject());*/

        if (oEvent.getParameter("name") === "systemDetail") { // check route name
        	
        	/*console.log(oEvent.getParameter("arguments")+" "+ this.getView().getModel());*/
        	
        	var listView = this.getView().byId("idSystemDetailList");
        	
        
	/*		var oSystemModuleSerialLabel = new sap.m.Label({text:oEvent.getParameter("arguments").systemModuleSerial});
			var oSystemModuleSerialLink = new sap.m.Link({text:oEvent.getParameter("arguments").systemModuleSerial});
        	console.dir(oEvent.getParameter("arguments"));
        	  var oModel = new sap.ui.model.json.JSONModel();        // created a JSON model      
        	     oModel.setData({modelData: {dealId:oEvent.getParameter("arguments").dealId, 
        	    	 systemModuleDescription:oEvent.getParameter("arguments").systemModuleDescription, 
        	    	 systemModuleSerial:oEvent.getParameter("arguments").systemModuleSerial, 
        	    	 systemName:oEvent.getParameter("arguments").systemName, 
        	    	 systemSiteName:oEvent.getParameter("arguments").systemSiteName}}); 
        	     
        	  listView.setModel(oModel);
        	 
        	  var oItemTemplate = new sap.m.CustomListItem({  
      			  content: [oSystemModuleSerialLabel, oSystemModuleSerialLink]
                });
        	   
        	  listView.bindContent("/modelData", oItemTemplate);*/
        	
        }
    },
    _readAndBindDealDetails: function() {

        var oRequestFinishedDeferred = this.ModelHelper.readDealDetail(this._sDealId);

        jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oDealDetailModel) {

            this.getView().setModel(oDealDetailModel, "SystemDetailModel");
        }, this));
    },

    /**
     * On back button press
     */
    handleSystemDetailNavButtonPress: function(oEvent) {
    	
    	this.CommonController.getRouter(this).myNavBack("main");
    }

   
});