// Enumneration for search type
function SearchResultsType() {
}
SearchResultsType.Preview = 0;
SearchResultsType.Fields = 1;
SearchResultsType.Grid = 2;

var hasInstantPreview = true;
var notifyReadItems = true;


// Class for Search Results 
OMWClientContext.SearchResults = new function () {
};

// Set default search results type
OMWClientContext.SearchResults.Type = SearchResultsType.Preview;

// Define Init method (public)
OMWClientContext.SearchResults.Init = function (serverUrl, navigationPaneNumber, navigationPaneId, navigationPaneItemId) {
    OMWClientContext.Init(serverUrl, navigationPaneNumber, navigationPaneId, navigationPaneItemId);
    OMWClientContext.SearchResults._InitInternal();
};

OMWClientContext.SearchResults.updateLayout = function () {
    if (OMWClientContext.SearchResults._GetAngularScope &&
        OMWClientContext.SearchResults._GetAngularScope() &&
        OMWClientContext.SearchResults._GetAngularScope().updateLayout)
    {
	    //Was <= 740
	    if ($('#hdnCount').val() != "1")
	    {
		    OMWClientContext._FixContentMWidth(false);
	    }

        OMWClientContext.SearchResults._GetAngularScope().updateLayout();
    }
};

OMWClientContext.SearchResults.DoSearch = function (searchResultsType) {
    //Close full screen preview if opened
    OMWClientContext.CloseFullScreenPreview();

    //Set current grid item to -1
    var scope = OMWClientContext.SearchResults._GetAngularScope();
    scope.carouselIndex = 0;
    scope.searchResults = [];

    scope.toTopClick();

    $('#contentPanel').append($('<div></div>').load(OMWClientContext.GetFullUrl('Search/SearchMain/SearchContent/' + searchResultsType)).html());
    OMWClientContext.SearchResults.Type = searchResultsType;
    var searchInfo = OMWClientContext.SearchResults._GetSearchInfo();
    OMWClientContext.SearchResults._StartSearch(searchInfo);
    OMWClientContext.SearchResults._SetupEvents();

    //resize();
};

OMWClientContext.SearchResults._StartSearch = function (searchInfo) {

    $.ajax({
        url: OMWClientContext.GetFullUrl('Search/SearchMain/StartSearch'),
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: { model: JSON.stringify(searchInfo) },
        success: function (data) {
            $('#hdnSearchContextID').val(data.SearchContextID);

            //alert(data);
            //OMWClientContext.SearchResults._GetAngularScope().resultsToCaruselData = data;
            //OMWClientContext.SearchResults._GetAngularScope().initFullScreenPreview();
            OMWClientContext.SearchResults._NavigateToPage(0);
            setTimeout(function () {
                OMWClientContext.AdjustWholeHeight();


            }, 100);
        },
        error: function (xhr, textStatus, error) {
            OMWClientContext.ProcessAjaxError(xhr);
        }
    });

};

OMWClientContext.SearchResults._GetSearchResults = function (searchContextId, pageNumber) {
    var searchResults;
    $.ajaxSetup({ async: false });
    //$.post(OMWClientContext.GetFullUrl('Search/SearchMain/GetSearchResults'), { SearchContextID: searchContextId, PageNumber: pageNumber, SearchProfileId: SeachProfile }, function (data) {
    //    searchResults = data;
    //}, 'json');

    $.ajax({
        url: OMWClientContext.GetFullUrl('Search/SearchMain/GetSearchResults'),
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: { SearchContextID: searchContextId, PageNumber: pageNumber, SearchProfileId: SeachProfile },
        success: function (data) {
            searchResults = data;
        },
        error: function (xhr, textStatus, error) {
            OMWClientContext.ProcessAjaxError(xhr);
        }
    });

    return searchResults;
};
//data-uid
//data-documentType
//data-supportOpen
function openStory(el) {
    var $target = $(el).closest('div');
    var supportOpen = $target.attr('data-supportOpen');
    if (supportOpen != 'true') {
        return false;
    }

    var uid = $target.attr('data-uid');
    var documentType = $target.attr('data-documentType');

    // var dataItem = $(this).closest("tr");
    OMWClientContext.LoadStory(uid, documentType);
    return false;
};

function openStoryInTab(el) {
    var $target = $(el).closest('div');
    var supportOpen = $target.attr('data-supportOpen');
    if (supportOpen != 'true') {
        return false;
    }

    var uid = $target.attr('data-uid');
    var documentType = $target.attr('data-documentType');

    OMWClientContext.OpenStoryInNewTab(uid, documentType);
    return false;
};

function PopUpPreview() {
    var $toggleBar = $('#rightTogglerBar');
    if ($toggleBar.hasClass('expandR')) {
        $toggleBar.click();
    }
    $('#optFullScreen').click();
}

function RecalculateInstantPreviewAvailableSize() {
    var maxHeight = $(window).height() - $('#headerM').height() - $('#previewButtonsContainer').height() - 70;
    $('.slick-slide p').each(function () {
        var h1 = $(this).parent().find('h1');
        $(this).css('max-height', maxHeight - h1.height() + 'px')
    });
}

var activeOptions = {
    AutoSync: true,
    Notify: true
};

var syncOnText = 'Auto sync - On';
var syncOffText = 'Auto sync - Off';
var notifyOnText = 'Notify - On';
var notifyOffText = 'Notify - Off';

function optSyncClick() {
    SetInstantPreviewOptions({
        AutoSync: !activeOptions.AutoSync,
        Notify: activeOptions.Notify
    });
}

function optNotifyClick() {
    SetInstantPreviewOptions({
        AutoSync: activeOptions.AutoSync,
        Notify: !activeOptions.Notify
    });
}

function SetInstantPreviewOptions(options) {
    var $optSync = $('#optSync');
    var $optSyncSpan = $('.optSync span');
    var $optNotify = $('#optNotify');
    var $optNotifySpan = $('.optNotify span');

    activeOptions = options;
    console.log(JSON.stringify(options));

    if (options.AutoSync) {
        $('.optSync').addClass('active');
        $optSync.attr('src', '/OMWebiSearch/Content/Images/update.png');
        $optSyncSpan.html(syncOnText);
    } else {
        $('.optSync').removeClass('active');
        $optSync.attr('src', '/OMWebiSearch/Content/Images/update_disabled.png');
        $optSyncSpan.html(syncOffText);
    }

    if (options.Notify) {
        $('.optNotify').addClass('active');
        $optNotify.attr('src', '/OMWebiSearch/Content/Images/notif_on.png');
        $optNotifySpan.html(notifyOnText);
    } else {
        $('.optNotify').removeClass('active');
        $optNotify.attr('src', '/OMWebiSearch/Content/Images/notif_mute.png');
        $optNotifySpan.html(notifyOffText);
    }

}


function OnInstantPreviewOptions(options)
{
	console.log(options);
}

onChange = function () {
    var selected = $.map(this.select(), function (item) {
        return $(item).attr("id");
    });

    alert(selected);
};

OMWClientContext.SearchResults._GetAngularScope = function () {
    return (angular.element($('#searchResultsOptions')).scope());
};

OMWClientContext.SearchResults.GetIconForTemplate = function () {
    return '/OMWebiSearch/Content/Images/icon_example_32.png';
};

OMWClientContext.SearchResults.IsOMWDocumentIDsEqual = function (id1, id2) {
    return id1.PoolID == id2.PoolID && id1.PinnID == id2.PinnID && id1.SystemID == id2.SystemID;
};

OMWClientContext.SearchResults._NavigateToPage = function (pageNumber, keepOldResults) {
    $('#SearchPreviewPanel').hide(0);

    var contextID = $('#hdnSearchContextID').val();

    OMWClientContext.SearchResults._GetAngularScope().startSearch({
        SearchContextID: contextID,
        PageNumber: pageNumber,
        SearchProfileID: SeachProfile,
        newSearch: pageNumber == 0
    }, keepOldResults);

    OMWClientContext.SearchResults._SetupEvents();
};



// Define InitInternal method (private)
OMWClientContext.SearchResults._InitInternal = function () {
    $(document).ready(function () {
        $('#divSearchNavigation').hide();
        OMWClientContext.SearchResults._SetupEvents();
        RecalculateInstantPreviewAvailableSize();
        //init
        SetInstantPreviewOptions({
            AutoSync: true,
            Notify: true
        });
    });
};

OMWClientContext.SearchResults._SetupEvents = function () {
    OMWClientContext._FixContentMWidth();

    $(window).resize(function () {
        OMWClientContext.Delay(function () {
            OMWClientContext.SearchResults._AdjustPreviewPanelTop();
            RecalculateInstantPreviewAvailableSize();
        }, 200);
    });
    $(window).scroll(function () {
        OMWClientContext.SearchResults._AdjustPreviewPanelTop();
    });
};

OMWClientContext.SearchResults._AdjustPreviewPanelTop = function () {
    OMWClientContext._FixContentMWidth();
};

OMWClientContext.SearchResults._GetSearchInfo = function () {

    var selectedSearchProfile = $('#selectedSearchProfile').val();
    var inputs = $('#headerPanel .SearchInput');
    var values = [];
    $(inputs).each(function () {
        values.push({
            Name: this.id,
            Value: $(this).val(),
            Label: $($(this).parent()).attr('label')

        });
        //console.log($($(this).parent()).attr('label'));
    });

    // Had to be added so the values from combobox can be taken,
    // Without this it wont work correct because searchParams in SearchService cant be initialized properly
    var comboboxes = $('select.customCombobox');
    // console.log(comboboxes);
    $(comboboxes).each(function () {
        var id = "#" + this.id;
        var combobox = $(id).data("kendoComboBox");
        //console.log(combobox);
        var input = combobox.input;

        var value = $(input).val();

        //console.log(this);
        //console.log('name: ' + this.id);
        //console.log('val: ' + $(input).data('value'));
        //console.log('lab: ' + $($(this).parent()).attr('label'));
        values.push({
            Name: this.id,
            Value: value,
            Label: $($(this).parent()).attr('label')  // Value for label has to be checked, I didnt know what to take
            // because for every input there is no value Label sent to server
        });
    });

    //customComboboxNotEditable
    var ComboboxNotEditable = $('select.customComboboxNotEditable');
    $(ComboboxNotEditable).each(function () {
        var id = "#" + this.id;
        var combobox = $(id).data("kendoComboBox");
        var input = combobox.input;

        var value = $(input).val();

        values.push({
            Name: this.id,
            Value: value,
            Label: $($(this).parent()).attr('label')  // Value for label has to be checked, I didnt know what to take
            // because for every input there is no value Label sent to server
        });
    });








    //SHOULD ADD THE DATE FORMAT TO EVERY DATE TIME FIELDS
    var dateTimeFields = $('.hasDatepicker');
    dateTimeFields.each(function () {

        var $this = $(this);
        var label = $this.parent().parent().parent().find('.searchFieldLabel').text();
        var format = $(this).data('dateformat');
        var name = this.id;

        if ($this.is(':visible')) {
            values.push({
                Name: name,
                Value: $(this).val(),
                Label: label,
                Format: format
                // Value for label has to be checked, I didnt know what to take
                // because for every input there is no value Label sent to server
            });
        }
        else {
            //Find select and get value from there
            var pickerContent = $this.closest('.dateTimePickerWithSwich')[0];
            var value = $(pickerContent).find('select').data("kendoComboBox").value();
            if (pickerContent) {
                values.push({
                    Name: name,
                    Value: value,
                    Label: label,
                    Format: format
                });
            }
            else {
                values.push({
                    Name: name,
                    Value: $this.val(),
                    Label: label,
                    Format: format
                });
            }
        }
    });


    console.log('Values that are been sent to the server are:');
    console.log(values);




    return {
        SearchProfileId: selectedSearchProfile,
        ResultsType: OMWClientContext.SearchResults.Type,
        Values: values
    };
};

OMWClientContext.SearchResults.LoadSearchProfile = function (navigationPaneId, searchProfileId) {
    location.href = '/OMWebiSearch/Search/SearchMain/Index/' + searchProfileId + "/" + navigationPaneId;
};


OMWClientContext.SearchResults.IsPreviewEnabled = false;

OMWClientContext.SearchResults.ShowSearchProfile = function (navigationPaneId, searchProfileId) {

    //setTimeout(function () {
    //    $("#searchProfilesSelector").accordion("option", "active", navigationPaneId - (OMWClientContext.itemsRemovedAtTheBeginning || 0));
    //}, 30);
    setTimeout(function () {
        OMWClientContext.SearchResults.SelectPaneItem(searchProfileId);
    }, 30);

    $('#SearchPreviewPanel').hide(0);
    if (searchProfileId <= 0) {
        $('#headerPanel').html('');
        $('#selectedSearchProfile').val('-1');
        $('#selectedNavigationPane').val('-1');
        console.log("IF");
    } else {
        $('#selectedSearchProfile').val(searchProfileId);
        $('#selectedNavigationPane').val(navigationPaneId);
        OMWClientContext.SetupHeaderFields();
        hasPreview = $("#has-preview").val();

        //console.log(hasPreview);
        //if (hasPreview) {
        //    OMWClientContext.SearchResults.IsPreviewEnabled = true;
        //}
    }



};

OMWClientContext.SearchResults.SelectPaneItem = function (searchProfileId) {
    var item = $('#navigationPaneItem' + searchProfileId);
    console.log(item);
    console.log($(item).length);

    if (item && $(item).length > 0) {
        $('.navigationPaneItem').removeClass('selectedNavigationPaneItem');
        $(item).addClass('selectedNavigationPaneItem');
    }
};

OMWClientContext.SearchResults.OpenSearchProfileInNewWindow = function (paneId, searchProfileId) {
    if (!e)
        var e = window.event;

    if ($.browser.msie) {
        e.cancelBubble = true;
    }
    else if ($.browser.mozilla) {
        // alert('moz');
        //   e.preventDefault();
    }
    else {
        e.stopPropagation();
    }

    var url = OMWClientContext.GetFullUrl('Search/SearchMain/Index/' + searchProfileId + '/' + paneId);

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

OMWClientContext.SearchResults.OpenRSS = function (u) {
    var url = u;
    var searchInfo = OMWClientContext.SearchResults._GetSearchInfo();
    url = url + searchInfo.SearchProfileId + '?';
    $(searchInfo.Values).each(function () {
        if (this.Value == '' || this.Label == '' || (this.Value == -1 && $('#' + this.Name).is('select'))) return;
        var arr = this.Name.split("_");
        if (arr.length != 3) return;
        url += arr[2];
        url += '=';
        url += this.Value.replace('/', '-').replace('/', '-');
        url += '&';
    });
    window.open(url, '_newtab');
};

OMWClientContext.SearchResults.CreatePortlet = function () {
    var searchInfo = OMWClientContext.SearchResults._GetSearchInfo();

    $.ajax(
        OMWClientContext.GetFullUrl('Search/SearchMain/CreatePortlet'),
        {
            type: 'POST',
            data: JSON.stringify({
                categoryId: $('#selectedNavigationPane').val(),
                profileId: searchInfo.SearchProfileId,
                parameters: searchInfo.Values
            }),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                alert('The portlet is created successfully.');
            },
            error: function (xhr) {
                alert('Failed to create the portlet.');
                OMWClientContext.ProcessAjaxError(xhr);
            }
        });
};

OMWClientContext.SearchResults.CheckStringSpaces = function (el) {
    //check if all from start are spaces, then change all to ␣

    var length = el.value.length;
    var allSpaces = true;
    for (var i = 0; i < length; i++) {
        if (el.value[i] == " " || el.value[i] == "␣") {

        }
        else {
            allSpaces = false;
            break;
        }
    }

    var newValue = "";
    if (allSpaces) {
        for (var i = 0; i < length; i++) {
            newValue += "␣";
        }

    }
    else {//normal char arrived, change all ␣ to simple space
        for (var i = 0; i < length; i++) {
            if (el.value[i] != "␣") {
                newValue += el.value[i];
            }
            else {
                newValue += " ";
            }
        }
    }
    el.value = newValue;

};

$(document).ready(function () {
    $('.searchFieldWrap').on('click', '.date-picker-swich-icon', function () {
        var $element = $(this);
        var $parent = $element.parent();
        if ($element.hasClass('date-picker-dropdown')) {
            $element.removeClass('date-picker-dropdown');
            $element.addClass('date-picker-calendar');

            //Hide date picker, show dropdown
            $parent.find('input.SearchField').hide();
            $parent.find('.k-combobox.date-custom-combobox').removeClass('hidden');
        }
        else {
            $element.removeClass('date-picker-calendar');
            $element.addClass('date-picker-dropdown');

            //Hide dropdown, show date picker
            $parent.find('.k-combobox.date-custom-combobox').addClass('hidden');
            $parent.find('input.SearchField').show();
        }
    });

    if (hasInstantPreview == true) {
        //console.log("yes preview");
    }
    else {
        $("#rightTogglerBar").hide();
    }


    //KENDO UI
    var pageType = $('#hdnPageType').val();
    //If it is Search then do this, else the
    //KEDNO UI constructor will be called in OMW_HeaderSearch.js
    if (pageType != "Story" && pageType != "Collection") {

        $('#rightSlidebarM').show();

        $('#hdnPageType').focus();
        //Register event for ENTER key in header in the Search page
        $(document).keydown(function (event) {

            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                //alert('enter');

                //Enter key pressed
                OMWClientContext.SearchResults.DoSearch(SearchResultsType.Grid);

                //Move focus away from header fields
                $('.searchFieldContainer input').blur();
            }
            event.stopPropagation();

        });

        var searchPageComboboxes = $('.customCombobox');
        $(searchPageComboboxes).kendoComboBox({
            autoComplete: true,
        });


        var searchPageComboboxesNotEditable = $('.customComboboxNotEditable');

        $(searchPageComboboxesNotEditable).kendoComboBox({
            autoComplete: true,
        });

        $('.date-custom-combobox').each(function () {
            var $this = $(this);
            if ($this.is(':visible')) {
                $this.kendoComboBox();
            }
            else {
                $this.show();
                $this.kendoComboBox();
                $this.hide();
            }
        });
        $('.date-custom-combobox').each(function () {
            $(this).attr('disabled', true);
        });

        $('input.customComboboxNotEditable').each(function () {
            $(this).attr('disabled', true);
        });



        //Events for checking the spaces
        $('input.customCombobox').on('keyup', function () {
            OMWClientContext.SearchResults.CheckStringSpaces(this);
        });
        $('input.customComboboxNotEditable').on('keyup', function () {
            OMWClientContext.SearchResults.CheckStringSpaces(this);
        });


    }


});
