jQuery.sap.require("dia.cmc.common.util.Formatter");

sap.ui.controller("dia.cmc.contractlandscape.view.Timeline", {

	// Flag to indicate whether to navigate to deail screen or not when close button is clicked
	_bNavigate: false,
	
	// Deal Id for which timeline is displayed
	_sDealId: "",
	
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
	
		// Attached event handler for route match event
		this.CommonController.getRouter(this).attachRouteMatched(this.handleRouteMatched, this);
		
		this.getView().setModel(this.ModelHelper.oPropertyModel, "PropertyModel");
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
	 onAfterRendering: function() {
		 

	 },
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

			this._sDealId = oEvent.getParameter("arguments").dealId;

			this.getView().setModel(this.ModelHelper.oDealDetailModel, "DealDetailModel");

//			var oTimelineUI = this.CommonController.getUIElement("idTimeline", this.getView());
//			
//			oTimelineUI.invalidate();
//			
////			oTimelineUI.setVisible(false);
//			
//			// Hide Timeline control by default
//			this.ModelHelper.setProperty("TimelineVisi", false);
			
			// Flag to indicate whether to navigate to deail screen or not when close button is clicked
			this._bNavigate = true;
			
			// Open selection popup
			 this._openTimelineSelectionPopup();
			
		}
	},

//	_setTimelinePeriodDefaultValue:function(){
//		
//		var oPeriodUI = this.CommonController.getUIElement("idTimelinePeriod",this.getView());
//
//		dFromDate = new Date();
//		dFromDate.setMonth(dFromDate.getMonth() - 3);
//		
//	    oPeriodUI.setDateValue(dFromDate);
//	    oPeriodUI.setSecondDateValue(new Date());
//	    
//	},
	
	/***
	 * Event handler for navigation back button
	 */
	handleTimelineNavButtonPress : function(oEvent){
		// Navigate back to details screen
		this.CommonController.getRouter(this).myNavBack("main");
		
	},
	
	/**
	 * Event handler for timeline selection press event. It will open the Timeline selection screen
	 * @param oEvent
	 */
	handleTimelineSelectionPress : function(oEvent){
		
		this._bNavigate = false;
		
		// Open selection popup
		this._openTimelineSelectionPopup();
	},
	
	/**
	 * Open timeline selection popup 
	 */
	_openTimelineSelectionPopup:function(){
		// Destroy popup if its already there
		if (this._timelineSelection) {
			this._timelineSelection.destroy(true);
		}
		
		this._timelineSelection = new sap.ui.xmlfragment(
				"dia.cmc.contractlandscape.fragment.TimelineSelection", this);

		this.getView().addDependent(this._timelineSelection);

		this._timelineSelection.open();
	},
	
	/**
	 * Event handler for Search button. It will search for timeline data and displays in timeline control
	 * @param oEvent
	 */
	handleTimelineSearchPress : function(oEvent){
		
		var sFilters = this._buildFilterString();
		
		var oRequestFinishedDeferred = this.ModelHelper.readDealTimeline(this._sDealId, sFilters);

		jQuery.when(oRequestFinishedDeferred).then(jQuery.proxy(function(oTimelineModel) {
		
			if(oTimelineModel.getData().AmendmentCollection.length > 0){	// Some Amendments found
				this.getView().setModel(oTimelineModel);
				this._timelineSelection.close();	// Close Timeline selection window
				
				//Show Timeline
				this.ModelHelper.setProperty("TimelineVisi", true);
				
			}else{
				sap.m.MessageToast.show("No data found");	
			}
			
		}, this));

	},
	
	/**
	 * It builds filter string base on selection screen parameters
	 * @returns {String}
	 */
	_buildFilterString: function(){

		var sFilters = " Action eq 'RTL'";
		
		// Read and set Timeline period serach criteria
		var oPeriodUI = this.CommonController.getUIElement("idTimelinePeriod");

	    var dFrom = oPeriodUI.getDateValue();
	    var dTo = oPeriodUI.getSecondDateValue();

	    if ( dFrom != null && dTo != null ){
	    	
	    	var sFromDate = dia.cmc.common.util.Formatter.convertToEDMDate(dFrom);
			var sToDate = dia.cmc.common.util.Formatter.convertToEDMDate(dTo);

			sFilters += " and ( ChangedOn ge datetime'" +  sFromDate + "' and ChangedOn le datetime'" + sToDate + "') "; 
	    }

	    var oAmendCatUI = this.CommonController.getUIElement("idAmendCat");

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

		var oPartnerUI = this.CommonController.getUIElement("idTLPartner");
	    var sPartnerNumber = oPartnerUI.getSelectedKey();

	    if ( sPartnerNumber != null || sPartnerNumber !== "" ){
			sFilters += " and ( PartnerNumber eq '" + sPartnerNumber + "') "; 
	    }

		var oProductUI = this.CommonController.getUIElement("idTLProduct");
	    var sProductNumber = oProductUI.getValue();

	    if ( sProductNumber != null || sProductNumber !== "" ){
			sFilters += " and ( Material eq '" + sProductNumber + "') "; 
	    }
	    
		var oPriceDetailItemsUI = this.CommonController.getUIElement("idTLPriceDetailItems");
	    var bPriceDetailItems = oPriceDetailItemsUI.getSelected();

		sFilters += " and ( SubItem eq '" + bPriceDetailItems + "') "; 

	    return sFilters;
	    
	},

	/**
	 * Close Timeline selection window
	 */
	handlePopupClose: function(oEvent){
		this.CommonController.closePopupWindow(oEvent);
		
		//Navigate back to details screen
		if(this._bNavigate){
			this.CommonController.getRouter(this).myNavBack("main");	
		}
		
		
	},
	
	
	handleAmendCatChange: function(oEvent){
//		var oSelectedItem = oEvent.getParameter("selectedItem");
//		var bSelected = oEvent.getParameter("selected");
//		
//		var oAmendCatUI = this.CommonController.getUIElement("idAmendCat",this.getView());
//
//		
//		if(oSelectedItem.getKey() === "AL"){
//			
//			if(bSelected === false){
//				oAmendCatUI.setSelectedKeys(["AL"]);
//			}
//			
//		}
	},
	
	/**
	 * Event handler for Price detail button. It will display the popover with price details
	 * @param oEvent
	 */
	handlePriceDetailsPress: function(oEvent){
		
//		var oPriceDetailListUI1 = this.CommonController.getUIElement("idPriceDetailList1",this.getView());
//		
//		oPriceDetailListUI1.setVisible(true);
		
		
		var oButton = oEvent.getSource();
		
		if (!this._oPriceTimeline) {
			this._oPriceTimeline = new sap.ui.xmlfragment(
					"dia.cmc.contractlandscape.fragment.PriceTimeline",
					this
			);

			this.getView().addDependent(this._oPriceTimeline);

		}

		var oSelectedContext = oEvent.getSource().getBindingContext();
		
        var oAmendDetail = this.getView().getModel().getProperty(oSelectedContext.getPath());

        if(oAmendDetail.AmendCat === 'PR'){
			this.ModelHelper.setProperty("TimelineDetailTitle",this.ModelHelper.getText("PriceChanges"));
		}
        else if(oAmendDetail.AmendCat === 'CM'){
        	this.ModelHelper.setProperty("TimelineDetailTitle",this.ModelHelper.getText("CommitmentChanges"));
        }
		
		this._oPriceTimeline.bindElement(oSelectedContext.getPath());
		
		var sPath = oSelectedContext.getPath() + "/PriceDetailCollection";
		
		var oPriceDetailListUI = this.CommonController.getUIElement("idPriceDetailList");

		
		// create layout for custom list 
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
		         layoutFixed : false
		        });

		var oIconUI = new sap.ui.core.Icon({src:"sap-icon://accept"});

		var oTitleUI = new sap.m.Text({text:"{RequestDesc}"});

		oLayout.createRow( oIconUI, oTitleUI );  

		var oDescUI = new sap.m.Label({text:"{DetailDesc}"});

		oLayout.createRow( null, oDescUI );  
		
	
		  var oItemTemplate = new sap.m.CustomListItem({  
			  content: oLayout

          });  
		  
//		  var oItemTemplate = new sap.m.StandardListItem({  
//              title : "{RequestDesc}",  
//              icon: "sap-icon://accept",  
//              description: "{SubDesc}",
//          });  
		  
//		oPriceDetailListUI.bindAggregation("items", oPath, oItemTemplate);
		oPriceDetailListUI.bindItems(sPath, oItemTemplate, null,null);

		this._oPriceTimeline.openBy(oButton);

	}
});