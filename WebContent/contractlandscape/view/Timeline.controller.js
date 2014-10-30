jQuery.sap.require("dia.cmc.common.util.Formatter");

sap.ui.controller("dia.cmc.contractlandscape.view.Timeline", {

	/***************************************************************************
	 * Start - Standard hook events
	 **************************************************************************/
	
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf view.detail.Partner
	 */
	onInit : function() {
		
		// Model Helper reference
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;

		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;

		this._setTimelinePeriodDefaultValue();
		
		// Attached event handler for route match event
		this.CommonController.getRouter(this).attachRouteMatched(this.handleRouteMatched, this);
		
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onBeforeRendering: function() {
	// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onAfterRendering: function() {
	// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources
	 * and finalize activities.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onExit: function() {
	// }

	
	/***************************************************************************
	 * End - Standard hook events
	 **************************************************************************/
	

	/** Event handler for Route Matched event 
	 * It will check for deal id and if available, reads the deal details
	 * @param oEvent
	 */
	handleRouteMatched : function(oEvent) {
		
		if (oEvent.getParameter("name") === "dealTimeline") {		// check route name

			_sDealId = oEvent.getParameter("arguments").dealId;

//			var oView = this.getView();
//			oView.setModel(this.ModelHelper.oODataModel);
//			
//			var sPath = "/DealCollection('" + sDealId + "')";
////			var sPath = "/DealCollection/0";
//			var oContext = new sap.ui.model.Context(oView.getModel(), sPath);
//			oView.setBindingContext(oContext);
			
			this._readTimeline();
		
			this.getView().setModel(this.ModelHelper.oDealDetailModel, "DealDetailModel");
			
		}
	},
	
	_setTimelinePeriodDefaultValue:function(){
		
		var oPeriodUI = this.CommonController.getUIElement("idTimelinePeriod",this.getView());

		dFromDate = new Date();
		dFromDate.setMonth(dFromDate.getMonth() - 3);
		
	    oPeriodUI.setDateValue(dFromDate);
	    oPeriodUI.setSecondDateValue(new Date());
	    
	},
	
	handleTimelineNavButtonPress : function(oEvent){
		this.CommonController.getRouter(this).myNavBack("main");
	},
	
	
	handleTimelineSearchPress : function(oEvent){
		
		this._readTimeline();
		
	},
	
	_readTimeline: function(){

		var sFilters = " Action eq 'RTL'";
		
		// Read and set Timeline period serach criteria
		var oPeriodUI = this.CommonController.getUIElement("idTimelinePeriod",this.getView());

	    var dFrom = oPeriodUI.getDateValue();
	    var dTo = oPeriodUI.getSecondDateValue();

	    if ( dFrom != null && dTo != null ){
	    	
	    	var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(dFrom);
			var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(dTo);

			sFilters += " and ( ChangedOn ge datetime'" +  sFromDate + "' and ChangedOn le datetime'" + sToDate + "') "; 
	    }

	    var oAmendCatUI = this.CommonController.getUIElement("idAmendCat",this.getView());

	    var oSelectedAmendCatArr = oAmendCatUI.getSelectedKeys();
	    
	    for ( var i=0; i< oSelectedAmendCatArr.length; i++ ){
	    
	    	if (i === 0){
	    		sFilters += " and ( AmendCat eq '" +  oSelectedAmendCatArr[i] + "'";	
	    	}else{
	    		sFilters += " or AmendCat eq '" +  oSelectedAmendCatArr[i] + "'";
	    	}
	    	
	    	if (i === (oSelectedAmendCatArr.length - 1)){
	    		sFilters += " ) ";
	    	}
	    }
	    
		var oTimelineModel = this.ModelHelper.readDealTimeline(_sDealId, sFilters);

		this.getView().setModel(oTimelineModel);
		
	}

});