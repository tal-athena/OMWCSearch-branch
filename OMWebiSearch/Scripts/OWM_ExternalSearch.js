OMWClientContext.ExternalSearch = new function () {
};

//// Public Methods
// Define Init method (public)
OMWClientContext.ExternalSearch.Init = function (serverUrl, id) {
    OMWClientContext.Init(serverUrl);
    OMWClientContext.ExternalSearch._InitInternal(id);
};


// Define _InitInternal method (private)
OMWClientContext.ExternalSearch._InitInternal = function (id) {
    OMWClientContext.ExternalSearch.Id = id;
};


OMWClientContext.ExternalSearch.OpenExternalSearchInNewTab = function (id) {
    id = "PDIsMjM2OTQsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==";
    window.open(OMWClientContext.GetFullUrl('External/ExternalSearch/Index/' + id), '_blank');
};

OMWClientContext.ExternalSearch.GetContent = function () {
    var container = $('#externalSearch');
    container.toggleClass('loader');
    setTimeout(function() {
        $.ajax({
            url: OMWClientContext.GetFullUrl('External/ExternalSearch/GetContent'),
            type: 'POST',
            dataType: 'json',
            data: { id: OMWClientContext.ExternalSearch.Id },
            success: function(response) {
                container.html(response);
            },

            error: function (xhr, textStatus, error) {
                OMWClientContext.ProcessAjaxError(xhr);

            }
        }).done(function() {
            container.toggleClass('loader');
        });
    }, 2000);
    return OMWClientContext.Story._RecordTypes;
};


//OMWClientContext.Story.StartEditStory = function (fieldId) {
//    // lock story
//    var storyId = $('#hdnStoryId').val();
//    $.post(OMWClientContext.GetFullUrl('Story/EditStory/Lock'), { storyId: storyId, fieldId: fieldId }, function (data) { }, 'json');
//};

//OMWClientContext.Story.EndEditStory = function (fieldId, obj) {

//    var storyId = $('#hdnStoryId').val();

//    var fieldValue = $($('[fieldId="' + fieldId + '"]')[0]).val();
//    if ($(obj).hasClass("dateTimePicker")) {
//        fieldValue = $(obj).val();
//    }
//    if ($(obj).hasClass("datePicker")) {
//        fieldValue = $(obj).val();
//    }
//    if ($(obj).hasClass("timePicker")) {
//        fieldValue = $(obj).val();
//    }



//    // update story 
//    var htmlUpdated = CKEDITOR.instances["Story_Text"].checkDirty();
//    var html = '';
//    if (htmlUpdated) {
//        CKEDITOR.instances["Story_Text"].resetDirty();
//        html = escape(CKEDITOR.instances["Story_Text"].getData());
//    }

//    var params = { storyId: $('#hdnStoryId').val(), fieldId: fieldId, fieldValue: fieldValue, htmlUpdated: htmlUpdated, html: html };
//    $.ajax({
//        url: OMWClientContext.GetFullUrl('Story/EditStory/SaveStory'),
//        type: 'POST',
//        traditional: true,
//        dataType: 'json',
//        data: params
//    });

//    // unlock story
//    $.post(OMWClientContext.GetFullUrl('Story/EditStory/UnLock'), { storyId: storyId, fieldId: fieldId }, function (data) { }, 'json');
//};

//OMWClientContext.LoadStory = function (id, documentType) {
//    if (documentType) {
//        location.href = '/OMWebiSearch/Collection/Editor/Index/' + id;
//    }
//    else {
//        location.href = OMWClientContext.GetFullUrl('Story/EditStory/Index/' + id);
//    }
//};
