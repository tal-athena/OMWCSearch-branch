/// <reference path="MicrosoftMvcAjax.debug.js" />
/// <reference path="jquery-1.9.1.js" />
/// <reference path="jquery-1.9.1.intellisense.js" />
//// Class OMWClientContext
var OMWClientContext = OMWClientContext || function () { };

var selectItem = null;


//// Properties
OMWClientContext.ServerUrl = '';
OMWClientContext.NavigationPaneNumber = 0;
OMWClientContext.NavigationPaneId = 0;
OMWClientContext.NavigationPaneItemId = 0;
OMWClientContext.RedrawNavigation = true;

OMWClientContext.IsEditMode = false;
OMWClientContext.IsTableMode = false;
OMWClientContext.PreviewRow = null;

ServerUpdates = {
        isSuspended: false
    };

ServerUpdates.suspendPolling = function()
{
    ServerUpdates.isSuspended = true;
};

ServerUpdates.enablePolling = function()
{
    ServerUpdates.isSuspended = false;
};

///// Public Methods
// Init Method
OMWClientContext.Init = function (serverUrl, navigationPaneNumber, navigationPaneId, navigationPaneItemId) {
    OMWClientContext.ServerUrl = serverUrl;
    OMWClientContext.NavigationPaneNumber = navigationPaneNumber;
    OMWClientContext.NavigationPaneId = navigationPaneId;
    OMWClientContext.NavigationPaneItemId = navigationPaneItemId;
    OMWClientContext.RedrawNavigation = true;
    //this._InitInternal(serverUrl);
};

// Define Init method (public)
OMWClientContext.InitStory = function (serverUrl) {
    OMWClientContext.Init(serverUrl);
    if (!!OMWClientContext.Story) {
        OMWClientContext.Story._InitInternal();
    }
};

// Only Numbers Method
OMWClientContext.OnlyNumbers = function (evt) {
    var e = event || evt; // for trans-browser compatibility
    var charCode = e.which || e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
};


OMWClientContext.OpenStoryInNewTab = function (id, documentType) {
    if (documentType) {
        window.open('/OMWebiSearch/Collection/Editor/Index/' + id, '_blank');
    }
    else {
        window.open(OMWClientContext.GetFullUrl('Story/EditStory/Index/' + id), '_blank');
    }
};


OMWClientContext.LoadStory = function (id, documentType) {
    if (documentType) {
        location.href = '/OMWebiSearch/Collection/Editor/Index/' + id;
    }
    else {
        location.href = OMWClientContext.GetFullUrl('Story/EditStory/Index/' + id);
    }
};



OMWClientContext.SetupHeaderFields = function ()
{
    $('#fnPaneContainer').css("display", "none");

    var dateTimePickers = $('.dateTimePicker');
    dateTimePickers.each(function () {
        // console.log($(this));
        var Format = $(this).data('dateformat').split(' ');
        if (Format != "") {
            var dateFormat = Format[0];
            var timeFormat = Format[1];


            console.log(timeFormat);

            var showHours = true;
            if (timeFormat.indexOf('h') < 0 & timeFormat.indexOf('H') < 0) {
                showHours = false;
            }
            var showSeconds = true;
            if (timeFormat.indexOf('s') < 0 & timeFormat.indexOf('S') < 0) {
                showSeconds = false;
            }

            //  console.log(dateFormat);
            $(this).datetimepicker({
                timeFormat: timeFormat,
                dateFormat: dateFormat,


                showSecond: showSeconds,
                showHour: showHours,


                onClose: function (datetimeText, datepickerInstance) {
                    if ($(this).attr("fieldId")) {
                        //OMWClientContext.Story.EndEditStory($(this).attr("fieldId"), this);
                        console.log(this.value);
                    }
                }
            });
        }
        else {
            //Important for DEV version
            //Just show date time picker with default values
            $(this).datetimepicker();
        }

    });
    var datePickers = $('.datePicker');
    datePickers.each(function () {
        var dateFormat = $(this).data('dateformat');
        if (!!dateFormat && dateFormat != "") {
            $(this).datepicker({
                dateFormat: dateFormat,
            });
        }
        else {
            //Important for DEV version
            //Show date time picker with default values
            $(this).datepicker();
        }
    });

    var timePickers = $('.timePicker');
    timePickers.each(function () {
        var timeFormat = $(this).data('timeformat');
        if (!!timeFormat && timeFormat != "") {
            var showHours = true;
            if (timeFormat.indexOf('h') < 0 & timeFormat.indexOf('H') < 0) {
                showHours = false;
            }
            var showSeconds = true;
            if (timeFormat.indexOf('s') < 0 & timeFormat.indexOf('S') < 0) {
                showSeconds = false;
            }

            $(this).timepicker({

                showSecond: showSeconds,
                showHour: showHours,

                timeFormat: timeFormat,
            });
        }
        else {
            //Important for DEV version
            //Show date time picker with default values
            $(this).timepicker();
        }
    });


    //$('.dateTimePicker').datetimepicker({
    //    timeFormat: 'HH:mm:ss',
    //    dateFormat: 'dd.mm.yy',

    //    //showSecond: true,

    //    onClose: function (datetimeText, datepickerInstance) {
    //        if ($(this).attr("fieldId")) {
    //            //OMWClientContext.Story.EndEditStory($(this).attr("fieldId"), this);
    //            console.log(this.value);
    //        }
    //        //var dateTime = datetimeText.split(' ');
    //        //$('#' + datepickerInstance.id).val(dateTime[0]);
    //    }
    //});
    //$('.datePicker').datepicker({
    //    dateFormat: 'dd.mm.yy',

    //});
    //$('.timePicker').timepicker({
    //    timeFormat: 'HH:mm:ss',
    //});

    $('.durationPicker').timepicker({
        timeFormat: 'HH:mm:ss',
        showSecond: true,
    });

    $('.SearchInput').hover(function () {
        $(this).addClass('input-active');
    }, function () {
        $(this).removeClass('input-active');
    });
};

// GetFullUrl Method (public) - (concatenates the server url with the provided partial url)
OMWClientContext.GetFullUrl = function (partialUrl) {
    return this.ServerUrl + partialUrl;
};

// Delay Method (public)
OMWClientContext.Delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();


OMWClientContext.ProcessAjaxErrorSaveStory = function (xhr) {
    var data = {};

    //console.log(xhr);
    //console.log(xhr.status);

    if (xhr.status == 401) {
        data = { status: "error", error: { message: "Session expired." }, saveStory: "yes" };
    }
    else {
        data = { status: "error", error: { message: "Error." }, saveStory: "yes" };
    }
    OMWClientContext.ProcessResponse(data);
}

OMWClientContext.ProcessAjaxError = function (xhr, textStatus, error) {
    var data = {};

    console.log(xhr);
    console.log(xhr.status);

    if (xhr.status == 401) {
        data = { status: "error", error: { message: "Session expired." } };
    }
    else {
        var uid = "n" + Guid();
        data = {
            status: "error", error: {
                message: "<a href='#' onclick='Notification.ShowModal(\"" + uid + "\");return false;'>Error.</a>",
                modalHtml: xhr.responseText,
                modalTitle: error,
                uid: uid
            }
        };
    }
    OMWClientContext.ProcessResponse(data);
}

OMWClientContext.ProcessResponse = function (data) {

    //console.log(data);

    //console.log(data.status);

    if (!data.saveStory) {
        data.saveStory = "no";
    }

    if (data.status == "success") {
        console.log('success');
    }

    //if (data.status != "success" || data.status != "OK") {

    //It should probably be &&
    //if (data.status != "success" && data.status != "OK") {
    if (data.status != "success") {

        var notification = { message: data.error.message, modalTitle: data.error.modalTitle, modalHtml: data.error.modalHtml, saveStory: data.saveStory, uid: data.error.uid };
        Notification.PushNotification(notification);
        return false;
    }

    return true;
};

OMWClientContext.StoryPreviewed = function (objid) {
    $.ajax({
        type: 'POST',
        url: OMWClientContext.GetFullUrl('Search/SearchMain/ReadItem'),
        data: {
            objectId: objid
        },
        success: function (data) {
            if (OMWClientContext.ProcessResponse(data)) {

            }
        },
        error: function (xhr, textStatus, error) {
            OMWClientContext.ProcessAjaxError(xhr);
        }
    });
};

OMWClientContext.NotificationTest = function (testMethod) {
    $.ajax({
        type: 'POST',
        url: OMWClientContext.GetFullUrl('Search/SearchMain/' + testMethod),
        data: {
            objectId: 0
        },
        success: function (data) {
            if (OMWClientContext.ProcessResponse(data)) {

            }
        },
        error: function (xhr, textStatus, error) {
            OMWClientContext.ProcessAjaxError(xhr, textStatus, error);
        }
    });
};

OMWClientContext.ExpandLeft = function () {
    $("#leftPanel").toggleClass('leftPanelOpened leftPanelClosed');
    var leftSlidebarMWidth = 274;
    var newLeftPanelWidth = 290;
    $("#leftSlidebarM").animate({ width: leftSlidebarMWidth }, "slow", "linear", function () { });
    $("#leftPanel").animate({ width: newLeftPanelWidth, }, "slow", "linear", function () {
        //we set the correct class for slider
        $("#leftTogglerBar").removeClass('expand expandActive');
        $("#leftTogglerBar").addClass('collapse collapseActive');
        OMWClientContext.SliderLeftDone();
    });
};
OMWClientContext.CollapseLeft = function () {
    $("#leftPanel").toggleClass('leftPanelOpened leftPanelClosed');
    var collapsedSliderWidth = 28 + 10;
    var newLeftPanelWidth = collapsedSliderWidth;//.expand class width
    $("#leftSlidebarM").animate({ width: 0 }, "slow", "linear", function () { });
    $("#leftPanel").animate({ width: newLeftPanelWidth, }, "slow", "linear", function () {
        //we set the correct class for slider
        $("#leftTogglerBar").removeClass('collapse collapseActive');
        $("#leftTogglerBar").addClass('expand expandActive');
        OMWClientContext.SliderLeftDone();
    });
};

OMWClientContext.CollectionRightPanelLoadData = function (id) {
    //Check if right preview pane is opened
    if ($('#rightSlidebarM').hasClass('openedRightTab')) {

        $('#iframeStoryHLoader').show();

        $('#iframeStoryH').on('load', function () {
            $('#iframeStoryH').contents().find('#containerM').css({
                'overflow-y': 'auto',
                'height': 'auto'
            });

            $('#iframeStoryHLoader').hide();
        });

        //Check if the story id is changed
        var storyHUrl = OMWClientContext.ServerUrl + "StoryH/StoryH/Index/" + id + "?checkReadonly=true";
        $('#iframeStoryH').attr('src', storyHUrl);
    }
}

OMWClientContext.RightPanelInterval;
//loads data for right panel
OMWClientContext.RightPaneleLoadData = function () {

    if ($('#hdnPageType').val() == 'Collection') {
        var scope = angular.element('#collectionPage').scope();

        $('#previewButtonsContainer').hide();
        $('#previewHeaderContainer').hide();
        $('#searchResultGridDetailView').hide();
        $('#iframeContainerStoryH').show();

        if (!scope.selectedRow) {
            if (scope.gridOptions.data.length > 0) {
                scope.selectedRow = scope.gridOptions.data[0];
                scope.gridOptions.data[0].selected = true;
            }
            else {
                //Do not show loading animation
                $('#iframeStoryHLoader').hide();
            }
        }
        if (!!scope.selectedRow) {
            $('#rightSlidebarM').addClass('openedRightTab');
            $('#rightSlidebarM').removeClass('closedRightTab');
            OMWClientContext.CollectionRightPanelLoadData(scope.selectedRow.id);
        }
    }
    else {
        $('#iframeContainerStoryH').hide();
        $('#previewButtonsContainer').show();
        $('#previewHeaderContainer').show();
        $('#searchResultGridDetailView').show();

        //prepare datarightSlidebarM
        var scope = OMWClientContext.SearchResults._GetAngularScope();
        //AJAX CALL for updating the Previewed state
        if (notifyReadItems == true) {
            if (scope.selectedRow && scope.selectedRow.itemRead == false) {
                scope.selectedRow.itemRead = true;
                OMWClientContext.StoryPreviewed(scope.selectedRow.ID.EncodedID);
            }
        }
    }
};

//expands right panel
OMWClientContext.ExpandRight = function () {
    OMWClientContext.RightPaneleLoadData();

    //visual 
    $("#rightTogglerBar").toggleClass('expandR expandRActive');
    $("#rightTogglerBar").toggleClass('collapseR collapseRActive');
    $('#rightSlidebarM').addClass('openedRightTab');
    $('#rightSlidebarM').removeClass('closedRightTab');


    //if ($('#hdnPageType').val() == 'Collection') {
    //    $('#rightSlidebarM').css('height', $(window).height() - $('#headerM').height());
    //}


    //$("#rightSlidebarM").css({ height: '100%' });
    $("#rightSlidebarM").css({ width: '50%' });
    //$("#rightSlidebarMInner").css({ height: $('#contentM').height() });

    //$("#rightSlidebarMInner").css({ width: $("#rightSlidebarM").width() });
    //$("#rightSlidebarM").css({ width: '1%' }); //small value to start animate from
    // $("#rightPreviewContainer").css({ height: '100%' });
    $("#rightPreviewContainer").show();

    OMWClientContext.SliderRightDone();

    $('#splitterContentPanel.split-pane').splitPane('lastComponentSize', $('#splitterContentPanel').width() / 2);

    //Show resize bar
    $('#rightSplitterDivider').show();
};

//collapses right panel
OMWClientContext.CollapseRight = function () {

    window.clearInterval(OMWClientContext.RightPanelInterval);

    $("#rightTogglerBar").toggleClass('expandR expandRActive');
    $("#rightTogglerBar").toggleClass('collapseR collapseRActive');
    $('#rightSlidebarM').removeClass('openedRightTab');
    $('#rightSlidebarM').addClass('closedRightTab');


    $("#rightPreviewContainer").hide();
    OMWClientContext.SliderRightDone();

    //Hide resize bar
    $('#rightSplitterDivider').hide();

    //Unload StoryH
    $('#iframeStoryH').attr('src', '');

    $('#splitterContentPanel.split-pane').splitPane('firstComponentSize', $('#splitterContentPanel').width() - 28);
};

//misc functions to run after right panel animation done
OMWClientContext.SliderRightDone = function () {
    OMWClientContext.AdjustWholeHeight();
    OMWClientContext._FixContentMWidth();
    if (OMWClientContext.SearchResults && OMWClientContext.SearchResults.updateLayout) {
        OMWClientContext.SearchResults.updateLayout();
    }
    $(window).trigger('resize');

    setTimeout(function()
    {
        $(window).trigger('resize');
    }, 100);
    
    console.log($('#previewHeaderContainer').html());
};

//Fixes page elements after left slider worked
OMWClientContext.SliderLeftDone = function () {
    OMWClientContext._FixContentMWidth();
    //if (OMWClientContext.Story != null) {
    //    OMWClientContext.Story.Resize();
    //}
    if (OMWClientContext.SearchResults && OMWClientContext.SearchResults.updateLayout) {
        OMWClientContext.SearchResults.updateLayout();
    }
    $(window).trigger('resize');
};

OMWClientContext.CollapseTop = function () {
    $("#searchProfileTogglerBar").toggleClass('collapseV collapseVActive');
    $("#searchProfileTogglerBar").toggleClass('expandV expandVActive');
    $("#headerPanel").animate({ height: '0' }, function () {
        $("#headerPanel").hide();
        OMWClientContext.SliderTopDone();
    });

};
OMWClientContext.SliderTopDone = function () {

    OMWClientContext._FixContentMWidth();
    if (OMWClientContext.SearchResults && OMWClientContext.SearchResults.updateLayout) {
        OMWClientContext.SearchResults.updateLayout();
    }
    $(window).trigger('resize');
};

//// Private methods
// InitInternal Method (private)

///////////  TOOLBAR   ///////////

OMWClientContext.toolbarButtonsData = [];
OMWClientContext.toolbarButtonsWidth = [];
OMWClientContext.toolbarButtons = [];
OMWClientContext.toolbarAllButtonsWidth = 0;
OMWClientContext.toolbarMoreButtonWidth = 100;
OMWClientContext.toolbarVisibleButtonsWidth = 0;
OMWClientContext.toolbarLastCollapsedButtonIndex = -1;
OMWClientContext.toolbarCollapsed = false;
OMWClientContext.ToolbarURL = '';
OMWClientContext.ToolbarCurrentPage = '';

OMWClientContext.ToolbarButtonClick = function (btn) {

    //Get current button object
    var item = OMWClientContext.toolbarButtonsData[$(btn).data('position')];
    //If it is one of the static buttons just return from this function
    //because the static buttons should have their own event handlers
    if (!item) {
        return;
    }

    //Show loading animation
    var $img = $(btn).find('img');
    var $toolbarButtonAnimation = $('<span class="toolbarButtonLoading" />');
    $(btn).prepend($toolbarButtonAnimation);
    $img.addClass('toolbarButtonAlphaIcon');


    //Assing btn to DOM btn (so in case of error two state buttons can be returned to previous state)
    item.btn = btn;
    item.$img = $img;
    item.$toolbarButtonAnimation = $toolbarButtonAnimation;
    //Get ids for the current page
    var ids = OMWClientContext.ToolbarGetIDs(item);
    //If there are no ids then do not make ajax call
    if (ids.length > 0) {
        //Check if the button is twoStateButton
        if (item.twoStateButton) {

            //Check if it has checked class
            if ($(btn).hasClass('toolbarButtonActive')) {
                //Check if there is message to be shown to user (YES/NO)
                if (item.askBeforeSendingReleaseCommands != null && item.askBeforeSendingReleaseCommands != "") {
                    if (confirm(item.askBeforeSendingReleaseCommands)) {

                        //Make ajax no. 2
                        OMWClientContext.ToolbarAjaxCall(item, item.ToolCommandList_Release, ids);
                        $(btn).removeClass('toolbarButtonActive');
                    }
                }
                else {
                    //Make ajax no. 2
                    OMWClientContext.ToolbarAjaxCall(item, item.ToolCommandList_Release, ids);
                    $(btn).removeClass('toolbarButtonActive');
                }

            }
            else {
                if (item.askBeforeSendingPressCommands != null && item.askBeforeSendingPressCommands != "") {
                    if (confirm(item.askBeforeSendingPressCommands)) {

                        //Make ajax no. 1
                        OMWClientContext.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
                        $(btn).addClass('toolbarButtonActive');
                    }
                }
                else {
                    //Make ajax no. 1
                    OMWClientContext.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
                    $(btn).addClass('toolbarButtonActive');
                }
            }
        }
        else {
            if (item.askBeforeSendingPressCommands != null && item.askBeforeSendingPressCommands != "") {
                if (confirm(item.askBeforeSendingPressCommands)) {

                    //Do ajax no.1
                    OMWClientContext.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
                }
            }
            else {
                //Do ajax no.1
                OMWClientContext.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
            }
        }
    }
    else {
        //Remove toolbar button animation
        item.$img.removeClass('toolbarButtonAlphaIcon');
        item.$toolbarButtonAnimation.remove();
    }
};
OMWClientContext.ToolbarAjaxCall = function (item, commands, ids) {

    $.ajax(OMWClientContext.ToolbarURL, {
        dataType: "json",
        data: {
            ToolCommandList: JSON.stringify(commands),
            IDs: ids,
            Context: item.Context
        },
        type: 'POST',
        traditional: true
    })
    .done(function (data) {
        //If the ImmediateReturn is set to false, show response in alert
        if (!item.ImmediateReturn) {
            //Check if alert should be shown only if there is error
            if (item.PopUpOnlyError) {
                //Show only if there is error
                if (data.status.toLowerCase() == 'error') {
                    alert(data.message);
                }
            }
            else {
                //Always show message
                alert(data.message);
            }
        }
        //Check if needed to return to previous state (if data.status == 'error')
        if (item.twoStateButton) {
            if (data.status.toLowerCase() == 'error') {
                //Return to previous state
                $(item.btn).toggleClass('toolbarButtonActive');
            }
        }
    })
    .fail(function (data) {
        if (item.twoStateButton) {
            //Return to previous state when ajax failed
            $(item.btn).toggleClass('toolbarButtonActive');
        }
        alert('Error while executing command.');
    })
    .always(function () {
        item.$img.removeClass('toolbarButtonAlphaIcon');
        item.$toolbarButtonAnimation.remove();
    });
};
OMWClientContext.ToolbarGetIDs = function (item) {
    var ids = [];

    if (OMWClientContext.ToolbarCurrentPage == 'Search') {
        //Get selected DocIds in search results, if there are no selected searchResults do not make ajax
        var scope = angular.element('#searchResultsOptions').scope();
        console.log(scope.selectedRows);
        for (var i = 0; i < scope.selectedRows.length; i++) {
            ids.push(scope.selectedRows[i].ID.EncodedID);
        }
    }
    else if (OMWClientContext.ToolbarCurrentPage == 'Story') {
        //Get story id
        var storyId = $('#hdnStoryId').val();
        ids.push(storyId);
    }
    else {
        if (item.ApplyToSubItems) {
            //Get selected lines from grid
            var entityGrid = $("#collectionGrid").data("kendoGrid");
            var rows = entityGrid.select();
            for (var i = 0; i < rows.length; i++) {
                var selectedItem = entityGrid.dataItem(rows[i]);
                ids.push(selectedItem.Id);
            }
        }
        else {
            //Get id of collection
            var collectionId = $('#hdnStoryId').val();
            ids.push(collectionId);
        }
    }

    return ids;
};
OMWClientContext.ToolbarStart = function () {

    //Url for action in ToolbarController
    OMWClientContext.ToolbarURL = $('#hdnTopLevelBaseUrl').val() + 'Toolbar2/Event';

    //Get page type
    OMWClientContext.ToolbarCurrentPage = $('#hdnPageType').val();

    //Get the data
    var data = $('#hdnToolbarButtonsData').val();
    if (data) {
        OMWClientContext.toolbarButtonsData = JSON.parse(data);
    }
    else {
        //If there is no data (first page) assign to it empty array
        OMWClientContext.toolbarButtonsData = [];
    }

    //Combobox in toolbar
    var toolbarComboboxData = JSON.parse($('#hdnToolbarComboboxValue').val());
    var selectedValue = OMWClientContext.getParameterByName('viewID', window.location.href);
    if (!selectedValue) {
        selectedValue = $('#hdnSelectedViewID').val();
    }

    $("#toolbarCombobox").kendoComboBox({
        dataTextField: "title",
        dataValueField: "viewID",
        dataSource: toolbarComboboxData,
        dataBound: function (e) {
            $('.toolbarComboboxItem').click(function (event) {
                event.stopPropagation();

                var id = $(this).data('viewId');

                var url = window.location.href;
                url = OMWClientContext.removeURLParameter(url, 'viewID');
                if (url.indexOf('?') > -1) {
                    url += '&viewID=' + id
                } else {
                    url += '?viewID=' + id
                }
                window.location.href = url;
            });
        },
        template: '<table class="historyComboboxItem" style="table-layout:fixed; width:97%;"><tr class="toolbarComboboxItem" data-view-id="${ data.viewID }"><td style="width:25px;"><img style="width:24px;height:24px;" src=\"${data.iconRelativePath}\" alt=\"${data.title}\" /></td>' +
                     '<td><span class="wrapword">${ data.title }</span></td></tr></table>',
    });
    for (var i = 0; i < toolbarComboboxData.length; i++) {
        if (toolbarComboboxData[i].viewID === selectedValue) {
            $("#toolbarCombobox").data("kendoComboBox").select(i);
            break;
        }
    }


    $('.toolbarMenuButton').click(function (e) {
        e.preventDefault();

        //Hide More list
        $('.toolbarMoreItems').hide();
        $('.toolbarOverlay').hide();

        OMWClientContext.ToolbarButtonClick(this);
    });


    $('.toolbarMoreButton').click(function (e) {

        //Set position
        var position = $('.toolbarMoreButton').position();
        $('.toolbarMoreItems').css('left', (position.left - $('.toolbarMoreItems').width() + 68) + "px");

        $('.toolbarMoreItems').show();
        $('.toolbarOverlay').show();
    });
    $('.toolbarOverlay').click(function () {
        $('.newInItems').hide();
        $('.toolbarMoreItems').hide();
        $('.saveMoreItems').hide();
        $('.toolbarOverlay').hide();
    });

    $('.saveMoreButton').click(function (e) {
        
        //Set position
        var position = $('.saveMoreButton').position();
        $('.saveMoreItems').css('left', (position.left - $('.saveMoreItems').width() + 68) + "px");
        $('.saveMoreItems').show();
        $('.toolbarOverlay').show();
    });

    var toolbarButtons = $('.toolbarCustomButton');
    if (toolbarButtons.length == 0) {
        //Hide toolbar
        $('.toolbarWrapper').hide();
    }
    else {
        OMWClientContext.toolbarButtons = toolbarButtons;
        toolbarButtons.click(function () {
            OMWClientContext.ToolbarButtonClick(this);
        });
        toolbarButtons.each(function (i, e) {
            var width = $(e).width() + 30;
            OMWClientContext.toolbarAllButtonsWidth += width;
            OMWClientContext.toolbarButtonsWidth.push(width);
        });

        //Add width of viewID dropdown
        OMWClientContext.toolbarAllButtonsWidth += 160;
        OMWClientContext.toolbarButtonsWidth.push(160);

        OMWClientContext.toolbarVisibleButtonsWidth = OMWClientContext.toolbarAllButtonsWidth;

        OMWClientContext.AdjustToolBar();
    }

	//OMWClientContext.StartWebWorker();
    OMWClientContext.LoadSelectionLists();
};

OMWClientContext.WebWorker = null;
OMWClientContext.StartWebWorker = function()
{
	if (typeof (SharedWorker) !== "undefined")
	{
		if (!OMWClientContext.WebWorker)
		{
			OMWClientContext.WebWorker = new SharedWorker(OMWClientContext.ServerUrl + "Scripts/Shared/WebWorker/OMWebAppKernel.js");

			OMWClientContext.WebWorker.port.addEventListener("message",
					function (event)
					{
						var data = event.data;
						if (!!data)
						{
							if (!!data.tickersInfo)
							{
								OMWClientContext.InitTicker(data.tickersInfo);
								OMWClientContext.UpdateTickerAnimation();
							}
							if (!!data.updateTickersInfo)
							{
								OMWClientContext.TickersInfo = data.updateTickersInfo;
							}
							else if (!!data.tickers)
							{
								OMWClientContext.Tickers = data.tickers;
								OMWClientContext.UpdateTicker();
							}
						}
					}, false);

			OMWClientContext.WebWorker.port.start();
		}
	}
	else
		console.error('SharedWorker is not supported');
};

OMWClientContext.TickerHover = false;
OMWClientContext.TickerPopupVisible = false;

OMWClientContext.PopupTickerDataIndex = -1;
OMWClientContext.PopupTickerHitIndex = -1;

OMWClientContext.TickerButtonMenuIndex = -1;

OMWClientContext.TickersInfo = null;
OMWClientContext.Tickers = [];

OMWClientContext.InitTicker = function (tickersInfo)
{
	OMWClientContext.TickersInfo = tickersInfo;

	OMWClientContext.InitTickerButtons();

	var tickerContainer = $(".tickerContainer");
	if ($('#hdnStoryId').length > 0)
		tickerContainer.css("margin", "0");

	tickerContainer.mouseenter(function()
	{
		OMWClientContext.TickerHover = true;
		OMWClientContext.UpdateTickerAnimation();
	});

	tickerContainer.mouseleave(function ()
	{
		OMWClientContext.TickerHover = false;
		OMWClientContext.UpdateTickerAnimation();
	});

	tickerContainer.css("display", "block");

	OMWClientContext.InitTickerMenu();
	OMWClientContext.InitTickerPopup();
};

OMWClientContext.UpdateTickerAnimation = function()
{
	if (OMWClientContext.Tickers.length > 0 && !OMWClientContext.TickerHover && !OMWClientContext.TickerPopupVisible && OMWClientContext.TickerButtonMenuIndex === -1)
		$(".ticker").removeClass("ticker-pause");
	else
		$(".ticker").addClass("ticker-pause");
};

OMWClientContext.UpdateTicker = function ()
{
	var ticker = $(".ticker");
	var tickerText = ticker.children().first();

	var text = "";
	for (var i = 0; i < OMWClientContext.Tickers.length; i++)
	{
		var tickerData = OMWClientContext.Tickers[i];
		var color = OMWClientContext.GetTickerColor(tickerData.lowId);

		for (var j = 0; j < tickerData.hits.length; j++)
		{
			var hit = tickerData.hits[j];

			if (text.length > 0)
				text += " <span>&#x25cf;</span> ";

			text += "<span class='ticker-title' data-ticker-index='" + i + "' data-ticker-hit-index='" + j + "' style='color: " + color + "'>" + hit.PreviewHeader + "</span>";
		}
	}

	tickerText.html(text);

	var tickerContainer = $(".tickerContainer");

	var speed = 80; // pixels per second
	var width = tickerContainer.width();

	var duration = width / speed;
	ticker.css("animation-duration", duration + "s");
	ticker.css("-webkit-animation-duration", duration + "s");

	OMWClientContext.UpdateTickerButtons();
	OMWClientContext.UpdateTickerAnimation();
};

function getTickerData(tickerIndex)
{
	if (tickerIndex >= 0 && tickerIndex < OMWClientContext.Tickers.length)
		return OMWClientContext.Tickers[tickerIndex];

	return null;
}

function getTickerHit(tickerIndex, tickerHitIndex)
{
	var tickerData = getTickerData(tickerIndex);
	if (!!tickerData)
	{
		if (tickerHitIndex >= 0 && tickerHitIndex < tickerData.hits.length)
			return tickerData.hits[tickerHitIndex];
	}

	return null;
}

OMWClientContext.InitTickerMenu = function()
{
	$("body").on("click",
		function (e)
		{
			var target = $(e.target);
			if (target.closest(".ticker-menu").length === 0)
				OMWClientContext.HideTickerMenu();
		});

	var menu = $(".ticker-menu");
	
	menu.on("click",
		"#ticker-menu-active",
		function()
		{
			var index = OMWClientContext.TickerButtonMenuIndex;
			if (index >= 0 && index < OMWClientContext.TickersInfo.tickerSearchInfos.length)
			{
				var tickerInfo = OMWClientContext.TickersInfo.tickerSearchInfos[index];

				var isActive = tickerInfo.active !== undefined ? !tickerInfo.active : false;

				OMWClientContext.WebWorker.port.postMessage({
						setActiveIndex: OMWClientContext.TickerButtonMenuIndex,
						isActive: isActive
					});
			}

			OMWClientContext.HideTickerMenu();
		});

	menu.on("click",
		"#ticker-menu-open-hit",
		function ()
		{
			var hit = null;

			var index = OMWClientContext.TickerButtonMenuIndex;
			if (index >= 0 && index < OMWClientContext.TickersInfo.tickerSearchInfos.length)
			{
				var tickerInfo = OMWClientContext.TickersInfo.tickerSearchInfos[index];
				for (var i = 0; i < OMWClientContext.Tickers.length; i++)
				{
					var ticker = OMWClientContext.Tickers[i];
					if (ticker.lowId == tickerInfo.lowId)
					{
						if (ticker.hits.length > 0)
							hit = ticker.hits[ticker.hits.length - 1];

						break;
					}
				}
			}

			if (!!hit)
			{
				var url = GetSearchResultURL(hit);
				window.open(url, '_blank');
			}

			OMWClientContext.HideTickerMenu();
		});

	menu.on("click",
		"#ticker-menu-open-search",
		function ()
		{
			var index = OMWClientContext.TickerButtonMenuIndex;
			if (index >= 0 && index < OMWClientContext.TickersInfo.tickerSearchInfos.length)
			{
				var tickerInfo = OMWClientContext.TickersInfo.tickerSearchInfos[index];
				var url = GetTickerSearchURL(tickerInfo);
				window.open(url, '_blank');

				OMWClientContext.HideTickerMenu();
			}
		});
};

OMWClientContext.ShowTickerMenu = function(e)
{
	var index = $(e.target).closest("button").index();
	if (index >= 0 && index < OMWClientContext.TickersInfo.tickerSearchInfos.length)
	{
		e.stopPropagation();
		e.preventDefault();

		OMWClientContext.HideTickerMenu();

		OMWClientContext.TickerButtonMenuIndex = index;
		OMWClientContext.UpdateTickerAnimation();

		var tickerChecked = $("#ticker-checked");
		var tickerUnchecked = $("#ticker-unchecked");

		var tickerInfo = OMWClientContext.TickersInfo.tickerSearchInfos[index];
		if (tickerInfo.active === false)
		{
			tickerChecked.hide();
			tickerUnchecked.show();
		}
		else
		{
			tickerUnchecked.hide();
			tickerChecked.show();
		}

		var rc = e.target.getBoundingClientRect();

		var menuWidth = 170;

		var top = rc.bottom + 3;
		var left = rc.left;
		if (left + menuWidth > document.body.clientWidth - 10)
			left = document.body.clientWidth - menuWidth;
		else if (left < 10)
			left = 10;

		var menu = $(".ticker-menu");
		menu.css("display", "flex");
		menu.css("left", left + "px");
		menu.css("top", top + "px");
	}
};

OMWClientContext.HideTickerMenu = function ()
{
	$(".ticker-menu").hide();
	OMWClientContext.TickerButtonMenuIndex = -1;
	OMWClientContext.UpdateTickerAnimation();
};

OMWClientContext.InitTickerPopup = function()
{
	$("body").on("click",
		function (e)
		{
			var target = $(e.target);
			if (target.closest(".ticker-popup").length === 0)
				closePopup();
		});

	var popup = $(".ticker-popup");

	popup.on("keydown",
		"button",
		function (e)
		{
			if (e.keyCode === 9)
			{
				e.preventDefault();
				e.stopPropagation();

				var index = $(e.target).index();

				if (e.shiftKey)
				{
					index--;
					if (index < 0)
						index = 2;
				}
				else
				{
					index++;
					if (index > 2)
						index = 0;
				}

				popup.find("button:nth-child(" + (index + 1) + ")").focus();
			}
		});

	popup.on("click",
		"#idTickerSetRead",
		function ()
		{
			var tickerData = getTickerData(OMWClientContext.PopupTickerDataIndex);
			if (!!tickerData)
			{
				var hitIndex = OMWClientContext.PopupTickerHitIndex;
				if (hitIndex >= 0 && hitIndex < tickerData.hits.length)
				{
					OMWClientContext.UpdateTicker();
					OMWClientContext.UpdateTickerButtons();

					OMWClientContext.WebWorker.port.postMessage({
							tickerIndex: OMWClientContext.PopupTickerDataIndex,
							tickerHitIndex: OMWClientContext.PopupTickerHitIndex
						});

					closePopup();
				}
			}
		});

	popup.on("click",
		"#idTickerOpen",
		function ()
		{
			var hit = getTickerHit(OMWClientContext.PopupTickerDataIndex, OMWClientContext.PopupTickerHitIndex);
			if (!!hit)
			{
				var url = GetSearchResultURL(hit);
				window.open(url, '_blank');
			}
		});

	popup.on("click",
		"#idTickerClose",
		function ()
		{
			closePopup();
		});

	function closePopup()
	{
		OMWClientContext.PopupTickerDataIndex = -1;
		OMWClientContext.PopupTickerHitIndex = -1;

		popup.hide();
		OMWClientContext.TickerPopupVisible = false;
		OMWClientContext.UpdateTickerAnimation();
	}

	var ticker = $(".ticker");

	ticker.on("click", ".ticker-title", function (e)
	{
		e.preventDefault();
		e.stopPropagation();
		var target = $(e.target);

		var tickerDataIndex = target.data("ticker-index");
		var tickerHitIndex = target.data("ticker-hit-index");

		var hit = getTickerHit(tickerDataIndex, tickerHitIndex);
		if (!hit)
			return;

		OMWClientContext.PopupTickerDataIndex = tickerDataIndex;
		OMWClientContext.PopupTickerHitIndex = tickerHitIndex;

		var rc = e.target.getBoundingClientRect();

		popup.css("display", "flex");

		var top = rc.bottom + 4;
		var left = rc.left;

		var popupWidth = popup.width() + 10;

		if (left + popupWidth > document.body.clientWidth - 10)
			left = document.body.clientWidth - popupWidth;
		else if (left < 10)
			left = 10;

		popup.css("left", left + "px");
		popup.css("top", top + "px");

		popup.find("button:first-child").focus();

		$(".ticker-popup-header").text(hit.PreviewHeader);

		var content = $(".ticker-popup-content");
		content.empty();
		content.append(hit.PreviewMain);

		OMWClientContext.TickerPopupVisible = true;
		OMWClientContext.UpdateTickerAnimation();
	});
};

OMWClientContext.InitTickerButtons = function()
{
	var buttons = $(".tickerContainer .ticker-buttons");

	var html = "";

	for (var i = 0; i < OMWClientContext.TickersInfo.tickerSearchInfos.length; i++)
	{
		var ticker = OMWClientContext.TickersInfo.tickerSearchInfos[i];
		var color = OMWClientContext.GetTickerColor(ticker.lowId);

		var hitsCount = 0;
		for (var j = 0; j < OMWClientContext.Tickers.length; j++)
		{
			var tickerData = OMWClientContext.Tickers[j];
			if (tickerData.lowId == ticker.lowId)
			{
				hitsCount = tickerData.hits.length;
				break;
			}
		}

		if (hitsCount === 0)
			hitsCount = "-";

		html += '<button><div class="ticker-circle" style="background: ' + color + '"></div>' +
				'<div data-ticker="' + ticker.lowId + '" style="color: ' + color + '">' + hitsCount + '</div>' +
				'</button><div></div>';
	}

	buttons.empty();
	buttons.append(html);

	buttons.on("click",
		"button",
		function(e)
		{
			OMWClientContext.ShowTickerMenu(e);
		});
};

OMWClientContext.UpdateTickerButtons = function()
{
	var ticker = $(".tickerContainer");
	for (var i = 0; i < OMWClientContext.Tickers.length; i++)
	{
		var tickerData = OMWClientContext.Tickers[i];
		var button = ticker.find('[data-ticker="' + tickerData.lowId + '"]');
		var buttonText = tickerData.hits.length > 0 ? tickerData.hits.length.toString() : "-";
		button.text(buttonText);
	}
};

OMWClientContext.GetTickerColor = function (lowId)
{
	for (var i = 0; i < OMWClientContext.TickersInfo.tickerSearchInfos.length; i++)
	{
		var ticker = OMWClientContext.TickersInfo.tickerSearchInfos[i];
		if (ticker.lowId == lowId)
		{
			for (var j = 0; j < OMWClientContext.TickersInfo.tickerStyles.length; j++)
			{
				var style = OMWClientContext.TickersInfo.tickerStyles[j];
				if (style.category == ticker.tickerCategory)
				{
					return intToRgba(style.color);
				}
			}

			break;
		}
	}

	return "#000";
};

function GetSearchResultURL(tickerHit)
{
	return OMWClientContext.GetFullUrl('Search/SearchMain/Index');
}

function GetTickerSearchURL(tickerSearch)
{
	return OMWClientContext.GetFullUrl('Search/SearchMain/Index');
}

function intToRgba(num)
{
	num >>>= 0;
	var b = num & 0xFF,
	    g = (num & 0xFF00) >>> 8,
	    r = (num & 0xFF0000) >>> 16,
	    a = ((num & 0xFF000000) >>> 24) / 255;
	return "rgba(" + [r, g, b, a].join(",") + ")";
}

OMWClientContext.LoadSelectionLists = function()
{
    setTimeout(function()
    {
        var storyId = $('#hdnStoryId').val();

        OMWClientContext.LoadJsonList(storyId);
        OMWClientContext.LoadHtmlList();
    }, 500);
};

OMWClientContext.LoadJsonList = function(storyId)
{
    $.ajax({
        type: 'POST',
        url: OMWClientContext.GetFullUrl('Document/SelectionLists/GetList?id=' + storyId),
        success: function(data)
        {
            if (!!data && Array.isArray(data))
            {
                var html = '';

                for (var i = 0; i < data.length; i++)
                {
                    var item = data[i];
                    html += '<li data-index=' +
                        i +
                        '>' +
                        '<div class="toolbarMenuButton">' +
                        '<img class="iconBox" src="' +
                        OMWClientContext.GetFullUrl(item.IconURL) +
                        '">' +
                        '<span class="menuButtonText">' +
                        item.Name +
                        '</span>' +
                        '</div>' +
                        '</li>';
                }

                var items = $('#newInItems');
                items.append(html);

                items.on("click",
                    "li",
                    function(e)
                    {
                        var index = $(this).data('index');
                        if (index >= 0 && index < data.length)
                        {
                            DocumentTypeId = data[index].ID;
                            ParentId = data[index].Directory;

                            OMWClientContext.CreateDocument.OnSaveDocument();
                        }
                    });

                // Just a simple code change - a comment
                $("body").on("keydown",
                    function(e)
                    {
                        if (e.keyCode >= 49 && e.keyCode <= 57 && e.altKey)
                        {
                            var index = e.keyCode - 49;

                            if (OMWClientContext.ToolbarCurrentPage === 'Story')
                            {
                                OMWClientContext.CreateTemplateFromHtml(index);
                            }
                            else if (OMWClientContext.ToolbarCurrentPage === 'Search')
                            {
                                OMWClientContext.CreateTemplateFromHtml(index);
                            }
                            else
                            {
                                var isGridFocused;
                                if (!!document.activeElement)
                                {
                                    var activeElement = $(document.activeElement);
                                    isGridFocused = activeElement.closest("#collectionPageGrid").length > 0;
                                }

                                if (isGridFocused)
                                    OMWClientContext.CreateTemplateFromJson(data, index);
                                else
                                    OMWClientContext.CreateTemplateFromHtml(index);
                            }
                        }
                        if (e.altKey && e.shiftKey && e.keyCode == 0x48) {
                            angular.element('div.ui-splitbar > a').triggerHandler('click');                            
                            //alert("test");
                        }
                    });
            }
        },
        error: function(xhr, textStatus, error)
        {
            OMWClientContext.ProcessAjaxError(xhr);
        }
    });
};

OMWClientContext.CreateTemplateFromJson = function(data, index)
{
    var dialog = $("#openModal");
    if (dialog.length === 0 || !dialog.hasClass('showModalDialog'))
    {
        if (index < data.length)
        {
            DocumentTypeId = data[index].ID;
            ParentId = data[index].Directory;

            OMWClientContext.CreateDocument.OnSaveDocument();

            return true;
        }
    }
};

OMWClientContext.CreateTemplateFromHtml = function (index)
{
    var html = OMWClientContext.NewSelectionListHtml;
    if (!!html)
    {
        html = $(html);
        var rows = html.find("tbody tr");
        if (index < rows.length)
        {
            var row = $(rows[index]);
            OMWClientContext.HandleSelectedTemplate(row.data("templateid"), row.data("dirid"));
        }
    }
};

OMWClientContext.HandleSelectedTemplate = function (templateId, parentId)
{
    alert("No focus\n\n" + templateId + '\n' + parentId);
};

OMWClientContext.LoadHtmlList = function (storyId)
{
    $.ajax({
        type: 'POST',
        url: OMWClientContext.GetFullUrl('Document/SelectionLists/ShowList?id=' + storyId),
        success: function (data)
        {
            if (!!data)
                OMWClientContext.NewSelectionListHtml = data;
        },
        error: function (xhr, textStatus, error)
        {
            OMWClientContext.ProcessAjaxError(xhr);
        }
    });
};

OMWClientContext.getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

OMWClientContext.removeURLParameter = function (url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        url = urlparts[0] + '?' + pars.join('&');
        return url;
    } else {
        return url;
    }
};

OMWClientContext.AddButtonToMoreMenu = function (btn) {
    var li = document.createElement('li');
    li.id = "toolbarMenuButton_" + $(btn).data('position');

    //Check if the button is in selected state
    var activeClass = '';
    if ($(btn).hasClass('toolbarButtonActive')) {
        activeClass = 'toolbarButtonActive';
    }
    var newLi = '<div class="toolbarMenuButton ' + activeClass + '" data-position="' + $(btn).data('position') + '">' +
        '<img class="iconBox" src="' + $(btn).find('img').attr('src') + '">' +
                                '<span class="menuButtonText">' + $(btn).find('span').text() + '</span>' +
                            '</div>';
    li.innerHTML = newLi;

    $('.toolbarMoreItems ul').prepend(li);
    $(li).find('.toolbarMenuButton').click(function (e) {
        e.preventDefault();

        //Hide More list
        $('.toolbarMoreItems').hide();
        $('.toolbarOverlay').hide();

        OMWClientContext.ToolbarButtonClick(this);
    });
};
OMWClientContext.RemoveButtonFromMoreMenu = function (btn) {
    $('#toolbarMenuButton_' + $(btn).data('position')).remove();
};
OMWClientContext.RemoveAllButtonsFromMoreMenu = function () {
    $('.toolbarMoreItems ul').empty();
    $('.toolbarMoreItems').hide();
};

OMWClientContext.AdjustToolBar = function ()
{
    var toolbarWidth = $('.toolbarWrapper').width();

    if (toolbarWidth <= OMWClientContext.toolbarVisibleButtonsWidth) {
        while (toolbarWidth <= OMWClientContext.toolbarVisibleButtonsWidth) {

            //If it is collapsed add it
            if (!OMWClientContext.toolbarCollapsed) {

                OMWClientContext.toolbarCollapsed = true;
                OMWClientContext.toolbarLastCollapsedButtonIndex = OMWClientContext.toolbarButtons.length - 1;

                //Hide button (add it to the More button)
                var currentButton = $(OMWClientContext.toolbarButtons[OMWClientContext.toolbarLastCollapsedButtonIndex--]);
                var currentButtonWidth = currentButton.width() + 30;
                currentButton.hide();

                OMWClientContext.AddButtonToMoreMenu(currentButton);
                OMWClientContext.toolbarVisibleButtonsWidth -= currentButtonWidth;

                //positionInArray
                $('.toolbarMoreButton').show();
                //OMWClientContext.toolbarVisibleButtonsWidth += $('.toolbarMoreButton').width() + 30;
                OMWClientContext.toolbarVisibleButtonsWidth += OMWClientContext.toolbarMoreButtonWidth;
                // $('.toolbarMenu').append(OMWClientContext.toolbarMoreButton);
            }
            else {
                //Hide button (add it to the More button)
                var currentButton = $(OMWClientContext.toolbarButtons[OMWClientContext.toolbarLastCollapsedButtonIndex--]);
                var currentButtonWidth = currentButton.width() + 30;
                currentButton.hide();

                OMWClientContext.AddButtonToMoreMenu(currentButton);
                OMWClientContext.toolbarVisibleButtonsWidth -= currentButtonWidth;
            }

        }
    }
    else {
        if (OMWClientContext.toolbarCollapsed) {
            //Get current width + width of next button
            var width = (OMWClientContext.toolbarVisibleButtonsWidth + OMWClientContext.toolbarButtonsWidth[OMWClientContext.toolbarLastCollapsedButtonIndex + 1]);
            //Check if this button is the last button in toolbar
            if (OMWClientContext.toolbarLastCollapsedButtonIndex + 2 == OMWClientContext.toolbarButtons.length) {
                //The last one button to be shown, remove More and show this button
                width -= OMWClientContext.toolbarMoreButtonWidth;
                if (toolbarWidth > width) {
                    //Sub the width of the More button
                    OMWClientContext.toolbarVisibleButtonsWidth -= OMWClientContext.toolbarMoreButtonWidth;

                    //Add the width of the last button
                    OMWClientContext.toolbarVisibleButtonsWidth += OMWClientContext.toolbarButtonsWidth[OMWClientContext.toolbarButtonsWidth.length - 1];

                    $('.toolbarMoreButton').hide();

                    //Show all buttons
                    $('.toolbarCustomButton').show();
                    OMWClientContext.RemoveAllButtonsFromMoreMenu();

                    //Reset index
                    OMWClientContext.toolbarLastCollapsedButtonIndex = OMWClientContext.toolbarButtonsWidth.length - 1;

                    OMWClientContext.toolbarCollapsed = false;
                }
            }
            else {
                //Check for the next button width
                while (toolbarWidth > width) {
                    if (OMWClientContext.toolbarLastCollapsedButtonIndex + 1 >= OMWClientContext.toolbarButtons.length - 1) {

                        OMWClientContext.toolbarVisibleButtonsWidth -= OMWClientContext.toolbarMoreButtonWidth;
                        //Add the width of the last button
                        OMWClientContext.toolbarVisibleButtonsWidth += OMWClientContext.toolbarButtonsWidth[OMWClientContext.toolbarButtonsWidth.length - 1];

                        $('.toolbarMoreButton').hide();

                        //Show all buttons
                        $('.toolbarCustomButton').show();

                        //Remove all buttonsFromMoreMenu
                        OMWClientContext.RemoveAllButtonsFromMoreMenu();


                        OMWClientContext.toolbarCollapsed = false;

                        //Reset index
                        OMWClientContext.toolbarLastCollapsedButtonIndex = OMWClientContext.toolbarButtonsWidth.length - 1;

                        break;
                    }
                    //Show button (add it to the toolbar)
                    OMWClientContext.toolbarLastCollapsedButtonIndex++;
                    var currentButton = $(OMWClientContext.toolbarButtons[OMWClientContext.toolbarLastCollapsedButtonIndex]);
                    currentButton.show();

                    OMWClientContext.RemoveButtonFromMoreMenu(currentButton);
                    var currentButtonWidth = currentButton.width() + 30;

                    //Add width to the variables
                    width += currentButtonWidth;
                    OMWClientContext.toolbarVisibleButtonsWidth += currentButtonWidth;
                }
            }
        }
        else {
            OMWClientContext.toolbarCollapsed = false;
            //Show all buttons
            $('.toolbarCustomButton').show();
            $('.toolbarMoreButton').hide();
        }
    }


};

//////////////////////

OMWClientContext.UpdateHeaderFields = function()
{
	setTimeout(function()
		{
			var $body = angular.element(document.body);
			var $rootScope = $body.scope().$root;
			$rootScope.$apply(function()
			{
				$rootScope.$broadcast("updateHeaderFields");
			});
		},
		650);
};

OMWClientContext.GetHeaderPanel = function()
{
	var headerPanel = $('.collectionHeader');

	if (headerPanel.length == 0)
		headerPanel = $('.storyHeader');

	if (headerPanel.length == 0)
		headerPanel = $('.searchProfileHeaderFieldsPreview');

	return headerPanel;
};

OMWClientContext.GetHeaderPanelContainers = function(headerPanel)
{
	return headerPanel.find('.headerFieldContainer,.headerFieldContainerMultiline,.searchFieldContainer,.searchFieldContainerMultiline');
};

OMWClientContext.GetHeaderPanelSplitContainerHeight = function (headerPanel)
{
	var splitContainer = headerPanel.closest("[ui-layout-container]");
	var height = splitContainer.height();

	return height;
};

OMWClientContext._FixContentMWidth = function (delayed)
{
	var headerPanel = OMWClientContext.GetHeaderPanel();
	if (headerPanel.length > 0)
    {
        if (delayed)
        {
            setTimeout(function()
                {
				OMWClientContext._FixCollectionHeaderFields(headerPanel);
                },
                100);
        }
        else
        {
			OMWClientContext._FixCollectionHeaderFields(headerPanel);
        }
    }
};

OMWClientContext._FixCollectionHeaderFields = function (headerPanel)
{
	if (!headerPanel || headerPanel.length == 0)
		return;

	var totalHeight = OMWClientContext.GetHeaderPanelSplitContainerHeight(headerPanel);
	if (totalHeight <= 0)
		return;

	var containers = OMWClientContext.GetHeaderPanelContainers(headerPanel);

	if (OMWClientContext.IsHeaderFieldsOrientationVertical())
	{
		headerPanel.css("display", "flex");
		headerPanel.css("flex-direction", "column");
		headerPanel.css("flex-wrap", "wrap");
		headerPanel.css("height", "100%");

		headerPanel.parent().css("height", "100%");

		var pageType = $('#hdnPageType').val();
		if (pageType == 'Search')
			headerPanel.parent().parent().css("height", "100%");

		if (pageType == 'Story')
		{
			headerPanel.css("width", "100%");
			headerPanel.css("overflow", "hidden");
			headerPanel.parent().css("overflow-y", "scroll");
			headerPanel.parent().parent().css("overflow-y", "hidden");
		}

		var totalRowsHeight = OMWClientContext.RenderColumnFields(containers, totalHeight);

		var parentHeight = headerPanel.parent().height();
		if (totalRowsHeight > parentHeight)
		{
			headerPanel.css("height", totalRowsHeight + 'px');
			headerPanel.css("min-height", totalRowsHeight + 'px');
		}
		else
		{
			headerPanel.css("height", "100%");
			headerPanel.css("min-height", "100%");
		}
	}
	else
	{
		OMWClientContext.RenderRowFields(containers, totalHeight);
	}
};

OMWClientContext.RenderColumnFields = function (containers, totalHeight)
{
	var columnsInfo = OMWClientContext.GetHeaderFieldsColumnsCountAndHeight(containers, totalHeight);

	var fieldsPerColumn = columnsInfo.fieldsPerColumn;
	var totalRowsHeight = columnsInfo.totalHeight;

	var columns = Math.ceil(containers.length / fieldsPerColumn);

	var fieldWidth = (100 / columns) + "%";

	///////////////////////////////////////////////////////////////////////////////

	var row = [];

	var count = 0;

	var rowIndex = 0;

	for (var col = 0; col < containers.length; col++)
	{
		row = [];
		for (var i = col; i < containers.length; i += fieldsPerColumn)
		{
			if (!!containers[i])
			{
				row.push(containers[i]);
				count++;

				$(containers[i]).attr("data-row", rowIndex);
				$(containers[i]).attr("data-col", row.length - 1);
			}
		}

		rowIndex++;

		var defaultHeight = 28;

		var container;

		var isDynamicRow = false;
		var maxHeight = 0;
		for (var i = 0; i < row.length; i++)
		{
			container = $(row[i]);
			var field = container.children().first();
			var fieldHeight = field.height();

			var isDynamicControl = container.hasClass("headerFieldContainerMultiline") || container.hasClass("searchFieldContainerMultiline");
			isDynamicRow = isDynamicRow || isDynamicControl;

			if (isDynamicControl)
				maxHeight = Math.max(maxHeight, fieldHeight);
		}

		for (var j = 0; j < row.length; j++)
		{
			container = $(row[j]);
			container.width(fieldWidth);

            var isDynamicControl = container.hasClass("headerFieldContainerMultiline") || container.hasClass("searchFieldContainerMultiline");
            if (isDynamicControl)//(isDynamicRow)
			{
				if (maxHeight > 0)
				{
					container.height(maxHeight);
				}
				else
				{
					container.height("auto");
				}
			}
			else
			{
				container.height(defaultHeight);
			}
		}

		if (count >= containers.length)
			break;
	}

	return totalRowsHeight;
};

OMWClientContext.RenderRowFields = function(containers, totalHeight)
{
	var rowsInfo = OMWClientContext.GetHeaderFieldsRowCountAndHeight(containers, totalHeight);

	var rows = rowsInfo.rows;
	var totalRowsHeight = rowsInfo.totalHeight;

	var columns = Math.ceil(containers.length / rows);
	var fieldWidth = (100 / columns) + "%";

	var index = 0;
	var row = [];

	while (index < containers.length)
	{
		row.push(containers[index]);

		if (row.length == columns || index == containers.length - 1)
		{
			var container;

			var defaultHeight = 28;

			var isDynamicRow = false;
			var maxHeight = 0;
			for (var i = 0; i < row.length; i++)
			{
				container = $(row[i]);
				var field = container.children().first();
				var fieldHeight = field.height();

				var isDynamicControl = container.hasClass("headerFieldContainerMultiline") || container.hasClass("searchFieldContainerMultiline");
				isDynamicRow = isDynamicRow || isDynamicControl;

				if (isDynamicControl)
					maxHeight = Math.max(maxHeight, fieldHeight);
			}

			for (var j = 0; j < row.length; j++)
			{
				container = $(row[j]);
				container.width(fieldWidth);

                var isDynamicControl = container.hasClass("headerFieldContainerMultiline") || container.hasClass("searchFieldContainerMultiline");
                if (isDynamicControl)//(isDynamicRow)
				{
					if (maxHeight > 0)
						container.height(maxHeight);
					else
						container.height("auto");
				}
				else
					container.height(defaultHeight);
			}

			row = [];
		}

		index++;
	}

	return totalRowsHeight;
};

OMWClientContext.GetNumberOfLines = function()
{
	var val = parseInt($("#hdnNumberOfLines").val());
	if (isNaN(val) || val <= 0)
		val = 2;

	return val;
};

OMWClientContext.GetMaxFieldsPerLine = function ()
{
	var val = parseInt($("#hdnMaxFieldsPerLine").val());
	if (isNaN(val) || val <= 0)
		val = 5;

	return val;
};

OMWClientContext.IsHeaderFieldsOrientationVertical = function ()
{
	return $("#hdnHeaderFieldsOrientation").val() === "vertical";
};

OMWClientContext.GetHeaderFieldsColumnsCountAndHeight = function (containers, totalContainerHeight)
{
	var maxFieldsPerLine = OMWClientContext.GetMaxFieldsPerLine();

	var fieldsPerColumn = containers.length;

	var totalFieldsHeight;

	var i;
	for (i = containers.length; i > 0; i--)
	{
		totalFieldsHeight = OMWClientContext.GetTotalFieldsColumnsHeight(containers, i);

		var columns = Math.ceil(containers.length / i);

		if (columns >= maxFieldsPerLine)
		{
			fieldsPerColumn = Math.ceil(containers.length / maxFieldsPerLine);
			break;
		}

		if (totalFieldsHeight <= totalContainerHeight)
		{
			fieldsPerColumn = i;
			break;
		}
	}

	return {
			fieldsPerColumn: fieldsPerColumn,
			totalHeight: OMWClientContext.GetTotalFieldsColumnsHeight(containers, fieldsPerColumn)
		};
};

OMWClientContext.GetHeaderFieldsRowCountAndHeight = function(containers, totalContainerHeight)
{
	var maxFieldsPerLine = OMWClientContext.GetMaxFieldsPerLine();

	var rows = containers.length;

	var totalFieldsHeight;

	var i;
	for (i = 1; i <= maxFieldsPerLine; i++)
	{
		totalFieldsHeight = OMWClientContext.GetTotalFieldsRowsHeight(containers, i);
		rows = Math.ceil(containers.length / i);

		if (totalFieldsHeight <= totalContainerHeight)
			break;
	}

	var fieldsPerLine = Math.ceil(containers.length / rows);
	if (fieldsPerLine > maxFieldsPerLine)
		rows = Math.ceil(containers.length / maxFieldsPerLine);

	return {
		rows: rows,
		totalHeight: OMWClientContext.GetTotalFieldsRowsHeight(containers, i - 1)
	};
};

OMWClientContext.GetTotalFieldsColumnsHeight = function (containers, fieldsPerColumn)
{
	var totalHeight = 0;

	var rows = [];

	var fieldIndex = 0;
	for (var i = 0; i < containers.length; i++)
	{
		var container = $(containers[i]);
		var fieldHeight = OMWClientContext.GetFieldHeight(container);

		var rowHeight = rows[fieldIndex];
		if (rowHeight !== undefined)
			rows[fieldIndex] = Math.max(rowHeight, fieldHeight);
		else
			rows[fieldIndex] = fieldHeight;

		fieldIndex++;

		if (fieldIndex >= fieldsPerColumn)
			fieldIndex = 0;
	}

	for (var j = 0; j < rows.length; j++)
	{
		totalHeight += rows[j];
	}

	return totalHeight;
};

OMWClientContext.GetTotalFieldsRowsHeight = function(containers, fieldsPerLine)
{
	var totalHeight = 0;

	var rowHeight = 0;

	var columnIndex = 0;
	for (var i = 0; i < containers.length; i++)
	{
		var container = $(containers[i]);
		var fieldHeight = OMWClientContext.GetFieldHeight(container);

		rowHeight = Math.max(rowHeight, fieldHeight);

		columnIndex++;
		if (columnIndex >= fieldsPerLine)
		{
			columnIndex = 0;
			totalHeight += rowHeight;
			rowHeight = 0;
		}
	}

	totalHeight += rowHeight;

	return totalHeight;
};

OMWClientContext.GetFieldHeight = function(container)
{
	var field = container.find("> div");
	var fieldHeight = field[0].getBoundingClientRect().height;
	fieldHeight += parseInt(container.css("margin-top")) + parseInt(container.css("margin-bottom"));

	return fieldHeight;
};

OMWClientContext.ResizeCollectionPageIframe = function()
{
    OMWClientContext._FixContentMWidth(true);

    if ($('#storyType').val() != "storyH")
    {
        delete OMWClientContext.InitialAccordionHeight;
        OMWClientContext._updateAccordionBottomPanelStatus();

        if (OMWClientContext.SearchResults && OMWClientContext.SearchResults.updateLayout)
        {
            OMWClientContext.SearchResults.updateLayout();
        }
    }
};

OMWClientContext.AccInitialized = false;
OMWClientContext.activePaneIndex = 0;

OMWClientContext.AdjustWholeHeight = function ()
{
    if (window.self !== window.top) // is in iframe?
    {
        OMWClientContext.ResizeCollectionPageIframe();
        return;
    }

    OMWClientContext._FixContentMWidth(true);

    if ($('#storyType').val() != "storyH") {
        var headerHeight = parseInt($('#headerM').css('height')) + 2;

        var mainPanelHeight = $(window).height() - headerHeight;
        var paddingBottom = 10;
        
        $('.searchProfileWrapper').css('height', mainPanelHeight - paddingBottom);

        $("#rightSlidebarMInner").css({ width: $("#rightSlidebarM").width() });

        if (OMWClientContext.AccInitialized)
        {
            $("#searchProfilesSelector").accordion("refresh").accordion("option", 'active', OMWClientContext.activePaneIndex);
        }

        delete OMWClientContext.InitialAccordionHeight;
        OMWClientContext._updateAccordionBottomPanelStatus();

        if (OMWClientContext.SearchResults && OMWClientContext.SearchResults.updateLayout) {
            OMWClientContext.SearchResults.updateLayout();
        }
    }
};

OMWClientContext.Font100 = function (el, div) {
    var element = $('#' + el);
    element.css({ 'font-size': '100%' });
    element.css({ 'line-height': '100%' });

    $(div).parent().children('div').each(function () {
        $(this).css({ 'background-color': 'transparent' });
    });
    $(div).css({ 'background-color': 'rgb(206,208,210)' });

}
OMWClientContext.Font75 = function (el, div) {
    var element = $('#' + el);
    element.css({ 'font-size': '75%' });
    //element.css({ 'line-height': '75%' });

    $(div).parent().children('div').each(function () {
        $(this).css({ 'background-color': 'transparent' });
    });
    $(div).css({ 'background-color': 'rgb(206,208,210)' });
}

OMWClientContext.ArrowKeys = function (event) {

    if (event.keyCode == 37) {//go left
        OMWClientContext.SearchResults._GetAngularScope().showPrev();
    }
    else if (event.keyCode == 39) { // go right
        OMWClientContext.SearchResults._GetAngularScope().showNext();
    }
};

OMWClientContext.CloseFullScreenPreview = function () {

    $('#fullScreenLoader').show();

    //OMWClientContext.SearchResults._GetAngularScope().fullScreenClosed();

    $('#fullScreenPreview').removeClass('showFullScreenPreview');

    $(document.documentElement).unbind('keyup', OMWClientContext.ArrowKeys);

    $('#fullScreenLoader').hide();

    return false;
};

OMWClientContext.OpenFullScreenPreview = function () {

    $('#fullScreenLoader').show();

    $('#fullScreenPreview').addClass('showFullScreenPreview');
    $(window).trigger('resize');

    $(document.documentElement).keyup(OMWClientContext.ArrowKeys);

    $('#fullScreenLoader').hide();

    return false;
};

OMWClientContext.ToggleEditMode = function()
{
    if (OMWClientContext.IsEditMode)
    {
        OMWClientContext.IsEditMode = false;

        $("#rightPreviewContainer").css("overflow", "auto");

        $("#searchResultGridEditorView").hide();

        $("#previewHeaderContainer").show();
        $("#searchResultGridDetailView").show();

        $("#optEdit img").css("background", "transparent");
    }
    else
    {
        if (!!OMWClientContext.PreviewRow && $("#rightPreviewContainer").is(":visible"))
        {
            OMWClientContext.IsEditMode = true;

            $("#rightPreviewContainer").css("overflow", "hidden");

            OMWClientContext.UpdatePreview();

            $("#previewHeaderContainer").hide();
            $("#searchResultGridDetailView").hide();
            $("#searchResultGridEditorView").show();

            $("#optEdit img").css("background", "orange");
        }
    }

    return false;
};

OMWClientContext.UpdateTableMode = function()
{
    var elements = $("#searchResultGridDetailView").find("font, span, div").not("#searchResultGridDetailView");
    if (OMWClientContext.IsTableMode)
    {
        elements.css("white-space", "pre");
        $("#optTableMode img").css("background", "orange");
    }
    else
    {
        elements.css("white-space", "normal");
        $("#optTableMode img").css("background", "transparent");
    }
}

OMWClientContext.ToggleTableMode = function ()
{
    if (OMWClientContext.IsTableMode)
        OMWClientContext.IsTableMode = false;
    else if (!!OMWClientContext.PreviewRow && $("#rightPreviewContainer").is(":visible"))
        OMWClientContext.IsTableMode = true;

    OMWClientContext.UpdateTableMode();

    return false;
};

OMWClientContext.UpdatePreview = function()
{
    var url;
    if (OMWClientContext.PreviewRow.documentType)
        url = "/OMWebiSearch/Collection/Editor/Iframe?id=" + OMWClientContext.PreviewRow.systemId + "&isCompactView=true";
    else
        url = "/OMWebiSearch/StoryH/StoryH/Index?id=" + OMWClientContext.PreviewRow.systemId + "&isCompactView=true";

    var html = '<iframe src="' + url + '" class="iframe-sidebar" frameborder="0"></iframe>';

    var editorView = $("#searchResultGridEditorView");
    editorView.html(html);
    editorView.addClass("loading");

    setTimeout(function()
        {
            editorView.removeClass("loading");
        },
        800);
};

OMWClientContext.OnPreviewRowChanged = function(event)
{
    OMWClientContext.PreviewRow = event.detail;
    if ($("#searchResultGridEditorView").is(":visible") && $("#rightPreviewContainer").is(":visible"))
        OMWClientContext.UpdatePreview();
};

document.addEventListener("previewRowChanged", OMWClientContext.OnPreviewRowChanged, false);

var r = false;
$(document).click(function (e) {
    if (e.target == document.getElementById('optsMenu')) return true;
    if (r) {
        $('.optionsButtonDropMenu').css('display', 'none');
        r = false;
    }
});

OMWClientContext.OnOptsMenuClick = function () {
    if ($('.optionsButtonDropMenu').css('display') == 'block') {
        $('.optionsButtonDropMenu').css('display', 'none');
    } else {
        $('.optionsButtonDropMenu').css('display', 'block');
        r = true;
    }
};

OMWClientContext.Font125 = function (el, div) {
    var element = $('#' + el);
    element.css({ 'font-size': '125%' });
    element.css({ 'line-height': '125%' });

    $(div).parent().children('div').each(function () {
        $(this).css({ 'background-color': 'transparent' });
    });
    $(div).css({ 'background-color': 'rgb(206,208,210)' });
}


OMWClientContext.IncreaseFont = function (el) {
    var element = $('#' + el);
    element.toggleClass('IncreasedFont', true);
};
OMWClientContext.DecreaseFont = function (el) {
    var element = $('#' + el);
    element.toggleClass('IncreasedFont', false);
};
OMWClientContext.IncreaseSpacing = function (el) {
    var element = $('#' + el);
    element.toggleClass('IncreasedLineHeight', true);
};
OMWClientContext.DecreaseSpacing = function (el) {
    var element = $('#' + el);
    element.toggleClass('IncreasedLineHeight', false);
};
$.clientCoords = function () {
    if (jQuery.browser.msie) {
        return {
            w: document.documentElement.offsetWidth,
            h: document.documentElement.offsetHeight
        };
    } else
        return { w: window.innerWidth, h: window.innerHeight };
};
// _AdjustNavigation Method (private)
OMWClientContext._AdjustNavigation = function () {
    var h = $(window).height() - 65;
    $('.searchProfileWrapper').css('height', h);
    $('#searchResultGridDetailView').css('min-height', h);
    this._RefreshNavigation();
};

OMWClientContext.Header = new function () {
};

OMWClientContext.Header.OpenInputLink = function (e) {
    var theUrl = OMWClientContext.Header.GetURL($(e).val());
    if (theUrl == undefined) {
        alert("invalid url");
        return;
    }
    location.href = theUrl;
};

OMWClientContext.Header.OpenInputLinkInNewWindow = function (e) {
    var theUrl = OMWClientContext.Header.GetURL($(e).val());
    if (theUrl == undefined) {
        alert("invalid url");
        return;
    }
    window.open(theUrl, '_blank');
};

OMWClientContext.Header.GetURL = function (theUrl) {
    // Check if starts with www
    var n = theUrl.indexOf("www.");
    if (0 == n) {
        return "http://" + theUrl;
    }
    // Check if there is a protocol
    var pattern = /^[^:]+(?=:\/\/)/;
    if (pattern.test(theUrl)) {
        return theUrl;
    }
    return undefined;
};

OMWClientContext.ExecuteFunctionByName = function (functionName) {
    var args = Array.prototype.slice.call(arguments).splice(1);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    var ns = namespaces.join('.');
    if (ns == '') {
        ns = 'window';
    }
    ns = eval(ns);
    return ns[func].apply(ns, args);
}

////Print
function BeforePrint() {
    console.log('onbeforeprint equivalent start');
    if (window.CKEDITOR && CKEDITOR.instances.Story_Text) {
        $('#printableContent').html($(CKEDITOR.instances.Story_Text.window.$.document.body).html());
    }

    //$('#mainPanel').css('height', 'auto');
    //$('#contentM').css('height', 'auto');

    console.log($(window).height());
    
    //$('#mainPanel').height($(window).height() - 150);
    //$('#contentM').height($(window).height() - 150);
    //$('#searchGrid').height(350);


    //$('#searchGrid').css('width', '100%');
    //$('#searchGrid .ui-grid-render-container-body .ui-grid-viewport').css('width', '99%');
    //$('#searchGrid').css('border', '3px solid red');

    console.log('onbeforeprint equivalent end');
}

function AfterPrint() {
    console.log('onafterprint equivalent start');
    OMWClientContext.AdjustWholeHeight();
    console.log('onafterprint equivalent end');
}

$(document).ready(function ()
{
    var $body = angular.element(document.body);
    $body.on("mousedown",
        function()
        {
            var $body = angular.element(document.body);
            var $rootScope = $body.scope().$root;
            $rootScope.$apply(function ()
            {
                $rootScope.$broadcast('hide-internal-link-context-menu');
            });
        });

    var pageType = $('#hdnPageType').val();

    if ($('#hdnPageType').val() == 'Collection') {
        $('#rightSlidebarM').addClass('rightSlidebarMCollection');
    }
    else {
        $('#rightSlidebarM').addClass('rightSlidebarMSearch');
    }

    if (pageType === 'Collection') {
        
        $('#splitterContentPanel').splitPane();
        $('#rightSplitterDivider').hide();
    }
    else if (pageType === 'Search') {
        if ($('#hdnSearchNavigationPaneId').val()) {
            $('#splitterContentPanel').splitPane();
            $('#rightSplitterDivider').hide();
        }
        else {
            $('#rightSlidebarM').remove();
        }
    }


    OMWClientContext.ToolbarStart();

    OMWClientContext._FixContentMWidth();
    OMWClientContext.AdjustWholeHeight();

    var mediaQueryList = window.matchMedia('print');

    mediaQueryList.addListener(function (mql) {
        if (mql.matches) {
            BeforePrint();
        } else {
            AfterPrint();
        }
    });
    window.onbeforeprint = BeforePrint;
    window.onafterprint = AfterPrint;



    //left panel show/hide
    $("#leftTogglerBar").click(function () {
        if ($("#leftTogglerBar").hasClass("collapseActive")) {
            OMWClientContext.CollapseLeft();
        } else if ($("#leftTogglerBar").hasClass("expandActive")) {
            OMWClientContext.ExpandLeft();
        } else {
            return;
        }
    });
    //right panel show/hide
    $("#rightTogglerBar").click(function () {
        if ($("#rightSlidebarM").hasClass("openedRightTab")) {
            OMWClientContext.CollapseRight();
        } else if ($("#rightSlidebarM").hasClass("closedRightTab")) {
            OMWClientContext.ExpandRight();
        } else {
            return;
        }
    });

    OMWClientContext.InitSessionExpired();
});

////------------------------Notifications

//-------------Helper Functions
function isElemEmpty(el) {
    return !$.trim(el.html());
}

function Guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//Notifications
function Notification() { }
Notification.notifications = null;
Notification.timeoutMs = 5000;
Notification.containerId = "messageContainer";
Notification.container = null;
Notification.ShowModal = function (notificationId) {
    var notification = jQuery.grep(Notification.notifications, function (elem, index) {
        return elem.uid === notificationId;
    })[0];

    if ($("#NotificationModal")[0] == undefined) {
        var notificationModal = $("<div id='NotificationModal' title='" + notification.modalTitle + "'></div>");
        var iframe = $('<iframe id="NotificationModalIframe" style="width:97%;height:97%;">');
        notificationModal.html(iframe);
        $("body").append(notificationModal);
    }

    $("#NotificationModal").dialog({
        modal: true,
        width: "90%",
        height: $(window).height() * 0.9,
        open: function (event, ui) {
            setTimeout(function () {
                var iframeBody = $('html', $("#NotificationModalIframe")[0].contentWindow.document);
                iframeBody.html(notification.modalHtml);
            }, 1);
        },
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }

    });


}
//inserts new notification in an array and displays it on screen
//notification object must contain "message" property for example:
//"{message:'hello world!'}"
Notification.PushNotification = function (notification) {
    if (!Notification.notifications) {
        Notification.notifications = [];
    }
    Notification.notifications.push(notification);
    Notification.ShowNotifications();
};

///hides notification by its ID
Notification.HideNotification = function (itemId) {
    Notification.container = $("#" + Notification.containerId);
    if ($("#" + itemId)) {
        $("#" + itemId).remove();
    }
    if (Notification.notifications) {
        Notification.notifications = jQuery.grep(Notification.notifications, function (elem, index) {
            return elem.uid != itemId;
        });
    }
    if (isElemEmpty(Notification.container)) {
        Notification.container.hide('slow');
    }
};

/// displays notifications on screen
Notification.ShowNotifications = function () {
    var maxOpenedItems = 4;
    Notification.container = $("#" + Notification.containerId);
    var notifications = Notification.notifications;
    if (notifications && notifications.length > 0) {
        if (notifications.length > maxOpenedItems) {
            notifications.splice(0, 1);
        }
        Notification.container.empty();
        var html = '';
        for (var i = 0; i < notifications.length; i++) {
            if (!notifications[i].uid) {
                notifications[i].uid = "n" + Guid(); //if no UID we create a new one
            }
            var itemId = notifications[i].uid;

            var currentPageURL = window.location.href;
            console.log(currentPageURL);
            ///Item template
            ///
            html = '<div><div class="notificationItem" id="' + itemId + '">' + notifications[i].message;
            if (notifications[i].saveStory == "yes") {
                html += '  <a class="notificationHyperlink" href="' + '/OMWebiSearch/Authentication/Account/LogOn?returnURL=' + currentPageURL + '">Log in</a><a class="notificationHyperlink" href="#" onclick="OMWClientContext.Story.SaveStoryLocaly(this)">' + OMWClientContext.NotificationStrings.SaveStory + '</a></div>';
            }
            else if (notifications[i].loadStory) {
                html += '<a class="notificationHyperlink" href="#" onclick="OMWClientContext.Story.ShowLocalStory(this)">' + OMWClientContext.NotificationStrings.LoadText + '</a><a class="notificationHyperlink" href="#" onclick="OMWClientContext.Story.CancelShowLocalStory(this)">' + OMWClientContext.NotificationStrings.Cancel + '</a></div>';
            }
            else {
                html += '  <a class="notificationHyperlink" href="' + '/OMWebiSearch/Authentication/Account/LogOn?returnURL=' + currentPageURL + '">Log in</a></div>';

            }
            html += '<div onclick="Notification.CloseNotificationCenter(this)" class="notificationClose">x</div></div>';

            if (notifications[i].type == 'tabs') {
                html = notifications[i].html;
            }

            Notification.container.append(html);
            if (!notifications[i].timeout) {
                //   notifications[i].timeout = window.setTimeout(Notification.HideNotification.bind(null, itemId), Notification.timeoutMs);
            }
        }
        Notification.container.show('slow');
    }
}

Notification.CloseNotificationCenter = function (el) {
    console.log('CloseNotificationCenter');
    console.log(el);
    var id = $(el).parent().find('.notificationItem').attr('id');
    console.log($(el).parent().find('.notificationItem'));
    if (!id) {
        id = $(el).parent().attr('id');
    }
    console.log(id);
    // console.log(id.attr('id'));

    Notification.HideNotification(id);
};


//Session Expired
OMWClientContext.InitSessionExpired = function () {
    $('#sessionExpiredRefresh').click(function () {
        //Refresh page
        location.reload();
    });
    $('#sessionExpiredLogin').click(function () {
        var currentUrl = window.location.pathname;
        var url = OMWClientContext.ServerUrl + 'Authentication/Account/LogOn?returnUrl=' + currentUrl;

        window.location.replace(url);
    });
};
OMWClientContext.SessionExpired = function () {
    //Show layer over page
    $('#sessionExpiredModal').show();
};

OMWClientContext.LogOff = function(logOffUrl)
{
	if (!!OMWClientContext.WebWorker)
		OMWClientContext.WebWorker.port.postMessage({ loggedIn: false });

    window.location.href = logOffUrl;
};

OMWClientContext.SetPaneVisible = function (visible) //truthy = show, falsy = hide, no arg = toggle
{
    var pane = $('#fnPaneContainer');
    var html = $("html");

    var show;
    if (arguments.length === 0)
        show = !pane.hasClass("fn-pane-visible");
    else
        show = visible;

    if (show)
    {
        html.css("overflow", "hidden");
        pane.css("display", "flex");

        setTimeout(function()
        {
            pane.addClass('fn-pane-visible');

            setTimeout(function ()
                {
                    html.css("overflow", "unset");
                },
                250);
        }, 50);
    }
    else
    {
        html.css("overflow", "hidden");

        pane.removeClass('fn-pane-visible');
        setTimeout(function()
            {
                pane.css("display", "none");
                html.css("overflow", "unset");
            },
            250);
    }
};