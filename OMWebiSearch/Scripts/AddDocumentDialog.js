$(document).ready(function () {

    $('#newButtonDiv').click(function (e) {
        e.stopPropagation();
        OMWClientContext.CreateDocument.OpenModal();
    });

    $('#newInButton').click(function (e) {
		e.stopPropagation();

	    OMWClientContext.CreateDocument.OpenModal();
	});

	$('#newInButtonDropdown').click(function (e)
	{
		e.stopPropagation();

		var position = $('#newInButton').position();
		$('.newInItems').css('left', position.left + "px");
		$('.newInItems').show();
		$('.toolbarOverlay').show();
	});

    $('#closeX').click(function () {
        OMWClientContext.CreateDocument.OnCloseDialog();
    });

    $('#btnSave').attr('disabled', 'disabled');
    $('#btnNext').attr('disabled', 'disabled');
 
});

var DocumentTypeId;
var ParentId;
var PrevDocumentTypeId;

$(function ()
{
	OMWClientContext.CreateDocument = function () { }

	$(".step1").show();
    $(".step2").hide();

    // working
    OMWClientContext.CreateDocument.OpenModal = function () {
       
        OMWClientContext.CreateDocument.LoadDocumentTypesGrid();

        //$(".step1").show();
        //$(".step2").hide();
        //$('#openModal').addClass('showModalDialog');

    }
    // called when the button "Close" is pressed
    OMWClientContext.CreateDocument.OnCloseDialog = function () {
        //location.href = $('#closeX').attr('href');
        $('#openModal').removeClass('showModalDialog');

        $('#btnSave').attr('disabled', 'disabled');
        $('#btnNext').attr('disabled', 'disabled');
        DocumentTypeId = null;
        ParentId = null;
	PrevDocumentTypeId = null;
    };

    var pageId = $('#hdnStoryId').val();
   // var pageId = null;
	OMWClientContext.CreateDocument.LoadDocumentTypesGrid = function()
	{
		//$.post(OMWClientContext.GetFullUrl('Document/SelectionLists/ShowList'), { id: pageId }, function (data) {
		//    $('#gridDocumentsController').empty();
		//    $('#gridDocumentsController').append(data);

		//    $('#documents tr').click(function (event) {

		//        if (DocumentTypeId) {
		//            var id = "#";
		//            id += DocumentTypeId;
		//            $(id).removeClass('selectedRow');
		//        }
		//        else {
		//            $('#btnSave').removeAttr('disabled');
		//            $('#btnNext').removeAttr('disabled');
		//        }

		//        DocumentTypeId = $(this).attr('id');
		//        $(this).addClass('selectedRow');
		//    });

		//    $(".step1").show();
		//    $(".step2").hide();
		//    $('#openModal').addClass('showModalDialog');

		//});

		if (!OMWClientContext.NewSelectionListHtml)
		{
			$.ajax({
				type: 'POST',
				url: OMWClientContext.GetFullUrl('Document/SelectionLists/ShowList'),
				data: { id: pageId },
				success: function(data)
				{
					OMWClientContext.NewSelectionListHtml = data;
					OMWClientContext.CreateDocument.InsertSelectionListMarkup(data);
				},
				error: function(xhr, textStatus, error)
				{
					OMWClientContext.ProcessAjaxError(xhr);
				}
			});
		}
		else
			OMWClientContext.CreateDocument.InsertSelectionListMarkup(OMWClientContext.NewSelectionListHtml);
	};

	OMWClientContext.CreateDocument.InsertSelectionListMarkup = function(html)
	{
		$('#gridDocumentsController').empty();
		$('#gridDocumentsController').append(html);

		$('#documents tr').click(function (event)
		{

			if (DocumentTypeId)
			{
				var id = "#";
				id += DocumentTypeId;
				$(id).removeClass('selectedRow');
			}
			else
			{
				$('#btnSave').removeAttr('disabled');
				$('#btnNext').removeAttr('disabled');
			}

			DocumentTypeId = $(this).attr('id');
			$(this).addClass('selectedRow');
		});

		$(".step1").show();
		$(".step2").hide();
		$('#openModal').addClass('showModalDialog');
	};

    // called when the button "Next" is pressed
    OMWClientContext.CreateDocument.OnDocumentTypeSelected = function () {
        $(".step2").show("slide", { direction: "right" }, 1000);
        $(".step1").hide("slide", { direction: "left" }, 1000);

        if (PrevDocumentTypeId != DocumentTypeId) {
            OMWClientContext.CreateDocument.LoadParentsGrid();

            ParentId = null;
            PrevDocumentTypeId = DocumentTypeId;
        }


    };

    // called when the button "previous" is pressed
    OMWClientContext.CreateDocument.OnBackToDocumentTypes = function () {
        $(".step1").show("slide", { direction: "left" }, 1000);
        $(".step2").hide("slide", { direction: "right" }, 1000);

        //selected DocumentTypeId
        var id = "#" + DocumentTypeId;
        $(id).addClass('selectedRow');

        ParentId = null;
    };


    // called when the button "Save" is pressed
    OMWClientContext.CreateDocument.OnSaveDocument = function () {

        //$.post(OMWClientContext.GetFullUrl('Document/SelectionLists/AddDocument'), { documentTypeId: DocumentTypeId, parentId: ParentId }, function (data) {
        //    if (data != null) {
        //        var win = window.open(data, '_blank');
        //        win.focus();
        //    }
        //});

        $.ajax({
            type: 'POST',
            url: OMWClientContext.GetFullUrl('Document/SelectionLists/AddDocument'),
            data: {
                documentTypeId: DocumentTypeId,
                parentId: ParentId
            },
            success: function (data) {
                if (data != null) {
                    //var win = window.open(data, '_blank');
	                //win.focus();

					alert("Success");
                }
            },
            error: function (xhr, textStatus, error) {
                OMWClientContext.ProcessAjaxError(xhr);
            }
        });
    };

    OMWClientContext.CreateDocument.SelectParent = function (elem) {
        if (ParentId) {
            var id = "#";
            id += ParentId;
            $(id).removeClass('selectedRow');
        }

        ParentId = $(elem).attr('id');
        $(elem).addClass('selectedRow');

    };


    OMWClientContext.CreateDocument.LoadParentsGrid = function () {
        var documentTypeId = DocumentTypeId;

        // alert(documentTypeId);

        //$.post(OMWClientContext.GetFullUrl('Document/SelectionLists/GetParents/' + documentTypeId), null, function (data) {

        //    $('#selectParent tbody').empty();

        //    $.each(data, function (index, value) {
        //        console.log(value.ID);
        //        var tr = "<tr onclick='OMWClientContext.CreateDocument.SelectParent(this)' id=";
        //        tr += value.ID;
        //        tr += "><td> <div><img src=/OMWebiSearch";
        //        tr += value.IconURL;
        //        tr += " /> </div></td><td>" ;
        //        tr += value.Name;
        //        tr += "</td></tr>";
        //        $('#selectParent tbody').append(tr);
        //    });
        //});


        $.ajax({
            type: 'POST',
            url: OMWClientContext.GetFullUrl('Document/SelectionLists/GetParents/' + documentTypeId),
            data: { },
            success: function (data) {
                $('#selectParent tbody').empty();

                $.each(data, function (index, value) {
                    console.log(value.ID);
                    var tr = "<tr onclick='OMWClientContext.CreateDocument.SelectParent(this)' id=";
                    tr += value.ID;
                    tr += "><td> <div><img src=/OMWebiSearch";
                    tr += value.IconURL;
                    tr += " /> </div></td><td>";
                    tr += value.Name;
                    tr += "</td></tr>";
                    $('#selectParent tbody').append(tr);
                });
            },
            error: function (xhr, textStatus, error) {
                OMWClientContext.ProcessAjaxError(xhr);
            }
        });
    };

});