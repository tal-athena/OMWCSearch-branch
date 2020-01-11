OMWClientContext.Collection = new function () {
};

OMWClientContext.Collection.StartEditCollection = function (fieldId) {
    // lock collection
    var collectionId = $('#hdnStoryId').val();
    $.post(OMWClientContext.GetFullUrl('Collection/Editor/Lock'), { collectionId: collectionId, fieldId: fieldId }, function (data) { }, 'json');
};

OMWClientContext.Collection.CheckBoxClicked = function(id, value) {
    console.log({
        id: id,
        value: value
    });
};


OMWClientContext.Collection.EndEditCollection = function (fieldId, obj) {

    var collectionId = $('#hdnStoryId').val();

    var fieldValue = $($('[fieldId="' + fieldId + '"]')[0]).val();
    if ($(obj).hasClass("dateTimePicker")) {
        fieldValue = $(obj).val();
    }
    if ($(obj).hasClass("datePicker")) {
        fieldValue = $(obj).val();
    }
    if ($(obj).hasClass("timePicker")) {
        fieldValue = $(obj).val();
    }


    var params = { collectionId: $('#hdnStoryId').val(), fieldId: fieldId, fieldValue: fieldValue, htmlUpdated: "", html: "" };
    $.ajax({
        url: OMWClientContext.GetFullUrl('Collection/Editor/SaveCollection'),
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: params
    });

    // unlock collection
    $.post(OMWClientContext.GetFullUrl('Collection/Editor/Unlock'), { collectionId: collectionId, fieldId: fieldId }, function (data) { }, 'json');
};

OMWClientContext.Collection.SetupHeaderFields = function () {
    //$('.dateTimePicker').datetimepicker({
    //    timeFormat: 'hh:mm:ss',
    //    dateFormat: 'dd.mm.yy',
    //    onClose: function (datetimeText, datepickerInstance) {
    //        if ($(this).attr("fieldId")) {
    //            //OMWClientContext.Story.EndEditStory($(this).attr("fieldId"), this);
    //            console.log(this.value);
    //        }
    //        //var dateTime = datetimeText.split(' ');
    //        //$('#' + datepickerInstance.id).val(dateTime[0]);
    //    }
    //});
    //$('.datePicker').datepicker({
    //    dateFormat: 'dd.mm.yy',

    //});
    //$('.timePicker').timepicker({
    //    timeFormat: 'hh:mm:ss',
    //});

    $('.SearchInput').hover(function () {
        $(this).addClass('input-active');
    }, function () {
        $(this).removeClass('input-active');
    });
};