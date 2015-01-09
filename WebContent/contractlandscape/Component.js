jQuery.sap.declare("dia.cmc.contractlandscape.Component");

jQuery.sap.require("dia.cmc.common.helper.ModelHelper");
jQuery.sap.require("dia.cmc.common.util.MyRouter");

sap.ui.core.UIComponent.extend("dia.cmc.contractlandscape.Component", {

	metadata : {
        name : "CMC Contract Landscape",
        version : "1.0",
        includes : [],
        dependencies : {
            libs : ["sap.m", "sap.ui.layout"],
            components : []
        },
        
// 	rootView : "dia.cmc.contractlandscape.view.Root",

    routing: {
            config : {
                routerClass : dia.cmc.common.util.MyRouter,
                viewType : "XML",
                viewPath : "dia.cmc.contractlandscape.view",
                targetAggregation : "detailPages",
                clearTarget : false
            },
            routes : [
                {
                    pattern : "",
                    name : "main",
                    view : "Master",
                    targetAggregation : "masterPages",
                    targetControl : "idAppControl",
                    subroutes : [
                        {
                            pattern : "Deal({dealId})",
                            name : "dealDetail",
                            view : "Detail",
                            transition : "show"
                        },
                        
                        {
                            pattern : "Deal({dealId})/Timeline",
                            name : "dealTimeline",
                            view : "Timeline",
                            transition : "show"
                        },
                        
                        {   //Change Start by Abdul {09/01/2015}
							pattern : "SystemDetail({dealId},{systemModuleSerial},{systemModule})",
							//Change End by Abdul {09/01/2015}
							name : "systemDetail",
							view : "SystemDetail",
							transition : "show"
						},
						
                        {
							pattern : ":all*:",
							name : "catchallDetail",
							view : "Empty",
							transition : "show"
						}
                    ]
                },
                
                {
					name : "catchallMaster",
					view : "Master",
					targetAggregation : "masterPages",
					targetControl : "idAppControl",
					subroutes : [
						{
							pattern : ":all*:",
							name : "catchallNotFound",
							view : "NotFound",
							transition : "show"
						}
					]
				}
            ]
        }
    },
    
    

	init : function() {
		
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
        
		// Get ODataModel instance
	    var oODataModel = dia.cmc.common.helper.ModelHelper.getODataModel();
	    
		// Set OData Model
		this.setModel(oODataModel ,"ODataModel");
		
	
	    // Get i18n model 
		var i18nModel =	dia.cmc.common.helper.ModelHelper.getI18nModel("contractlandscape/i18n/messageBundle.properties");
		
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

	},
   
    
    createContent : function() {
    
		// create root view
		var oView = sap.ui.view({
			id : "idRootView",
			viewName : "dia.cmc.contractlandscape.view.Root",
			type : "XML",
			viewData : { component : this }
		});
		
		window.rootView = oView;
		
		return oView;
    }

});