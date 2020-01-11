
var OMWClientContext = OMWClientContext || function () { };

OMWClientContext.minAccordionItemsForScroll = 3;
OMWClientContext.accordionScrollEnabled = false;
OMWClientContext.AccordionScrollDelta = 0;
OMWClientContext.LastExpandedItemOffset = OMWClientContext.LastExpandedItemOffset || 0;
OMWClientContext.accordionPanes = '';

OMWClientContext.UpdateVisiblePaneItems = function (delta) {
    //Remove disable classes from arrows
    $('.arrow-left-sidebar-bottom').removeClass('disabled');
    $('.arrow-left-sidebar-top').removeClass('disabled');

    var panesThatShouldBeVisible = [];
    var startPosition = delta;
    var endPosition = delta + OMWClientContext.minAccordionItemsForScroll;
    var length = OMWClientContext.accordionPanes.length;
    var activePaneIndex = 0;
    if (endPosition >= length) {
        startPosition = startPosition - (endPosition - length);
        endPosition = length;
        $('.arrow-left-sidebar-bottom').addClass('disabled');
    }

    //If startPosition == 0 do not show up arrow
    if (startPosition === 0) {
        $('.arrow-left-sidebar-top').addClass('disabled');
    }

    //Calculate activePaneIndex
    if (OMWClientContext.LastExpandedItemOffset <= startPosition) {
        OMWClientContext.LastExpandedItemOffset = startPosition;
        activePaneIndex = 0;
    }
    else if (OMWClientContext.LastExpandedItemOffset >= endPosition) {
        OMWClientContext.LastExpandedItemOffset = endPosition;
        activePaneIndex = OMWClientContext.minAccordionItemsForScroll - 1;
    }
    else {
        //Show the same element as expanded
        activePaneIndex = OMWClientContext.minAccordionItemsForScroll - (endPosition - OMWClientContext.LastExpandedItemOffset);
    }

    //Get panes that should be in accordion
    panesThatShouldBeVisible = OMWClientContext.accordionPanes.slice(startPosition, endPosition);

    //for (var i = 0; i < panesThatShouldBeVisible.length; i++) {
    //   //Get content of pane items or leave it with beforeActivate of accordion
    //}

    $("#searchProfilesSelector").html(panesThatShouldBeVisible);
    $("#searchProfilesSelector").accordion("refresh").accordion("option", 'active', activePaneIndex);

};

OMWClientContext._InitAccordion = function (activePaneNumber) {

    //Check if this is defined and nummber
    if (!activePaneNumber || isNaN(activePaneNumber)) {
        activePaneNumber = 0;
    }

    OMWClientContext.LastExpandedItemOffset = activePaneNumber;
    OMWClientContext.AccordionScrollDelta = activePaneNumber;

    //Save all list items so we can re-create accordion
    OMWClientContext.accordionPanes = $('#searchProfilesSelector li');
    var oldLastExpandedItemOffset = OMWClientContext.LastExpandedItemOffset;

    //Initialize accordion
    $('#searchProfilesSelector').accordion({
        animate: false,
        active: 1,
        //heightStyle: "content",
        heightStyle: "fill",
        autoHeight: true,
        header: ".opener",
        event: "click",
        beforeActivate: function (event, ui) {

            var searchPaneId = $(ui.newHeader).find('#searchProfileID').val();

            //Check if content is already loaded maybe so there are no same calls to server?
            $(ui.newPanel).load(OMWClientContext.GetFullUrl("Search/SearchMain/GetNavigationPaneItems/" + searchPaneId + '/' + $('#selectedSearchProfile').val()), function () {
                OMWClientContext._updateAccordionBottomPanelStatus();
            });
        },
        activate: function (event, ui) {
            //Save this offset
            OMWClientContext.LastExpandedItemOffset = ui.newHeader.data('position');

            if ($.browser.msie) {
                // do it if we're only in the IE (rebind the onclick handlers)
                $('.navigationPaneItem').each(function () {
                    var profileId = $(this).attr('profileId');
                    var searchPaneId = $(ui.newHeader).find('#searchProfileID').val();
                    $(this).click(function () {
                        OMWClientContext.SearchResults.LoadSearchProfile(searchPaneId, profileId);
                    });
                    $(this).find('img').click(function () {
                        OMWClientContext.SearchResults.OpenSearchProfileInNewWindow(searchPaneId, profileId);
                    });
                });
            }
        }
    }).accordion("option", 'active', 0);


    OMWClientContext.LastExpandedItemOffset = oldLastExpandedItemOffset;
    //Check if arrows should be visible
    if (OMWClientContext.accordionPanes.length <= OMWClientContext.minAccordionItemsForScroll) {
        $('.arrow-frame').hide();
    } else {
        $('.arrow-frame').show();
        //Go to frame that should be visible
        OMWClientContext.UpdateVisiblePaneItems(OMWClientContext.AccordionScrollDelta);
    }

};


OMWClientContext._updateAccordionBottomPanelStatus = function () {
    if (!OMWClientContext.InitialAccordionHeight) {
        OMWClientContext.InitialAccordionHeight = parseInt($('.ui-accordion-content-active').css('height'));
    }
    if ($('<div>').append(OMWClientContext.InitialPanes).find('li').length > OMWClientContext.minAccordionItemsForScroll) {
        $('.ui-accordion-content-active').css('height', OMWClientContext.InitialAccordionHeight - 25 + 'px');
    }
};

$(window).resize(function () {
    $('#searchProfilesSelector').accordion("refresh");
});


$(document).ready(function () {
    $('.arrow-left-sidebar-bottom').click(function () {
        if ($('.arrow-left-sidebar-bottom').hasClass('disabled')) return;

        OMWClientContext.AccordionScrollDelta++;
        OMWClientContext.UpdateVisiblePaneItems(OMWClientContext.AccordionScrollDelta);
    });

    $('.arrow-left-sidebar-top').click(function () {
        if ($('.arrow-left-sidebar-top').hasClass('disabled')) return;

        OMWClientContext.AccordionScrollDelta--;
        OMWClientContext.UpdateVisiblePaneItems(OMWClientContext.AccordionScrollDelta);
    });
});

OMWClientContext.RecycleBinOpen = function (paneId, searchProfileId) {
    if (!e)
        var e = window.event;

    if ($.browser.msie) {
        e.cancelBubble = true;
    }
    else {
        e.stopPropagation();
    }

    var url = OMWClientContext.GetFullUrl('Search/SearchMain/RecycleBin/' + searchProfileId + '/' + paneId);
    location.href = url;
};


OMWClientContext.RecycleBinOpenInNewWindow = function (paneId, searchProfileId) {
    if (!e)
        var e = window.event;

    if ($.browser.msie) {
        e.cancelBubble = true;
    }
    else {
        e.stopPropagation();
    }

    var url = OMWClientContext.GetFullUrl('Search/SearchMain/RecycleBin/' + searchProfileId + '/' + paneId);

    OMWClientContext.OpenUrlInNewTab(url);
};

OMWClientContext.OpenUrlInNewTab = function (url) {
    if ($.browser.msie) {
        window.open(url, '_blank');
    }
    else if ($.browser.mozilla) {

        var lastUrl = window.location.href;
        if (lastUrl[lastUrl.length - 1] == '#') {
            lastUrl = lastUrl.substring(0, lastUrl.length - 1);
            window.location = lastUrl;
        }

        window.location = lastUrl;

        var no = Math.random() * 10;
        window.open(url, '_newtab' + no);

        alert();
    }
    else {
        window.open(url, '_newtab' + Math.random() * 11);
    }
};