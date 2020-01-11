OMWMobileStory = function () {
};

OMWMobileStory.HeaderFieldsChanged = false;
OMWMobileStory.PlainTextChanged = false;
OMWMobileStory.HTMLTextChanged = false;

OMWMobileStory.Locked = false;

OMWMobileStory.OMWBaseUrl = '';
OMWMobileStory.BaseURL = '';

OMWMobileStory.InitCKEditor = function () {

    var readonly = $('#hdnStoryReadonly').val();

	var toolbar = OMWMobileStory.EditorToolbar;
	if (!toolbar)
	{
		toolbar = [];
		alert("CK Editor buttons configuration is wrong. Please contact your system administrator");
	}

    var editor = CKEDITOR.instances["Story_Text"];
    try {
        if (editor) { editor.destroy(true); }
    }
    catch (e) { }

    if (readonly != 'False') {
        CKEDITOR.replace('Story_Text',
           {
               fullPage: true,
			   extraPlugins: 'records',
			   toolbar: toolbar
           });
        $('#Story_Text').attr('disabled', 'disabled');
    }
	else
    {
		var localStoragePlugin = !!window.OMWLocalStorage && window.OMWLocalStorage.LocalStorageEnabled ? ",omwlocalstorage" : "";
        CKEDITOR.replace('Story_Text',
           {
               fullPage: true,
			   extraPlugins: 'records,settings' + localStoragePlugin,
			   toolbar: toolbar
           });
    }

    //nanospell.ckeditor('Story_Text', {
    //    dictionary: "en",  // 24 free international dictionaries  
    //    server: "asp.net"      // can be php, asp, asp.net or java
    //});

    OMWMobileStory.InitCKEditorEvents();

    OMWMobileStory.KeepAliveTimestamp = new Date();
    OMWMobileStory.KeepAliveInterval = '';

};
OMWMobileStory.CKEditorOnChange = function (e) {
    OMWMobileStory.KeepAliveTimestamp = new Date();

    // Check is the story already locked
    var Disabled = $("#Story_Text").attr('disabled');

    if (!OMWMobileStory.Locked) {
        if (Disabled != 'disabled') {
            var locked = OMWMobileStory.LockStory();
            //If it is not locked stop event 
            switch (locked) {
                case OMWMobileStory.StartEditStatus.notLocked:
                    if (!!e) {
                        e.removeListener('change');
                        CKEDITOR.instances.Story_Text.execCommand('undo');
                        CKEDITOR.instances.Story_Text.on('change', OMWMobileStory.CKEditorOnChange);
                    }

                    alert('Story already locked'); break;
                case OMWMobileStory.StartEditStatus.locked:

                    OMWMobileStory.Locked = true;
                    OMWMobileStory.ShowLockIcon(); break;
                case OMWMobileStory.StartEditStatus.changed:
                    if (!!e) {
                        e.removeListener('change');
                        CKEDITOR.instances.Story_Text.execCommand('undo');
                        CKEDITOR.instances.Story_Text.on('change', OMWMobileStory.CKEditorOnChange);
                    }
                    alert('Please refresh page!');
                    break;
                default:
            }
        }
    }
    return OMWMobileStory.Locked;
};

OMWMobileStory.CKEditorEventsCreated = false;
OMWMobileStory.InitCKEditorEvents = function myfunction() {
    if (OMWMobileStory.CKEditorEventsCreated == false) {

        OMWMobileStory.CKEditorEventsCreated = true;
        CKEDITOR.on('instanceReady', function () {

            OMWMobileStory.SetHeightOfStoryContents();

            CKEDITOR.instances["Story_Text"].on('change', OMWMobileStory.CKEditorOnChange);

            CKEDITOR.instances["Story_Text"].on('focus', function () {
                //Add thin frame around
                $("#cke_Story_Text").addClass('lockStory');
            });
            CKEDITOR.instances["Story_Text"].on('blur', function () {
                //Remove thin frame that is around
                $("#cke_Story_Text").removeClass('lockStory');
            });
        });
    }
};

OMWMobileStory.InitLockIcon = function () {
    $('#Story_Text').after("<div id='lockIcon'></div>");
};
OMWMobileStory.HideLockIcon = function () {
    $('#lockIcon').hide();
    $('.btnCancelEditRichTextPage').addClass('ui-disabled');
    $('.btnSaveEditRichTextPage').addClass('ui-disabled');
    OMWMobileStory.Locked = false;

    clearInterval(OMWMobileStory.KeepAliveInterval);

};
OMWMobileStory.ShowLockIcon = function () {
    $('#lockIcon').show();
    $('.btnCancelEditRichTextPage').removeClass('ui-disabled');
    $('.btnSaveEditRichTextPage').removeClass('ui-disabled');

    OMWMobileStory.KeepAliveInterval = setInterval(function () {
        if (!OMWMobileStory.Locked) {
            OMWMobileStory.KeepAliveEvent();
        }
    }, 30000);
};

OMWMobileStory.StartEditStatus = {
    locked: 0,
    notLocked: 1,
    changed: 2
};

OMWMobileStory.LockStory = function () {
    var returnValue = OMWMobileStory.StartEditStatus.notLocked;

    $.mobile.loading('show');
    var storyId = $('#hdnStoryId').val();
    var fieldId = 0;
    $.ajax({
        type: 'POST',
        url: OMWMobileStory.BaseURL + "/LockStory",
        data: { storyId: storyId, fieldId: fieldId },
        async: false
    }).success(function (data) {

        if (data.status == "OK") {
            var previousStoryText = $('#hdnStoryText').text().trim();
            if (data.storyText !== previousStoryText) {
                returnValue = OMWMobileStory.StartEditStatus.changed;
            }
            else {
                returnValue = OMWMobileStory.StartEditStatus.locked;
            }
        }
    }, 'json')
   .always(function () {
       // Stop the animation
       $.mobile.loading('hide');
   });
    return returnValue;
};
OMWMobileStory.UnlockStory = function () {

    var storyId = $('#hdnStoryId').val();
    var fieldId = 0;
    $.post(OMWMobileStory.BaseURL + "/UnLockStory", { storyId: storyId, fieldId: fieldId }, function (data) {

        //Disable Save button ???

    }, 'json')
    .always(function () {
        // Stop the animation
        $.mobile.loading('hide');
    });
};

OMWMobileStory.SaveStoryRich = function (fieldId, fieldValue) {

    var _fieldId = !!fieldId ? fieldId : 0;
    var _fieldValue = !!fieldValue ? fieldValue : 0;

    var htmlUpdated = false;
    var html = '';
    if ($('#hdnShowText').val() != "False") {
        htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

        if (htmlUpdated) {
            CKEDITOR.instances["Story_Text"].resetDirty();
            html = escape(CKEDITOR.instances["Story_Text"].getData());
        }
    }

    OMWMobileStory.SaveStory(htmlUpdated, html, _fieldId, _fieldValue);

};
OMWMobileStory.SaveStory = function (htmlUpdated, html, fieldId, fieldValue) {

    var storyId = $('#hdnStoryId').val();

    var params = { storyId: storyId, fieldId: fieldId, fieldValue: fieldValue, htmlUpdated: htmlUpdated, html: html };

    console.log(params);

    $.ajax({
        url: OMWMobileStory.BaseURL + '/SaveStory',
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: params,
        success: function (data) {
            console.log(data);
            if (data.status != "error") {

                //Disable save and cancel button
                OMWMobileStory.HideLockIcon();

                //Remove blue frame
                $("#cke_Story_Text").removeClass('lockStory');

				OMWMobileStory.Locked = false;

	            if (!!window.OMWLocalStorage && window.OMWLocalStorage.LocalStorageEnabled)
	            {
		            var storyId = $('#hdnStoryId').val();
					OMWLocalStorage.ClearStory(storyId);
					OMWLocalStorage.UpdateOfflineState(false);

		            OMWMobile.UpdateMainMenu();
	            }

                //Restart undo
                //CKEDITOR.instances.Story_Text.resetUndo();

                //Get data from server
                //OMWMobileStory.GetStoryHtmlText();

                $.mobile.loading('hide');
            }
        },
        error: function (xhr, textStatus, error) {
            $.mobile.loading('hide');
        }
    });
};

OMWMobileStory.SaveHeaderValues = function () {


    $('.btnCancelHeader').removeClass('ui-disabled');
    $('.btnSaveHeader').removeClass('ui-disabled');

    var storyId = $('#hdnStoryId').val();
    var headerFields = JSON.stringify(OMWMobileStory.dirtyHeaderFields);
    var htmlUpdated = false;
    var html = '';
    if ($('#hdnShowText').val() != "False") {
        //htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

        if (htmlUpdated) {
            CKEDITOR.instances["Story_Text"].resetDirty();
            html = escape(CKEDITOR.instances["Story_Text"].getData());
        }
    }

    var data = {
        storyId: storyId,
        HeaderFields: headerFields,
        //headerFields: headerFields,
        //headerFields: OMWMobileStory.dirtyHeaderFields,
        html: html,
        htmlUpdated: htmlUpdated
    };
    console.log(data);
    //Send new values to server
    $.ajax({
        url: OMWMobileStory.BaseURL + '/SaveHeaderFields',
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: data,
        success: function (data) {
            console.log(data);
            if (data.status != "error") {

                //Disable save and cancel button
                $('.btnCancelHeader').addClass('ui-disabled');
                $('.btnSaveHeader').addClass('ui-disabled');

                //Remove all dirty items from array
                OMWMobileStory.dirtyHeaderFields = [];


                $.mobile.loading('hide');
            }
        },
        error: function (xhr, textStatus, error) {
            $.mobile.loading('hide');
        }
    });

};

OMWMobileStory.GetStoryHeader = function () {

    var storyId = $('#hdnStoryId').val();
    $.post(OMWMobileStory.BaseURL + "/GetStoryHeader", { id: storyId }, function (data) {

        OMWMobileStory.RefreshPreviewHeader(data);

    });

};

OMWMobileStory.GetStoryHtmlText = function () {

    var storyId = $('#hdnStoryId').val();
    $.post(OMWMobileStory.BaseURL + "/GetStoryHtmlText", { id: storyId }, function (data) {

        console.log(data);


        ////Change rich text box value
        //$('#Story_Text').val(data.Text);

        OMWMobileStory.InitCKEditor(data.ReadOnly);


    });

};


OMWMobileStory.SetHeightOfStoryContents = function () {

    var viewPortHeight = $(window).height();
    var headerHeight = $('.storyHeader').height();
    var navigationHeight = $('#storyNavigationHeader').height();
    var footerHeight = $('div[data-role="footer"]').height();
    var contentHeight = viewPortHeight - headerHeight - navigationHeight - footerHeight - 4;



    var textBoxHeight = contentHeight;
    var textAreaHeight = textBoxHeight - 40;

    //Set height of first page
    $('#mainContent').height(textBoxHeight + 10);

    //Set height of second page
    $('.storyPageContent').height(textAreaHeight + 5);


    //Set height of third page
    $('.richEditPage').addClass('richEditPageCalculate');

    $('.richEditPage').height(contentHeight);
    $('.richTextBoxContainer').height(textBoxHeight);


    var textEditHeight = $(".richEditPage").height() - $('.richEditPage .ui-header').height();
    var ckTopHeight = $(".cke_top").height();

    var richTextBoxContentHeight = textEditHeight - ckTopHeight - 50;
    if (richTextBoxContentHeight < 100) {
        richTextBoxContentHeight = 100;
    }
    $(".cke_contents").height(richTextBoxContentHeight + "px");
    $('.richEditPage').removeClass('richEditPageCalculate');
};

OMWMobileStory.SetHeaderFieldLabelWidth = function () {
    var maxWidth = 0;
    $('.headerFieldLabel').each(function () {
        var width = $(this).width();
        if (width > maxWidth) {
            maxWidth = width;
        }
    });
    maxWidth += 5;
    $('.headerFieldLabel').width(maxWidth);
    $('.headerFieldValue').css('marginLeft', maxWidth);
};

OMWMobileStory.comboboxPreviousValue = "";
OMWMobileStory.comboboxOpenedEditPopup = "";
OMWMobileStory.previousValue = "";
OMWMobileStory.BindFieldsChangeValue = function () {

    //Simple combobox
    $(".custom-header-list-not-editable headerList, .headerComboReadonly").bind("change", function (event, ui) {

        ////Save story
        //OMWMobileStory.SaveStoryRich($(event.target).data('fieldid'), $(event.target).val());
        var value = $(event.target).val();
        if (value instanceof Array) {
            value = value.join(',');
        }

        OMWMobileStory.SetControlToDirty($(event.target).data('fieldid'), value);
    });

    //Editable combobox
    $(".headerCombo").bind("focus", function (event, ui) {
        OMWMobileStory.comboboxPreviousValue = $(event.target).val();
    });
    $(".headerCombo").bind("blur", function (event, ui) {

        var selectedItem = $(event.target).val();

		//Set dirty
        OMWMobileStory.SetControlToDirty($(event.target).data('fieldid'), selectedItem);

        //Remove user input from popup
        $('#newComboboxValue').val('');
    });


    //Input 
    $('.fieldInputText, .custom-header-list-editable input').focus(function (event) {
        //Get value and save it as last value
        OMWMobileStory.previousValue = $(event.target).val();
    }).blur(function (event) {
        //Check if there is a change in the last value
        var newVal = $(event.target).val();
        if (newVal != OMWMobileStory.previousValue) {

            //OMWMobileStory.SaveStoryRich($(event.target).data('fieldid'), newVal);

            //Add to dirty array
            OMWMobileStory.SetControlToDirty($(event.target).data('fieldid'), newVal);
        }
        //Restart previousValue
        OMWMobileStory.previousValue = "";
    }).keyup(function () {
        //Enable Save and Cancel
        $('.btnCancelHeader').removeClass('ui-disabled');
        $('.btnSaveHeader').removeClass('ui-disabled');
    });

    //Datetime
    $('.dateInput').bind('datebox', function (e, p) {
        console.log(e);
        if (p.method === 'set') {
            e.stopImmediatePropagation();
            var value = "";

            if ($(this).hasClass('dateTimeDate')) {
                //Get time and append to date
                console.log($(this).parent().parent().find('.dateTimeTime'));
                value = p.value + " " + $(this).parent().parent().find('.dateTimeTime').val();
            }
            else if ($(this).hasClass('dateTimeTime')) {
                //Get date and append to time
                //Get time and append to date
                console.log($(this).parent().parent().find('.dateTimeDate'));
                value = $(this).parent().parent().find('.dateTimeDate').val() + " " + p.value;
            }
            else {
                var value = p.value;
            }
            var fieldId = $(this).data('fieldid');

            //OMWMobileStory.SaveStoryRich(fieldId, value);
            OMWMobileStory.SetControlToDirty(fieldId, value);
        }
    });

    //Checkbox
    $('.headerFieldCheckBox').click(function () {
        var fieldId = $(this).data('fieldid');
        var value = $(this).is(':checked') ? "1" : "0";

        //OMWMobileStory.SaveStoryRich(fieldId, value);
        OMWMobileStory.SetControlToDirty(fieldId, value);
    });

    //Multiline
    $('.headerMultiline').focus(function (event) {
        OMWMobileStory.previousValue = $(event.target).val();
    }).blur(function (event) {
        //Check if there is a change in the last value
        var newVal = $(event.target).val();
        if (newVal != OMWMobileStory.previousValue) {

            //OMWMobileStory.SaveStoryRich($(event.target).data('fieldid'), newVal);

            //Add to dirty array
            OMWMobileStory.SetControlToDirty($(event.target).data('fieldid'), newVal);
        }
        //Restart previousValue
        OMWMobileStory.previousValue = "";
    }).keyup(function () {
        //Enable Save and Cancel
        $('.btnCancelHeader').removeClass('ui-disabled');
        $('.btnSaveHeader').removeClass('ui-disabled');
    });

    $('.custom-header-list-not-editable headerList').change(function () {
        //Enable Save and Cancel
        $('.btnCancelHeader').removeClass('ui-disabled');
        $('.btnSaveHeader').removeClass('ui-disabled');
    });
};


OMWMobileStory.UpdateFieldFromServer = function (fieldId, fieldValue, fieldType) {
    var elementForAnimation;
    switch (fieldType) {

        case "eOMFieldDisplayType_Check":

            var id = "#checkbox_" + fieldId;
            if (fieldValue == 1) {
                $(id).prop("checked", true);
            }
            else {
                $(id).prop("checked", false);
            }
            $(id).val(fieldValue);
            $(id).checkboxradio().checkboxradio("refresh");

            elementForAnimation = $(id).parent().find('label');

            break;
        case "eOMFieldDisplayType_DateTime":

            //Parse date so it will show nicely??

            var idDate = "#inputDate_" + fieldId;
            $(idDate).trigger('datebox', { 'method': 'set', 'value': fieldValue });
            var idTime = "#inputTime_" + fieldId;
            $(idTime).trigger('datebox', { 'method': 'set', 'value': fieldValue });


            var dateAnimation = $(idDate).parent();
            dateAnimation.addClass('updateFieldAnimation');
            dateAnimation.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                dateAnimation.removeClass('updateFieldAnimation');
            });

            elementForAnimation = $(idTime).parent();

            break;
        case "eOMFieldDisplayType_Duration":

            //Not working because of format

            var idDuration = "#duration_" + fieldId;
            $(idDuration).trigger('datebox', { 'method': 'set', 'value': fieldValue });

            elementForAnimation = $(id).parent();
            break;
        case "eOMFieldDisplayType_TimeOnly":

            //Parse time so it will show nicely??

            var idTime = "#time_" + fieldId;
            $(idTime).trigger('datebox', { 'method': 'set', 'value': fieldValue });

            elementForAnimation = $(idTime).parent();
            break;
        case "eOMFieldDisplayType_DateOnly":

            //Parse date so it will show nicely??

            var idDate = "#date_" + fieldId;
            $(idDate).trigger('datebox', { 'method': 'set', 'value': fieldValue });

            elementForAnimation = $(idDate).parent();
            break;

        case "eOMFieldDisplayType_MultilineText":
            var id = "#multiline_" + fieldId;

            $(id).val(fieldValue);

            elementForAnimation = $(id);
            break;

        case "eOMFieldDisplayType_Combo":
            var id = "#combo_" + fieldId;

            var selectOption = $(id).find('option[value="' + fieldValue + '"]');
            if (selectOption.length > 0) {
                $(selectOption).attr('selected', 'selected');
            }
            else {
                //Add new option and select it
                var newOption = '<option selected="selected" value="' + fieldValue + '">' + fieldValue + '</option>';
                $(id).append(newOption);
            }
            $(id).selectmenu('refresh', true);

            elementForAnimation = $(id).parent();
            break;

        case "eOMFieldDisplayType_List":
            var id = "#list_" + fieldId;
            var selectOption = $(id).find('option[value="' + fieldValue + '"]');
            if (selectOption.length > 0) {
                $(selectOption).attr('selected', 'selected');
            }
            else {
                //Add new option and select it
                var newOption = '<option selected="selected" value="' + fieldValue + '">' + fieldValue + '</option>';
                $(id).append(newOption);
            }

            $(id).selectmenu('refresh', true);

            elementForAnimation = $(id).parent();
            break;


        default:
            var id = "#input_" + fieldId;
            $(id).val(fieldValue);

            elementForAnimation = $(id).parent();
            break;

    }
    //Animation
    elementForAnimation.addClass('updateFieldAnimation');
    elementForAnimation.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
        elementForAnimation.removeClass('updateFieldAnimation');
    });
};


OMWMobileStory.dirtyHeaderFields = new Array();
OMWMobileStory.SetControlToDirty = function (fieldId, value) {

    var newItem = {
        fieldId: fieldId,
        fieldValue: value
    };

    //Check if that header is already changed
    var index = -1;
    for (var i = 0; i < OMWMobileStory.dirtyHeaderFields.length; i++) {
        if (OMWMobileStory.dirtyHeaderFields[i].fieldId == fieldId) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        OMWMobileStory.dirtyHeaderFields[index] = newItem;
    }
    else {
        OMWMobileStory.dirtyHeaderFields.push(newItem);
    }
    console.log(newItem);

    //Enable Save and Cancel
    $('.btnCancelHeader').removeClass('ui-disabled');
    $('.btnSaveHeader').removeClass('ui-disabled');
};

//Keep alive
OMWMobileStory.KeepAliveEvent = function () {
    var difference = (new Date() - OMWMobileStory.KeepAliveTimestamp) / 1000;
    if (OMWMobileStory.Locked && difference <= 30) {
        //Save or send KeepAlive to server
        if (_getAutoSaveValueForCKEditor()) {
            //Save to server
            OMWMobileStory.SaveStoryRich();
        }
        else {
            OMWMobileStory.KeepAlive();
        }
    }

};
OMWMobileStory.KeepAlive = function () {
    $.post(OMWMobileStory.BaseURL + "/KeepAlive", {}, function () { });
};

$(window).resize(function () {
    OMWMobileStory.SetHeightOfStoryContents();
});

OMWMobileStory.isNewStory = false;

$(document).on("pagehide", "#storyPage", function () {
    $.mobile.loading('show');

    //If save before exit if checked save story before closing
    //if (_getSaveBeforeExitValueForCKEditor()) {
    //    //Save story
    //    OMWMobileStory.SaveStoryRich();
    //}

    //Remove from DOM
    $('#storyPage').remove();

});

$(document).on("pageshow", "#storyPage", function () {

    $.mobile.popup.prototype.options.history = false;

    OMWMobileStory.isNewStory = false;

    $.mobile.loading('show');
    OMWMobileStory.BaseURL = $("#hdnBaseStoryURL").val();
    OMWMobileStory.OMWBaseUrl = $("#hdnBaseURL").val()

    //get url
    var parameters = window.location.href.split('?')[1];
    if (parameters) {
        var parameter = parameters.replace('new=', '');
        OMWMobileStory.isNewStory = true;
    }

    OMWMobileStory.BindFieldsChangeValue();

    //Show initial page
    $('.richEditPage').show();

    if ($('#hdnStoryShowText').val() == 'True') {
        OMWMobileStory.InitCKEditor();
    }
    else {
        //Hide rich edit story
        $('.headerPage').show();
        $('.richEditPage').remove();
        $('#storyNavigationHeader').remove();

        $('.editStoryPageButton').hide();
        $('.headerPageButton').show();
    }


    OMWMobileStory.SetHeightOfStoryContents();
    OMWMobileStory.SetHeaderFieldLabelWidth();


    $('.ui-selectmenu.ui-popup').each(function () {
        $(this).data('history', false);
    });

    $('.clearDatePicker').click(function () {
        var $element = $(this).parent().find('input');
        $element.val('');
        //Remove value from OMWMobileStory.dirtyHeaderFields
        var fieldId = $element.data('fieldid');
        for (var i = 0; i < OMWMobileStory.dirtyHeaderFields.length; i++) {
            if (OMWMobileStory.dirtyHeaderFields[i].fieldId == fieldId) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            OMWMobileStory.dirtyHeaderFields.splice(index, 1);
            if (OMWMobileStory.dirtyHeaderFields.length === 0) {
                $('.btnCancelHeader').addClass('ui-disabled');
                $('.btnSaveHeader').addClass('ui-disabled');
            }
        }
    });

    $(".custom-list-multiselect .select-list-input-text").on("focus", function (e) {
        $(this).attr('data-previous-val', $(this).val());
    });
    $(".custom-list-multiselect .select-list-input-text").on("input", function (e)
    {
        var $input = $(this);
        var text = $input.val();
        var oldVal = $input.attr('data-previous-val');

        var splitter = ';';
        var newVal = text.split(splitter);
        oldVal = oldVal.split(splitter);

        //Find difference in arrays and only work with one of them
        var length = newVal.length;
        if (oldVal.length < newVal.length) {
            length = oldVal.length;
        }

        var index = -1;
        for (var i = 0; i < length; i++) {
            if (newVal[i] !== oldVal[i]) {
                //Found different one
                index = i;
                break;
            }
        }
        var updatedValue = newVal[index] || '';

        var $selectContainer = $(this).closest('.select-container');

        var sugList = $selectContainer.find('.suggestions');
        sugList.unbind('click');

        if (updatedValue.length < 1) {
            sugList.html("");
            sugList.listview("refresh");
        } else {
            var items = [];
            var $selectOptions = $selectContainer.find('option');
            var addedItems = 1;
            $selectOptions.each(function (i, option) {
                //Check if value starts with text that is provided
                if (option.value.indexOf(updatedValue) == 0) {
                    items.push(option.value);
                    addedItems++;
                    if (addedItems > 5) {
                        return false;
                    }
                }
            });

            var str = "";
            for (var i = 0, len = items.length; i < len; i++) {
                str += "<li>" + items[i] + "</li>";
            }
            sugList.html(str);
            sugList.listview("refresh");

            sugList.on('click', 'li', function (e) {
                newVal[index] = $(this).text();
                newVal = newVal.join(splitter);
                $input.val(newVal);

                //Hide suggestion list
                sugList.html("");
                sugList.listview("refresh");
            });
        }
        //Update previous value after change
        $input.attr('data-previous-val', text);
    });

    $.mobile.loading('hide');
    ////For testing update of header fields
    // TestUpdateFields();

});

$(document).on("pageshow", "#saveAsPage", function () {

    $.mobile.popup.prototype.options.history = false;

    setTimeout(function () {
        var ul = $('#saveAsItemsList');
        ul.listview("refresh");
    }, 1);

    //Hide notification
    $.mobile.loading('hide');
});

$(document).on('pageinit', '#saveAsPage', function () {

    $.mobile.popup.prototype.options.history = false;

    $('#saveAsItemsList').on('click', '.createStory', function () {
        var data = $(this).data('param');

        $.mobile.loading('show');

        //Make ajax request 
        $.post(OMWMobileStory.OMWBaseUrl + "/Document/CopyAs/CopyAsCmd/", data, function (response) {

            //Hide notification
            $.mobile.loading('hide');

            var url = response.url;
            $.mobile.changePage(url + '?new=true', { dataUrl: "?new=true", data: { 'new': 'true' }, transition: "slideleft", allowSamePageTransition: true });
        });
    });
});

$(document).on('pageinit', '#storyPage', function () {

	$.mobile.popup.prototype.options.history = false;

	$(document).on("selectWidgetValueChanged", function (e, data)
	{
		OMWMobileStory.SetControlToDirty(data.fieldId, data.value);
		if (data.save)
			OMWMobileStory.SaveHeaderValues();
	});

    $('#backBut').click(function () {
        window.history.back();
        if (OMWMobileStory.isNewStory) {
            window.history.back();
        }
        location.reload();
    });

    //Start hiding of the carousel
    $('#searchPreviewCarouselPage').animate({ marginLeft: -$(document).width() - 20 }, 340, function () {
        //$.mobile.loading('hide');
    });

    OMWMobileStory.InitLockIcon();

    $('.pageBackButton').click(function () {
        $.mobile.back();
    });

    //Nav buttons
    $('.navBtnHeader').click(function () {
        $.mobile.loading('show');

        $('.richEditPage').hide();
        $('.headerPage').show();

        $('.editStoryPageButton').hide();
        $('.headerPageButton').show();

        $.mobile.loading('hide');
    });
    $('.navBtnRich').click(function () {
        OMWMobileStory.SetHeightOfStoryContents();
        $.mobile.loading('show');

        $('.headerPage').hide();
        $('.richEditPage').show();

        $('.headerPageButton').hide();
        $('.editStoryPageButton').show();

        $.mobile.loading('hide');
    });

    $('.btnCancelHeader').click(function () {

        OMWMobileStory.Locked = false;

        //Reload header fields
        $('.storyHeaderFields').load(OMWMobileStory.BaseURL + "/LoadMobileStoryFields/" + $('#hdnStoryId').val(), function () {


            //Disable save and cancel button
            $('.btnCancelHeader').addClass('ui-disabled');
            $('.btnSaveHeader').addClass('ui-disabled');

            $('.headerPage').trigger("create");
            $('.storyHeaderFields').listview("refresh");

            OMWMobileStory.BindFieldsChangeValue();
        });

    });
    $('.btnSaveHeader').click(function () {

        $.mobile.loading('show');

        OMWMobileStory.SaveHeaderValues();

    });

    $('.btnCancelEditRichTextPage').click(function () {

        //Disable save and cancel button
        OMWMobileStory.HideLockIcon();

        OMWMobileStory.InitCKEditor(false);
    });
    $('.btnSaveEditRichTextPage').click(function () {
        $.mobile.loading('show');

		OMWMobileStory.SaveStoryRich();

        OMWMobileStory.HTMLTextChanged = true;

    });

    var getIconUrl = function (name) {
        return 'http://demos.jquerymobile.com/1.4.1/_assets/img/jquery-logo.png';
        return OMWMobileStory.OMWBaseUrl + 'Content/' + name;
    };

    $('.save-as-mobile-toolbar-button').one('click', function () {

        //Start loading animation
        $.mobile.loading('show');

        //Make ajax request to GetCopyAsListForObject
        $.get(OMWMobileStory.OMWBaseUrl + "/Document/CopyAs/GetCopyAsListForObject/" + $('#hdnStoryId').val(), function (data) {
            console.log(data);

            //Hide notification
            $.mobile.loading('hide');

            var ul = $('#saveAsItemsList');

            ul.html('');

            for (var i = 0; i < data.length; i++) {
                var li = '<li><a class="listItem"><img src="' + getIconUrl(data[i].iconID) + '" /><h2>' + data[i].Template + '</h2><p>Folder: ' + data[i].DirectoryPath + '</p></a><a data-param="' + JSON.stringify(data[i].data) + '" class="createStory"></a></li>';
                ul.append(li);
            }

            //Open full screen list and send this data to it??
            $(':mobile-pagecontainer').pagecontainer('change', '#saveAsPage', {
                //changeHash: false
            });
        });
    });

    $("#popupHyperlinkEdit").popup();
    $('#popupHyperlinkEdit .popupHyperlinkEditCancelBtn').click(function () {
        $('#popupHyperlinkEdit #newHyperlinkValue').val('');
        $("#popupHyperlinkEdit").popup("close");
    });

    $('#popupHyperlinkEdit .popupHyperlinkEditSaveBtn').click(function () {
        var oldValue = selectedHyperLinkButton.text();
        var newValue = $('#popupHyperlinkEdit #newHyperlinkValue').val();
        var fieldId = selectedHyperLinkButton.data('fieldid');
        $('#popupHyperlinkEdit #newHyperlinkValue').val('');
        $("#popupHyperlinkEdit").popup("close");

        //Set new value to selected button
        selectedHyperLinkButton.text(newValue);
        selectedHyperLinkButton.attr('href', newValue);

        //Check if there is a change
        if (oldValue !== newValue) {
            $('.btnCancelHeader').removeClass('ui-disabled');
            $('.btnSaveHeader').removeClass('ui-disabled');

            OMWMobileStory.SetControlToDirty(fieldId, newValue);
        }

    });
    var selectedHyperLinkButton;
    $('.storyPageContent').on('click', '.editHyperLink', function () {
        selectedHyperLinkButton = $(this).parent().find('.fieldInputHyperlinkEditable');
        var hyperLink = selectedHyperLinkButton.text();
        $('#popupHyperlinkEdit #newHyperlinkValue').val(hyperLink);
        $("#popupHyperlinkEdit").popup("open");
    });

    $("#popupComoboxInput").popup({
        afterclose: function (event, ui) {
            //Return to the previous state??
            console.log(OMWMobileStory.comboboxOpenedEditPopup);

            $(OMWMobileStory.comboboxOpenedEditPopup).find('option[value="' + OMWMobileStory.comboboxPreviousValue + '"]').attr('selected', 'selected');
            OMWMobileStory.comboboxPreviousValue = "";

            $(OMWMobileStory.comboboxOpenedEditPopup).selectmenu('refresh', true);
        }
    });

    //Click event for select menu
    //$('.custom-menu-list').click(OMWMobileStory.SelectListClick);
    $('.custom-header-list-not-editable select.custom-header-list').change(function (e) {
        OMWMobile.SelectList.SelectListChange(e);

        var $select = $(e.target).closest('.ui-select').find('select.custom-menu-list');
        var fieldId = $select.data('fieldid');
        var value = $(e.target).closest('.ui-select').find('span.headerList.custom-menu-list').text();

        OMWMobileStory.SetControlToDirty(fieldId, value);
    });

    //Remove this handler
    $(document).off("pageinit", "#storyPage");
});

$(document).ready(function () {
    OMWMobileStory.BaseURL = $('#hdnBaseStoryURL').val();

    window.addEventListener('beforeunload', function (event) {
        if (!CKEDITOR.instances["Story_Text"]) return;
        //1. Check if the story is edited and not saved
        var htmlUpdated = false;
        var html = '';
        if ($('#hdnStoryShowText').val() != "False") {
            htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

            if (htmlUpdated) {
                event.returnValue = "You have unsaved changes";
            }
        }
    });

    // Always unlock story if page closes
    window.addEventListener('unload', function (event) {
        var storyId = $('#hdnStoryId').val();
        jQuery.ajax({
            type: "POST",
            url: OMWMobileStory.BaseURL + '/UnLock',
            data: { storyId: storyId, fieldId: 14 },
            async: false
        });
    });

});
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
function _getAutoSaveValueForCKEditor() {
    if (supports_html5_storage()) {
        if (localStorage["OMWeb_CKEditor"]) {
            var data = JSON.parse(localStorage["OMWeb_CKEditor"]);
            return data.autoSave;
        }
    }
    return true;
}
function _getSaveBeforeExitValueForCKEditor() {
    if (supports_html5_storage()) {
        if (localStorage["OMWeb_CKEditor"]) {
            var data = JSON.parse(localStorage["OMWeb_CKEditor"]);
            return data.saveBeforeExit;
        }
    }
    return true;
}

//Test function
function TestUpdateFields() {
    var i = 0;
    setInterval(function () {
        //eOMFieldDisplayType_MultilineText
        var multiline = "New multiline value  " + i.toString();
        OMWMobileStory.UpdateFieldFromServer(1, multiline, "eOMFieldDisplayType_MultilineText");
        OMWMobileStory.UpdateFieldFromServer(2, "Readonly " + multiline, "eOMFieldDisplayType_MultilineText");

        //eOMFieldDisplayType_Text
        var text = "New text value  " + i.toString();
        OMWMobileStory.UpdateFieldFromServer(3, text, "eOMFieldDisplayType_Text");
        OMWMobileStory.UpdateFieldFromServer(4, "Readonly " + text, "eOMFieldDisplayType_Text");

        //eOMFieldDisplayType_DateTime
        var now = new Date();
        var dateTime = now.toString();
        console.log(dateTime);
        OMWMobileStory.UpdateFieldFromServer(5, dateTime, "eOMFieldDisplayType_DateTime");
        OMWMobileStory.UpdateFieldFromServer(6, dateTime, "eOMFieldDisplayType_DateTime");

        //eOMFieldDisplayType_DateOnly
        var date = now.toDateString();
        OMWMobileStory.UpdateFieldFromServer(7, date, "eOMFieldDisplayType_DateOnly");
        OMWMobileStory.UpdateFieldFromServer(8, date, "eOMFieldDisplayType_DateOnly");

        //eOMFieldDisplayType_DateOnly
        var time = now.toTimeString();
        OMWMobileStory.UpdateFieldFromServer(9, time, "eOMFieldDisplayType_TimeOnly");
        OMWMobileStory.UpdateFieldFromServer(10, time, "eOMFieldDisplayType_TimeOnly");


        //eOMFieldDisplayType_Duration
        var time = now.toTimeString();
        OMWMobileStory.UpdateFieldFromServer(11, dateTime, "eOMFieldDisplayType_Duration");
        OMWMobileStory.UpdateFieldFromServer(12, dateTime, "eOMFieldDisplayType_Duration");


        //eOMFieldDisplayType_List
        var listItem = "opt" + i.toString();
        OMWMobileStory.UpdateFieldFromServer(13, listItem, "eOMFieldDisplayType_List");
        OMWMobileStory.UpdateFieldFromServer(14, listItem, "eOMFieldDisplayType_List");


        //eOMFieldDisplayType_List
        var listItem = "opt" + i.toString();
        OMWMobileStory.UpdateFieldFromServer(15, listItem, "eOMFieldDisplayType_Combo");
        OMWMobileStory.UpdateFieldFromServer(16, listItem, "eOMFieldDisplayType_Combo");


        //eOMFieldDisplayType_Check
        var checkValue = i % 2;
        OMWMobileStory.UpdateFieldFromServer(17, checkValue, "eOMFieldDisplayType_Check");
        OMWMobileStory.UpdateFieldFromServer(18, checkValue, "eOMFieldDisplayType_Check");

        i++;
    }, 5000);
};
