jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.helper.CommonController");
sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {
    
    	// Model Helper reference
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;		

		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;
		
        // set i18n model
        var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl: "contractsinamendment/i18n/messageBundle.properties"
        });
        this.getView().setModel(i18nModel, "i18n");

        // set explored app's demo model on this sample
        var oModel = new sap.ui.model.json.JSONModel("contractsinamendment/model/products.json");
        this.getView().setModel(oModel);

      /*  var oComp = sap.ui.getCore().createComponent({
            name: 'dia.cmc.contractsinamendment.tableview'
        });
        oComp.setModel(this.getView().getModel());
        this._oTable = oComp.getTable();
        this.getView().byId("idIconTabBar").insertContent(this._oTable);*/
        
        var bus = sap.ui.getCore().getEventBus();
        bus.subscribe("nav", "to", sap.ui.controller("dia.cmc.contractsinamendment.view.App").navToHandler, this);
        bus.subscribe("nav", "back", sap.ui.controller("dia.cmc.contractsinamendment.view.App").navBackHandler, this);
 	

    },

    handleIconTabBarSelect: function(oEvent) {
    	this._oTable = this.getView().byId("idTable");
        var oBinding = this._oTable.getBinding("items"),
            sKey = oEvent.getParameter("selectedKey"),
            oFilter;

        if (sKey === "Created") {
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Created");
            oBinding.filter([oFilter]);
        } else if (sKey === "Released") {
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Released");
            oBinding.filter([oFilter]);
        } else if (sKey === "Executed") {
            oFilter = new sap.ui.model.Filter("AmendmentStatus", "EQ", "Executed");
            oBinding.filter([oFilter]);
        } else {
            oBinding.filter([]);
        }

    },
    handleLineItemPress: function(evt) {
        console.log("This will navigate to details page");

    },
    /**
	 * Navigate back to main page.
	 */
	navBackHandler : function() {
	   this.app.back();
    },
	
    /**
     * Navigate to Amendment Flow.
     */
    handleWorkFlowPress : function(oEvent) {	
    	
    	var oContext = oEvent.getSource().getBindingContext();
		this._displayDealDetail(oContext);	 
	},
	/**
	 * Display pop-up.
	 */
	handlePopoverPress : function(oEvent) {
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
	_displayDealDetail: function(oContext){

////		// To reduce the initial application load, load google map library when user select any contract from least instead of loading at start of application
//		sap.ui.getCore().loadLibrary("openui5.googlemaps", "lib/openui5/googlemaps/"); 

//		// Read selected deal details
//		var oDealDetailModel = this.ModelHelper.readDealDetail(oContext.getPath());
//
//		// If Deal detail is successfully fetched and context is build navigate to Detail view
//		if(oDealDetailModel != null && oDealDetailModel != undefined)
//			this.nav.to("Detail", oDealDetailModel);
		
		// set selected Deal path to helper class
		this.ModelHelper.sSelectedDealPathIndex = oContext.getPath();
		
		// If we're on a phone, include nav in history; if not, don't.
		var bReplace = jQuery.device.is.phone ? false : true;
		
		var oDealDetail = this.getView().getModel().getProperty(oContext.getPath());
		
		this.CommonController.getRouter(this).navTo("AmendmentFlow", {
			from: "master",
			dealId: oDealDetail.DealId,
		}, bReplace);
		
		
	},
    

});