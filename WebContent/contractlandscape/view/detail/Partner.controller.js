jQuery.sap.require("openui5.googlemaps.MapUtils");

sap.ui.controller("dia.cmc.contractlandscape.view.detail.Partner", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onInit: function() {
	// },
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onBeforeRendering: function() {
	// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onAfterRendering: function() {
	// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources
	 * and finalize activities.
	 * 
	 * @memberOf view.detail.Partner
	 */
	// onExit: function() {
	// }
	/***************************************************************************
	 * Start - Facet Filter related Code
	 **************************************************************************/

	/**
	 * Event handler for Facet Filter List close event. It is common for both
	 * Landscape and Partner Facet Filter
	 */
	handleFacetFilterListClose : function(oEvent) {

		// Get the Facet Filter lists and construct a (nested) filter for the
		// binding

		var oFacetFilter = oEvent.getSource().getParent();
		var sId = oFacetFilter.getId();

		var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
			return oList.getSelectedItems().length;
		});

		if (mFacetFilterLists.length) {

			// Build the nested filter with ORs between the values of each group
			// and
			// ANDs between each group
			var oFilter = new sap.ui.model.Filter(mFacetFilterLists
					.map(function(oList) {

						return new sap.ui.model.Filter(oList.getSelectedItems()
								.map(
										function(oItem) {
											return new sap.ui.model.Filter(
													oList.getKey(), "EQ", oItem
															.getText());
										}), false);

					}), true);

			// Apply the Facet Filter on data
			this._applyFacetFilter(sId, oFilter);

		} else {

			this._applyFacetFilter(sId, []);
		}

	},

	/**
	 * Event handler for Facet Filter List Reset event. It is common for both
	 * Landscape and Partner Facet Filter
	 */
	handleFacetFilterReset : function(oEvent) {

		// Get reference of Facet Filter and List.
		var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
		var aFacetFilterLists = oFacetFilter.getLists();

		// Clear all selected filter values
		for (var i = 0; i < aFacetFilterLists.length; i++) {
			aFacetFilterLists[i].setSelectedKeys();
		}

		this._applyFacetFilter(oEvent.getParameter("id"), []);
	},

	/**
	 * Method for applying the Facet Filter on data source. It is common for
	 * both Landscape and Partner Facet Filter
	 */
	_applyFacetFilter : function(sIdFacetFilter, oFilter) {

		// Get the id of data source from Facet Filter Id
		if (sIdFacetFilter.indexOf("Landscape") > 0)
			sId = "idLandscapeTable";
		else if (sIdFacetFilter.indexOf("Partner") > 0)
			sId = "idPartnerList";
		else
			return;

		// Get the table and apply the filter
		var oTable = this.getView().byId(sId);
		oTable.getBinding("items").filter(oFilter);
	},

	/***************************************************************************
	 * End - Facet Filter related Code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Link Action related Code
	 **************************************************************************/

	/**
	 * Event handler for Partner Number. It will open default calling
	 * application.
	 */
	handlePartnerNumber : function(oEvent) {

		// Get the reference of link
		var oLink = this.getView().byId(oEvent.getSource().getId());

		// Trigger Telephone call
		sap.m.URLHelper.triggerTel(oLink.getText());
	},

	/**
	 * Event handler for Partner Email. It will open default email application.
	 */
	handlePartnerEmail : function(oEvent) {

		// Get the reference of link
		var oLink = this.getView().byId(oEvent.getSource().getId());

		// Trigger Email
		sap.m.URLHelper.triggerEmail(oLink.getText(), "Info Request");
	},

	/***************************************************************************
	 * End - Link Action related Code
	 **************************************************************************/

	/***************************************************************************
	 * Start - Google Map related code
	 **************************************************************************/

	/**
	 * Event handler for Partner Address link press. It will display Map window
	 * with address location
	 */
	handlePartnerAddressPress : function(oEvent) {

		// sap.ui.getCore().loadLibrary("openui5.googlemaps",
		// "lib/openui5/googlemaps/");

		// jQuery.sap.require("openui5.googlemaps.MapUtils");

		// Get reference of Map Util class of google map library
		this.oMapUtils = openui5.googlemaps.MapUtils;

		// Get Partner address
		var sPartnerAddress = oEvent.getSource().getText();

		// Search location
		this._searchLocationOnMap(sPartnerAddress, true);

	},

	// Event handler for Suggest event for Search Address field
	handleSearchAddressSuggest : function(oEvent) {
		// this.locations = [];
		var sValue = oEvent.getParameter("suggestValue");

		if (sValue.length > 3) {
			this.oMapUtils.search({
				'address' : sValue
			}).done(
					jQuery.proxy(this._searchAddressSuggestions, oEvent
							.getSource()));
		}
	},

	// Event handler for Search Address change
	handleSearchAddressChange : function(oEvent) {
		var sAddress = oEvent.getParameters('newValue').newValue;

		// var oCtxt = oEvent.getSource().getBindingContext();

		// var oMapModel = this.getView().getModel("MapModel");

		// this.locations.forEach(function(oLocation) {
		// if (oLocation.value === sAddress) {
		// // oCtxt.getModel().setProperty('lat', oLocation.lat, oCtxt);
		// // oCtxt.getModel().setProperty('lng', oLocation.lng, oCtxt);
		// // oCtxt.getModel().setProperty('name', oLocation.value, oCtxt);
		// oMapModel.setProperty("/Locations", oLocation);

		// }
		// });

		this._searchLocationOnMap(sAddress, false);
	},

	/* get my location */
	handleSearchAddress : function() {

	},

	handleLocateAddressAfterOpen : function(oEvent) {
		var oMapModel = this.getView().getModel("MapModel");
		var location = oMapModel.getProperty("/Locations/0");

		var oMapUI = sap.ui.getCore().byId("idMap");

		oMapUI.setLat(location.lat);
		oMapUI.setLng(location.lng);

	},

	/**
	 * Method for searching the suggestions for address
	 */
	_searchAddressSuggestions : function(results, status) {
		var that = this;
		this.destroySuggestionItems();
		// this.locations = [];

		this.locations = jQuery.map(results, function(item) {
			var location = {};
			location.value = item.formatted_address;
			location.lat = item.geometry.location.lat();
			location.lng = item.geometry.location.lng();
			return location;
		});

		this.locations.forEach(function(item) {
			that.addSuggestionItem(new sap.ui.core.ListItem({
				text : item.value,
			}));
		});
	},

	/**
	 * Method for searching Geocode of address and displaying it on Map.
	 */
	_searchLocationOnMap : function(sAddress, bMapWind) {

		var oView = this.getView();
		var oMapModel = this.getView().getModel("MapModel");
		var oController = this;

		// Call serach method to get the Geocode for partner address
		this.oMapUtils.search({
			'address' : sAddress
		}).done(
				function(results, status) {

					this.locations = [];

					this.locations = jQuery.map(results, function(item) {
						var location = {};
						location.name = item.formatted_address;
						location.lat = item.geometry.location.lat();
						location.lng = item.geometry.location.lng();
						return location;
					});

					oMapModel.setProperty("/Locations", locations);

					if (bMapWind) {
						if (!this._locateAddress) {
							this._locateAddress = sap.ui.xmlfragment(
									"dia.cmc.contractlandscape.fragments.LocateAddress",
									oController);

							oView.addDependent(this._locateAddress);
						}

						this._locateAddress.open();
					}

					var oMapUI = sap.ui.getCore().byId("idMap");
					oMapUI.setLat(results[0].geometry.location.lat());
					oMapUI.setLng(results[0].geometry.location.lng());

				});

	},

	/** Event Handler for Close button on Map popup window. It will close the Map popup window
	 */
	handleAmendPopupClose : function(oEvent) {
		oEvent.getSource().getParent().close();
	},

/*******************************************************************************
 * Start - Google Map related code
 ******************************************************************************/

});