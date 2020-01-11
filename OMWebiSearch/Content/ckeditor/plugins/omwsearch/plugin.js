(function () {

    var contentPasted = false;
    CKEDITOR.plugins.add('omwsearch', {
        init: function (editor) {
            editor.on('selectionChange', function (e) {
                if ($.browser.mozilla) {
                    if (contentPasted) {
						if (e.stopPropagation)
							e.stopPropagation();
						else if (e.stop)
							e.stop();

                        contentPasted = false;
                    }
                    else {
                        var range = getRange(editor);
                        replaceRangeWithClosestEditableRoot(range, editor);
                    }
                }
            });
            editor.on('contentDom', function () {
                //Get font and set it as default
                setDefaultFont(editor);
            });
            editor.on('paste', function () {
                contentPasted = true;
            });
        }
    });

    function refreshContent(editor) {
        dataRefreshed = true;
        var data = editor.getData();

        editor.setData(data);
    }

    var dataRefreshed = false;
    function setDefaultFont(editor) {
        if (!dataRefreshed) {

            var size = $('#hdnFontSize').val();
            var face = $('#hdnFontFace').val();

            var css = "body{font-family:'" + face + "'; font-size:" + size + ";}";

            //Here should be a IF to check if it is already added
            editor.document.appendStyleText(css);

            editor.dataProcessor.htmlFilter.addRules({
                elements: {
                    //p: function (e) { e.attributes.style = 'font-size:' + fontsizevariable + 'px; font-family:' + fontfamilyvariable + ';'; }
                    //div: function (e) { e.attributes.style = 'font-size:' + size + '; font-family:' + face + ''; },
                    div: function (e) { e.attributes.style = "font-family:'" + face + "'; font-size:" + size + ";"; },
                    p: function (e) { e.attributes.style = "font-family:'" + face + "'; font-size:" + size + ";"; }
                }
            });


            refreshContent(editor);
        }
        else {
            dataRefreshed = false;
        }
    }

    function replaceRangeWithClosestEditableRoot(range, editor) {
            if (range.startContainer) {
                var name = range.startContainer.$.nodeName;
                if (name == "p" || name == "P" || name == "DIV" || name == "div"
                    || name == "BR" || name == "br" || name == "BODY" || name == "body") {
                    var spans = range.startContainer.getElementsByTag('span');
                    var node;
                    if (spans.count() > 0) {
                        node = spans.getItem(spans.count() - 1);
                        if (!range.root.equals(node)) {
                            var range1 = editor.createRange();
                            range1.moveToElementEditEnd(node);
                            editor.getSelection().selectRanges([range1]);
                        }
                    }
                    else {
                        //Add span with default size and font-style
                    }
                }
            //}
        }
    }

    function getRange(editor) {
        // Get the selection ranges
        var ranges = editor.getSelection().getRanges(true);

        // Delete the contents of all ranges except the first one
        for (var i = ranges.length - 1; i > 0; i--) {
            ranges[i].deleteContents();
        }

        // Return the first range
        return ranges[0];
    };
})();
