//jQuery.sap.require("sap.ca.ui.utils.busydialog");

jQuery.sap.declare("dia.cmc.common.helper.ModelHelper");

dia.cmc.common.helper.ModelHelper = {

	oBundle : null, // somebody has to set this

	oODataModel : null,
	oDealCollectionModel : new sap.ui.model.json.JSONModel(),
	//Change Start by Abdul {09/01/2015}
	oSystemDetailCollection : new sap.ui.model.json.JSONModel(),
	//Change End by Abdul {09/01/2015}
	oDealDetailModel: new sap.ui.model.json.JSONModel(),
	sSelectedDealPathIndex:null,
	sSelectedDealPathKey:null,
	sSelectedDealId:null,
	oPropertyModel : new sap.ui.model.json.JSONModel(),
	oDefaultParameterModel: null,
	oRequestFinishedDeferred:null,

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
		
		this.oODataModel.setSizeLimit(300);
				
		this.oODataModel.setCountSupported(false);
		
		return this.oODataModel;
	},
	//Change Start by Abdul {09/01/2015}
	/**
	 * Read System Detai Collection and convert it to JSON Model
	 * @param sDealId
	 * @param sSystemModuleSerial
	 * @param sSystemModule
	 */	 
	readSystemDetailCollection : function (sDealId, sSystemModuleSerial, sSystemModule){
		
		var that = this;
		// Open busy dialog
		this.openBusyDialog();
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();		
		var oModel = new sap.ui.model.json.JSONModel();	
		
		// Call OData read method and get System Detai Collection
		this.oODataModel.read("/SystemCollection(DealId='" + sDealId + "',SystemModuleSerial='" +sSystemModuleSerial+ "',SystemModule='"+sSystemModule+"')", null, null , true, 
			
			function(oData, oResponse){		// Call is successful
				oModel.setData({SystemCollection:oData});
				
				if(oModel.getData().SystemCollection.length > 0){
					that.oSystemDetailCollection = oModel;
				}
				
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oModel);
				
				// close busy dialog 
				that.closeBusyDialog();
				
			},
			
			function(oResponse){			// Error occured
				
				// Read error message and display
			   oResponse = jQuery.parseJSON(oResponse.response.body);

			   sap.m.MessageBox.alert(oResponse.error.message.value, {
					title : "Result"
				});
			   
			   // Reject deferred object
			   oRequestFinishedDeferred.resolve();
			   
			   // Close busy dialog
			   that.closeBusyDialog();
			   
		});
			
		return oRequestFinishedDeferred;
	},
	
	//Change End by Abdul {09/01/2015}
	
	// Read Deal Collection and convert it to JSON Model
	readDealCollection : function (sFilters){
		
		var that = this;

		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var oModel = new sap.ui.model.json.JSONModel();
	
		// Update filter string with default values
		if (sFilters == null && sFilters == undefined){
			sFilters = "IsFavorite eq 'X'";
		}
		
		var oDefaultParameters = this.oDefaultParameterModel.getData();
		
		sFilters += " and SalesOrg eq '" + oDefaultParameters.SalesOrg + 
					"' and DistChannel eq '" + oDefaultParameters.DistChannel +
					"' and Division eq '" + oDefaultParameters.Division +
					"'";
		
		// Call OData read method and get Deal Collection
		this.oODataModel.read("DealCollection", null, {"$select":"DealId,CustomerName,IsFavorite,IsFlagged,CustomerCity,DealMasterPO,DealMasterDescr,ValidFrom,ValidTo", 
													   "$filter": sFilters } , true, 
			
			function(oData, oResponse){		// Call is successful
				oModel.setData({DealCollection:oData.results});
				
				if(oModel.getData().DealCollection.length > 0){
					that.oDealCollectionModel = oModel;
				}
				
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oModel);
				
				// close busy dialog 
				that.closeBusyDialog();
				
			},
			
			function(oResponse){			// Error occured
				
				// Read error message and display
			   oResponse = jQuery.parseJSON(oResponse.response.body);

			   sap.m.MessageBox.alert(oResponse.error.message.value, {
					title : "Result"
				});
			   
			   // Reject deferred object
			   oRequestFinishedDeferred.resolve();
			   
			   // Close busy dialog
			   that.closeBusyDialog();
			   
		});
			
		return oRequestFinishedDeferred;
	},
	
	
	// Displays selected Deal's details
	readDealDetail: function(sDealId){

		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		this.sSelectedDealId = sDealId;	

		this.sSelectedDealPathKey = "/DealCollection('" + sDealId + "')";

		// read Deal details by calling ODataModel read method with $expand parameter to read all the entityset in one single server call
//		
		this.oODataModel.read(this.sSelectedDealPathKey, null, {"$expand":"SystemCollection,PartnerCollection,MaterialPriceCollection,TestPriceCollection,MaterialDiscountCollection,HierarchyDiscountCollection,GroupDiscountCollection,CommitmentCollection,ReferenceCollection"}, 
							  true,
				
				function(oData, oResponse){  
			
					// Build the list of System Group and Systems without duplicates
					var oSystemGroupName = [];
					var oSystemGroupNameCollection = [];
					
					var oSystemName = [];
					var oSystemNameCollection = [];
					
					$.each(oData.SystemCollection.results, function(i, el){
						
					    if(el.SystemGroupName != "" && ($.inArray(el.SystemGroupName, oSystemGroupName) === -1) )
					    {
					    	oSystemGroupName.push(el.SystemGroupName);
					    	oSystemGroupNameCollection.push({'SystemGroupName':el.SystemGroupName});
					    }

					    
					    if(el.SystemName != "" && ($.inArray(el.SystemName, oSystemName) === -1) )
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
						
					    if(el.PartnerFunctionDesc != "" && ($.inArray(el.PartnerFunctionDesc, oPartnerFunctionDesc) === -1) )
					    {
					    	oPartnerFunctionDesc.push(el.PartnerFunctionDesc);
					    	oPartnerFunctionDescCollection.push({'PartnerFunctionDesc':el.PartnerFunctionDesc});
					    }

					    
					    if(el.PartnerName != "" && ($.inArray(el.PartnerName, oPartnerName) === -1) )
					    {
					    	oPartnerName.push(el.PartnerName);
					    	oPartnerNameCollection.push({'PartnerName':el.PartnerName,
					    								 'PartnerNumber':el.PartnerNumber});
					    }

					});

					
					// Building Property Object for properties like Favorite and Flag button Icon, tooltip and text
					var oPropertyObject = that.setDealDetailElementsProperties(oData,false);	
					
					// Parse detail detail object
					var oDealDetail = that.parseDealDetailObject(oData);
					
					// Build JSON model base on OData response
					that.oDealDetailModel.setData({	DealDetail:oDealDetail,
													Properties:oPropertyObject,
													NewPriceItem:null,
													NewDiscountItem:null,
													NewCommitmentItem:null,
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
													SystemGroupNameCollection:oSystemGroupNameCollection,
													SystemNameCollection:oSystemNameCollection,
													PartnerFunctionDescCollection:oPartnerFunctionDescCollection,
													PartnerNameCollection:oPartnerNameCollection});

					// Disable amendment, if required
					that.disableSimpleAmend();
					
					// Resolve Deferred object and return the model
					oRequestFinishedDeferred.resolve(that.oDealDetailModel);
					
					// close busy dialog 
					that.closeBusyDialog();
					
			   },
			   function(oResponse){
				   
				   oResponse = jQuery.parseJSON(oResponse.response.body);

				   sap.m.MessageBox.alert(oResponse.error.message.value, {
						title : "Deal Detail Read Result"
				   });
				   

				   // Reject deferred object
				   oRequestFinishedDeferred.resolve();
				   
				   // Close busy dialog
				   that.closeBusyDialog();
				   
			   });

		return oRequestFinishedDeferred;

	},


	// Read selected Deal's header details
	readDealHeader: function(){

		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		var oErrorResponse = null;
		
		// read Deal details by calling ODataModel read method
		this.oODataModel.read(this.sSelectedDealPathKey, null, null, true,
				
				function(oData, oResponse){  
					
					// Building Property Object for properties like Favorite and Flag button Icon, tooltip and text
					var oPropertyObject = that.setDealDetailElementsProperties(oData,false);	
					
					// Parse detail detail object
					var oDealDetail = that.parseDealDetailObject(oData);

					// Update Deal header details in model
					that.oDealDetailModel.setProperty("/DealDetail",oDealDetail);
					
					that.oDealDetailModel.setProperty("/Properties",oPropertyObject);
					
					//Disable amendment, if required
					that.disableSimpleAmend();
					
					// Resolve Deferred object and return the model
					oRequestFinishedDeferred.resolve(that.oDealDetailModel);
					
			   },
			   function(oResponse){
				   
				   oResponse = jQuery.parseJSON(oResponse.response.body);

				   sap.m.MessageBox.alert(oErrorResponse.error.message.value, {
						title : "Deal Detail Read Result"
				   });
				   
				   // Reject deferred object
				   oRequestFinishedDeferred.resolve();

			   });

	
		return oRequestFinishedDeferred;

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

	/** Initialize the object for NewPriceItem
	 */
	initalizeNewPriceItem : function (sPath, bInitialize, sCondType){
		
		var oSelectedItem = jQuery.extend({}, this.oDealDetailModel.getProperty(sPath));
	    
	    if(bInitialize === true){
	    	
	    	oSelectedItem.Material = "";
	    	oSelectedItem.MaterialDescription = "";
	    	oSelectedItem.Rate = "";
	    	oSelectedItem.Unit = 1;
	    	oSelectedItem.Uom = "";
//	    	oSelectedItem.Uom = "PC";			// Temporary hard coded
	    	
	    	if(!oSelectedItem.CurrencyCode){ // If currency is not available, read from deal header
	    		oSelectedItem.CurrencyCode = this.oDealDetailModel.getData().DealDetail.CurrencyCode;	
	    	}
	    	
//	    	if(!oSelectedItem.AgreementType){
//	    		oSelectedItem.AgreementType = sCondType;
//	    	}
	    	
	    	oSelectedItem.DealMasterContract = "";
	    	oSelectedItem.DealMasterContractItem = 0;
	    }

		oSelectedItem.AgreementType = sCondType;
		
	    // Both in case of Add and Change show default dates
    	oSelectedItem.ValidFrom = new Date();
    	oSelectedItem.ValidTo = new Date("9999-12-31");
    	
		return oSelectedItem;
	},
	
	/** Initialize the object for NewDiscountItem
	 */
	initalizeNewDiscountItem : function (sPath, bInitialize){
		
		var oSelectedItem = jQuery.extend({}, this.oDealDetailModel.getProperty(sPath));
	    
	    if(bInitialize === true){
	    	
	    	oSelectedItem.Material = "";
	    	oSelectedItem.MaterialDescription = "";
	    	oSelectedItem.Discount = "";
	    	oSelectedItem.ValidFrom = new Date();
	    	oSelectedItem.ValidTo = new Date("9999-12-31");
	    }

		return oSelectedItem;
	},
	
	
	/** Initialize the object for NewCommitmentItem
	 */
	initalizeNewCommitmentItem : function (sPath, bInitialize){
		
		var oSelectedItem = jQuery.extend({}, this.oDealDetailModel.getProperty(sPath));
	    
	    if(bInitialize === true){
	    	
	    	oSelectedItem.CallOffPartner = "";
	    	oSelectedItem.PartnerName = "";
	    	oSelectedItem.Material = "";
	    	oSelectedItem.MaterialDescription = "";
	    	oSelectedItem.Quantity = "";
	    	oSelectedItem.Uom = "";
	    	oSelectedItem.ValidFrom = new Date();
	    	oSelectedItem.ValidTo = new Date("9999-12-31");
	    }
	
	    
//	    jQuery.sap.require("sap.ui.core.format.NumberFormat");
//	    
//	    var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
//	      maxFractionDigits: 3,
//	      groupingEnabled: true,
//	      groupingSeparator: ",",
//	      decimalSeparator: "."
//	    }); 
//
//	    oSelectedItem.Quantity = oNumberFormat.format(oSelectedItem.Quantity); // Set the formatted value on the text field
//	    
		return oSelectedItem;
	},
	
	
	initalizePropertyModel : function (){
		
		this.oPropertyModel = new sap.ui.model.json.JSONModel({
								FlagButtonText:"",
								FlagIconColor:"",
								FlagButtonTooltip:"",
								FavIconColor:"",
								FavButtonTooltip:"",
								ProfitabilityIconColor:"#DF0101",
								ProfitabilityIconTooltip:"",
								EfficiencyIconColor:"#088A29",
								EfficiencyIconTooltip:"",
								ComplianceIconColor:"#FFCC00",
								ComplianceIconTooltip:"",
								IsInAmendmentStatus:false,
								AmendPriceTitle:"",
								AmendDiscountTitle:"",
								AmendCommitmentTitle:"",
								PricingActionButtonVisi:false,
								DiscountActionButtonVisi:false,
								CommitmentActionButtonVisi:false,
								MaterialEnable:false,
								DiscountFieldEnable:false,
								CancelAmendBtnEnable:true,
								SimpleAmendEnable:true,		// Disable Simple Amendment, when contract is expired or contract is in Amendment
								MaterialLabel:"",
								DiscountFieldLabel:"",
								CustomerCountryFlag:"",
								AdvanceCustomerCountryFlag:"",
							    TimelineVisi:false,
							    TimelineDetailTitle:""
							});

		return this.oPropertyModel;
	},

	
	// Set properties like Favorite and Flag button Icon, tooltip and text
	setDealDetailElementsProperties : function (oDealDetail, bUpdate){
		
		var sFlagButtonText = null;
		var sFlagButtonTooltip = null;
		var sFlagIconColor = null;
		var sFavButtonTooltip = null;
		var sFavIconColor = null;
		
		//var oBundle = this.getView().getModel("i18n");
		
		if(oDealDetail.IsFlagged === 'X'){				// Deal is already flagged?
			sFlagButtonText = this.oBundle.getText("DeflagButtonText");
			sFlagButtonTooltip = this.oBundle.getText("DeflagButtonTooltip");
//			sFlagIconColor = "#DF0101";
			sFlagIconColor = "#007cc0";
		}else{
			sFlagButtonText = this.oBundle.getText("FlagButtonText");
			sFlagButtonTooltip = this.oBundle.getText("FlagButtonTooltip");
			sFlagIconColor = "#cccccc";
		}
		
		if(oDealDetail.IsFavorite === 'X'){			// Deal is already added in Favorite?
			sFavButtonTooltip = this.oBundle.getText("DeFavButtonTooltip");
//			sFavIconColor = "#FFFF00";
//			sFavIconColor = "#FFCC00";
			sFavIconColor = "#007cc0";
			
		}else{
			sFavButtonTooltip = this.oBundle.getText("FavButtonTooltip");
			sFavIconColor = "#cccccc";
		}
		
		
		this.oPropertyModel.setProperty("/FlagButtonText",sFlagButtonText);
		this.oPropertyModel.setProperty("/FlagIconColor",sFlagIconColor);
		this.oPropertyModel.setProperty("/FlagButtonTooltip",sFlagButtonTooltip);
		this.oPropertyModel.setProperty("/FavIconColor",sFavIconColor);
		this.oPropertyModel.setProperty("/FavButtonTooltip",sFavButtonTooltip);
		
		this.oPropertyModel;
	},
	
	
	/**Disable simple amendment button when contract is expired or is In Amendment.
	 * 
	 */
	disableSimpleAmend:function(){
		var oDealDetail = this.oDealDetailModel.getData().DealDetail;
		
		var bSimpleAmendEnable = true;
		
		if(oDealDetail.ValidTo < (new Date()) || oDealDetail.DealStatus === "AMEND"){
			bSimpleAmendEnable = false;
		}
		
		this.setProperty("SimpleAmendEnable", bSimpleAmendEnable);
	},
	
	
	// Set property values to Properties model
	setProperty : function(sName, oValue){
		
		sName = "/" + sName;
		
		this.oPropertyModel.setProperty(sName,oValue);
	},
	
	
	// Set SelectedItem property in model
	setSelectedItem : function(sProperty, oSelectedItem){
	    
//	    var oSelectedItem = jQuery.extend({}, this.oDealDetailModel.getProperty(sPath));
//	    
//	    if(bInitialize === true){
//	    	
//	    	oSelectedItem.Material = "";
//	    	oSelectedItem.MaterialDescription = "";
//	    	oSelectedItem.Rate = "";
//	    	oSelectedItem.Unit = "";
//	    	oSelectedItem.Uom = "";
//	    	oSelectedItem.ValidFrom = null;
//	    	oSelectedItem.ValidTo = null;
//			
//	    }
	    
	    this.oDealDetailModel.setProperty(sProperty, oSelectedItem);
	},
	
	// Get SelectedItem property in model
	getSelectedItem : function(sProperty){
		  
	    return this.oDealDetailModel.getProperty(sProperty);
	},
	
	
	// Return text from i18n model
	getText : function (sPath, sArg1){
	
		var sText = this.oBundle.getText(sPath);
		
		if(sArg1){
			sText = sText.replace("&", sArg1);
		}
			
		return sText;
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

		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		oAmendDetail.DealId = this.sSelectedDealId;
			
		// Call ODataModel create method to post amendment data to SAP backend
		this.oODataModel.create(this.sSelectedDealPathKey + "/AmendmentCollection", oAmendDetail, {success: function(oData){
			
			// This is create success event handler. Will be called when create operation is successful.
				
			var oRequestFinishedDeferredHeader = that.readDealHeader();
			
			jQuery.when(oRequestFinishedDeferredHeader).then(jQuery.proxy(function() {

				oAmendDetail.AmendmentId = oData.AmendmentId;
				oAmendDetail.Message = oData.Message;
				oAmendDetail.MessageType = oData.MessageType;
	
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oAmendDetail);
				
				// close busy dialog 
				that.closeBusyDialog();
				
			}, this));
			
		}, error: function(oResponse){
			// This is create error event handler. Will be called when create operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			oAmendDetail.Message = oResponse.error.message.value;
			oAmendDetail.MessageType = "E";
			

		   // Reject deferred object
		   oRequestFinishedDeferred.resolve(oAmendDetail);
		   
		   // Close busy dialog
		   that.closeBusyDialog();
			   
		}, async : true});
				
		return oRequestFinishedDeferred;
	},
	
	// Post/Create Material Price Amendment to SAP
	postPriceAmendment : function(oPriceDetail){

		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		oPriceDetail.DealId = this.sSelectedDealId;

		var sPath = "";
		
		if (oPriceDetail.AgreementType === "YIMP"){
			sPath = "/MaterialPriceCollection";
		}
		else{
			sPath = "/TestPriceCollection";
		}
		
		// Call ODataModel create method to post amendment data to SAP backend
		this.oODataModel.create(this.sSelectedDealPathKey + sPath, oPriceDetail, {success: function(oData){
				
			// This is create success event handler. Will be called when create operation is successful.
				
			var oRequestFinishedDeferredDealDetail = that.readDealDetail(that.sSelectedDealId);
			
			jQuery.when(oRequestFinishedDeferredDealDetail).then(jQuery.proxy(function(oDealDetailModel) {
				
	//			oPriceDetail.AmendmentId = oData.AmendmentId;
				oPriceDetail.Message = oData.Message;
				oPriceDetail.MessageType = oData.MessageType;
	
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oPriceDetail, oDealDetailModel);
				
				// close busy dialog 
				that.closeBusyDialog();

			}));
			
		}, error: function(oResponse){
			// This is create error event handler. Will be called when create operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			oPriceDetail.Message = oResponse.error.message.value;
			oPriceDetail.MessageType = "E";

			// Reject deferred object
			oRequestFinishedDeferred.resolve(oPriceDetail);
			   
			// Close busy dialog
			that.closeBusyDialog();
			   
		}, async: true});
				
		return oRequestFinishedDeferred;
	},
	
	// Post/Create Commitment Amendment to SAP
	postCommitmentAmendment : function(oCommitmentDetail){

		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		oCommitmentDetail.DealId = this.sSelectedDealId;
			
		var that = this;
		
		// Call ODataModel create method to post amendment data to SAP backend
		this.oODataModel.create(this.sSelectedDealPathKey + "/CommitmentCollection", oCommitmentDetail, {success: function(oData){
			
			// This is create success event handler. Will be called when create operation is successful.
				
			var oRequestFinishedDeferredDealDetail = that.readDealDetail(that.sSelectedDealId);
			
			jQuery.when(oRequestFinishedDeferredDealDetail).then(jQuery.proxy(function(oDealDetailModel) {
				
	//			oCommitmentDetail.AmendmentId = oData.AmendmentId;
				oCommitmentDetail.Message = oData.Message;
				oCommitmentDetail.MessageType = oData.MessageType;
	
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oCommitmentDetail, oDealDetailModel);
				
				// close busy dialog 
				that.closeBusyDialog();
			}));
			
		}, error: function(oResponse){
			// This is create error event handler. Will be called when create operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			oCommitmentDetail.Message = oResponse.error.message.value;
			oCommitmentDetail.MessageType = "E";
			
//			oCommitmentDetail.Message = "Error while posting Amendment.";

		   // Reject deferred object
		   oRequestFinishedDeferred.resolve(oCommitmentDetail);
		   
		   // Close busy dialog
		   that.closeBusyDialog();
		}, async: true});
				
		return oRequestFinishedDeferred;
	},
	
	
	/** Initialize default parameters model
	 */
	initializeDefaultParameterModel : function (){
		
		this.oDefaultParameterModel = new sap.ui.model.json.JSONModel({
								UserId:"",
								SalesOrg:"",
								DistChannel:"",
								Division:"",
								CountryKey:"",
								DecimalFormat:null,
								Message:"",
								MessageType:"E"
							});
	},
	
	
	/** Read default parameters for user and bind it to JSON Model
	 */
	readDefaultParameters : function (){
			
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		// if default parameters are already read, don't do it again
		if(this.oDefaultParameterModel === undefined || this.oDefaultParameterModel === null ){

			// Open busy dialog
			this.openBusyDialog();
			
			this.initializeDefaultParameterModel();
			
			this.oODataModel.read("/UserPreferenceCollection('Dummy')", null, null , true, 
			function(oData, oResponse){
				oData.MessageType = "S";
				that.oDefaultParameterModel.setData(oData);
				
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(jQuery.extend({}, that.oDefaultParameterModel.getData()));
				
				// close busy dialog 
				that.closeBusyDialog();
				
		   },
		   function(oResponse){
//			   alert(oResponse);
			   
			   	var oDefaultParameter = that.oDefaultParameterModel.getData();
				oDefaultParameter.MessageType = "E";
				
			   // Reject deferred object
			   oRequestFinishedDeferred.resolve(oDefaultParameter);
			   
			   // Close busy dialog
			   that.closeBusyDialog();
			   
		   });
		}
			
//		var oDefaultParameters = jQuery.extend({}, this.oDefaultParameterModel.getData());
		
		return oRequestFinishedDeferred;
	},
	
	
	/** Update user's default parameters to SAP
	 * @param oDefaultParameter : Default Parameters
	 */
	updateDefaultParameters : function(oDefaultParameter){
		
		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		// Call ODataModel Update method to post data to SAP
		this.oODataModel.update("/UserPreferenceCollection('Dummy')", oDefaultParameter, {success: function(){
			// This is update success event handler. Will be called when update operation is successful.
				
			oDefaultParameter.Message = that.getText("UpdateDefaultParamSuccess")
			oDefaultParameter.MessageType = "S";
			
			//Update the UserPa and DealDetailModel to reflect the latest values
			that.oDefaultParameterModel.setData(oDefaultParameter);
			
			// Resolve Deferred object and return the model
			oRequestFinishedDeferred.resolve(oDefaultParameter);
			
			// close busy dialog 
			that.closeBusyDialog();
			
			
		}, error: function(oResponse){
			// This is update error event handler. Will be called when update operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			
			oDefaultParameter.Message = oResponse.error.message.value;
			oDefaultParameter.MessageType = "E";
			
		   // Reject deferred object
		   oRequestFinishedDeferred.resolve(oDefaultParameter);
			   
		   // Close busy dialog
		   that.closeBusyDialog();
			   
		},async : true});
		
		return oRequestFinishedDeferred;
	},
	


	
	/** Read Amendment details for selected Deal
	 * @Param: sDealId 
	 */
	readAmendmentDetail: function(){

		var that = this;
		
		var oAmendmentDetailModel = new sap.ui.model.json.JSONModel();
		
		var sPath = "/DealCollection('" + this.sSelectedDealId + "')/AmendmentCollection";
		
		var sFilters = "Action eq 'RCA'";	// Read Current Amendment detail
		
		// read amendment details by calling ODataModel read method 
		this.oODataModel.read(sPath, null, {"$filter": sFilters }, false, 
				function(oData, oResponse){  
			
					// Build JSON model base on OData response
					oAmendmentDetailModel.setData(oData.results[0]);
			   },
			   function(oResponse){
				  sap.m.MessageToast.show(that.getText("AmendmentDetailReadError"));
			   });

		return oAmendmentDetailModel;

	},
	
	/** Read timeline for selected Deal
	 * @Param: sDealId 
	 * 		   sFilters
	 */
	readDealTimeline: function(sDealId, sFilters){

		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		var oTimelineModel = new sap.ui.model.json.JSONModel();
		
		var sPath = "/DealCollection('" + sDealId + "')/AmendmentCollection";
		
//		var sFilters = "Action eq 'RTL'";			// Read Timeline
		
		// read timeline details by calling ODataModel read method 
		this.oODataModel.read(sPath, null, {"$filter": sFilters }, true, 
			function(oData, oResponse){  
		
//				// Build JSON model base on OData response
//					oTimelineModel.setData({AmendmentCollection:oData.results});
					
				var oTimelineData = [];
				var oItem = new Object();
				
				$.each(oData.results, function(i, el){

					if(el.SubItem === "X"){
						
						if(el.DetailDesc == ""){
							el.DetailDesc = 'NA';
						}
						oItem.PriceDetailCollection.push(el);
						
					}else{
						oItem = new Object();
						
						oItem = el;
						oItem.PriceDetailCollection = [];
						
						oTimelineData.push(oItem);
					}
				});
					
				// Build JSON model base on OData response
				oTimelineModel.setData({AmendmentCollection:oTimelineData});
				
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oTimelineModel);
				
				// close busy dialog 
				that.closeBusyDialog();
				
		   },
		   function(oResponse){
			  sap.m.MessageToast.show(that.getText("TimelineReadError"));
			  
			   // Reject deferred object
			   oRequestFinishedDeferred.resolve(oTimelineModel);
				   
			   // Close busy dialog
			   that.closeBusyDialog();
			   
		   });
		
		return oRequestFinishedDeferred;
	},
	
	
	/** Cancel an Amendment - Used in Deals in amendment application
	 * @param oDefaultParameter : Default Parameters
	 */
	updateAmendment : function(oAmendmentDetails){
		
		// Open busy dialog
		this.openBusyDialog();
		
		// Create deferred object so that calling program can wait till asynchronous call is finished
		var oRequestFinishedDeferred = jQuery.Deferred();
		
		var that = this;
		
		// If amendment id is not available read current amendment details for the deal
		if (!oAmendmentDetails.AmendmentId){
			var oAmendmentDetailModel = this.readAmendmentDetail();
			
			oAmendmentDetails.AmendmentId = oAmendmentDetailModel.getData().AmendmentId;
			
			if (!oAmendmentDetails.AmendmentId){
				return;
			}
		}
		
		this.oODataModel.update("/AmendmentCollection('"+oAmendmentDetails.AmendmentId+"')", oAmendmentDetails, {success: function(){
			// This is update success event handler. Will be called when update operation is successful.
				
			
			var oRequestFinishedDeferredHeader = that.readDealHeader();
			
			jQuery.when(oRequestFinishedDeferredHeader).then(jQuery.proxy(function() {
			
				oAmendmentDetails.Message = that.getText("RecalculationCancelSuccess");
				oAmendmentDetails.MessageType = "S";
	
				// Resolve Deferred object and return the model
				oRequestFinishedDeferred.resolve(oAmendmentDetails);
				
				// close busy dialog 
				that.closeBusyDialog();

			}, this));
			
		}, error: function(oResponse){
			// This is update error event handler. Will be called when update operation is failed.
			
			oResponse = jQuery.parseJSON(oResponse.response.body);
			
			oAmendmentDetails.Message = oResponse.error.message.value;
			oAmendmentDetails.MessageType = "E";
			

		   // Reject deferred object
		   oRequestFinishedDeferred.resolve(oAmendmentDetails);
		   
		   // Close busy dialog
		   that.closeBusyDialog();
			   
		}, async: true});
				
		return oRequestFinishedDeferred;
	},
	
	
	
	/**
	 * Open busy dialog
	 */
	openBusyDialog: function (){
		
		if (!this._busyDialog) {
			this._busyDialog = new sap.ui.xmlfragment(
					"idBusydialog", "dia.cmc.common.fragment.BusyDialog",
					this);

		}

		this._busyDialog.open();
		
		
		
	},
	
	/**
	 * Close busy dialog
	 */
	closeBusyDialog: function(){
		this._busyDialog.close();
		
	},
	
	
	
	////////////////////////// Code specific to Deal in Amendment //////////////////////
	
	oDealsInAmendmentCollectionModel : new sap.ui.model.json.JSONModel(),
	
	/**
	 * Read Deal Collection and convert it to JSON Model
	 */

	readDealsInAmendmentCollection : function (){

		var that = this;		
		
		this.oODataModel.read("DealInAmendmentCollection", null, null , false, 
			
			function(oData, oResponse){
				that.oDealsInAmendmentCollectionModel.setData({DealsInAmendmentCollection:oData.results});
			},
			
			function(oResponse){
			   oResponse = jQuery.parseJSON(oResponse.response.body);

			   sap.m.MessageBox.alert(oResponse.error.message.value, {
					title : "Result"
				});
			});
		
            
		return this.oDealsInAmendmentCollectionModel;
	},

	////////////////////////////////////////////////////////////////////////////////////////////////
	
};