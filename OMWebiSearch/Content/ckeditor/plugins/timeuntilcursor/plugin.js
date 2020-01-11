
CKEDITOR.plugins.add("timeuntilcursor", {
    lang: "ar,ca,da,de,el,en,es,eu,fi,fr,he,hr,it,jp,nl,no,pl,pt,pt-br,ru,sk,sv,tr,zh-cn", // %REMOVE_LINE_CORE%
    version: 1.15,
    requires: 'htmlwriter,undo',
    init: function (editor) {
        var defaultFormat = "",
            intervalId,
            lastWordCount = -1,
            lastCharCount = -1,
            limitReachedNotified = false,
            limitRestoredNotified = false,
            snapShot = editor.getSnapshot(),
            initializedDom = false;


        var dispatchEvent = function (type, currentLength, maxLength) {
            if (typeof document.dispatchEvent == 'undefined') {
                return;
            }

            type = 'ckeditor.timeuntilcursor.' + type;

            var cEvent;
            var eventInitDict = {
                bubbles: false,
                cancelable: true,
                detail: {
                    currentLength: currentLength,
                    maxLength: maxLength
                }
            };

            try {
                cEvent = new CustomEvent(type, eventInitDict);
            } catch (o_O) {
                cEvent = document.createEvent('CustomEvent');
                cEvent.initCustomEvent(
                    type,
                    eventInitDict.bubbles,
                    eventInitDict.cancelable,
                    eventInitDict.detail
                );
            }

            document.dispatchEvent(cEvent);
        };

        // Default Config
        var defaultConfig = {
            showTotalTime: true,
            showWordcount: true,

            countHTML: false,
            hardLimit: true,

            // Filter
            filter: null,

            //DisAllowed functions
            wordCountGreaterThanMaxLengthEvent: function (currentLength, maxLength) {
                dispatchEvent('wordCountGreaterThanMaxLengthEvent', currentLength, maxLength);
            },
            charCountGreaterThanMaxLengthEvent: function (currentLength, maxLength) {
                dispatchEvent('charCountGreaterThanMaxLengthEvent', currentLength, maxLength);
            },

            //Allowed Functions
            wordCountLessThanMaxLengthEvent: function (currentLength, maxLength) {
                dispatchEvent('wordCountLessThanMaxLengthEvent', currentLength, maxLength);
            },
            charCountLessThanMaxLengthEvent: function (currentLength, maxLength) {
                dispatchEvent('charCountLessThanMaxLengthEvent', currentLength, maxLength);
            }
        };

        // Get Config & Lang
        var config = CKEDITOR.tools.extend(defaultConfig, editor.config.timeuntilcursor || {}, true);

        if (config.showWordcount) {
            defaultFormat += 'Wordcount:' + " %wordCount%";
        }

        if (config.showTotalTime) {
            defaultFormat += '  %totalTime%';
        }


        var format = '';
        var format1 = defaultFormat;
        var format2 = '';//'Words:' + " %wordCount%" + '  %timeToReadSelected%';
        if (config.showWordcount) {
            format2 += 'Words:' + " %wordCount%";
        }
        format2 += '  %timeToReadSelected%';

        function counterId(editorInstance) {
            return "cke_timeuntilcursor_" + editorInstance.name;
        }

        function counterElement(editorInstance) {
            return document.querySelector('#' + counterId(editorInstance) + ' .summary');
        }

        function strip(html) {
            var tmp = document.createElement("div");

            // Add filter before strip
            html = filter(html);

            tmp.innerHTML = html;

            if (tmp.textContent == "" && typeof tmp.innerText == "undefined") {
                return "";
            }

            return tmp.textContent || tmp.innerText;
        }

        /**
         * Implement filter to add or remove before counting
         * @param html
         * @returns string
         */
        function filter(html) {

            //Remove head part
            html = html.replace('');

            if (config.filter instanceof CKEDITOR.htmlParser.filter) {
                var fragment = CKEDITOR.htmlParser.fragment.fromHtml(html),
                    writer = new CKEDITOR.htmlParser.basicWriter();
                config.filter.applyTo(fragment);
                fragment.writeHtml(writer);
                return writer.getHtml();
            }
            return html;
        }

        function countTotalTime(text, editor) {
            var normalizedText = text.
               replace(/(\r\n|\n|\r)/gm, " ").
               replace(/^\s+|\s+$/g, "").
               replace("&nbsp;", " ");

            normalizedText = strip(normalizedText);

            var matches = normalizedText.replace(/\(.*\)/g, '').trim();

            var words = matches.split(/\s+/);

            //(number of words - the one in brackets) / 2.5s
            var numberOfWords = words.length;
            if (numberOfWords > 0) {
                return getTimeFromSeconds(numberOfWords / 2.5);
            }
            return '00:00';
        }

        function getTimeFromSeconds(seconds) {
            var sec_num = Math.round(seconds);
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours < 10) { hours = "0" + hours; }
            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }
            return minutes + ':' + seconds;
            //return hours + ':' + minutes + ':' + seconds;
        }

        function countWords(text) {
            var normalizedText = text.
                replace(/(\r\n|\n|\r)/gm, " ").
                replace(/^\s+|\s+$/g, "").
                replace("&nbsp;", " ");

            normalizedText = strip(normalizedText);

            var words = normalizedText.split(/\s+/);

            for (var wordIndex = words.length - 1; wordIndex >= 0; wordIndex--) {
                if (words[wordIndex].match(/^([\s\t\r\n]*)$/)) {
                    words.splice(wordIndex, 1);
                }
            }

            //return (words.length);
            //Minus one as the first word is 'undefined'?
            return (words.length - 1);
        }

        function updateCounter(editorInstance) {
            if (!initializedDom) {
                var mainElement = document.getElementById(counterId(editorInstance));
                mainElement.innerHTML = '<div id="lockIcon"></div><div class="summary"></div>';
                initializedDom = true;
            }

            format = format1;

            var sel = editor.getSelection();
            var selectedText = sel.getSelectedText();
            if (selectedText !== '') {
                format = format2;
            }

            var totalTimeCount = '',
                wordCount = 0,
                timeToReadSelected = 0,
                text;

            if (text = editorInstance.getData()) {
                if (selectedText !== '') {
                    wordCount = countWords(selectedText);
                }
                else {
                    text = text.replace(/<head[^>]*>[\s\S]*<\/head>/gi, '<head></head>');
                    wordCount = countWords(text);
                }
                timeToReadSelected = countTotalTime(selectedText, editorInstance);

                if (config.showTotalTime) {
                    totalTimeCount = countTotalTime(text, editorInstance);
                }
            }

            var html = format.replace("%wordCount%", wordCount).replace('%timeToReadSelected%', timeToReadSelected).replace("%totalTime%", totalTimeCount);

            (editorInstance.config.timeuntilcursor || (editorInstance.config.timeuntilcursor = {})).wordCount = wordCount;
            (editorInstance.config.timeuntilcursor || (editorInstance.config.timeuntilcursor = {})).totalTimeCount = totalTimeCount;

            if (CKEDITOR.env.gecko) {
                counterElement(editorInstance).innerHTML = html;
            } else {
                counterElement(editorInstance).innerText = html;
            }

            return true;
        }

        editor.on('dialogDefinition', function (e) {
            var dialog = e.data.definition.dialog;
            dialog.on('show', function () {
                var element = this.getElement();
                var labelledby = element.getAttribute('aria-labelledby');
                var nativeElement = document.querySelector("[aria-labelledby='" + labelledby + "']");
                nativeElement.onclick = function (evt) {
                    setTimeout(function () {
                        updateCounter(editor);
                    }, 100);
                };
                nativeElement.onmouseup = function (evt) {
                    setTimeout(function () {
                        updateCounter(editor);
                    }, 100);
                };
            });
        });

        editor.on("key", function (event) {
            if (editor.mode === "source") {
                updateCounter(event.editor);
            }
        }, editor, null, 100);

        editor.on("change", function (event) {
            updateCounter(event.editor);
        }, editor, null, 100);

        editor.on("selectionChange", function (event) {
            console.info('selection change');
            updateCounter(event.editor);
        }, editor, null, 100);

        editor.on("uiSpace", function (event) {
            if (editor.elementMode === CKEDITOR.ELEMENT_MODE_INLINE) {
                if (event.data.space == "top") {
                    event.data.html += "<div class=\"cke_timeuntilcursor\" style=\"\"" +
                        " title=\"" +
                        //editor.lang.timeuntilcursor.title +
                        "\"" +
                        "><span id=\"" +
                        counterId(event.editor) +
                        "\" class=\"cke_path_item\">&nbsp;</span></div>";
                }
            } else {
                if (event.data.space == "bottom") {
                    event.data.html += "<div class=\"cke_timeuntilcursor\" style=\"\"" +
                        " title=\"" +
                        //editor.lang.timeuntilcursor.title +
                        "\"" +
                        "><span id=\"" +
                        counterId(event.editor) +
                        "\" class=\"cke_path_item\">&nbsp;</span></div>";
                }
            }

        }, editor, null, 100);

        editor.on("dataReady", function (event) {
            updateCounter(event.editor);
        }, editor, null, 100);

        editor.on("afterPaste", function (event) {
            updateCounter(event.editor);
        }, editor, null, 100);

        editor.on("blur", function () {
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        }, editor, null, 300);
    }
});