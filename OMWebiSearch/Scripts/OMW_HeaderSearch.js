/// <reference path="jquery-1.9.1.js" />
/// <reference path="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.js" />



OMWClientContext.HeaderSearch = new function ()
{
};


OMWClientContext.HeaderSearch.lastLockedFieldId = "";
OMWClientContext.HeaderSearch.lastComboboxValueIndex = 0;


OMWClientContext.HeaderSearch.GetAngularScope = function ()
{
	return (angular.element($('#headerSearchController')).scope());
};

var lastValue = "";

OMWClientContext.HeaderSearch.updateTextField = true;

OMWClientContext.HeaderSearch.findElementFieldId = function (elm)
{
	console.log(elm);
	var position = $(elm).attr('id').lastIndexOf('_');
	return $(elm).attr('id').substring(position + 1);
};




OMWClientContext.HeaderSearch.lockFieldStatus = null;

OMWClientContext.HeaderSearch.findElementPosition = function (arr, propName, propValue)
{
	for (var i = 0; i < arr.length; i++)
		if (arr[i][propName] == propValue)
			return i;

	// will return undefined if not found; you could return a default instead
	return 0;
}

// Updating combobox values from server
OMWClientContext.HeaderSearch.updateComboboxOptions = function (FieldId, Options, SelectedIndex)
{

	var scope = OMWClientContext.HeaderSearch.GetAngularScope();
	var fieldId = "#" + FieldId;

	var ngModel = $(fieldId).attr('ng-model');

	var indexOfArray = ngModel.substring(ngModel.lastIndexOf("[") + 1, ngModel.lastIndexOf("]"));

	var ds = $(fieldId).data().kendoComboBox;

	console.log(Options);
	ds.dataSource.data(Options);
	// Need selected option or Selected Index???

	ds.text(Options[SelectedIndex].text);

	ds.value(Options[SelectedIndex].value);

	scope.fieldsList[indexOfArray].Value = Options[SelectedIndex];

	if (!scope.$$phase)
	{
		scope.$apply();
	}
};


// Funnction called on input type blur event, send changed data to server

OMWClientContext.HeaderSearch.updateElementValue = function (FieldId, FieldValue)
{
	if (FieldValue != lastValue)
	{
		lastValue = "";

		var collectionId = $('#hdnStoryId').val();

		// Type of page, so the code for AngularJS bindings can be reused
		var pageType = $('#hdnPageType').val();
		console.log('page type is ' + pageType);

		// alert(collectionId);
		//alert(FieldId);
		//alert(FieldValue);

		console.log('Field updated: ' + FieldValue);


		var dataToUpdate = {
			collectionId: collectionId,
			fieldId: FieldId,
			fieldValue: FieldValue
		};
		if (pageType == "Story")
		{
			OMWClientContext.Story.EndEditStory(FieldId, FieldValue);
		}
		else
		{
			$.ajax({
				type: 'POST',
				url: OMWClientContext.GetFullUrl('Collection/Editor/UpdateField'),
				data: dataToUpdate,
				success: function (data)
				{
					if (data.status == 'Error')
					{
						console.log(data.message);
					}
				},
				error: function (xhr, textStatus, error)
				{
					OMWClientContext.ProcessAjaxError(xhr);
				}
			});
		}

	}
	else
	{
		console.log("Element value wasn't changed, no need for AJAX call" + FieldValue + " last:" + lastValue);
	}


	OMWClientContext.HeaderSearch.UnlockField(FieldId);

};

//updateDataElementValue
OMWClientContext.HeaderSearch.updateDateElementValue = function (FieldId, FieldValue, FieldFormat)
{
	if (FieldValue != lastValue)
	{
		lastValue = "";

		var collectionId = $('#hdnStoryId').val();

		// Type of page, so the code for AngularJS bindings can be reused
		var pageType = $('#hdnPageType').val();

		console.log('Field updated: ' + FieldValue);
		console.log('Field format: ' + FieldFormat);

		if (pageType == "Story")
		{
			OMWClientContext.Story.EndEditStoryDateTime(FieldId, FieldValue, FieldFormat);
		}
		else
		{
			var dataToUpdate = {
				collectionId: collectionId,
				fieldId: FieldId,
				fieldValue: FieldValue,
				fieldFormat: FieldFormat
			};

			$.ajax({
				type: 'POST',
				url: OMWClientContext.GetFullUrl('Collection/Editor/UpdateDateField'),
				data: dataToUpdate,
				success: function (data)
				{
					if (data.status == 'Error')
					{
						console.log(data.message);
					}
				},
				error: function (xhr, textStatus, error)
				{
					OMWClientContext.ProcessAjaxError(xhr);
					console.log('Greskaaa');
				}
			});
		}

	}
	else
	{
		console.log("Element value wasn't changed, no need for AJAX call" + FieldValue + " last:" + lastValue);
	}


	OMWClientContext.HeaderSearch.UnlockField(FieldId);

};

OMWClientContext.HeaderSearch.LockField = function (fieldId, value)
{
	//Start animation
	$('#headerSearchController').addClass("loading");

	if (value !== undefined)
		lastValue = value;

	console.log('Lock field with Id ' + fieldId);

	OMWClientContext.HeaderSearch.lockFieldStatus = null;

	var collectionId = $('#hdnStoryId').val();
	var dataToUpdate = {
		collectionId: collectionId,
		fieldId: fieldId
	};
	$.ajax({
		async: false,
		type: 'POST',
		url: OMWClientContext.GetFullUrl('Collection/Editor/LockField'),
		data: dataToUpdate,
		success: function (data)
		{
			if (data.status != 'success')
			{

				OMWClientContext.HeaderSearch.lockFieldStatus = false;
			}
			else
			{
				OMWClientContext.HeaderSearch.lockFieldStatus = true;
			}
		},
		error: function (xhr, textStatus, error)
		{
			OMWClientContext.ProcessAjaxError(xhr);
			OMWClientContext.HeaderSearch.lockFieldStatus = false;
		}
	}).complete(function ()
	{

		//Stop animation
		$('#headerSearchController').removeClass("loading");
	});



};
OMWClientContext.HeaderSearch.UnlockField = function (fieldId)
{
	$('#headerSearchController').addClass("loading");

	console.log('Unlock field with Id ' + fieldId);

	var collectionId = $('#hdnStoryId').val();
	var dataToUpdate = {
		collectionId: collectionId,
		fieldId: fieldId
	};
	$.ajax({
		type: 'POST',
		url: OMWClientContext.GetFullUrl('Collection/Editor/UnlockField'),
		data: dataToUpdate,
		success: function (data)
		{
			if (data.status != 'success')
			{
				console.log('Didnt unlock the field');
			}
		},
		error: function (xhr, textStatus, error)
		{
			OMWClientContext.ProcessAjaxError(xhr);
			console.log('Didnt unlock the field');
		}
	}).complete(function ()
	{

		//Stop animation
		$('#headerSearchController').removeClass("loading");
	});;


};


var pageType = "";



OMWClientContext.HeaderSearch.InitControlls = function ()
{

	pageType = $('#hdnPageType').val();

	var scope = OMWClientContext.HeaderSearch.GetAngularScope();

	//Init of the comboboxes
	var onComboBoxOpen = function(event)
	{
		var element = $(this.element);
		var indexInArray = element.data('indexofelement');
		var fieldId = scope.fieldsList[indexInArray].Key;
		var comboBoxId = "#comboBox_" + fieldId;
		var comboBox = $(comboBoxId);

		var isDynamic = element.data('dynamic');
		if (isDynamic === "True")
		{
			var isLoading = element.data('loading');
			if (isLoading == true)
			{
				event.preventDefault();
				return;
			}

			var isExpanding = element.data('expanding');
			if (isExpanding == true)
			{
				element.data('expanding', false);
				OMWClientContext.HeaderSearch.lastComboboxValueIndex = comboBox.data("kendoComboBox").select();
				return;
			}

			element.data('loading', true);

			try
			{
				event.preventDefault();
				var loaderId = "#comboBoxLoader_" + fieldId;
				var loader = $(loaderId);
				loader.show();

				$.ajax({
					type: 'POST',
					url: OMWClientContext.GetFullUrl('Story/EditStory/GetDynamicComboValues'),
					data: { fieldID: fieldId, value: comboBox.val() },
					success: function (response)
					{
						try
						{
							var data = [];
							for (var i = 0; i < response.length; i++)
							{
								data.push({
									text: response[i],
									value: response[i]
								});
							}

							var k = comboBox.data("kendoComboBox");
							k.dataSource.data(data);

							element.data('loading', false);
							element.data('expanding', true);
							k.open();
						}
						catch (e)
						{
							console.log(e);
						}

						loader.hide();
					},
					error: function (xhr, textStatus, error)
					{
						loader.hide();
						element.data('loading', false);
						OMWClientContext.ProcessAjaxError(xhr);
					}
				});
			}
			catch (e)
			{
				element.data('loading', false);
			} 
		}
		else
		{
			OMWClientContext.HeaderSearch.lastComboboxValueIndex = comboBox.data("kendoComboBox").select();
		}
	};

	//Init of the comboboxes

	var searchPageComboboxes = $('.customCombobox');
	$(searchPageComboboxes).kendoComboBox({
		autoComplete: true,
		change: function ()
		{
			var indexInArray = $(this.element).data('indexofelement');
			var fieldId = scope.fieldsList[indexInArray].Key;

			if (OMWClientContext.HeaderSearch.lastLockedFieldId != fieldId)
			{
				OMWClientContext.HeaderSearch.LockField(fieldId);

				var id = "#comboBox_" + fieldId;

				if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
				{
					$(id).data("kendoComboBox").select(OMWClientContext.HeaderSearch.lastComboboxValueIndex);
				}
				else
				{
					var value = $(id).data("kendoComboBox").text();
					console.log(value);
					scope.fieldsList[indexInArray].Value = value;

					OMWClientContext.HeaderSearch.updateElementValue(fieldId, value);
				}
			}
		},
		open: onComboBoxOpen
	});

	var searchPageComboboxesNotEditable = $('.customComboboxNotEditable');
	$(searchPageComboboxesNotEditable).kendoComboBox({
		autoComplete: true,
		change: function ()
		{
			var indexInArray = $(this.element).data('indexofelement');
			var fieldId = scope.fieldsList[indexInArray].Key;
			//var value = scope.fieldsList[indexInArray].Value;


			if (OMWClientContext.HeaderSearch.lastLockedFieldId != fieldId)
			{
				OMWClientContext.HeaderSearch.LockField(fieldId);

				var id = "#comboBox_" + fieldId;

				if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
				{

					$(id).data("kendoComboBox").select(OMWClientContext.HeaderSearch.lastComboboxValueIndex);

				}
				else
				{
					var value = $(id).data("kendoComboBox").text();
					console.log(value);
					scope.fieldsList[indexInArray].Value = value;
					OMWClientContext.HeaderSearch.updateElementValue(fieldId, value);
				}
			}
		},
		open: onComboBoxOpen
	});


	$('input.customCombobox').on("focus", function (e)
	{
		console.log('customCombobox lock');

		var select = $(this).parent().parent().parent().parent().parent().find('select');
		var indexInArray = select.data('indexofelement');
		var fieldId = scope.fieldsList[indexInArray].Key;

		if (OMWClientContext.HeaderSearch.lastLockedFieldId != fieldId)
		{
			OMWClientContext.HeaderSearch.LockField(fieldId);
		}

	});
	$('input.customCombobox').on("blur", function (e)
	{
		if (OMWClientContext.HeaderSearch.lockFieldStatus == true)
		{
			console.log('customCombobox unlock');

			var select = $(this).parent().parent().parent().parent().parent().find('select');
			var indexInArray = select.data('indexofelement');

			var fieldId = scope.fieldsList[indexInArray].Key;
			var value = scope.fieldsList[indexInArray].Value;

			OMWClientContext.HeaderSearch.updateElementValue(fieldId, value);
		}
	});


	$('input.customComboboxNotEditable').each(function ()
	{
		$(this).attr('disabled', true);
	});





	//var scope = OMWClientContext.HeaderSearch.GetAngularScope();

	//Init values for all comboboxes
	//var searchPageComboboxes = $('.customCombobox');
	searchPageComboboxes.each(function ()
	{
		var ds = $(this).data().kendoComboBox;
		var indexInArray = $(this).data('indexofelement');

		var fieldValue = scope.fieldsList[indexInArray].Value;

		ds.value(fieldValue);
		ds.text(fieldValue);
	});
	//var searchPageComboboxesNotEditable = $('.customComboboxNotEditable');
	searchPageComboboxesNotEditable.each(function ()
	{

		var ds = $(this).data().kendoComboBox;
		var indexInArray = $(this).data('indexofelement');
		var fieldValue = scope.fieldsList[indexInArray].Value;

		ds.value(fieldValue);
		ds.text(fieldValue);
	});

};



//FOR TESTING UPDATE


//YOU CAN DELETE ALL OF THE NEXT CODE WHEN YOU FINISH TESTING

//var br = 1;
//$(document).ready(function svake5sekunde() {
//    setTimeout(
//         function () {
//             //Update with dummy data
//             var scope = OMWClientContext.HeaderSearch.GetAngularScope();


//             //First val is the value that the comboboxes have in the option list
//             //Second is some dummy value that is new to the comboboxes

//             //  var val = "opt" + br;
//             var val = "optNotInOptList" + br;

//             scope.updateElementFromServer(999, val);
//             scope.updateElementFromServer(9929, val);
//             //123458 
//             scope.updateElementFromServer(123458, val);

//             //1234581
//             scope.updateElementFromServer(1234581, val);
//             br++;
//             if (br > 5) {
//                 br = 1;
//             }

//             svake5sekunde();
//         }, 5000);

//});