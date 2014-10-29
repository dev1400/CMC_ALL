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
              {id: "0", lane: "0" , title: "Deal Configuration", children: null, state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
              {id: "1", lane: "1" , title: "Deal Approval", children: null, state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
 	         

	         /* {id: "1",  lane: "0",  title: "Deal Configuration", children: [2], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status", focused: true, texts: ["Sales Order Document Overdue long text for the wrap up all the aspects", "Not cleared"]},
	          {id: "2",  lane: "1",  title: "Deal Approval", children: null, state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status", focused: true, texts: ["Sales Order Document Overdue long text for the wrap up all the aspects", "Not cleared"]},
	          */
	         /* {id: "10", lane: "1" , title: "Outbound Delivery 40", children: [20, 21], state: sap.suite.ui.commons.ProcessFlowNodeState.Negative, stateText: "NOT OK", texts: ["text 1", "text 2"]},
	          {id: "11", lane: "1" , title: "Outbound Delivery 43", children: [20], texts: ["text 1", "text 2"]},
	          {id: "12", lane: "1" , title: "Outbound Delivery 45", children: [20]},
	         */ /*{id: "20",  lane: "2" , title: "Invoice 9",  children: null [31, 51], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
	         */ /* {id: "31",  lane: "3" , title: "Accounting Document 7",  children: [41], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
	          {id: "41",  lane: "4" , title: "Payment Document 75",  children: [51], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
	          {id: "51",  lane: "5" , title: "Acceptance Letter 14",  children: [61], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
	          {id: "61",  lane: "6" , title: "Credit Voucher 67",  children: [71], state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status"},
	          {id: "71",  lane: "7" , title: "Credit Return 77",  children: null, state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, stateText: "Planned status text"}
	      */  ],
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