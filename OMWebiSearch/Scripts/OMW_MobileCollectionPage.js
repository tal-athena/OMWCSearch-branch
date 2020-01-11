
OMWMobileCollection = {};

OMWMobileCollection.CollectionId = '';
OMWMobileCollection.TemplateId = '';
OMWMobileCollection.BaseURL = "";
OMWMobileCollection.Start = function () {

    $.mobile.loading('show');

    var url = OMWMobileCollection.BaseURL + "Collection/Editor/ContentsDataMobile";

    $.ajax({
        url: url,
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: { templateId: OMWMobileCollection.TemplateId, collectionId: OMWMobileCollection.CollectionId },
        success: function (data) {

            var list = $('#collectionListItems');

            var currentUrl = $.mobile.activePage.data('url');

            for (var i = 0; i < data.totalCount; i++) {
                //Check if Edit button should be shown
                var item = data.items[i];

                if (item.HasSubitems) {
                    var href = '';

                    if (item.DocumentType === 0) {
                        href = OMWMobileCollection.BaseURL + "Story/EditStory/Index/" + item.ID.EncodedID;
                    }
                    else {
                        href = OMWMobileCollection.BaseURL + "Collection/Editor/Index/" + item.ID.EncodedID;
                    }

                    //Collection
                    var newLi = "<li class='collectionItem'" +
                      "'data-id='" + item.ID.EncodedID + "'>" +
                      "<a href='" + href + "' rel='external' data-transition='slide'>" +
                      "<img class='collectionListImage ui-li-icon' src='" +
                          OMWMobileCollection.GetIcon() + "' alt='icon' />" +
                          "<h2>" + item.Title1 + "</h2>" +
                          "<p>" + item.Title2 + "</p>" +
                          "<p class='ui-li-aside'>" + item.Title3 + "</p>" +
                      "</a></li>";

                    list.append(newLi);
                }
                else {
                    var newLi = "<li class='collectionItem'" +
                      "'data-id='" + item.ID.EncodedID + "'>" +
                          "<a class='hide-list-item-arrow'><img class='collectionListImage ui-li-icon' src='" +
                          OMWMobileCollection.GetIcon() + "' alt='icon' />" +
                          "<h2>" + item.Title1 + "</h2>" +
                          "<p>" + item.Title2 + "</p>" +
                          "<p class='ui-li-aside'>" + item.Title3 + "</p>" +
                      "</a></li>";

                    list.append(newLi);
                }
            }

            list.listview();
            list.listview("refresh");


            $.mobile.loading('hide');
        },
        error: function (xhr, textStatus, error) {
            console.log(textStatus);

            $.mobile.loading('hide');
        }
    });
};

OMWMobileCollection.GetIcon = function (id) {
    return OMWMobileCollection.BaseURL + 'Content/Images/icon_example_32.png';
};

OMWMobileCollection.SelectListClick = function (e) {
    if (e.toElement) {
        //Stop this event from propagating
        e.stopPropagation();
        //Show animation
        $.mobile.loading('show');

        var $select = $(e.target).closest('.ui-select').find('select.custom-menu-list');
        var dataLoaded = $select.data('dataloaded');
        if (dataLoaded) {
            //Open selectmenu
            $select.selectmenu('open');
            //Hide animation
            $.mobile.loading('hide');
            return;
        }

        var fieldId = $select.data('fieldid');
        var separator = $select.data('separator');
        var value = $select.data('value');
        value = value.split(separator);
        
        $.ajax({
            url: OMWMobileCollection.BaseURL + "Collection/Editor/GetHeaderFieldValues",
            type: 'GET',
            traditional: true,
            dataType: 'json',
            data: {
                collectionId: OMWMobileCollection.CollectionId,
                fieldId: fieldId
            },
            success: function (data) {
                OMWMobile.SelectList.ShowData(data, value, $select);
            },
            error: function (xhr, textStatus, error) {
                console.log(textStatus);
                $.mobile.loading('hide');
            }
        });
    }
};

$(document).on("pageinit", "#collectionPage", function () {
    $('.recordsNavBtn').click(function () {
        $('.headerPage').hide();
        $('.recordsPage').show();
    });
    $('.headerNavBtn').click(function () {
        $('.recordsPage').hide();
        $('.headerPage').show();
    });

    $('.recordsPage').show();

    //Click event for select menu
    $('.custom-menu-list').click(OMWMobileCollection.SelectListClick);
    $('select.custom-menu-list').change(OMWMobile.SelectList.SelectListChange);
});

$(document).on("pageshow", "#collectionPage", function () {
    OMWMobileCollection.BaseURL = $('#hdnAppBaseUrl').val();
    OMWMobileCollection.CollectionId = $('#hdnCollectionId').val();
    OMWMobileCollection.TemplateId = $('#hdnTemplateId').val();


    $('.pageBackButton').click(function () {
        $.mobile.back();
    });

    $('.clearDatePicker').click(function () {
        $(this).parent().find('input').val('');
    });

    OMWMobileCollection.Start();
});