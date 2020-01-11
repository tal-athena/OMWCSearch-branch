(function () {
    'use strict';

    //Init navigation
    OMWClientContext.AdjustWholeHeight();
    OMWClientContext.minAccordionItemsForScroll = parseInt($('#hdnMinAccordionItemsForScroll').val());
    OMWClientContext._InitAccordion(OMWClientContext.NavigationPaneNumber);

    $(window).resize(function () {

        OMWClientContext.AdjustToolBar();

        OMWClientContext.AdjustWholeHeight();
        OMWClientContext._FixContentMWidth();
    });

    $(document).ajaxError(function (e, xhr, settings, exception) {
        if (xhr.status == "504") {
            location.href = (this._GetFullUrl("Search/SearchMain/SessionTimeout"));
        }
    });

})();