sap.ui.jsview("dia.cmc.contractsinamendment.view.App", {

    getControllerName: function() {
        return "dia.cmc.contractsinamendment.view.App";
    },

    createContent: function(oController) {

        // to avoid scroll bars on desktop the root view must be set to block display
        this.setDisplayBlock(true);

        // create app
        this.app = new sap.m.App("theApp");

        // load the master page
        var master = sap.ui.xmlview("Master", "dia.cmc.contractsinamendment.view.Master");
        master.getController().nav = this.getController();
        this.app.addPage(master, true);

        // load the amendment process flow page
        var amendmentProcessFlow = sap.ui.xmlview("AmendmentFlow", "dia.cmc.contractsinamendment.view.AmendmentFlow");
        amendmentProcessFlow.getController().nav = this.getController();
        this.app.addPage(amendmentProcessFlow, false);

        // done
        return this.app;
    }
});