jQuery.sap.declare("dia.cmc.processflow.Component");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.util.MyRouter");
sap.ui.core.UIComponent.extend("dia.cmc.processflow.Component", {
    metadata: {
        name: "CMC Contracts in Amendment Process Flow",
        version: "1.0",
        includes: [],
        dependencies: {
            libs: ["sap.m", "sap.ui.layout"],
            components: []
        },
        rootView: "dia.cmc.processflow.view.Root",
        routing: {
            config: {
                routerClass: dia.cmc.common.util.MyRouter,
                viewType: "XML",
                viewPath: "dia.cmc",
                targetAggregation: "pages",
                targetControl: "idAppControl",
                clearTarget: false
            },
            routes: [{
                pattern: "",
                name: "main",
                view: "processflow.view.ProcessFlow",
                targetAggregation: "pages",
            }]
        }
    },
    init: function() {
        sap.ui.core.UIComponent.prototype.init.apply(this,
            arguments);
        // Get ODataModel instance
        var oODataModel = dia.cmc.common.helper.ModelHelper.getODataModel();
        // Set OData Model
        this.setModel(oODataModel);
        // Get i18n model 
        var i18nModel = dia.cmc.common.helper.ModelHelper.getI18nModel("processflow/i18n/messageBundle.properties");
        // set i18n model
        this.setModel(i18nModel, "i18n");
        // set device model
        var oDeviceModel = new sap.ui.model.json.JSONModel({
            isTouch: sap.ui.Device.support.touch,
            isNoTouch: !sap.ui.Device.support.touch,
            isPhone: sap.ui.Device.system.phone,
            isNoPhone: !sap.ui.Device.system.phone,
            listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
            listItemType: (sap.ui.Device.system.phone) ?
                "Active" : "Inactive"
        });
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");
        // Property Model
        var oPropertyModel = dia.cmc.common.helper.ModelHelper.initalizePropertyModel();
        this.setModel(oPropertyModel, "Property");
        this.getRouter().initialize();
    }
});