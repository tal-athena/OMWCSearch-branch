CKEDITOR.plugins.add('insertdatetime',
{
    init: function (editor) {
        editor.addCommand('insertDateTime', new CKEDITOR.dialogCommand('insertDateTime'));

        editor.ui.addButton('Insert Date Time',
		{
		    // Toolbar button tooltip.
		    label: 'Insert Date Time',
		    // Reference to the plugin command name.
		    command: 'insertDateTime',
		    // Button's icon file path.
		    icon: this.path + 'images/icon.png'
		});


        var selectedCKEditorDateTime = '';

        function appendSelectedDateTime(editor) {
            editor.insertText(selectedCKEditorDateTime);

            //Close dialog
            CKEDITOR.dialog.getCurrent().hide();
        }

        CKEDITOR.dialog.add('insertDateTime', function (editor) {
            // var dialogObj = this;
            return {
                title: 'Insert Date Time',
                minWidth: 200,
                minHeight: 100,
                contents:
                [
                    {
                        id: 'general',
                        label: 'Current date time',
                        elements:
                        [
                            // UI elements of the Insert Date Time tab.
                            {
                                id: 'content',
                                type: 'html',
                                html: '<ul class="ck-editor-plugin-insert-date-time"></ul>'
                            }
                        ]
                    }
                ],
                onOk: function () {
                    appendSelectedDateTime(editor);
                },
                onShow: function () {
                    var dialog = this;

                    console.info(dialog);

                    var elements = [];
                    var content = this.getContentElement('general', 'content');

                    var id = content.domId;
                    var $ul = $('#' + id);

                    var items = '';
                    var date = new Date();

                    items += '<li>' + DateFormat.formatDate1(date) + '</li>';
                    items += '<li>' + DateFormat.formatTime1(date) + '</li>';
                    items += '<li>' + DateFormat.formatDateTime1(date) + '</li>';
                    items += '<li>' + DateFormat.formatDate2(date) + '</li>';
                    items += '<li>' + DateFormat.formatTime2(date) + '</li>';
                    items += '<li>' + DateFormat.formatDateTime2(date) + '</li>';
                    items += '<li>' + DateFormat.formatDate3(date) + '</li>';
                    items += '<li>' + DateFormat.formatTime3(date) + '</li>';
                    items += '<li>' + DateFormat.formatDateTime3(date) + '</li>';

                    $ul.html(items);

                    var timer,
                        clicks = 0;

                    $ul.find('li').on('click', function (e) {
                        selectedCKEditorDateTime = e.target.innerText;
                        $ul.find('li').removeClass('ck-editor-plugin-insert-date-time-selected');
                        $(e.target).addClass('ck-editor-plugin-insert-date-time-selected');
                    });

                    $ul.find('li').on('dblclick', function (e) {
                        selectedCKEditorDateTime = e.target.innerText;
                        appendSelectedDateTime(editor);
                    });

                }
            };
        });
    }
});

var DateFormat = {
    formatDate1: function formatDate1(d) {
        var month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('.');
    },
    formatTime1: function (d) {
        var hour = '' + d.getHours(),
            minute = '' + d.getMinutes(),
            second = '' + d.getSeconds();

        if (hour.length < 2) hour = '0' + hour;
        if (minute.length < 2) minute = '0' + minute;
        if (second.length < 2) second = '0' + second;

        return [hour, minute, second].join(':');
    },
    formatDateTime1: function (d) {
        return DateFormat.formatDate1(d) + ' ' + DateFormat.formatTime1(d);
    },
    formatDate2: function (d) {
        var month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return d.toString().split(' ')[0] + ', ' + [month, day, year].join('/');
    },
    formatTime2: function (d) {
        var hours = d.getHours();
        if (hours > 12) hours = hours - 12;
        var hour = '' + hours,
            minute = '' + d.getMinutes(),
            second = '' + d.getSeconds();

        if (hour.length < 2) hour = '0' + hour;
        if (minute.length < 2) minute = '0' + minute;
        if (second.length < 2) second = '0' + second;

        return [hour, minute, second].join(':');
    },
    formatDateTime2: function (d) {
        return DateFormat.formatDate2(d) + ' ' + DateFormat.formatTime2(d);
    },
    formatDate3: function formatDate1(d) {
        var month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [month, day, year].join('/');
    },
    formatTime3: function (d) {
        var hour = '' + d.getHours(),
            minute = '' + d.getMinutes();

        if (hour.length < 2) hour = '0' + hour;
        if (minute.length < 2) minute = '0' + minute;

        return [hour, minute].join(':');
    },
    formatDateTime3: function (d) {
        return DateFormat.formatDate3(d) + ' ' + DateFormat.formatTime3(d);
    }
};
