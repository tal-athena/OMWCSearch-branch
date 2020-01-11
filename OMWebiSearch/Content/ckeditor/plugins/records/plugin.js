CKEDITOR.plugins.add('records',
{
    requires: ['richcombo'], //, 'styles' ],
    init: function (editor) {
        var config = editor.config,
         lang = editor.lang.format;

        // Gets the list of record types

        var records = getRecordTypes();

        // Create the combo
        editor.ui.addRichCombo('records',
         {
             label: "Records",
             title: "Records",
             voiceLabel: "Records",
             className: 'cke_format',
             multiSelect: false,

             panel:
            {
                css: [config.contentsCss, CKEDITOR.getUrl(editor.skinPath + 'editor.css')],
                voiceLabel: lang.panelVoiceLabel
            },

             init: function () {
                 this.startGroup("Records");
                 records = getRecordTypes();
                 if (records != undefined) {
                     for (var i = 0; i < records.length; i++) {
                         var imgTag = "<img src='/OMWebiSearch/Content/RecordIcons/" + records[i].IconURL + "' />";
                         this.add(records[i].Name, imgTag + records[i].Name, 'Records');
                     }
                 }
             },

             onClick: function (value) {

                 // get the record based on its name
                 var record = OMWClientContext.Story.GetRecord(value);

                 var params = { storyId: $('#hdnStoryId').val(), fieldId: record.Name };

                 // perfrom ajax call to server and insert the record only if the response != null
                 $.ajax({
                     url: OMWClientContext.GetFullUrl('Story/EditStory/CanAddStoryRecord'),
                     type: 'POST',
                     traditional: true,
                     dataType: 'json',
                     data: params,
                     asyc: false,
                     success: function (response) {
                         if (response != null) {
                             editor.focus();
                             editor.fire('saveSnapshot');
                             var imgTag = "<img id='OMINSERT_" + response.RecordID + "' src='/OMWebiSearch/Content/RecordIcons/" + record.IconURL + "' alt='" + response.TooltipText + "'  title='" + response.TooltipText + "' />";
                             editor.insertHtml(imgTag);
                             editor.fire('saveSnapshot');
                             this.init();
                         }
                         else {
                             alert('Cannot add record!');
                         }
                     }
                 });
             }
         });
    }
});
function getRecordTypes() {
    var storyId = $('#hdnStoryId').val();

    var params = { storyId: $('#hdnStoryId').val() };
    var records;
    $.ajax({
        url: $('#baseURL').val() + '/GetRecordIcons',
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: params,
        asyc: false,
        success: function (response) {
            records = response;
        },

        error: function (xhr, textStatus, error) {
            //OMWClientContext.ProcessAjaxError(xhr);
        }
    });
    return records;
}