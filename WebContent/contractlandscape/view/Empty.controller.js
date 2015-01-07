sap.ui.controller("dia.cmc.contractlandscape.view.Empty", {

	ICON_NUMBER : 9,

	INITIAL_DELAY : 4000,

	DELAY : 3000,

	onInit : function () {
		this._animate(1, true);
		
//		// Common Controller reference
//		this.CommonController = dia.cmc.common.helper.CommonController;
//
//		// Attached event handler for route match event
//		this.CommonController.getRouter(this).attachRouteMatched(this.handleRouteMatched, this);
//		
	},

	onBeforeRendering: function() {
		
//		this._animate(1, true);
	},

	
//	/** Event handler for Route Matched event 
//	 * It will check for deal id and if available, reads the deal details
//	 * @param oEvent
//	 */
//	handleRouteMatched : function(oEvent) {
//		
//		if (oEvent.getParameter("name") === "catchallDetail") {		// check route name
//
//			this.CommonController.IsDefaultDetailVisi = true;
//		}
//	},
	
	_animate : function (level, forward) {

		if (level === this.ICON_NUMBER + 1) {
			
			// end of recursion: fade them all
			for (var i = 0 ; i < this.ICON_NUMBER ; i++) {
				var icon = this.getView().byId("icon" + (i + 1));
//				icon.addStyleClass("welcomeIconFade");
				icon.addStyleClass("welcomeIcon");
			}
			
			this._animate(1, true);

		} else {
			
			// wait, animate and step down into recursion
			var delay = (level === 1) ? this.INITIAL_DELAY : this.DELAY;
			setTimeout(jQuery.proxy(function () {
				var icon = this.getView().byId("icon" + level);
				if (forward) {
					icon.addStyleClass("welcomeIconRotateForward");
				} else  {
					icon.addStyleClass("welcomeIconRotateBackward");
				}
				this._animate(level + 1, !forward);
			}, this), delay);
		}
	}
});