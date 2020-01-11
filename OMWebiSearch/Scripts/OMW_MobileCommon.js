OMWMobile = {};
OMWMobile.Notifications = {};

OMWMobile.Notifications.ShowNotification = function (title, text, showLoginButton, href) {
    //Set return url
    if (href == '') {
        href = $('#hdnAuthBaseURL').val() + '?returnUrl=' + document.location.pathname;
    }
    else {
        href = $('#hdnAuthBaseURL').val() + '?returnUrl=' + href;
    }

    console.log(href);
    $('#navigationLoginLink').attr('href', href);
    if (showLoginButton) {
        $('#showLoginButton').show();
    }
    else {
        $('#showLoginButton').hide();
    }

    $('#notificationPopupTitle').text(title);
    $('#notificationPopupText').text(text);

    $('#notificationPopup').popup({ shadow: true, history: false });
    $('#notificationPopup').show();
    $("#notificationPopup").popup("open");
};
OMWMobile.Notifications.HideNotification = function () {
    $("#notificationPopup").popup("close");
    $('#notificationPopup').hide();
};

$(document).ajaxError(function (event, jqxhr, settings) {
    if (jqxhr.status === 401) {
        //401 unauthorized
        var url = '';
        if (settings.url.indexOf('Index') > 0 || settings.url.indexOf('GetNavigationPaneItems') > 0) {
            url = settings.url.substr(settings.url.indexOf('/OMWebiSearch'));
        }

        $('.ui-loader.ui-corner-all.ui-body-a.ui-loader-verbose.ui-loader-textonly').remove();
        OMWMobile.Notifications.ShowNotification('Session expired.', 'Session expired. Please login.', true, url);
    }
});

$(document).bind("mobileinit", function () {
    $.mobile.pageLoadErrorMessage = '';
});


///Toolbar

OMWMobile.toolbarButtonsData = [];
OMWMobile.ToolbarURL = '';
OMWMobile.ToolbarCurrentPage = '';

OMWMobile.ToolbarButtonClick = function (btn) {

    //Get current button object
    var item = OMWMobile.toolbarButtonsData[$(btn).data('position')];
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
    var ids = OMWMobile.ToolbarGetIDs(item);
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
                        OMWMobile.ToolbarAjaxCall(item, item.ToolCommandList_Release, ids);
                        $(btn).removeClass('toolbarButtonActive');
                    }
                    else {

                        //Remove toolbar button animation
                        item.$img.removeClass('toolbarButtonAlphaIcon');
                        item.$toolbarButtonAnimation.remove();
                    }
                }
                else {
                    //Make ajax no. 2
                    OMWMobile.ToolbarAjaxCall(item, item.ToolCommandList_Release, ids);
                    $(btn).removeClass('toolbarButtonActive');
                }

            }
            else {
                if (item.askBeforeSendingPressCommands != null && item.askBeforeSendingPressCommands != "") {
                    if (confirm(item.askBeforeSendingPressCommands)) {

                        //Make ajax no. 1
                        OMWMobile.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
                        $(btn).addClass('toolbarButtonActive');
                    }
                    else {

                        //Remove toolbar button animation
                        item.$img.removeClass('toolbarButtonAlphaIcon');
                        item.$toolbarButtonAnimation.remove();
                    }
                }
                else {
                    //Make ajax no. 1
                    OMWMobile.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
                    $(btn).addClass('toolbarButtonActive');
                }
            }
        }
        else {
            if (item.askBeforeSendingPressCommands != null && item.askBeforeSendingPressCommands != "") {
                if (confirm(item.askBeforeSendingPressCommands)) {

                    //Do ajax no.1
                    OMWMobile.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
                }
                else {

                    //Remove toolbar button animation
                    item.$img.removeClass('toolbarButtonAlphaIcon');
                    item.$toolbarButtonAnimation.remove();
                }
            }
            else {
                //Do ajax no.1
                OMWMobile.ToolbarAjaxCall(item, item.ToolCommandList_Press, ids);
            }
        }
    }
    else {
        //Remove toolbar button animation
        item.$img.removeClass('toolbarButtonAlphaIcon');
        item.$toolbarButtonAnimation.remove();
    }
};
OMWMobile.ToolbarAjaxCall = function (item, commands, ids) {

    $.ajax(OMWMobile.ToolbarURL, {
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
OMWMobile.ToolbarGetIDs = function (item) {
    var ids = [];

    if (OMWMobile.ToolbarCurrentPage == 'Story') {
        //Get story id
        var storyId = $('#hdnStoryId').val();
        ids.push(storyId);
    }

    return ids;
};

OMWMobile.ToolbarStart = function () {

    //Url for action in ToolbarController
    OMWMobile.ToolbarURL = $('#hdnTopLevelBaseUrl').val() + 'Toolbar2/Event';

    OMWMobile.ToolbarCurrentPage = 'Story';

    //Get the data
    var data = $('#hdnToolbarButtonsData').val();
    if (data) {
        OMWMobile.toolbarButtonsData = JSON.parse(data);
    }
    else {
        //If there is no data (first page) assign to it empty array
        OMWMobile.toolbarButtonsData = [];
    }

    var toolbarButtons = $('.mobile-toolbar-action');

    OMWMobile.toolbarButtons = toolbarButtons;
    toolbarButtons.click(function () {
        OMWMobile.ToolbarButtonClick(this);
    });
};

OMWMobile.ToolbarStart();

OMWMobile.InitLocalStorageHandlers = function()
{
	if (!!window.OMWLocalStorage && window.OMWLocalStorage.LocalStorageEnabled)
	{
		var doc = $(document);

		doc.on("pagecontainershow", function (event, ui)
		{
			if (ui.toPage.length > 0)
			{
				var pageId = ui.toPage[0].id;

				if (pageId === 'searchProfiles')
					OMWMobile.UpdateMainMenu();
				else if (pageId === 'idUnsavedChangesPage')
					OMWMobile.UpdateStoriesList();
				else if (pageId === 'idReviewUnsavedChanges')
					OMWMobile.UpdateStoryReview();
			}
		});

		doc.on("pageshow",
			function(event, ui)
			{
				if (ui.toPage.length > 0)
				{
					var pageId = ui.toPage[0].id;

					if (pageId === 'searchProfiles')
						OMWMobile.UpdateMainMenu();
				}
			});

		doc.on("click",
			"#idCopyLocalToClipboard",
			function()
			{
				var stories = OMWLocalStorage.LoadStories();
				var localStory = OMWLocalStorage.FindStory(stories, OMWLocalStorage.GetCurrentStoryId());

				var text = localStory.Text;

				var $temp = $("<input>");
				$("body").append($temp);
				$temp.val(text).select();
				document.execCommand("copy");
				$temp.remove();
			});

		doc.on("click",
			"#idKeepServerVersion",
			function ()
			{
				OMWLocalStorage.ClearStory(OMWLocalStorage.GetCurrentStoryId());

				$("#idLocalStory").html("");
			});

		doc.on("click",
			"#idKeepLocalVersion",
			function ()
			{
				var baseUrl = $("#idMobileStoryURL").val();

				$.mobile.loading('show');

				var storyId = OMWLocalStorage.GetCurrentStoryId();
				var stories = OMWLocalStorage.LoadStories();
				var localStory = OMWLocalStorage.FindStory(stories, storyId);
				var text = escape(localStory.Text);
				var params = { storyId: storyId, fieldId: 0, fieldValue: 0, htmlUpdated: true, html: text };

				$.ajax({
						url: baseUrl + '/SaveStory',
						type: 'POST',
						traditional: true,
						dataType: 'json',
						data: params,
						success: function (data)
						{
							$.mobile.loading('hide');

							$("#idServerStory").html("");
							OMWLocalStorage.ClearStory(OMWLocalStorage.GetCurrentStoryId());
						},
						error: function (xhr, textStatus, error)
						{
							$.mobile.loading('hide');
						}
					});
			});

		doc.on("click",
			"#idOpenStory",
			function ()
			{
				OMWMobile.OpenCurrentStory();
			});
	}
};

OMWMobile.OpenCurrentStory = function()
{
	var baseUrl = $("#idMobileStoryURL").val();
	window.location.href = baseUrl + "/Index/" + OMWLocalStorage.GetCurrentStoryId();
};

OMWMobile.ExtractBody = function(html)
{
	if (!!html && html.indexOf('<html>') === 0)
		return /<body.*?>([\s\S]*)<\/body>/.exec(html)[1];

	return html;
};

OMWMobile.UpdateStoryReview = function()
{
	if (!!OMWLocalStorage.GetCurrentStoryId())
	{
		var stories = OMWLocalStorage.LoadStories();
		var localStory = OMWLocalStorage.FindStory(stories, OMWLocalStorage.GetCurrentStoryId());
		if (!localStory)
		{
			alert('Story not found in the local storage');
			return;
		}

		var html = OMWMobile.ExtractBody(localStory.Text);
		$("#idLocalStory").html(html);

		var baseUrl = $("#idMobileStoryURL").val();
		$.post(baseUrl + "/GetStoryHtmlText",
			{ id: OMWLocalStorage.GetCurrentStoryId() },
			function(data)
			{
				var html = OMWMobile.ExtractBody(data.Text);

				$("#idServerStory").html(html);
			});
	}
};

OMWMobile.UpdateStoriesList = function()
{
	var list = $("#idStoriesList");
	list.empty();

	var stories = OMWLocalStorage.LoadStories();
	for (var i = 0; i < stories.length; i++)
	{
		var story = stories[i];
		var html = '<li><a class="mobileNavigationPane ui-btn ui-btn-icon-right ui-icon-carat-r" data-id="' + story.ID + '" href="#idReviewUnsavedChanges">' + story.Title + '</a></li>';
		list.append(html);
		list.on("click",
			"a",
			function()
			{
				OMWLocalStorage.SetCurrentStoryId($(this).data('id'));
			});
	}
};

OMWMobile.UpdateMainMenu = function()
{
	var menu = $("#idStartMenu");
	var submenu = $("#idUnsavedChangesButton");
	var indicator = $("#idLocalStorageIndicator");

	var count = OMWLocalStorage.GetSavedStoriesCount();
	if (count > 0)
	{
		menu.css("margin-right", "30px");
		
		indicator.text(count.toString());
		indicator.show();

		submenu.show();
	}
	else
	{
		menu.css("margin-right", "0");

		indicator.text("");
		indicator.hide();

		submenu.hide();
	}
};

OMWMobile.InitLocalStorageHandlers();

OMWMobile.SelectList = {};
OMWMobile.SelectList.SelectListChange = function (e) {
    var $select = $(e.target).closest('.ui-select').find('select.custom-menu-list');
    var separator = $select.data('separator');
    if (separator === ',') {
        return;
    }

    var $textEl = $(e.target).closest('.ui-select').find('span.headerList.custom-menu-list');
    var text = $textEl.text();
    text = text.replace(/,/g, separator);
    $textEl.text(text);
};

OMWMobile.SelectList.ShowData = function (data, value, $select) {
    if (!(data && data.items)) {
        console.error('Failed loading items for this field');
        //Hide animation
        $.mobile.loading('hide');
        return;
    }
    
    $select.html('');

    //Append items to list
    var length = data.items.length;
    var options = '';
    for (var i = 0; i < length; i++) {
        if (value.indexOf(data.items[i]) > -1) {
            options += '<option value="' + data.items[i] + '" selected="selected">' + data.items[i] + '</option>';
        }
        else {
            options += '<option value="' + data.items[i] + '">' + data.items[i] + '</option>';
        }
    };
    $select.append(options);

    //Set loaded attribute for this select list
    $select.data('dataloaded', true);

    //Refresh selectmenu
    $select.selectmenu();
    $select.selectmenu('refresh', true);

    //Open selectmenu
    $select.selectmenu('open');
    //Hide animation
    $.mobile.loading('hide');
};