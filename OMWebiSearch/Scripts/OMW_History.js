
OMWHistory = function () {

};

OMWHistory.CreateCombobox = function (url) {

    var currentUrl = window.location.href;
    if (url != currentUrl) {

        if ($("#historySelect").length > 0) {
         

            var history = [];
            history = JSON.parse(localStorage["OMWHistory"]);

            //Instead of this show KendoUI Combobox
            var showValuesInCombobox = history.reverse();


            var iconFolderURL = OMWClientContext.GetFullUrl('Content/Icons/');


            $("#historySelect").kendoComboBox({
                dataTextField: "name",
                dataValueField: "url",

                dataSource: showValuesInCombobox,
                dataBound: function (e) {
                    //var allHistoryItems = $('.removeHistoryItem');
                    //for (var i = 0; i < 10; i++) {
                    //    var item = allHistoryItems[i];

                    //    $(item).attr('id', i);
                    //}

                    $('.removeHistoryItem').click(function (event) {
                        event.stopPropagation();

                        removeItemFromHistory(this);

                    });
                },

                template: '<table class="historyComboboxItem" style="table-layout:fixed; width:97%;"><tr><span data-url="#: url #" class="removeHistoryItem">x</span><td style="width:25px;"><img style="width:24px;height:24px;" src=\"/OMWebiSearch/Content/RecordIcons/RecordIcon3.png\" alt=\"${data.icon}\" /></td>' +
                             '<td><span class="wrapword">${ data.name }</span></td></tr></table>',

            });


            $(".historyComboboxItem").parent().hover(
              function () {

                  $(this).find('.removeHistoryItem').show();
              }, function () {
                  $(this).find('.removeHistoryItem').hide();
              }
            );

            var combobox = $("#historySelect").data("kendoComboBox");

            if (history.length < 1) {

                combobox.setDataSource([]);
                combobox.text('');
                combobox.enable(false);
            }
            else {
                // combobox.text(history[0].name);
                combobox.enable(true);
            }


            $('.historySelectCls .k-input').attr('disabled', true);
            //  $('.historySelectCls .k-input').addClass('customComboboxNotEditable');
        }
    }

};



Tabs = function () {

};
Tabs.LocalStorageKey = "OMWCount";
Tabs.AddToArray = function (guid) {
    if (supports_html5_storage()) {
        var count;
        if (localStorage[Tabs.LocalStorageKey]) {

            count = JSON.parse(localStorage[Tabs.LocalStorageKey]);
            if (count.length < 4) {//add to storage
                count.push(guid);


                localStorage[Tabs.LocalStorageKey] = JSON.stringify(count);
            }
            else {//notification that there is more than 4 tabs opened

                var uid = "n" + guid;
                var html = '<div class="notificationRow"><div class="notificationItem" id="' + uid + '">There are already 4 opened tabs.';
                html += '<a data-guid="' + guid + '" class="notificationHyperlink" onclick="Tabs.RemoveOldest(this)" href="#" ">Close oldest tab</a></div>'
                html += '<div onclick="Notification.CloseNotificationCenter(this)" class="notificationClose">x</div></div>';
                var notification = {
                    type: 'tabs',
                    uid: uid,
                    html: html
                };
                Notification.PushNotification(notification);
            }
        }
        else {
            count = new Array();
            count.push(guid);

            localStorage[Tabs.LocalStorageKey] = JSON.stringify(count);
        }
    }
};
Tabs.RemoveOldest = function (el) {
    if (supports_html5_storage()) {
        var count;
        if (localStorage[Tabs.LocalStorageKey]) {
            count = JSON.parse(localStorage[Tabs.LocalStorageKey]);
            var guid = count[0];

            //Close oldest tab

            Tabs.RemoveFromArray(guid);

            //Remove notification
            var element = $(el).parent().parent().find('.notificationClose');
            Notification.CloseNotificationCenter(element);
        }
    }
};
Tabs.RemoveFromArray = function (guid) {


    console.log('Removing from tabs array');
    console.log(guid);


    if (supports_html5_storage()) {
        var count;
        if (localStorage[Tabs.LocalStorageKey]) {
            count = JSON.parse(localStorage[Tabs.LocalStorageKey]);

            var newCount = [];
            var position = 0;
            for (var i = 0; i < count.length; i++) {
                if (count[i] != guid) {//remove that element
                    newCount[position] = count[i];
                    position++;
                }

            }
            console.log(newCount);
            localStorage[Tabs.LocalStorageKey] = JSON.stringify(newCount);
        }
    }
}


$(document).ready(function () {


    var guid = $('#tabGUID').val();
    Tabs.AddToArray(guid);

    window.onbeforeunload = function (e) {
        Tabs.RemoveFromArray(guid);
    }
    window.onunload = function (e) {
        Tabs.RemoveFromArray(guid);
    }


    $(window).bind('storage', function (e) {

        var url = e.originalEvent.url;
        console.log('Sender URL:');
        console.log(url);
        //change datasource of the history combobox
        OMWHistory.CreateCombobox(url);

    });


    //Add this to the FIFO array in memory
    //Checking is the localstorage sup  var currentTitle = document.title;

    //Testing with big values
    var currentTitle = document.title + document.title + document.title + document.title + document.title + document.title + document.title;

    var currentURL = window.location.href;
    var currentIcon = $('#hdnIcon').val();
    if (!currentIcon) {
        currentIcon = "1234";
    }

    if (supports_html5_storage()) {

        var history;

        if (localStorage["OMWHistory"]) {

            history = JSON.parse(localStorage["OMWHistory"]);

            if (history.length >= 10) {

                history.shift();
            }
            //add new object
            var obj = { icon: currentIcon, name: currentTitle, url: currentURL };
            history.push(obj);

            localStorage["OMWHistory"] = JSON.stringify(history);
        }
        else {
            var que = [];
            var obj = { icon: currentIcon, name: currentTitle, url: currentURL };

            que.push(obj);

            localStorage["OMWHistory"] = JSON.stringify(que);
        }


        OMWHistory.CreateCombobox('');
    }
    else {
        //Not supported, do not show the dropdown with items
        $('#historySelect').hide();
        console.log('Hideee');
    }

    //$('#historySelect').combobox();
});
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function removeItemFromHistory(e) {

    var position = jQuery(e).attr('id');
    console.log(position);
    var history = JSON.parse(localStorage["OMWHistory"]);

    //   history = history.reverse();

    var url = $(e).data('url');

    position = history.length - 1;
    var newHistory = [];

    while (position > -1) {
        //Delete it
        if (history[position].url == url) {

        }
        else {//Add in a new array
            newHistory.push(history[position]);
        }
        position--;
    }
    if (history.length > 1) {



        var combobox = $("#historySelect").data("kendoComboBox");

        var ds = combobox.dataSource;
        ds.data(newHistory);
        combobox.text(newHistory[0].name);

        //localStorage["OMWHistory"] = JSON.stringify(history);
        localStorage["OMWHistory"] = JSON.stringify(newHistory.reverse());


        //Add on hover for every x
        $(".historyComboboxItem").parent().hover(
       function () {

           $(this).find('.removeHistoryItem').show();
       }, function () {
           $(this).find('.removeHistoryItem').hide();
       }
     );


    }
    else {
        //remove item from the history
        history = [];

        localStorage["OMWHistory"] = JSON.stringify(history);


        var combobox = $("#historySelect").data("kendoComboBox");

        combobox.setDataSource(history);
        combobox.text('');
        combobox.enable(false);
    }

}


function historyComboboxSelect(sel) {

    var url = sel.options[sel.selectedIndex].value;

    console.log(url);
    window.open(url, '_blank');
}

