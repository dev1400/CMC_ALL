sap.ui.controller("dia.cmc.contractsinamendment.view.Master", {
    onInit: function() {

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
    handleWorkFlowPress : function(evt) {	
	   var bindingContext = evt.oSource.getBindingContext();
	   var bus = sap.ui.getCore().getEventBus();
	   bus.publish("nav", "to", { 
	       id : "AmendmentFlow",
	       data : {
	                context : bindingContext
	       }
	    });				
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
		}
    

});