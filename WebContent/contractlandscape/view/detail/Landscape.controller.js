/** 
 * 
 */
sap.ui.controller("dia.cmc.contractlandscape.view.detail.Landscape", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.detail.Landscape
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.detail.Landscape
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.detail.Landscape
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.detail.Landscape
*/
//	onExit: function() {
//
//	}

	
	 /**********************************************************************************************************************************
	 * Start - Facet Filter related Code 
	 ***********************************************************************************************************************************/
	
	/** Event handler for Facet Filter List close event. 
	 * It is common for both Landscape and Partner Facet Filter
	 */
	  handleFacetFilterListClose: function(oEvent) {
		  
	    // Get the Facet Filter lists and construct a (nested) filter for the binding
	
	    var oFacetFilter = oEvent.getSource().getParent();    
	    var sId = oFacetFilter.getId();

	    var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
	        return oList.getSelectedItems().length;
	      });

	    if(mFacetFilterLists.length) {
	    	
	      // Build the nested filter with ORs between the values of each group and
	      // ANDs between each group    
	      var oFilter = new sap.ui.model.Filter(mFacetFilterLists.map(function(oList) {
	    	  
	        return new sap.ui.model.Filter(oList.getSelectedItems().map(function(oItem) {
	          return new sap.ui.model.Filter(oList.getKey(), "EQ", oItem.getText());
	        }), false);
	        
	      }), true);
	      
	      // Apply the Facet Filter on data
	      this._applyFacetFilter(sId,oFilter);
	      
	    } else {
	    	
	      this._applyFacetFilter(sId,[]);
	    }
	    
	  },

		/** Event handler for Facet Filter List Reset event. 
		 * It is common for both Landscape and Partner Facet Filter
		 */
	  handleFacetFilterReset: function(oEvent) {
		  
		// Get reference of Facet Filter and List. 
	    var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
	    var aFacetFilterLists = oFacetFilter.getLists();
	    
	    // Clear all selected filter values
	    for(var i=0; i < aFacetFilterLists.length; i++) {
	      aFacetFilterLists[i].setSelectedKeys();
	    }
	    
	    this._applyFacetFilter(oEvent.getParameter("id"),[]);
	  },

	  
	/**Method for applying the Facet Filter on data source. It is common for both Landscape and Partner Facet Filter
	 */
	_applyFacetFilter: function(sIdFacetFilter, oFilter) {
	    
		// Get the id of data source from Facet Filter Id
		 if(sIdFacetFilter.indexOf("Landscape") > 0)
		    sId = "idLandscapeTable";
	    else if(sIdFacetFilter.indexOf("Partner") > 0)
	    	sId = "idPartnerList";
	    else
	    	return;

			// Get the table and apply the filter
		var oTable = this.getView().byId(sId);
	    oTable.getBinding("items").filter(oFilter);
	  },
	  
  
	 /**********************************************************************************************************************************
	 * End - Facet Filter related Code 
	 ***********************************************************************************************************************************/
	  
	  
	 /**********************************************************************************************************************************
	 * Start - Other Code 
	 ***********************************************************************************************************************************/
	  
	  /** Event handler for System line item selection. It will navigate to System Detail page
	   */
	  handleSystemLineItemPress : function(oEvent){
		  
		  var oDetailView = sap.ui.getCore().byId("Detail");
		  
		  oDetailView.nav.to("SystemDetail",null);
//		  this.nav.to("SystemDetail",null);
	  },
		
	 /**********************************************************************************************************************************
	 * End - Other Code 
	 ***********************************************************************************************************************************/
	  
		  
});