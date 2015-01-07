jQuery.sap.require("dia.cmc.common.helper.CommonController");
sap.ui.controller("dia.cmc.contractsinamendment.view.AmendmentFlow", {
	

	onInit: function () {		
		// Common Controller reference
		this.CommonController = dia.cmc.common.helper.CommonController;
		this.ModelHelper = dia.cmc.common.helper.ModelHelper;
		
		var oDataProcessFlowNodes = {
		        nodes:
		           [           
	                {id: "1",  lane: "0",  title: "Deal Configuration", children:[2, 3, 4, 5, 6] , state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, stateText: "OK status", focused: true},
	                {id: "2",  lane: "0",  title: "Deal Approval", children: null, state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status", focused: true},
	                {id: "3",  lane: "0",  title: "Release for Execution", children: null, state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, stateText: "OK status", focused: true},
	                
		            {id: "4", lane: "1" , title: "Deal Acceptance", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "5", lane: "1" , title: "Price Update", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "6", lane: "1" , title: "Key Date determination", children: [7, 8, 9, 10]},
		            
		            {id: "7", lane: "2" , title: "Instrument Shipping", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null, stateText: "OK status"},
		            {id: "8", lane: "2" , title: "Installation Scheduled", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "9", lane: "2" , title: "Installation Done", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "10", lane: "2" , title: "De-Installation Done", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: [11, 12, 13, 14, 15]},
		            
		            {id: "11", lane: "3" , title: "Deal structure closure", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "12", lane: "3" , title: "Service Amendments", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "13", lane: "3" , title: "Rental Amendments", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "14", lane: "3" , title: "Capitalization Done", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "15", lane: "3" , title: "Revenue Recognition Done", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: [16, 17, 18]},
		            
		            {id: "16", lane: "4" , title: "Agreement Update in Agiloft", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "17", lane: "4" , title: "Legal closure", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		            {id: "18", lane: "4" , title: "Amendment closure", state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, children: null},
		           ],
		        lanes:
		        	[
		        	{id: "0", icon: "sap-icon://activity-items", label: this.ModelHelper.getText("Proposal"), position: 0},
		        	{id: "1", icon: "sap-icon://simulate", label: this.ModelHelper.getText("ExecutionPreparation"), position: 1},
		        	{id: "2", icon: "sap-icon://decision", label: this.ModelHelper.getText("ExecutionHandling"), position: 2},
		        	{id: "3", icon: "sap-icon://sys-last-page", label: this.ModelHelper.getText("ExecutionClosure"), position: 3},
		        	{id: "4", icon: "sap-icon://documents", label: this.ModelHelper.getText("Documentation"), position: 4},

			        ]
		      };

		        var oModel = new sap.ui.model.json.JSONModel();
		        var view = this.getView();
		        oModel.setData(oDataProcessFlowNodes);
		        view.setModel(oModel, "processFlow");
		        view.byId("idProcessFlow").updateModel();
		
	  },
	  
	  /**
	   * Go back to main page
	   */
	  handleNavButtonPress : function (evt) {
		this.CommonController.getRouter(this).myNavBack("main");
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