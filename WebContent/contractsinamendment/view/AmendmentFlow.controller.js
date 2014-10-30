jQuery.sap.require("dia.cmc.common.helper.CommonController");
sap.ui.controller("dia.cmc.contractsinamendment.view.AmendmentFlow", {
	

	onInit: function () {		
		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;
		
	    var oProcessFlowLanes = {
	        lanes:
	          [
	          {id: "0", icon: "sap-icon://order-status", label: this.ModelHelper.getText("Proposal"), position: 0},
	          {id: "1", icon: "sap-icon://monitor-payments", label: this.ModelHelper.getText("ExecutionPreparation"), position: 1},
	          {id: "2", icon: "sap-icon://payment-approval", label: this.ModelHelper.getText("ExecutionHandling"), position: 2},
	          {id: "3", icon: "sap-icon://money-bills", label: this.ModelHelper.getText("ExecutionClosure"), position: 3},
	          {id: "4", icon: "sap-icon://payment-approval", label: this.ModelHelper.getText("DocumentationAndCleanUp"), position: 4},


	          ]
	    };

	    var oModel = new sap.ui.model.json.JSONModel();
	    var view = this.getView();
	    oModel.setData(oProcessFlowLanes);
	    view.setModel(oModel, "processFlow");

	    view.byId("idProcessFlow").updateModel();
	  },
	  
	  /**
	   * Go back to main page
	   */
	  handleNavButtonPress : function (evt) {
		this.CommonController.getRouter(this).myNavBack("main");
	  },

	  onHeaderPress: function( event ) {
		  console.log("onHeaderPress");
	    var oDataProcessFlowNodes = {
	        nodes:
	           [           
                {id: "1",  lane: "0",  title: "Release for Execution", children: [12, 13, 14], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status", focused: true, texts: ["Sales Order Document Overdue long text for the wrap up all the aspects", "Not cleared"]},
                
	            {id: "12", lane: "1" , title: "Deal Acceptance", children: null},
	            {id: "13", lane: "1" , title: "Price Update", children: null},
	            {id: "14", lane: "1" , title: "Key Date determination", children: [15, 16, 17, 18]},
	            
	            {id: "15", lane: "2" , title: "Instrument Shipping",  children: null, stateText: "OK status"},
	            {id: "16", lane: "2" , title: "Installation Scheduled", children: null},
	            {id: "17", lane: "2" , title: "Installation Done", children: null},
	            {id: "18", lane: "2" , title: "De-Installation Done", children: [19, 20, 21, 22, 23]},
	            
	            {id: "19", lane: "3" , title: "Deal structure closure", children: null},
	            {id: "20", lane: "3" , title: "Service Amendments", children: null},
	            {id: "21", lane: "3" , title: "Rental Amendments", children: null},
	            {id: "22", lane: "3" , title: "Capitalization Done", children: null},
	            {id: "23", lane: "3" , title: "Revenue Recognition Done", children: [24, 25, 26]},
	            
	            {id: "24", lane: "4" , title: "Agreement Update in Agiloft", children: null},
	            {id: "25", lane: "4" , title: "Legal closure", children: null},
	            {id: "26", lane: "4" , title: "Amendment closure", children: null},
	           ],
	        lanes:
	        	[
		          {id: "0", icon: "sap-icon://order-status", label: this.ModelHelper.getText("Proposal"), position: 0},
		          {id: "1", icon: "sap-icon://monitor-payments", label: this.ModelHelper.getText("ExecutionPreparation"), position: 1},
		          {id: "2", icon: "sap-icon://payment-approval", label: this.ModelHelper.getText("ExecutionHandling"), position: 2},
		          {id: "3", icon: "sap-icon://money-bills", label: this.ModelHelper.getText("ExecutionClosure"), position: 3},
		          {id: "4", icon: "sap-icon://payment-approval", label: this.ModelHelper.getText("DocumentationAndCleanUp"), position: 4},
		        ]
	      };

	        var oModel = new sap.ui.model.json.JSONModel();
	        var view = this.getView();
	        oModel.setData(oDataProcessFlowNodes);
	        view.setModel(oModel, "processFlow");
	        view.byId("idProcessFlow").updateModel();
	  },

	  onNodePress: function(event) {
		  console.log("onNodePress");
	    var textToDisplay = "Node ";
	    textToDisplay += event.getParameters().getNodeId();
	    textToDisplay += " was clicked";
	    sap.m.MessageToast.show(textToDisplay);
	  },

	  onNodeTitlePress: function(event) {
		  console.log("onNodeTitlePress");
	    var textToDisplay = 'Node title "';
	    textToDisplay += event.getParameters().getTitle();
	    textToDisplay += '" was clicked';
	    sap.m.MessageToast.show(textToDisplay);
	  },

	  onZoomIn: function () {
	      this.getView().byId("processflow1").zoomIn();
	      this.getView().byId("processflow1").getZoomLevel();

	      sap.m.MessageToast.show("Zoom level changed to: " + this.getView().byId("processflow1").getZoomLevel());
	  },

	  onZoomOut: function () {
	      this.getView().byId("processflow1").zoomOut();
	      this.getView().byId("processflow1").getZoomLevel();

	      sap.m.MessageToast.show("Zoom level changed to: " + this.getView().byId("processflow1").getZoomLevel());
	  },

	 
	


});