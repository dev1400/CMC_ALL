jQuery.sap.declare("dia.cmc.common.helper.ModelHelper");

dia.cmc.common.helper.ModelHelper = {

	oBundle : null, // somebody has to set this

	oODataModel : null,
	oDealCollectionModel : new sap.ui.model.json.JSONModel(),
	oDealDetailModel: new sap.ui.model.json.JSONModel(),
	sSelectedDealPathIndex:null,
	sSelectedDealPathKey:null,
	sSelectedDealId:null,
	oPropertyModel : new sap.ui.model.json.JSONModel(),
	oDefaultParameterModel: null,
	
	/**
	 * Supply here the service url of the service to fetch data from
	 */
	getServiceUrl : function () {
		
		// OData Service URL
		var sServiceUrl = "/sap/opu/odata/sap/ZV80_SA_CM_CE_CMS_DEAL_SRV/";
		
		//for local testing prefix with proxy
		  if (window.location.hostname == "localhost") {
		      return "proxy" + sServiceUrl;
		  } else {
		      return sServiceUrl;
		  }
	},
	
	
	/**
	 * Build i18n Model instance and return
	 */
	getI18nModel : function (sPath) {
		
		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : sPath
		});
		
		this.oBundle = i18nModel.getResourceBundle();
		
		return i18nModel;
	},
	
	/**
	 * Build ODataModel instance and return
	 */
	getODataModel : function () {
		
		// Create OData Model
//		var sUrl = dia.cmc.model.Config.getServiceUrl();
		var sUrl = this.getServiceUrl();
		this.oODataModel = new sap.ui.model.odata.ODataModel(sUrl, true);
		
//		this.oODataModel.setHeaders({
//	         "X-CSRF-Token": "Fetch"  // auth 
//	    });
	    
//		// Get security token
//		this.oODataModel.refreshSecurityToken();
		
		//alert(this.oODataModel.getHeaders()['x-csrf-token']);
		
		this.oODataModel.setSizeLimit(300);
				
		this.oODataModel.setCountSupported(false);
		
		return this.oODataModel;
	},
	
	
	// Read Deal Collection and convert it to JSON Model
	readDealCollection : function (sFilters){

		var that = this;
		
		if (sFilters == null && sFilters == undefined){
			sFilters = "IsFavorite eq 'X'";
		}
		
		var oDefaultParameters = this.oDefaultParameterModel.getData();
		
		sFilters += " and SalesOrg eq '" + oDefaultParameters.SalesOrg + 
					"' and DistChannel eq '" + oDefaultParameters.DistChannel +
					"' and Division eq '" + oDefaultParameters.Division +
					"'";
		
		this.oODataModel.read("DealCollection", null, {"$filter": sFilters } , false, function(oData, oResponse){
			that.oDealCollectionModel.setData({DealCollection:oData.results});
				
	   });
		
		
		//oModel.refreshSecurityToken()
//		if (sFilters != null && sFilters != undefined){			// Check if Filter string is passed
//			
//			this.oODataModel.read("DealCollection", null, {"$filter": sFilters } , false, function(oData, oResponse){
//				oJSONModel.setData({DealCollection:oData.results});
//		   });
//			
//		}else{
//			this.oODataModel.read("DealCollection", null, null, false, function(oData, oResponse){  
//				oJSONModel.setData({DealCollection:oData.results});
//		   });		
//		}
		
		
		return this.oDealCollectionModel;
	},

	
	
	// Displays selected Deal's details
	readDealDetail: function(sDealId){

		var that = this;
		
//		// set selected Deal path to helper class
//		this.sSelectedDealPathIndex = sPath;

		this.sSelectedDealPathKey = "/DealCollection('" + sDealId + "')";

		this.sSelectedDealId = sDealId;

		var oSelectedPriceItem = this.initalizeSelectedPriceItem();
		var oSelectedCommitmentItem = this.initalizeSelectedCommitmentItem();
		
		// read Deal details by calling ODataModel read method with $expand parameter to read all the entityset in one single server call
		this.oODataModel.read(this.sSelectedDealPathKey, null, {"$expand":"SystemCollection,PartnerCollection,MaterialPriceCollection,TestPriceCollection,MaterialDiscountCollection,HierarchyDiscountCollection,GroupDiscountCollection,CommitmentCollection,DocumentCollection,ReferenceCollection,TimelineCollection"}, false, 
				function(oData, oResponse){  
			
					// Build the list of System Group and Systems without duplicates
					var oSystemGroupName = [];
					var oSystemGroupNameCollection = [];
					
					var oSystemName = [];
					var oSystemNameCollection = [];

					$.each(oData.SystemCollection.results, function(i, el){
						
					    if($.inArray(el.SystemGroupName, oSystemGroupName) === -1)
					    {
					    	oSystemGroupName.push(el.SystemGroupName);
					    	oSystemGroupNameCollection.push({'SystemGroupName':el.SystemGroupName});
					    }

					    
					    if($.inArray(el.SystemName, oSystemName) === -1)
					    {
					    	oSystemName.push(el.SystemName);
					    	oSystemNameCollection.push({'SystemName':el.SystemName});
					    }

					});

					
					// Build the list of Partner Function and Names without duplicates
					var oPartnerFunctionDesc = [];
					var oPartnerFunctionDescCollection = [];
					
					var oPartnerName = [];
					var oPartnerNameCollection = [];

					$.each(oData.PartnerCollection.results, function(i, el){
						
					    if($.inArray(el.PartnerFunctionDesc, oPartnerFunctionDesc) === -1)
					    {
					    	oPartnerFunctionDesc.push(el.PartnerFunctionDesc);
					    	oPartnerFunctionDescCollection.push({'PartnerFunctionDesc':el.PartnerFunctionDesc});
					    }

					    
					    if($.inArray(el.PartnerName, oPartnerName) === -1)
					    {
					    	oPartnerName.push(el.PartnerName);
					    	oPartnerNameCollection.push({'PartnerName':el.PartnerName});
					    }

					});

					
					// Building Property Object for properties like Favorite and Flag button Icon, tooltip and text
					var oPropertyObject = that.setDealDetailElementsProperties(oData,false);	
					
					// Parse detail detail object
					var oDealDetail = that.parseDealDetailObject(oData);
					
					// Build JSON model base on OData response
					that.oDealDetailModel.setData({	DealDetail:oDealDetail,
													Properties:oPropertyObject,
													SelectedPriceItem:oSelectedPriceItem,
													SelectedCommitmentItem:oSelectedCommitmentItem,
													SystemCollection:oData.SystemCollection.results, 
													PartnerCollection:oData.PartnerCollection.results,
													MaterialPriceCollection:oData.MaterialPriceCollection.results,
													TestPriceCollection:oData.TestPriceCollection.results,
													MaterialDiscountCollection:oData.MaterialDiscountCollection.results,
													HierarchyDiscountCollection:oData.HierarchyDiscountCollection.results,
													GroupDiscountCollection:oData.GroupDiscountCollection.results,
													CommitmentCollection:oData.CommitmentCollection.results,
													DocumentCollection:oData.DocumentCollection.results, 
													ReferenceCollection:oData.ReferenceCollection.results,
													TimelineCollection:oData.TimelineCollection.results,
													SystemGroupNameCollection:oSystemGroupNameCollection,
													SystemNameCollection:oSystemNameCollection,
													PartnerFunctionDescCollection:oPartnerFunctionDescCollection,
													PartnerNameCollection:oPartnerNameCollection});
					
			   },
			   function(oResponse){
				  sap.m.MessageToast.show("Enable to read the Deal details.");
			   });

		return this.oDealDetailModel;

	},

	
	/** Parse Deal detail object and remove not required fields
	 */
	parseDealDetailObject : function(oData){
		
		var oDealDetail = {};
		
		for (var sKey in oData) {
			
			if ( sKey.indexOf("Collection") >= 0 || sKey.indexOf("__") >= 0 ){
				continue;
			}
			
			oDealDetail[sKey] = oData[sKey];
		}
		
		return oDealDetail;
		
	},

	/** Initialize the object for SelectedPriceItem
	 */
	initalizeSelectedPriceItem : function (){
		
		var oSelectedItem = new Object({
								Material:"",
								MaterialDescription:"",
								Rate:"",
								Unit:"",
								Uom:"",
								ValidFrom:null,
								ValidTo:null,
							});

		return oSelectedItem;
	},
	
	/** Initialize the object for SelectedCommitmentItem
	 */
	initalizeSelectedCommitmentItem : function (){
		
		var oSelectedItem = new Object({
								CallOffPartner:"",
								PartnerName:"",
								Material:"",
								MaterialDescription:"",
								Quantity:"",
								Uom:"",
								ValidFrom: null,
								ValidTo: null,
							});

		return oSelectedItem;
	},
	
	
	initalizePropertyModel : function (){
		
		this.oPropertyModel = new sap.ui.model.json.JSONModel({
								FlagButtonText:"",
								FlagButtonIcon:"",
								FlagButtonTooltip:"",
								FavButtonIcon:"",
								FavButtonTooltip:"",
								AmendPriceTitle:"",
								AmendCommitmentTitle:"",
								PricingActionButtonVisi:false,
								CommitmentActionButtonVisi:false,
								MaterialEnable:false,
								MaterialLabel:"",
								CustomerCountryFlag:"",
								AdvanceCustomerCountryFlag:""
							});

		return this.oPropertyModel;
	},

	
	// Set properties like Favorite and Flag button Icon, tooltip and text
	setDealDetailElementsProperties : function (oDealDetail, bUpdate){
		
		var sFlagButtonText = null;
		var sFlagButtonTooltip = null;
		var sFlagButtonIcon = null;
		var sFavButtonTooltip = null;
		var sFavButtonIcon = null;
		
		//var oBundle = this.getView().getModel("i18n");
		
		if(oDealDetail.IsFlagged === 'X'){				// Deal is already flagged?
			sFlagButtonText = this.oBundle.getText("DeflagButtonText");
			sFlagButtonTooltip = this.oBundle.getText("DeflagButtonTooltip");
			sFlagButtonIcon = "sap-icon://undo";
		}else{
			sFlagButtonText = this.oBundle.getText("FlagButtonText");
			sFlagButtonTooltip = this.oBundle.getText("FlagButtonTooltip");
			sFlagButtonIcon = "sap-icon://flag";
		}
		
		if(oDealDetail.IsFavorite === 'X'){			// Deal is already added in Favorite?
			sFavButtonTooltip = this.oBundle.getText("DeFavButtonTooltip");
			sFavButtonIcon = "sap-icon://unfavorite";
		}else{
			sFavButtonTooltip = this.oBundle.getText("FavButtonTooltip");
			sFavButtonIcon = "sap-icon://add-favorite";
		}
		
		
		this.oPropertyModel.setProperty("/FlagButtonText",sFlagButtonText);
		this.oPropertyModel.setProperty("/FlagButtonIcon",sFlagButtonIcon);
		this.oPropertyModel.setProperty("/FlagButtonTooltip",sFlagButtonTooltip);
		this.oPropertyModel.setProperty("/FavButtonIcon",sFavButtonIcon);
		this.oPropertyModel.setProperty("/FavButtonTooltip",sFavButtonTooltip);
		
		this.oPropertyModel;
	},
	
	
	
	// Set property values to Properties model
	setProperty : function(sName, oValue){
		
		sName = "/" + sName;
		
		this.oPropertyModel.setProperty(sName,oValue);
	},
	
	
	// Set SelectedItem property in model
	setSelectedItem : function(sProperty, sPath, oObject){
		
	    var oSelectedItem = null;
	    
	    if(sPath != null){
//	    	oSelectedItem = this.oDealDetailModel.getProperty(sPath);	
	    	oSelectedItem = jQuery.extend({}, this.oDealDetailModel.getProperty(sPath));
	    }
	    else{
	    	oSelectedItem = oObject;
	    }
	    
	    this.oDealDetailModel.setProperty(sProperty, oSelectedItem);
	},
	
	// Get SelectedItem property in model
	getSelectedItem : function(sProperty){
		  
	    return this.oDealDetailModel.getProperty(sProperty);
	},
	
	
	// Return text from i18n model
	getText : function (sPath){
	
		return this.oBundle.getText(sPath);
	},
	
	
	// Update Deal data to SAP
	updateDeal : function(oDealDetail){
		
		// Call ODataModel Update method to update data in SAP backend
		this.oODataModel.update(this.sSelectedDealPathKey, oDealDetail, null, function(){
			// This is update success event handler. Will be called when update operation is successful.
				
			oDealDetail.MessageType = "S";
			
		},function(oResponse){
			// This is update error event handler. Will be called when update operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			
			oDealDetail.Message = oResponse.error.message.value;
			oDealDetail.MessageType = "E";
		});
		
		
		//Update the DealModel and DealDetailModel to reflect the latest values
		if(oDealDetail.MessageType != "E"){
			this.oDealCollectionModel.setProperty(this.sSelectedDealPathIndex,oDealDetail);
			this.oDealDetailModel.setProperty("/DealDetail",oDealDetail);	
		}
		
		return oDealDetail;
	},
	
	// Post/Create Deal Amendment to SAP
	postAmendment : function(oAmendDetail){

		oAmendDetail.DealId = this.sSelectedDealId;
			
		// Call ODataModel create method to post amendment data to SAP backend
		this.oODataModel.create(this.sSelectedDealPathKey + "/AmendmentCollection", oAmendDetail, null, function(oData){
			
			// This is create success event handler. Will be called when create operation is successful.
				
			oAmendDetail.AmendmentId = oData.AmendmentId;
			oAmendDetail.Message = oData.Message;
			oAmendDetail.MessageType = oData.MessageType;
			
		},function(oResponse){
			// This is create error event handler. Will be called when create operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			oAmendDetail.Message = oResponse.error.message.value;
			oAmendDetail.MessageType = "E";
		});
				
		return oAmendDetail;
	},
	
	// Post/Create Material Price Amendment to SAP
	postPriceAmendment : function(oPriceDetail){

		oPriceDetail.DealId = this.sSelectedDealId;
			
		// Call ODataModel create method to post amendment data to SAP backend
		this.oODataModel.create(this.sSelectedDealPathKey + "/MaterialPriceCollection", oPriceDetail, null, function(oData){
			
			// This is create success event handler. Will be called when create operation is successful.
				
			oPriceDetail.AmendmentId = oData.AmendmentId;
			oPriceDetail.Message = oData.Message;
			oPriceDetail.MessageType = oData.MessageType;

			
		},function(oResponse){
			// This is create error event handler. Will be called when create operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			oPriceDetail.Message = oResponse.error.message.value;
			oPriceDetail.MessageType = "E";
		});
				
		return oPriceDetail;
	},
	
	// Post/Create Commitment Amendment to SAP
	postCommitmentAmendment : function(oCommitmentDetail){

		oCommitmentDetail.DealId = this.sSelectedDealId;
			
		var that = this;
		
		// Call ODataModel create method to post amendment data to SAP backend
		this.oODataModel.create(this.sSelectedDealPathKey + "/CommitmentCollection", oCommitmentDetail, null, function(oData){
			
			// This is create success event handler. Will be called when create operation is successful.
				
//			oCommitmentDetail.AmendmentId = oData.AmendmentId;
			oCommitmentDetail.Message = oData.Message;
			oCommitmentDetail.MessageType = oData.MessageType;

		},function(oResponse){
			// This is create error event handler. Will be called when create operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			oCommitmentDetail.Message = oResponse.error.message.value;
			oCommitmentDetail.MessageType = "E";
			
//			oCommitmentDetail.Message = "Error while posting Amendment.";
		});
				
		return oCommitmentDetail;
	},
	
	
	/** Initialize default parameters model
	 */
	initializeDefaultParameterModel : function (){
		
		this.oDefaultParameterModel = new sap.ui.model.json.JSONModel({
								UserId:"",
								SalesOrg:"",
								DistChannel:"",
								Division:"",
								Message:"",
								MessageType:"E"
							});
	},
	
	
	/** Read default parameters for user and bind it to JSON Model
	 */
	readDefaultParameters : function (){
		
		var that = this;
		
		// if default parameters are already read, don't do it again
		if(this.oDefaultParameterModel === undefined || this.oDefaultParameterModel === null ){

			this.initializeDefaultParameterModel();
			
			this.oODataModel.read("/UserPreferenceCollection('Dummy')", null, null , false, function(oData, oResponse){
				oData.MessageType = "S";
				that.oDefaultParameterModel.setData(oData);
		   },
		   function(oResponse){
//			   alert(oResponse);
		   });
		}
			
		var oDefaultParameters = jQuery.extend({}, this.oDefaultParameterModel.getData());
		
		return oDefaultParameters;
	},
	
	
	/** Update user's default parameters to SAP
	 * @param oDefaultParameter : Default Parameters
	 */
	updateDefaultParameters : function(oDefaultParameter){
		
		// Call ODataModel Update method to post data to SAP
		this.oODataModel.update("/UserPreferenceCollection('Dummy')", oDefaultParameter, null, function(){
			// This is update success event handler. Will be called when update operation is successful.
				
			oDefaultParameter.Message = "Passed: User defaults were updated!";
			oDefaultParameter.MessageType = "S";
			
		},function(oResponse){
			// This is update error event handler. Will be called when update operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			
			oDefaultParameter.Message = oResponse.error.message.value;
			oDefaultParameter.MessageType = "E";
		});
		
		
		//Update the UserPa and DealDetailModel to reflect the latest values
		if(oDefaultParameter.MessageType != "E"){
			this.oDefaultParameterModel.setData(oDefaultParameter);
		}
		
		return oDefaultParameter;
	},
	/** Cancel an Amendment
	 * @param oDefaultParameter : Default Parameters
	 */
	updateAmendment : function(oAmendmentDetails){
		
		// Call ODataModel Update method to post data to SAP
		this.oODataModel.update("/DealCollection("+oAmendmentDetails.DealId+")/AmendmentCollection("+oAmendmentDetails.AmendmentId+")", oAmendmentDetails, null, function(){
			// This is update success event handler. Will be called when update operation is successful.
				
			oAmendmentDetails.Message = "Passed: User defaults were updated!";
			oAmendmentDetails.MessageType = "S";
			
		},function(oResponse){
			// This is update error event handler. Will be called when update operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			
			oDefaultParameter.Message = oResponse.error.message.value;
			oDefaultParameter.MessageType = "E";
		});
		
		
		//Update the UserPa and DealDetailModel to reflect the latest values
		if(oAmendmentDetails.MessageType != "E"){
			this.oDefaultParameterModel.setData(oAmendmentDetails);
		}
		
		return oAmendmentDetails;
	},
};