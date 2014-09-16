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

        var oComp = sap.ui.getCore().createComponent({
            name: 'dia.cmc.contractsinamendment.tableview'
        });
        oComp.setModel(this.getView().getModel());
        this._oTable = oComp.getTable();
        this.getView().byId("idIconTabBar").insertContent(this._oTable);

    },

    handleIconTabBarSelect: function(oEvent) {
       
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

    }

});