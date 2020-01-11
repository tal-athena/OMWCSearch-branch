(function () {

    CKEDITOR.plugins.add('omwcontextmenu', {
        init: function (editor) {
            if (editor.contextMenu) {
                editor.addMenuGroup('pasteObjGroup', -1);
                editor.addMenuItem('pasteObj', {
                    label: 'Paste object',
                    group: 'pasteObjGroup',
                    onClick: function (e) {
                        var range = editor.getSelection().getRanges()[0];
                        console.log(range);
                        console.log('Element:');
                        console.log(range.startContainer.$);
                        console.log('Start: ' + range.startOffset);
                        console.log('End: ' + range.endOffset);

                        //Show loading animation
                        $('#storyLoading').show();
                        //After 10 seconds remove loading animation and add icon
                        setTimeout(function () {
                            //Insert html in this position
                            editor.insertHtml('<img data-date-time="' + Math.round(new Date().getTime() / 1000) + '" src="/OMWebiSearch/Content/Images/10.png"/>');

                            //Remove loading animation
                            $('#storyLoading').hide();
                        }, 10 * 1000);
                    }
				});

	            var contextMenuElement = null;

				editor.addMenuGroup('mediaInsertGroup', -1);
				addIconMenuItem('mediaInsertIcon', 'Icon', function () { OMWClientContext.Story.HandleIconDblClick(contextMenuElement); });
				addIconMenuItem('mediaInsertIconCtrl', 'Icon with CTRL', function () { OMWClientContext.Story.HandleIconDblClickWithCtrl(contextMenuElement); });
				addIconMenuItem('mediaInsertMainAreaCtrl', 'Main area with CTRL', function () { OMWClientContext.Story.HandleMainAreaDblClickWithCtrl(contextMenuElement); });
	            addIconMenuItem('mediaInsertMainArea', 'Show popup', function () { OMWClientContext.Story.HandleMainAreaDblClick(contextMenuElement); });

				editor.contextMenu.addListener(function (element) {
					if (element.$.tagName === "IMG") {
						contextMenuElement = element;
						editor.contextMenu.items.splice(editor.contextMenu.items.length - 1);
						return {
							mediaInsertIcon: CKEDITOR.TRISTATE_OFF,
							mediaInsertIconCtrl: CKEDITOR.TRISTATE_OFF,
							mediaInsertMainArea: CKEDITOR.TRISTATE_OFF,
							mediaInsertMainAreaCtrl: CKEDITOR.TRISTATE_OFF
						};
					}

					contextMenuElement = null;

                    return { pasteObj: CKEDITOR.TRISTATE_OFF };
				});

				function addIconMenuItem(id, label, onClick) {
					editor.addMenuItem(id, {
						label: label,
						group: 'mediaInsertGroup',
						onClick: onClick
					});
				}
            }
        }
    });
})();
