jQuery.sap.declare("dia.cmc.contractsinamendment.tableview.Component");

sap.ui.core.UIComponent.extend("dia.cmc.contractsinamendment.tableview.Component", {

	metadata : {
		publicMethods : [
			"getTable"
		],
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"AmendmentDetail.view.xml",
					"AmendmentDetail.controller.js",					
				]
			}
		}
	},
	
	getTable : function () {
		return this._rootView.getContent()[0];
	}
});

dia.cmc.contractsinamendment.tableview.Component.prototype.createContent = function () {
	this._rootView = sap.ui.xmlview({ viewName : "dia.cmc.contractsinamendment.tableview.AmendmentDetail" });
	
	var i18nModel = new sap.ui.model.resource.ResourceModel({
		bundleUrl : "contractsinamendment/i18n/messageBundle.properties"
	});
	this._rootView.setModel(i18nModel, "i18n");
	var oModel = new sap.ui.model.json.JSONModel("contractsinamendment/model/products.json");
	this._rootView.setModel(oModel);
	
	return this._rootView;
};