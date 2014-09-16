sap.ui.controller("dia.cmc.contractsinamendment.tableview.AmendmentDetail", {

	onInit: function () {
		// using explored app's demo model on this sample
	   var oModel = new sap.ui.model.json.JSONModel("contractsinamendment/model/products.json");
	   this.getView().setModel(oModel);
	   
	   var bus = sap.ui.getCore().getEventBus();
       bus.subscribe("nav", "to", sap.ui.controller("dia.cmc.contractsinamendment.view.App").navToHandler, this);
       bus.subscribe("nav", "back", sap.ui.controller("dia.cmc.contractsinamendment.view.App").navBackHandler, this);
		
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