sap.ui.controller("dia.cmc.contractsinamendment.view.App", {

    onInit: function() {
        var view = this.getView();
    },
    navToHandler: function(channelId, eventId, data) {

        if (data && data.id) {
            // lazy load view
            if (sap.ui.getCore().getElementById("theApp").getPage(data.id) === null) {

                sap.ui.getCore().getElementById("theApp").addPage(sap.ui.xmlview(data.id, "dia.cmc.contractsinamendment.view." + data.id));
            }
            // Navigate to given page (include bindingContext)
            sap.ui.getCore().getElementById("theApp").to(data.id, data.data.context);
        } else {
            jQuery.sap.log.error("nav-to event cannot be processed. Invalid data: " + data);
        }
    },
    back : function (pageId) {
		this.getView().app.backToPage(pageId);
	}
});