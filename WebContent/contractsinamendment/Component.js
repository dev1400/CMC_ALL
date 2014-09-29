
jQuery.sap.declare("dia.cmc.contractsinamendment.Component");
jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.util.MyRouter");

sap.ui.core.UIComponent.extend("dia.cmc.contractsinamendment.Component", {


	metadata : {
        name : "CMC Contract Landscape",
        version : "1.0",
        includes : [],
        dependencies : {
            libs : ["sap.m", "sap.ui.layout"],
            components : []
        },
        
 	rootView : "dia.cmc.contractsinamendment.view.Root",

    routing: {
            config : {
                routerClass : dia.cmc.common.util.MyRouter,
                viewType : "XML",
                viewPath : "dia.cmc",               
                targetAggregation: "pages",
                targetControl : "idAppControl",
                clearTarget : false
            },
            
           
            routes : [
                {
                    pattern : "",
                    name : "main",
                    view : "contractsinamendment.view.Master",
                    targetAggregation : "pages",
                    
                },
                {
                    pattern : "Deal({dealId})",
                    name : "dealDetail",
                    view : "contractlandscape.view.Detail",
                    transition : "show",                    
                },
	                {
	                pattern : "Workflow",
	                name : "AmendmentFlow",
	                view : "contractsinamendment.view.AmendmentFlow",
	                transition : "show",
	             
                }
            ]
        }
    },
    
    

	init : function() {

        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
        
		// Get ODataModel instance
	    var oODataModel = dia.cmc.common.helper.ModelHelper.getODataModel();
	    
		// Set OData Model
//		this.setModel(oODataModel ,"ODataModel");
	    this.setModel(oODataModel);
		
	    // Get i18n model 
		var i18nModel =	dia.cmc.common.helper.ModelHelper.getI18nModel("contractsinamendment/i18n/messageBundle.properties");
		
		// set i18n model
		this.setModel(i18nModel, "i18n");
		

		// set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : sap.ui.Device.system.phone,
			isNoPhone : !sap.ui.Device.system.phone,
			listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
			listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive"
		});
		
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");
		
		// Property Model
		var oPropertyModel = dia.cmc.common.helper.ModelHelper.initalizePropertyModel();
		this.setModel(oPropertyModel, "Property");
		
		// Google Map Model
		var oLocations = [{
		    name: "",
		    lat: -33.890542,
		    lng: 151.274856,
		}];
		

		var oMapModel = new sap.ui.model.json.JSONModel();

		oMapModel.setData({
			Title: '',
		    Locations: oLocations
		});

		this.setModel(oMapModel,"MapModel");

        this.getRouter().initialize();

	}
   

});