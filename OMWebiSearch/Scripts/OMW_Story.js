angular.module('omwShared')
    .controller('OMWStoryCtrl',
    [
        '$rootScope', '$scope', function ($rootScope, $scope) {
            $scope.UpdateStoryStorage=function() {
                $rootScope.$broadcast('story_updated', 1);
            }
        }
   ]);

//// Class for Story view
OMWClientContext.Story = new function ()
{
};

OMWClientContext.Story.BaseURL = "";
OMWClientContext.Story.Locked = false;
OMWClientContext.Story.CKEditorHasFocus = false;

//// Public Methods

//var hdnReadOnly = true;
var hdnReadOnly = false;


// Define _InitInternal method (private)
OMWClientContext.Story._InitInternal = function ()
{
	OMWClientContext.Story._RecordTypes = null;
	OMWClientContext.Story._StoryTextChanged = false;

};

OMWClientContext.Story.Resizing = function ()
{
	$(window).resize(OMWClientContext.Story.Resize);

	$(document).ready(function ()
	{
		OMWClientContext.Story.adjustWidth();
	});
};

OMWClientContext.Story.SetEditor = function ()
{
	var editor = CKEDITOR.instances["Story_Text"];
	if (editor) { return; }

	hdnReadOnly = $('#hdnStoryReadonly').val() == "True" ? true : false;

	OMWClientContext.Story.InitializeCKEditor(hdnReadOnly);

	OMWClientContext.Story.adjustWidth();
};

OMWClientContext.Story.CKEditorOnChange = function (e)
{

	if (OMWClientContext.Story.CKEditorHasFocus) {

		OMWClientContext.Story.KeepAliveTimestamp = new Date();

		// Check is the story already locked
		var Disabled = $("#Story_Text").attr('disabled');

		if (!OMWClientContext.Story.Locked) {
			if (Disabled != 'disabled') {
        var locked = OMWClientContext.Story.StartEditStory(0);
				//locked = OMWClientContext.Story.StartEditStatus.locked;
				/*switch (locked) {
					case OMWClientContext.Story.StartEditStatus.notLocked:
						if (!!e) {
							e.removeListener('change');
							CKEDITOR.instances.Story_Text.execCommand('undo');
							CKEDITOR.instances.Story_Text.on('change', OMWClientContext.Story.CKEditorOnChange);
						}
						alert('Story already locked');
						break;
					case OMWClientContext.Story.StartEditStatus.locked:
						OMWClientContext.Story.Locked = true;
						OMWClientContext.Story.ShowLockIcon();

						OMWClientContext.Story.EnableSaveButton();
						break;
					case OMWClientContext.Story.StartEditStatus.changed:
						if (!!e) {
							e.removeListener('change');
							CKEDITOR.instances.Story_Text.execCommand('undo');
							CKEDITOR.instances.Story_Text.on('change', OMWClientContext.Story.CKEditorOnChange);
						}
						alert('Please refresh page!');
						break;
					default:

				}*/
			}
		}
  }
  return true;
  //return OMWClientContext.Story.Locked;
};

OMWClientContext.Story.InitializeCKEditor = function (readonly, disabled)
{
	var top = $('#headerM').offset().top;

	//var height = $(window).height() - $('#contentPanel').offset().top - 180;
	var height = $(window).height() - $('#contentPanel').offset().top - 25 - 137;
	console.info("height:%s", height);

	var editor = CKEDITOR.instances["Story_Text"];
	if (editor) { editor.destroy(true); }
	//DISABLED FROM SERVER
	$('#Story_Text').attr('disabled', disabled);


	if (OMWClientContext.Story.IsRTL) {
		CKEDITOR.config.contentsLangDirection = 'rtl';
	}

	//Here is the configuration for new timeuntilcursor plugin
	//when property showWordcount = true then we show Wordcount in a plugin, when false we hide that
	//when property showTotalTime = true we show time when no text is selected, when false we hide it
	CKEDITOR.config.timeuntilcursor = {
		showWordcount: true,
		showTotalTime: false
	};

	var toolbar = OMWClientContext.EditorToolbar;
	if (!toolbar)
	{
		toolbar = [];
		showToolbarError();
	}

	if (readonly) {
		$('#Story_Text').attr('disabled', 'disabled');
		CKEDITOR.replace('Story.Text',
		   {
			fullPage: true,
			extraPlugins: 'records,mediainsert',
			toolbar: toolbar,
			height: height + 'px',
			autoGrow_minHeight: 300,
		   });

		// STYLE .cke_focus needs to change so there is no border on focus
	}
  else
	{
    var localStoragePlugin = !!window.OMWLocalStorage && window.OMWLocalStorage.LocalStorageEnabled ? ",omwlocalstorage" : "";
		var editorM = CKEDITOR.replace('Story.Text',
		   {
			fullPage: true,
			extraPlugins: 'records,omwsearch,omwcontextmenu,settings,omwinsertimg,timeuntilcursor' + localStoragePlugin,
			toolbar: toolbar,
			height: height + 'px',
			autoGrow_minHeight: 300,
			//enterMode: CKEDITOR.ENTER_BR
		   });

		editorM.addCommand('saveStoryCommand', {
			exec: function (editor, data)
			{
				console.log('saving to server');
				OMWClientContext.Story.EndEditStory('0', '0');
			}
		});
		editorM.keystrokeHandler.keystrokes[CKEDITOR.CTRL + 83 /* S */] = 'saveStoryCommand';

		//CKEDITOR.instances.Story_Text.on('contentDom', function () {
		//    //get all fonts from the body
		//    var editor = CKEDITOR.instances.Story_Text;
		//    var body = editor.document.getBody();
		//    var fonts = body.getElementsByTag('font');
		//    if (fonts.count() > 0) {
		//        var font = fonts.getItem(0);

		//        var face = font.getAttribute('face');
		//        //Set this as default

		//        editor.dataProcessor.htmlFilter.addRules({
		//            elements: {
		//                //p: function (e) { e.attributes.style = 'font-size:' + fontsizevariable + 'px; font-family:' + fontfamilyvariable + ';'; }
		//                div: function (e) { e.attributes.style = 'font-family:' + face + ';'; },
		//                p: function (e) { e.attributes.style = 'font-family:' + face + ';'; }
		//            }
		//        });
		//    }
		//});

		OMWClientContext.Story.KeepAliveTimestamp = new Date();
		OMWClientContext.Story.KeepAliveInterval = '';

		var bodyEl = $("body");
		var editorOnly = !!bodyEl.data("editor-only");

		CKEDITOR.instances.Story_Text.on('instanceReady', function (e)
		{
			var editor = CKEDITOR.instances.Story_Text;
			editor.on('drop', function(e)
			{
				handleEditorDrop(e, editor);
			});

			var scope = angular.element($('#storyController')).scope();
			scope.initMediaInsertDialog(editor);

			if (editorOnly)
				editor.execCommand('maximize');
		});

		CKEDITOR.instances.Story_Text.on('save', function (e)
		{
			OMWClientContext.Story.EndEditStory('0', '0');
		});

		if (editorOnly)
		{
			CKEDITOR.instances.Story_Text.on('maximize',
				function (e)
				{
					if (e.data === 1)
						bodyEl.addClass('editor-only');
					else
						bodyEl.removeClass('editor-only');
				});
        }

        CKEDITOR.instances.Story_Text.on('maximize',
            function (e) {
                if (e.data === 1)
                    $("#contentPanel").css("min-height", "100vh")
                else
                    $("#contentPanel").removeAttr("style");
            });

		//OMWClientContext.Story.CKEditorOnChange
		CKEDITOR.instances.Story_Text.on('change', OMWClientContext.Story.CKEditorOnChange);

		// Events for locking and unlocking story, sending the fieldId = 0 as you told me
		CKEDITOR.instances.Story_Text.on('focus', function ()
		{
			OMWClientContext.Story.CKEditorHasFocus = true;

			//Add thin frame around
			$("#cke_Story_Text").addClass('lockStory');

			OMWClientContext.Story.KeepAliveInterval = setInterval(function ()
			{

				//var hasLocked = $("#cke_Story_Text").hasClass('lockStory');
				if (!OMWClientContext.Story.Locked) {
					OMWClientContext.Story.KeepAliveEvent();
				}
			}, 30000);
		});

		CKEDITOR.instances.Story_Text.on('blur', function ()
		{
			OMWClientContext.Story.CKEditorHasFocus = false;
			//Remove thin frame that is around
			$("#cke_Story_Text").removeClass('lockStory');

			clearInterval(OMWClientContext.Story.KeepAliveInterval);
		});

		CKEDITOR.instances.Story_Text.on('paste', function (e)
		{
			console.log(e);
			if (!OMWClientContext.Story.CKEditorOnChange()) {
				//Dont allow paste event to finish
				e.cancel();
				e.stop();
			}
			////Save changes
			//CKEDITOR.instances.Story_Text.fire('saveSnapshot')
		});

		OMWClientContext.Story.InitLockIcon();
	}

	//nanospell.ckeditor('Story_Text', {
	//	dictionary: "en",  // 24 free international dictionaries  
	//	server: "asp.net"      // can be php, asp, asp.net or java
	//});

	OMWClientContext.Story.AskToLoadSavedStory();
};

function showToolbarError()
{
	var dlg = '<div id="dialog-toolbar-error" title="Configuration Error" style="display: none">' +
		'<span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>CK Editor buttons configuration is wrong. Please contact your system administrator.' +
		'</div>';

	$("body").append(dlg);

	$("#dialog-toolbar-error").dialog({
		resizable: false,
		height: "auto",
		closeOnEscape: true,
		width: 400,
		modal: false,
		open: function(event, ui)
		{
			$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();

			var parent = $(event.target).closest(".ui-dialog");

			var offsetX = parent.width() / 2;
			var offsetY = parent.height() / 2;

			parent.css("position", "absolute");
			parent.css("left", "calc(50% - " + offsetX + "px");
			parent.css("top", "calc(50% - " + offsetY + "px");
		},
		buttons: {
			"OK": function()
			{
				$(this).dialog("close");
			}
		}
	});
}

function handlePageDrop(e, editor)
{
	var data = e.originalEvent.dataTransfer.getData("search_hits");
	var hits = JSON.parse(data);
	if (Array.isArray(hits) && hits.length > 0)
	{
		var hit = hits[0];

		setTimeout(function ()
		{
			var imgUrl = "https://camo.githubusercontent.com/667301517903d259621233a1e064e82e46d0d7bf/687474703a2f2f692e696d6775722e636f6d2f63734a4e3542562e706e67";
			var imgTag = '<img class="MediaInsert" title="' + hit.PreviewHeader + '" data-id="' + hit.ObjID + '" src="' + imgUrl + '" />';
			var droppedData = htmlEscape(imgTag);

			var response = OMWClientContext.Story.PasteObjInStoryText(droppedData);

			if (!!response && (response.indexOf('<') === 0 || response.indexOf('&lt;') === 0))
			{
				imgTag = htmlUnescape(response);

				var img = editor.document.$.createElement("img");
				var body = editor.document.$.body;
				if (!!body.firstChild)
					body.insertBefore(img, body.firstChild);
				else
					body.appendChild(img);

				img.outerHTML = imgTag;

				editor.focus();
			}
			else
				alert('Server rejected pasted object');
		});
	}
}

function handleEditorDrop(e, editor)
{
	debugger;

	// call 'setData' after 2 seconds
	setTimeout(function ()
	{
		debugger;
		editor.setData("<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>");
	}, 2000);

	var droppedData = e.data.$.dataTransfer.getData('text/html');
	if (!!droppedData)
	{
		var droppedHtml = $(droppedData);
		if (droppedHtml.length === 1)
		{
			var element = droppedHtml[0];
			if (element.tagName === 'IMG' && element.className === 'MediaInsert')
			{
				element = $(element);
				var guid = element.attr("data-guid");

				setTimeout(function ()
				{
					droppedData = htmlEscape(droppedData);

					var response = OMWClientContext.Story.PasteObjInStoryText(droppedData);

					if (!!response && (response.indexOf('<') === 0 || response.indexOf('&lt;') === 0))
						response = htmlUnescape(response);

					var images = editor.document.$.querySelectorAll('[data-guid]');
					if (images.length > 0)
					{
						for (var i = 0; i < images.length; i++)
						{
							var img = images[i];
							var attr = img.getAttribute('data-guid');
							if (!!attr && attr === guid)
							{
								if (!!response)
								{
									img.removeAttribute("data-guid");
									img.outerHTML = response;
								}
								else
								{
									img.remove();
									editor.getSelection().removeAllRanges();

									alert('Server rejected pasted object');
								}

								break;
							}
						}
					}
				}, 100);
			}
		}
	}
}

function htmlEscape(str)
{
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function htmlUnescape(str)
{
	return str
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

OMWClientContext.Story.PasteObjInStoryText = function (html)
{
	$('#storyLoading').show();
	var storyId = $('#hdnStoryId').val();
	var viewId = $('#hdnToolbarComboboxViewID').val();
	if (!viewId)
		viewId = 0;

	var markup = '';

	$.ajax({
			type: 'POST',
			async: false,
			url: OMWClientContext.GetFullUrl('StoryH/StoryH/PasteInStoryText'),
			data: { storyId: storyId, viewId: viewId, html: html }
		})
		.done(function (data)
		{
			if (!!data)
				markup = data.markup;
		})
		.fail(function (xhr, textStatus, error)
		{
			return null;
		})
		.always(function ()
		{
			$('#storyLoading').hide();
		});
	return markup;
}

OMWClientContext.Story.KeepAliveEvent = function ()
{
	var difference = (new Date() - OMWClientContext.Story.KeepAliveTimestamp) / 1000;
	if (difference <= 30) {
		//Save or send KeepAlive to server
		if (_getAutoSaveValueForCKEditor()) {
			//Save to server
			console.log('auto save');
			OMWClientContext.Story.EndEditStory('0', '0');
		}
		else {
			OMWClientContext.Story.KeepAlive();
			console.log('keep alive');
		}
	}

};
OMWClientContext.Story.KeepAlive = function ()
{
	$.post(OMWClientContext.Story.BaseURL + "/KeepAlive", {}, function () { });
};

function getImageInfo(element) {
	var info = element.$.getAttribute('data-omid');
	if (!info)
		info = element.$.getAttribute('data-id');

	if (!info)
		info = element.$.className;

	return info;
}

OMWClientContext.Story.HandleIconDblClick = function(element) {
	alert('ICON: ' + getImageInfo(element));
};

OMWClientContext.Story.HandleIconDblClickWithCtrl = function (element) {
	alert('ICON with CTRL: ' + getImageInfo(element));
};

OMWClientContext.Story.HandleMainAreaDblClick = function (element) {

	var editor = CKEDITOR.instances.Story_Text;

	var storyId = $('#hdnStoryId').val();

	var mediaInsertId = element.data('omid');
	if (!mediaInsertId)
		mediaInsertId = element.data('id');

	var scope = angular.element($('#storyController')).scope();
	scope.openMediaInsertDialog(editor, storyId, mediaInsertId).then(function()
	{
		var selection = editor.getSelection();
		var range = selection.getRanges()[0];

		range.startOffset = range.endOffset;
		selection.selectRanges([range]);

		element.scrollIntoView();
	});
};

OMWClientContext.Story.HandleMainAreaDblClickWithCtrl = function (element) {
	alert('MAIN AREA with CTRL: ' + getImageInfo(element));
};

OMWClientContext.Story.HandleStoryDblClick = function (element, e)
{
	var aParentTag = OMWClientContext.Story.elementInsideATag(element);

	if (element.is('img')) {
		if (element.hasClass("MediaInsert")) {

			setTimeout(function () {
				var iconSize = element.data("iconsize");
				if (!iconSize)
					iconSize = 20;

				if (e.offsetX >= 0 && e.offsetY >= 0 && e.offsetX <= iconSize && e.offsetY <= iconSize) {
					if (e.ctrlKey)
						OMWClientContext.Story.HandleIconDblClickWithCtrl(element);
					else
						OMWClientContext.Story.HandleIconDblClick(element);
				} else {
					if (e.ctrlKey)
						OMWClientContext.Story.HandleMainAreaDblClickWithCtrl(element);
					else
						OMWClientContext.Story.HandleMainAreaDblClick(element);
				}
			});

			return true;
		}
		else if (element.data('id')) {
			if (element.data('dcmd')) {
				//Open pop up
				var scope = angular.element($('#storyController')).scope();
				scope.openImagePopUp(element.data('id'));
				return true;
			}
			else if (element.hasClass('OMInsert')) {
				//Open in new tab
				var url = OMWClientContext.Story.BaseURL + 'Index/' + element.data('id');
				window.open(url);

				return true;
			}
		}
	}
	else if (aParentTag != null) {
		window.open(aParentTag.getAttribute('href'));

		return true;
	}
	return false;
};

//Check if the element is inside of an A tag
OMWClientContext.Story.elementInsideATag = function (element)
{
	try {
		while (!element.getParent().is('body')) {
			if (element.is('a')) {
				return element;
			}
			element = element.getParent();
		}
		return null;
	}
	catch (e) {
		return null;
	}
};
// Deleting the old and creating the new CKEditor that is readoOnly
OMWClientContext.Story.BlockStory = function ()
{
	console.log(hdnReadOnly);
	//CAll only if the CKEditor is enabled
	if (!hdnReadOnly) {
		OMWClientContext.Story.InitializeCKEditor(hdnReadOnly, true);

		//Changing background color to gray because it is locked
		$("#cke_Story_Text iframe").css('backgroundColor', '#D8D8D8');
	}

};

// Deleting the old and creating the new CKEditor that is readoOnly
OMWClientContext.Story.UnblockStory = function ()
{
	console.log(hdnReadOnly);
	//CAll only if the CKEditor is enabled
	if (!hdnReadOnly) {
		OMWClientContext.Story.InitializeCKEditor(hdnReadOnly, false);

		//Changing background color to white
		$("#cke_Story_Text iframe").css('backgroundColor', 'white');
	}

};

//UpdateStoryText 
// FUNCTION FOR TESTING
//    OMWClientContext.Story.UpdateStoryText("<html><head><title></title></head><body><p>New text</p></body</html>")  

OMWClientContext.Story.UpdateStoryText = function (newHtml)
{
	var editor = CKEDITOR.instances["Story_Text"];

	var wnd = $(editor.document.getWindow().$);

	var oldScrollPos = wnd.scrollTop();

	editor.setData(newHtml,
		function()
		{
			wnd = $(editor.document.getWindow().$);
			wnd.scrollTop(oldScrollPos);
		});
	editor.resetDirty();
}

OMWClientContext.Story.UpdateStoryImages = function (newHtml)
{
	var sourceImages = $(newHtml).find("img[data-id]").map(function (index, element)
	{
		element = $(element);

		return {
			id: element.attr("data-id"),
			src: element.attr("src")
		};
	});

	///////////////////////////////////////////////////////////

	var editor = CKEDITOR.instances["Story_Text"];

	var document = $(editor.document.$);
	var targetImages = document.find("img[data-id]");
	updateImages(sourceImages, targetImages);

	function updateImages(sourceImages, targetImages)
	{
		for (var i = 0; i < targetImages.length; i++) {
			var targetImg = $(targetImages[i]);
			var targetId = targetImg.attr("data-id");
			if (!!targetId) {
				for (var j = 0; j < sourceImages.length; j++)
				{
					if (sourceImages[j].id == targetId)
					{
						var currSrc = targetImg.attr("src");
						if (currSrc !== sourceImages[j].src)
						{
							targetImg.attr("src", sourceImages[j].src);
							targetImg.attr("data-cke-saved-src", sourceImages[j].src);
						}
						break;
					}
				}
			}
		}
	}
};

OMWClientContext.Story.GetRecordTypes = function ()
{
	if (OMWClientContext.Story._RecordTypes == null) {
		var storyId = $('#hdnStoryId').val();

		var params = { storyId: $('#hdnStoryId').val() };
		var records;
		$.ajax({
			//url: OMWClientContext.GetFullUrl('Story/EditStory/GetRecordIcons'),
			url: OMWClientContext.Story.BaseURL + '/GetRecordIcons',
			type: 'POST',
			traditional: true,
			dataType: 'json',
			data: params,
			asyc: false,
			success: function (response)
			{
				OMWClientContext.Story._RecordTypes = response;
			},

			error: function (xhr, textStatus, error)
			{
				OMWClientContext.ProcessAjaxError(xhr);
			}
		});
	}

	return OMWClientContext.Story._RecordTypes;
};

OMWClientContext.Story.GetRecord = function (name)
{

	for (var i = 0; i < OMWClientContext.Story.GetRecordTypes().length; i++) {
		if (OMWClientContext.Story.GetRecordTypes()[i].Name == name) {
			return OMWClientContext.Story.GetRecordTypes()[i];
		}
	}
};

// The commented lines are no longer needed because of AngularJS
OMWClientContext.Story.SetupHeaderFields = function ()
{
	$('.dateTimePicker').datetimepicker({
		timeFormat: 'hh:mm:ss',
		dateFormat: 'dd.mm.yy',
		onClose: function (datetimeText, datepickerInstance)
		{
			//if ($(this).attr("fieldId")) {
			//    OMWClientContext.Story.EndEditStory($(this).attr("fieldId"), this);
			//}
			//var dateTime = datetimeText.split(' ');
			//$('#' + datepickerInstance.id).val(dateTime[0]);
		}
	});
	$('.datePicker').datepicker({
		dateFormat: 'dd.mm.yy',

	});
	$('.timePicker').timepicker({
		timeFormat: 'hh:mm:ss',
	});

	$('.SearchInput').hover(function ()
	{
		$(this).addClass('input-active');
	}, function ()
	{
		$(this).removeClass('input-active');
	});
};

OMWClientContext.Story.StartEditStatus = {
	locked: 0,
	notLocked: 1,
	changed: 2
};

OMWClientContext.Story.StartEditStory = function (fieldId)
{
	console.log("StartEditStory called");
	// lock story
	var storyId = $('#hdnStoryId').val();
	var returnValue = OMWClientContext.Story.StartEditStatus.notLocked;

	// Start showing the Jquery ajax animation
	$('#contentPanel').addClass("loading");

	$.ajax({
		type: 'POST',
		url: OMWClientContext.Story.BaseURL + "/LockStory",
		data: { storyId: storyId, fieldId: fieldId },
		async: false
	}).success(function (data)
	{

        console.log(data);
        angular.element(document.getElementById('OMWStoryCtrl')).scope().UpdateStoryStorage();

		if (data.status == "OK") {
			var previousStoryText = $('#hdnStoryText').text().trim();
			if (data.storyText !== previousStoryText) {
				returnValue = OMWClientContext.Story.StartEditStatus.changed;
			}
			else {
				returnValue = OMWClientContext.Story.StartEditStatus.locked;
			}
		}
		//else {
		//    //If the message is not OK show message for 10 sec and then block story
		//    //OMWClientContext.Story.ShowLockedMessage();

		//    //OMWClientContext.Story.BlockStory();
		//}

	}, 'json')
	.always(function ()
	{
		// Stop the animation
		$('#contentPanel').removeClass("loading");
	});
	return returnValue;
};
OMWClientContext.Story.ShowLockedMessage = function ()
{
	$('.contentPanelWrap .storyMessageText').text(data.message);

	$('.contentPanelWrap button').click(function ()
	{
		$('.storyMessage').removeClass('showStoryMessage');
	});

	$('.storyMessage').addClass('showStoryMessage');


	//wait 10 seconds and then fade out
	setTimeout(function ()
	{
		$('.storyMessage').removeClass('showStoryMessage');

	}, 10000);
};
OMWClientContext.Story.UnlockStory = function (fieldId)
{
	var storyId = $('#hdnStoryId').val();

	$.ajax({
		type: 'POST',
		//  url: OMWClientContext.GetFullUrl('Story/EditStory/UnLock'),
		url: OMWClientContext.Story.BaseURL + '/UnLockStory',
		data: { storyId: storyId, fieldId: fieldId },
		success: function (data)
		{

			//It is unlocked, disable the Save button
			OMWClientContext.Story.DisableSaveButton();

			OMWClientContext.Story.HideLockIcon();
			OMWClientContext.Story.Locked = false;
		},
		error: function (xhr, textStatus, error)
		{
			OMWClientContext.ProcessAjaxError(xhr);
		}
	});
};

OMWClientContext.Story.EndEditStory = function (fieldId, fieldValue)
{

	// Start showing the Jquery ajax animation
	$('#contentPanel').addClass("loading");


	var storyId = $('#hdnStoryId').val();

	// update story 

	var htmlUpdated = false;
	var html = '';
	if ($('#hdnShowText').val() != "False") {
		htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

		if (htmlUpdated) {
			CKEDITOR.instances["Story_Text"].resetDirty();
			html = escape(CKEDITOR.instances["Story_Text"].getData());

			// console.log('Story text is updating');
			console.log(html);
		}
	}

	var params = { storyId: storyId, fieldId: fieldId, fieldValue: fieldValue, htmlUpdated: htmlUpdated, html: html };
	$.ajax({
		//url: OMWClientContext.GetFullUrl('Story/EditStory/SaveStory'),
		url: OMWClientContext.Story.BaseURL + '/SaveStory',
		type: 'POST',
		traditional: true,
		dataType: 'json',
		data: params,
		success: function (data)
		{
			$('#contentPanel').removeClass("loading");
			console.log(data);
			if (data.status == "error") {
				OMWClientContext.ProcessAjaxErrorSaveStory(data);
			}
			else {
				//It is saved and unlocked, disable the Save button and hide lock icon
				OMWClientContext.Story.DisableSaveButton();

				OMWClientContext.Story.HideLockIcon();
				OMWClientContext.Story.Locked = false;

				if (!!window.OMWLocalStorage && OMWLocalStorage.LocalStorageEnabled)
					OMWLocalStorage.ClearStory(storyId);

				//Restart undo
				//CKEDITOR.instances.Story_Text.resetUndo();
			}
		},
		error: function (xhr, textStatus, error)
		{
			$('#contentPanel').removeClass("loading");
			//Add button that will ask does the user want to save story localy??
			console.log(xhr);
			OMWClientContext.ProcessAjaxErrorSaveStory(xhr);

		}
	});

};


OMWClientContext.Story.EndEditStoryDateTime = function (fieldId, fieldValue, fieldFormat)
{

	$('#contentPanel').addClass("loading");

	var storyId = $('#hdnStoryId').val();

	var htmlUpdated = false;
	var html = '';
	if ($('#hdnShowText').val() != "False") {
		// update story 
		htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

		if (htmlUpdated) {
			CKEDITOR.instances["Story_Text"].resetDirty();
			html = escape(CKEDITOR.instances["Story_Text"].getData());

			// console.log('Story text is updating');
			console.log(html);
		}
	}


	var params = { storyId: $('#hdnStoryId').val(), fieldId: fieldId, fieldValue: fieldValue, fieldFormat: fieldFormat, htmlUpdated: htmlUpdated, html: html };
	$.ajax({
		//url: OMWClientContext.GetFullUrl('Story/EditStory/SaveStoryDateTime'),
		url: OMWClientContext.Story.BaseURL + '/SaveStoryDateTime',
		type: 'POST',
		traditional: true,
		dataType: 'json',
		data: params,
		success: function (data)
		{
			$('#contentPanel').removeClass("loading");
			console.log(data);
			if (data.status == "error") {
				OMWClientContext.ProcessAjaxErrorSaveStory(data);
			}
			else {
				//It is saved and unlocked, disable the Save button and hide lock icon
				OMWClientContext.Story.DisableSaveButton();

				OMWClientContext.Story.HideLockIcon();
				OMWClientContext.Story.Locked = false;

				//Restart undo
				//CKEDITOR.instances.Story_Text.resetUndo();
			}
		},
		error: function (xhr, textStatus, error)
		{
			$('#contentPanel').removeClass("loading");
			OMWClientContext.ProcessAjaxErrorSaveStory(xhr);
		}
	});
};

OMWClientContext.Story.InitLockIcon = function ()
{
	//$('#Story_Text').after("<div id='lockIcon'></div>");
};
OMWClientContext.Story.HideLockIcon = function ()
{
	$('#lockIcon').hide();
};
OMWClientContext.Story.ShowLockIcon = function ()
{
	$('#lockIcon').show();
};


OMWClientContext.Story.adjustWidth = function ()
{
	OMWClientContext._FixContentMWidth(false);
};

OMWClientContext.Story.SaveStoryLocaly = function (el)
{

	if (supports_html5_storage()) {
		console.log('save');

		CKEDITOR.instances["Story_Text"].resetDirty();

		var data = CKEDITOR.instances["Story_Text"].getData();
		console.log(data);

		localStorage["OMWSavedStory"] = data;

		console.log(el);
		var id = $(el).parent().attr('id');
		console.log(id);
		Notification.HideNotification(id);
	}
};

OMWClientContext.Story.CancelShowLocalStory = function (el)
{
	if (supports_html5_storage()) {

		if (localStorage["OMWSavedStory"]) {
			localStorage.removeItem("OMWSavedStory");
			console.log('CancelShowLocalStory');
			console.log(el);
			var id = $(el).parent().attr('id');
			Notification.HideNotification(id);
		}
	}
};

OMWClientContext.Story.ShowLocalStory = function (el)
{
	if (supports_html5_storage()) {

		if (localStorage["OMWSavedStory"]) {
			OMWClientContext.Story.UpdateStoryText(localStorage["OMWSavedStory"]);

			localStorage.removeItem("OMWSavedStory");
			console.log('ShowLocalStory');
			console.log(el);
			var id = $(el).parent().attr('id');
			Notification.HideNotification(id);
		}
	}
};

OMWClientContext.Story.AskToLoadSavedStory = function ()
{

	//If there is the story saved localy

	if (supports_html5_storage()) {

		var history;

		if (localStorage["OMWSavedStory"]) {
			//Ask do the user want to load the localy saved story??
			var notification = { message: "", loadStory: "yes" };
			Notification.PushNotification(notification);
			//And if the user shows it the it should be deleted form the local memory
		}
	}
};

/**
 * Super user modal
 */

OMWClientContext.Story.SuperUserLockedInit = function ()
{
	//Close
	$('#superUserModalCloseIcon').click(OMWClientContext.Story.SuperUserModalClose);
	$('#superUserModalClose').click(OMWClientContext.Story.SuperUserModalClose);

	//Copy to clipboard
	$('#superUserModalCopyToClipboard').click(OMWClientContext.Story.SuperUserModalCopyToClipboard);

	//Init CKEditor
	var editor = CKEDITOR.instances["superUserModalCKEditor"];
	if (editor) { editor.destroy(true); }

	CKEDITOR.replace('superUserModalCKEditor', {
		fullPage: true,
		extraPlugins: '',
		toolbar: [['Print']],
		//height: height + 'px',
		autoGrow_minHeight: 200,
	});
};

OMWClientContext.Story.PopUpUnlockStory = function (textMessage)
{

	//Init fields
	$('#superUserModalTextMessage').text(textMessage);

	//Init CKEditors text
	var html = CKEDITOR.instances["Story_Text"].getData();

	var editor = CKEDITOR.instances["superUserModalCKEditor"];
	editor.setData(html);
	editor.resetDirty();

	//Show dialog
	$('#superUserModal').addClass('showModalDialog');
};

OMWClientContext.Story.SuperUserModalClose = function ()
{
	$('#superUserModal').removeClass('showModalDialog');
};

OMWClientContext.Story.SuperUserModalCopyToClipboard = function ()
{
	var editor = CKEDITOR.instances["superUserModalCKEditor"];
	editor.execCommand("selectAll");
	setTimeout(function ()
	{
		editor.execCommand('copy');
	}, 0);
};

OMWClientContext.Story.DisableSaveButton = function ()
{
	$('#saveButton').addClass('toolbar-button-disabled');
	$('#toolbarMenuButtonSaveAsVersion').addClass('button-disabled');

	CKEDITOR.instances.Story_Text.commands.save.disable();
};

OMWClientContext.Story.EnableSaveButton = function ()
{
	$('#saveButton').removeClass('toolbar-button-disabled');
	$('#toolbarMenuButtonSaveAsVersion').removeClass('button-disabled');

	CKEDITOR.instances.Story_Text.commands.save.enable();
};


function supports_html5_storage()
{
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function isDropAllowed(e)
{
	if (!!e.originalEvent)
	{
		var dataTransfer = e.originalEvent.dataTransfer;
		if (!!dataTransfer)
		{
			for (var i = 0; i < dataTransfer.types.length; i++)
			{
				if (dataTransfer.types[i] === "search_hits")
					return true;
			}
		}
	}

	return false;
}

function preventDrop(e)
{
	e.preventDefault();

	var dataTransfer = e.originalEvent.dataTransfer;
	if (!!dataTransfer)
	{
		dataTransfer.effectAllowed = "none";
		dataTransfer.dropEffect = "none";
	}
}

OMWClientContext.Story.InitializeDragDrop = function()
{
	var counter = 0;

	var body = $("body");
	var container = body.find("#containerM");

	body.on("dragenter",
			function(e)
			{
				e.stopPropagation();

				if (isDropAllowed(e))
				{
					if (counter === 0)
						container.addClass("drop-highlight");

					counter++;
				}
				else
				{
					preventDrop(e);
				}
			})
		.on("dragleave",
			function(e)
			{
				e.stopPropagation();

				counter--;
				if (counter <= 0)
				{
					counter = 0;
					container.removeClass("drop-highlight");
				}
			})
		.on("dragover",
			function(e)
			{
				if (isDropAllowed(e))
				{
					e.stopPropagation();
					e.preventDefault();
				}
				else
				{
					preventDrop(e);
				}
			})
		.on("drop",
			function(e)
			{
				e.stopPropagation();

				counter = 0;

				container.removeClass("drop-highlight");

				var editor = CKEDITOR.instances["Story_Text"];
				handlePageDrop(e, editor);
			});
};

$(document).ready(function ()
{

	try
	{
		OMWClientContext.Story.SetEditor();

		OMWClientContext.Story.InitializeDragDrop();
	}
	catch (e) { }

	$('#deleteButton').click(function ()
	{
		alert('STORY DELETED');
	});

	$('#saveButton').click(function (e)
	{
		e.stopPropagation();

		if (!$(this).hasClass('toolbar-button-disabled')) {
			OMWClientContext.Story.EndEditStory('0', '0');
		}
	});

	$('#toolbarMenuButtonVersionHistory').click(function (e)
	{
		//Get scope of story
		var scope = angular.element($('#storyController')).scope();

		var storyId = $('#hdnStoryId').val()

		//call method to open pop up
		scope.versionStory(storyId);

		$('.saveMoreItems').hide();
	});

	$('#toolbarMenuButtonSaveAsVersion').click(function (e)
	{
		e.stopPropagation();

		if ($(this).hasClass('button-disabled')) {
			return;
		}

		$('.saveMoreItems').hide();

		console.warn('HTTP request to save as version');
		// Start showing the Jquery ajax animation
		$('#contentPanel').addClass("loading");


		var storyId = $('#hdnStoryId').val();

		var htmlUpdated = false;
		var html = '';
		if ($('#hdnShowText').val() != "False") {
			htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

			if (htmlUpdated) {
				CKEDITOR.instances["Story_Text"].resetDirty();
				html = escape(CKEDITOR.instances["Story_Text"].getData());
			}
		}

		var params = { storyId: $('#hdnStoryId').val(), fieldId: '0', fieldValue: '0', htmlUpdated: htmlUpdated, html: html };
		$.ajax({
			url: OMWClientContext.Story.BaseURL + '/SaveStoryAsVersion',
			type: 'POST',
			traditional: true,
			dataType: 'json',
			data: params,
			success: function (data)
			{
				$('#contentPanel').removeClass("loading");
				console.log(data);
				if (data.status == "error") {
					OMWClientContext.ProcessAjaxErrorSaveStory(data);
				}
				else {
					//It is saved and unlocked, disable the Save button and hide lock icon
					OMWClientContext.Story.DisableSaveButton();

					OMWClientContext.Story.HideLockIcon();
					OMWClientContext.Story.Locked = false;
				}
			},
			error: function (xhr, textStatus, error)
			{
				$('#contentPanel').removeClass("loading");
				//Add button that will ask does the user want to save story localy??
				console.log(xhr);
				OMWClientContext.ProcessAjaxErrorSaveStory(xhr);
			}
		});

	});

	if ($('#hdnStoryShowText').val() !== 'True') {
		OMWClientContext.Story.Resizing();
	}

	OMWClientContext.Story.BaseURL = $('#baseURL').val();
	OMWClientContext.Story.IsRTL = $('#hdnIsRTLText').val() == 'True' ? true : false;

	OMWClientContext.Story.SuperUserLockedInit();

	window.addEventListener('beforeunload', function (event)
	{

		//1. Check if the story is edited and not saved
		var htmlUpdated = false;
		var html = '';
		if ($('#hdnShowText').val() != "False") {
			htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();

			if (htmlUpdated) {

				//2. Check if user want to save before exit
				var saveToServer = _getSaveBeforeExitValueForCKEditor();

				//3. Save to server if user clicked Yes
				if (saveToServer) {
					$('#contentPanel').addClass("loading");

					//Get html of story
					CKEDITOR.instances["Story_Text"].resetDirty();
					html = escape(CKEDITOR.instances["Story_Text"].getData());

					//Make ajax call to server 
					var params = { storyId: $('#hdnStoryId').val(), fieldId: '0', fieldValue: '0', htmlUpdated: htmlUpdated, html: html };
					$.ajax({
						url: OMWClientContext.Story.BaseURL + '/SaveStory',
						async: false,
						type: 'POST',
						traditional: true,
						dataType: 'json',
						data: params,
						success: function (data)
						{
							$('#contentPanel').removeClass("loading");
						},
						error: function (xhr, textStatus, error)
						{
							$('#contentPanel').removeClass("loading");
						}
					});
				}

			}
		}
	});
});

function _getAutoSaveValueForCKEditor()
{
	if (supports_html5_storage()) {
		if (localStorage["OMWeb_CKEditor"]) {
			var data = JSON.parse(localStorage["OMWeb_CKEditor"]);
			return data.autoSave;
		}
	}
	return true;
}
function _getSaveBeforeExitValueForCKEditor()
{
	if (supports_html5_storage()) {
		if (localStorage["OMWeb_CKEditor"]) {
			var data = JSON.parse(localStorage["OMWeb_CKEditor"]);
			return data.saveBeforeExit;
		}
	}
	return true;
}
