
angular.module('OMWMobileNGApp', ['angular-carousel', 'ngSanitize']);

var storyBaseUrl = '';
var collectionBaseUrl = '';


OMWMobileSearch = function () {
};

OMWMobileSearch.SearchHits = [];
OMWMobileSearch.BaseURL = "";

OMWMobileSearch.sortArray = [];
OMWMobileSearch.searchArray = OMWMobileSearch.searchArray || [];

OMWMobileSearch.StartSearch = function (model, sortArray) {

    var selectedSearchProfile = $('#selectedSearchProfileItems').val();
    var navigationPaneId = $('#NavigationPaneId').val();

    var url = OMWMobileSearch.BaseURL + "StartSearch";

    $.ajax({
        url: url,
        type: 'POST',
        traditional: true,
        dataType: 'json',
        data: { model: JSON.stringify(model), searchProfileName: OMWMobileSearch.SearchHitsPaneName },
        success: function (data) {

            $('#hdnSearchContextID').val(data.SearchContextID);
            $('#selectedSearchProfileItems').val(selectedSearchProfile);

            OMWMobileSearch.SearchHitsTotal = data.TotalSearchHits;


            //Get first items
            var searchDetails = {
                SearchContextID: data.SearchContextID,
                PageNumber: 0,
                SearchProfileID: selectedSearchProfile,
                SortOrder: sortArray
            };

            $.mobile.loading('show');

            OMWMobileSearch.GetPage(searchDetails, name);
            OMWMobileSearch.LastPageName = name;
            OMWMobileSearch.CurrentPage = 0;


        },
        error: function (xhr, textStatus, error) {
            console.log(textStatus);

            $.mobile.loading('hide');
            //window.history.back();
        }
    });
};
OMWMobileSearch.NavigationPaneId = 0;
OMWMobileSearch.SearchProfileId = 0;
OMWMobileSearch.LastPageName = "";
OMWMobileSearch.CurrentPage = 0;
OMWMobileSearch.SearchHitsTotal = 0;
OMWMobileSearch.Columns = [];

OMWMobileSearch.ChangeSearhPageUrl = function () {
    url = OMWMobileSearch.BaseURL + "Index/" + OMWMobileSearch.SearchProfileId + "/0";
    history.replaceState({}, '', url);
}

var returnValue = false;
OMWMobileSearch.PagePreview = function () {
    //if (OMWMobileSearch.NavigationPaneId > 2) {
    //    return true;
    //}
    //else{
    //    return false;
    //}
    returnValue = !returnValue;
    return returnValue;
};
OMWMobileSearch.MarkPreviewText = function (text) {
    //Replace all &nbsp; with spaces
    text = text.replace(/&nbsp;/gi, ' ');
    text = text.replace(/&lt;mark&gt;/gi, '<mark>');
    text = text.replace(/&lt;\/mark&gt;/gi, '</mark>');
    return text;
};

OMWMobileSearch.GetPage = function (searchModel, name) {

    searchModel.PageSize = 20;
    var offset = searchModel.PageSize * searchModel.PageNumber;

    $.ajax({
        url: OMWMobileSearch.BaseURL + 'GetSearchResults',
        type: 'POST',
        //traditional: true,
        dataType: 'json',
        data: searchModel,
        success: function (data) {

            var searchHits = data.SearchHits;

            var instantPreview = OMWMobileSearch.PagePreview();

            var columns = columnsSpecification.columns;
            OMWMobileSearch.Columns = columns;
            var columnsLength = columns.length;

            for (var i = 0; i < searchHits.length; i++) {

                //Check if Edit button should be shown
                searchHits[i].Editable = false;
                if (OMWMobileSearch.PagePreview(searchHits[i].FormattedID)) {
                    searchHits[i].Editable = true;
                }


                var newLi = "<li class='SearchHitItem previewedStory" + searchHits[i].ItemRead.toString() + "' data-storyposition='" + (i + offset) +
                    "' data-id='" + searchHits[i].FormattedID + "' data-name='" + searchHits[i].PreviewHeader +
                    "'><a href='#' data-transition='slide'><img class='paneItemImage ui-li-icon' src='" +
                    OMWMobileSearch.GetIcon() + "' alt='icon' />" + searchHits[i].PreviewHeader + "</a></li>";

                $('.listSearchHits').append(newLi);

            }

            $('.listSearchHits').listview();
            $('.listSearchHits').listview("refresh");


            $('.searchFieldsPage').hide();
            $('.resultsPage').show();


            $.mobile.loading("hide");


            //Arrange columns
            $(searchHits).each(function () {
                var columnValues = OMWMobileSearch.PrepareSearchHitColumns(this);

                this.PreviewMain = OMWMobileSearch.MarkPreviewText(this.PreviewMain);

                this.DisplayFields = columnValues;
            });


            //Carousel data
            if (searchModel.PageNumber == 0) {
                OMWMobileSearch.SearchHits = searchHits;
            }
            else {
                for (var i = 0; i < searchHits.length; i++) {
                    OMWMobileSearch.SearchHits.push(searchHits[i]);
                }
            }
            var scope = OMWMobileSearch.GetAngularScope();
            if (scope) {

                scope.columns = columnsSpecification.columns;

                scope.setSearchResults(OMWMobileSearch.SearchHits);
                scope.totalSearchHits = OMWMobileSearch.SearchHitsTotal;
            }


            $('.SearchHitItem').click(function () {


                $.mobile.loading('show');

                var storyIndex = $(this).data('storyposition');
                OMWMobileSearch.ShowStory(storyIndex);

            });


        },
        error: function (xhr, textStatus, error) {
            console.log(textStatus);

            $.mobile.loading("hide");
        }
    });
};

function stringEndsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

OMWMobileSearch.PrepareSearchHitColumns = function (h) {
    var that = h;
    var hit = new Array();
    $(OMWMobileSearch.Columns).each(function () {
        var column = this;


        var value = OMWMobileSearch.GetFieldValue(column.FieldID, that.Fields);
        if (value.length > 64) {
            value = value.substr(0, 64) + "...";
        }
        var name = column.columnName;
        var backgroundColor = OMWMobileSearch.GetFieldBackgroundColor(column.FieldID, that.Fields);

        var obj = { name: name, value: value, backgroundColor: backgroundColor };

        hit.push(obj);

        //Check if there is a field with id 401 and it is a image
        if (column.FieldID == 401 && (stringEndsWith(value, '.png') || stringEndsWith(value, '.jpg'))) {
            that.PreviewImage = value;
        }
    });
    return hit;
};
OMWMobileSearch.GetFieldBackgroundColor = function (fid, fields) {
    var res = '';
    $(fields).each(function () {
        if (this.FieldID == fid) {
            res = this.FieldValue.BackgroundColor;
        }
    });
    return res;
};
OMWMobileSearch.GetFieldValue = function (fid, fields) {
    var res = '';
    $(fields).each(function () {
        if (this.FieldID == fid) {
            res = this.DisplayValue;
        }
    });
    return res;
};


OMWMobileSearch.GetIcon = function (id) {
    return $('#hdnContentBaseURL').val() + 'Images/icon_example_32.png';
};

OMWMobileSearch.ShowStory = function (storyIndex) {

    var scope = OMWMobileSearch.GetAngularScope();

    if (scope) {
        scope.setCarouselIndex(storyIndex);
        scope.checkIfStoryIsEditable(storyIndex);

        scope.setItemRead(storyIndex);
    }

    //Change page content
    $(".searchHitsPage").animate({ marginLeft: -($(document).width() + 20) }, 350);
    $('#searchPreviewCarouselPage').animate({ marginLeft: 0 }, 350);


    //angular.element(document).ready(function () {
    //    OMWMobileSearch.InstantPreviewResize();
    //});

    OMWMobileSearch.SetFieldNameWidth();

    $.mobile.loading("hide");

};
OMWMobileSearch.CloseStory = function () {

    $(".searchHitsPage").animate({ marginLeft: 0 }, 350);
    $('#searchPreviewCarouselPage').animate({ marginLeft: $(document).width() + 20 }, 350);

};

OMWMobileSearch.InstantPreviewResize = function () {

    $('#searchPreviewCarouselPage').height($(window).height());
    var carouselHeight = $(window).height() - 42;
    $('#searchPreviewCarousel').height(carouselHeight);
    $('.slideItem').height(carouselHeight - 35);
};

OMWMobileSearch.GetNextPage = function () {

    $.mobile.loading('show');

    OMWMobileSearch.CurrentPage++;

    var searchDetails = {
        SearchContextID: $('#hdnSearchContextID').val(),
        PageNumber: OMWMobileSearch.CurrentPage,
        SearchProfileID: $('#selectedSearchProfileItems').val()
    };

    OMWMobileSearch.GetPage(searchDetails, OMWMobileSearch.LastPageName);

};
OMWMobileSearch.navigatedBackToStories = false;
OMWMobileSearch.navigatedBackToStoriesFromStory = false;
OMWMobileSearch.GetAngularScope = function () {
    return (angular.element($('#searchPreviewCarousel')).scope());
};

OMWMobileSearch.StoryPreviewed = function (objid) {
    $.ajax({
        type: 'POST',
        url: OMWMobileSearch.BaseURL + 'ReadItem',
        data: {
            objectId: objid
        }
    });
};

angular.module("OMWMobileNGApp").service("FetchRichTextSvc",
	function ($http, $q, $sce)
	{
		var pendingDownload = [];

		function onSearchHitSelected(hits, index, callback)
		{
			pendingDownload = [];

			if (index >= 0 && index < hits.length)
			{
				for (var i = index; i < hits.length; i++)
				{
					if (i >= index + 4)
						break;

					pendingDownload.push(i);
				}

				index--;
				if (index >= 0 && index < hits.length)
					pendingDownload.push(index);

				downloadNext(hits, callback);
			}
		}

		function downloadNext(hits, callback)
		{
			if (pendingDownload.length === 0)
				return;

			var nextHitIndex = pendingDownload[0];
			var nextHit = hits[nextHitIndex];

			if (!nextHit.HasRichText)
			{
				pendingDownload.shift();
				downloadNext(hits, callback);
				return;
			}

			if (nextHit.richTextFetched)
			{
				callback(nextHitIndex);
				pendingDownload.shift();
				downloadNext(hits, callback);
				return;
			}

			showLoading(hits, true);

			pendingDownload.shift();

			$http({
				url: OMWMobileSearch.BaseURL + 'GetSearchHitRichText',
				method: "GET",
				params: { objectId: nextHit.ID.EncodedID }
			}).then(function (response)
			{
				nextHit.richTextFetched = true;
				nextHit.isRichTextLoading = false;

				if (!!response && !!response.data && !!response.data.richText)
					nextHit.richText = $sce.trustAsHtml(response.data.richText);
				else
					nextHit.richText = "";

				callback(nextHitIndex);

				downloadNext(hits, callback);
			}).catch(function (error)
			{
				console.error(error);

				nextHit.isRichTextLoading = false;

				downloadNext(hits, callback);
			});
		}

		function cancelDownload(hits)
		{
			showLoading(hits, false);
			pendingDownload = [];
		}

		function showLoading(hits, loading)
		{
			for (var i = 0; i < pendingDownload.length; i++)
			{
				var index = pendingDownload[i];
				var hit = hits[index];

				if (loading)
				{
					if (hit.HasRichText && !hit.richTextFetched)
						hit.isRichTextLoading = loading;
				}
				else
					hit.isRichTextLoading = loading;
			}
		}

		return {
			onSearchHitSelected: onSearchHitSelected,
			cancelDownload: cancelDownload
		};
	}
);

angular.module('OMWMobileNGApp')
    .controller('InstantPreviewController', function ($scope, $timeout, FetchRichTextSvc) {
        $scope.searchResults = new Array();
        $scope.carouselIndex = 0;
        $scope.totalSearchHits = OMWMobileSearch.SearchHitsTotal;
        $scope.columns = "";

        $scope.isRichTextView = false;
		$scope.isRichTextViewAborted = false;

        $scope.setSearchResults = function (results) {
            $scope.searchResults = results;

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        function onSearchHitSelected(index)
        {
	        if (!index)
		        index = $scope.carouselIndex;

	        FetchRichTextSvc.onSearchHitSelected($scope.searchResults, index, function(downloadedIndex)
	        {
		        if (index === downloadedIndex)
		        {
			        if (!$scope.isRichTextViewAborted)
			        {
				        $scope.isRichTextView = true;
				        updateRichTextViewButton();
			        }
		        }
	        });
        }

        function updateRichTextViewButton()
        {
        	var button = $('.richTextViewCarouselButton');
        	if ($scope.getIsRichTextView())
		        button.addClass("active");
		    else
			    button.removeClass("active");
        }

        function isLoading()
        {
	        for (var i = 0; i < $scope.searchResults.length; i++)
	        {
		        if ($scope.searchResults[i].isRichTextLoading)
					return true;
	        }
        }

        $scope.setIsRichTextView = function (richTextViewEnable)
		{
			if (!$scope.$$phase)
			{
				$scope.$apply(function()
				{
					if (!richTextViewEnable)
					{
						FetchRichTextSvc.cancelDownload($scope.searchResults);
						$scope.isRichTextView = false;
						$scope.isRichTextViewAborted = true;
						updateRichTextViewButton();
					}
					else
					{
						$scope.isRichTextViewAborted = false;

						onSearchHitSelected();

						updateRichTextViewButton();
					}
				});
			}
		};

		$scope.getIsRichTextView = function()
		{
			return (($scope.isRichTextView || isLoading()) && !$scope.isRichTextViewAborted);
		};

        $scope.setItemRead = function (index)
        {
	        if ($scope.searchResults[index].ItemRead == false) {
                $scope.searchResults[index].ItemRead = true;
                OMWMobileSearch.StoryPreviewed($scope.searchResults[index].ID.EncodedID);

                //Remove class from item
                $('.listSearchHits li:eq( ' + index + ' )').removeClass('previewedStoryfalse').addClass('previewedStorytrue');
            }
        };

        $scope.setCarouselIndex = function (index) {
            $scope.carouselIndex = index;

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        $scope.fieldfilter = function (item) {
            // If no tags are selected, show all the items.
            if ($scope.selectedTags.length === 0) return true;

            return intersects($scope.selectedTags, item.tags);
        }

        $scope.checkIfStoryIsEditable = function (index) {

            var newSlide = $scope.searchResults[index];

			if (!newSlide.HasRichText)
			{
				$('.richTextViewCarouselButton').hide();
				$scope.isRichTextView = false;
				$scope.isRichTextViewAborted = true;
				updateRichTextViewButton();
				FetchRichTextSvc.cancelDownload($scope.searchResults);
			}
			else
				$('.richTextViewCarouselButton').show();

			if ($scope.isRichTextView)
				onSearchHitSelected(index);

	        updateRichTextViewButton();

            if (newSlide.Editable) {
                var href = '';
                var currentUrl = $.mobile.activePage.data('url');

                if (newSlide.DocumentType === 0) {
                    href = storyBaseUrl + newSlide.FormattedID;
                }
                else {
                    href = collectionBaseUrl + '/Index/' + newSlide.FormattedID;
                }
                $('.editCarouselButton').attr('href', href);
                $('.editCarouselButton').show();
            }
            else {
                $('.editCarouselButton').hide();
            }
        };

        $scope.showPrev = function () {
            if ($scope.carouselIndex > 0) {
                OMWMobileSearch.SetFieldNameWidth();

                $scope.checkIfStoryIsEditable($scope.carouselIndex - 1);

                OMWMobileSearch.InstantPreviewResize();

                $scope.setItemRead($scope.carouselIndex - 1);
            }

        };
        $scope.showNext = function () {
            if ($scope.carouselIndex < $scope.searchResults.length - 1) {
                OMWMobileSearch.SetFieldNameWidth();

                $scope.checkIfStoryIsEditable($scope.carouselIndex + 1);

                OMWMobileSearch.InstantPreviewResize();

                //Check if this is the last one and if there is more on server
                if ($scope.carouselIndex == $scope.searchResults.length - 2 && $scope.carouselIndex + 2 < $scope.totalSearchHits) {
                    OMWMobileSearch.GetNextPage();
                }

                $scope.setItemRead($scope.carouselIndex + 1);
            }
        };

    });

OMWMobileSearch.SetFieldNameWidth = function () {
    var maxWidth = 0;
    var labelFields = $('.fieldName');
    labelFields.each(function () {
        var width = $(this).width();
        if (width > maxWidth) {
            maxWidth = width;
        }
    });
    labelFields.width(maxWidth);
    $('.fieldValue').css('marginLeft', maxWidth);
};

OMWMobileSearch.ResetSearchFieldsValues = function () {
    var page = $('.searchFieldsPage:visible');

    var inputs = page.find('input:text.SearchInput, input[type="number"].SearchInput, select.SearchInput');
    $(inputs).each(function () {
        var value = $(this).data('defaultvalue');
        if (value != null) {
	        $(this).val(value).change();
        }
    });

    var selects = page.find('select.SearchInput');
    $(selects).each(function () {
        var value = $(this).data('defaultvalue');
        $(this).val(value).attr('selected', true).siblings('option').removeAttr('selected');
        $(this).selectmenu("refresh", true);
    });

    var checkboxes = page.find('input:checkbox.SearchInput');
    $(checkboxes).each(function () {
        var value = $(this).data('defaultvalue');
        $(this).prop('checked', value == 1 ? true : false).checkboxradio('refresh');
    });

    var dateTimeControlls = page.find('div.dateTimeSearchInput');
    $(dateTimeControlls).each(function () {
        var date = $(this).find('.dateTimeDate');
        $(date).trigger('datebox', { 'method': 'set', 'value': $(date).data('defaultvalue') });

        var time = $(this).find('.dateTimeTime');
        $(time).trigger('datebox', { 'method': 'set', 'value': $(time).data('defaultvalue') });
    });

    var dateControlls = page.find('.dateInput');
    $(dateControlls).each(function () {
        var date = $(this).data('defaultvalue');
        $(this).val(date);
        $(this).trigger('datebox', { 'method': 'set', 'value': date });
    });

};

OMWMobileSearch.GetSearchFieldsValues = function () {
    var values = [];

    var page = $('.searchFieldsPage:visible');

    var inputs = page.find('input:text.SearchInput, input[type="number"].SearchInput, select.SearchInput');
    $(inputs).each(function () {
        if ($(this).val() != '') {
            values.push({
                Name: this.id,
                Value: $(this).val(),
                Label: $(this).data('label')
            });
        }
        else {
            values.push({
                Name: this.id,
                Value: '',
                Label: $(this).data('label')
            });
        }
    });

    var selectLists = page.find('select.headerList.custom-menu-list');
    $(selectLists).each(function () {
        if ($(this).val() != '') {
            values.push({
                Name: this.id,
                Value: $(this).val().toString(),
                Label: $(this).data('label')
            });
        }
        else {
            values.push({
                Name: this.id,
                Value: '',
                Label: $(this).data('label')
            });
        }
    });

    var checkboxes = page.find('input:checkbox.SearchInput');

    $(checkboxes).each(function () {
        values.push({
            Name: this.id,
            Value: $(this).is(':checked') ? true : false,
            Label: $(this).data('label')
        });
    });

    var dateTimeControlls = page.find('div.dateTimeSearchInput');
    $(dateTimeControlls).each(function () {
        var name = this.id;
        var $this = $(this);

        if ($this.find('.date-fields').is(":visible")) {
            var date, time;

            var val1 = $this.find('.dateTimeDate').val();
            var val2 = $this.find('.dateTimeTime').val();
            if (val1 != '') {
                date = $this.find('.dateTimeDate').datebox('getTheDate');
            }
            if (val2 != '') {
                time = $this.find('.dateTimeTime').datebox('getTheDate');
            }

            var dateVal = '';
            if (val1 != '' && val2 != '') {
                dateVal = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
            }
            else if (val1 != '') {
                dateVal = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            }
            else if (val2 != '') {
                var oldDate = new Date(0);
                dateVal = new Date(oldDate.getFullYear(), oldDate.getMonth(), oldDate.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
            }

            if (dateVal != '') {
                values.push({
                    Name: name,
                    Value: dateVal.toUTCString(),
                    Label: $this.data('label')
                });
            }
            else {
                values.push({
                    Name: name,
                    Value: '',
                    Label: $this.data('label')
                });
            }
        }
        else {
            //Find select box and get value from there
            var pickerContent = $this.closest('.pickerContent')[0];
            if (pickerContent) {
                values.push({
                    Name: name,
                    Value: $(pickerContent).find('select.date-custom-combobox').val(),
                    Label: $this.data('label')
                });
            }
            else {
                values.push({
                    Name: name,
                    Value: '',
                    Label: $this.data('label')
                });
            }
        }
    });

    //dateInput
    var dateControlls = page.find('.dateInput');
    $(dateControlls).each(function () {
        var name = this.id;
        var $this = $(this);

        if ($this.is(":visible")) {
            var val1 = $this.val();
            var date = $this.datebox('getTheDate');
            if (val1 != '' && date != 'Invalid Date') {
                values.push({
                    Name: name,
                    Value: date.toUTCString(),
                    Label: $this.data('label')
                });
            }
            else {
                values.push({
                    Name: name,
                    Value: '',
                    Label: $this.data('label')
                });
            }
        }
        else {
            //Find select box and get value from there
            var pickerContent = $this.closest('.pickerContent')[0];
            if (pickerContent) {
                values.push({
                    Name: name,
                    Value: $(pickerContent).find('select.date-custom-combobox').val(),
                    Label: $this.data('label')
                });
            }
            else {
                values.push({
                    Name: name,
                    Value: '',
                    Label: $this.data('label')
                });
            }
        }
    });

    return values;
};


$(document).ready(function () {

    storyBaseUrl = $('#hdnStoryBaseURL').val();
    collectionBaseUrl = $('#hdnAppBaseUrl').val() + 'Collection/Editor';

    //Carousel change
    $('.rn-carousel-container').bind('bufferChanged', function () {
        var ml = $('#parentPage').css('marginLeft');
        if (ml != '0px') {
            OMWMobileSearch.InstantPreviewResize();
        }
    });


    $('#searchPreviewCarouselPage').css('marginLeft', $(window).width() + 20 + 'px');
    $("#parentPage").css('marginLeft', $(window).width() + 20 + 'px');

    var windowHeight = $(window).height();
    $('#searchPreviewCarousel').height(windowHeight - 42);


    //Change popup behaviour
    $('.my-popup-selector').on('popupafteropen', function () {
        $(this).one('popupafterclose', function () {
            $(window).one('navigate.popup', function (e) {
                e.preventDefault();
            });
        });
    });



    $.mobile.loader.prototype.options.text = "loading";
    $.mobile.loader.prototype.options.textVisible = false;
    $.mobile.loader.prototype.options.theme = "a";
    $.mobile.loader.prototype.options.html = "";

    $.mobile.popup.prototype.options.history = false;
    //$.mobile.hashListeningEnabled = false;

    $.mobile.ajaxEnabled = true;

    $.mobile.defaultPageTransition = 'slide';


});

$(window).resize(function () {
    var ml = $('#parentPage').css('marginLeft');
    if (ml != '0px') {
        var marginLeft = $('#searchPreviewCarouselPage').css('marginLeft');
        if (marginLeft != '0px') {
            $('#searchPreviewCarouselPage').css('marginLeft', $(window).width() + 20 + 'px');
        }
        else {
            $('#searchHits').css('marginLeft', '-' + ($(window).width() + 20) + 'px');
        }

        OMWMobileSearch.InstantPreviewResize();
    } else {
        $('#searchHits').css('marginLeft', '-' + ($(window).width() + 20) + 'px');
        $('#searchPreviewCarouselPage').css('marginLeft', '-' + ($(window).width() + 20) + 'px');
    }
});

OMWMobileSearch.SetSearchFieldValue = function (id, value)
{
    var type = $(id).data('type');
    if (type == 'text') {
        $(id).val(value).change();
    }
    else if (type == 'date') {
        var date = new Date(value);
        $(id).datebox('setTheDate', date);
    }
    else if (type == 'datetime') {
        var date = new Date(value);
        $(id + ' .dateTimeDate').datebox('setTheDate', date);
        $(id + ' .dateTimeTime').datebox('setTheDate', date);
    }
    else if (type == 'select') {
        $(id).val(value).selectmenu().selectmenu('refresh');
    }
    else if (type == 'check') {
        console.log(value);
        if (value == 'on') {
            $(id).attr("checked", true).checkboxradio().checkboxradio("refresh");
        }
    }
};
OMWMobileSearch.RestartSearchFields = function () {
    $('.SearchInput').val('').change();
    $('.dateTimeDate').val('');
    $('.dateTimeTime').val('');
    $('.dateInput').val('');
    $('.customCombobox').val('');
    $('.searchCheckbox').attr("checked", false);
};

$(document).on("pageshow", "#searchHits", function () {
    var url = document.URL;
    var strings = url.split('/');
    var navigationPane = strings[strings.length - 1];
    var selectedSearchProfile = strings[strings.length - 2];
    var sessionData = '';

    $('.resultsPage').show();

    if (!OMWMobileSearch.NavigatedFromPanes) {
        if ($('#hdnSessionData').val() != '') {

            sessionData = JSON.parse($('#hdnSessionData').val());

            if (sessionData.SearchProfileId != null && sessionData.SearchProfileId == selectedSearchProfile) {
                if (sessionData.SearchProfileName != null && sessionData.SearchProfileName != '') {
                    OMWMobileSearch.SearchHitsPaneName = sessionData.SearchProfileName;
                }
                if (sessionData.SearchParams != null) {

                    console.log(sessionData.SearchParams);

                    for (var i = 0; i < sessionData.SearchParams.length; i++)
                    {
	                    OMWMobileSearch.SetSearchFieldValue('#' + sessionData.SearchParams[i].Id, sessionData.SearchParams[i].Value);
                    }
                }
            }
            else {
                sessionData = '';
                $('#hdnSessionData').val('');
            }
        }
    }
    OMWMobileSearch.NavigatedFromPanes = false;


    //Change these
    $('#selectedSearchProfileItems').val(selectedSearchProfile);
    $('#NavigationPaneId').val(navigationPane);


    $('#searchHitsHeader').text(OMWMobileSearch.SearchHitsPaneName);

    $('.editCarouselButton').hide();

    OMWMobileSearch.BaseURL = $('#hdnStoriesBaseURL').val();


    $.mobile.loading('show');


    //Get search hits
    var selectedSearchProfile = $('#selectedSearchProfileItems').val();
    var navigationPaneId = $('#NavigationPaneId').val();

    $('.listSearchHits').html('');

    OMWMobileSearch.NavigationPaneId = navigationPaneId;
    OMWMobileSearch.SearchProfileId = selectedSearchProfile;

    var values = [];
    if (sessionData != '' && !!sessionData.SearchParams) {
        for (var i = 0; i < sessionData.SearchParams.length; i++) {
            values.push({
                Name: sessionData.SearchParams[i].Id,
                Value: sessionData.SearchParams[i].Value
            });
        }
    }
    else {
        //This was settings all search fields to empty, used for working with session search
        //OMWMobileSearch.RestartSearchFields();
    }
    var model = {
        SearchProfileId: selectedSearchProfile,
        ResultsType: 0,
        Values: values
    };

    OMWMobileSearch.StartSearch(model, OMWMobileSearch.searchArray);


    $('.loadMoreItems').click(function () {
        if (OMWMobileSearch.SearchHits.length < OMWMobileSearch.SearchHitsTotal) {
            OMWMobileSearch.GetNextPage();
        }
    });
    $('#resetSearchFields').click(function () {
        OMWMobileSearch.ResetSearchFieldsValues();

    });


    var viewPortHeight = $(window).height();
    var headerHeight = $('div[data-role="header"]').height() + $('.nav-glyphish').height();
    var footerHeight = $('div[data-role="footer"]').height();
    var contentHeight = viewPortHeight - headerHeight - footerHeight - 4;

    $('.storyContent').height(contentHeight);

    OMWMobileSearch.InstantPreviewResize();

    $.mobile.loading('hide');
});


OMWMobileSearch.SelectListClick = function (e) {
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

        var position = $select.data('position');
        var separator = $select.data('separator') || ',';
        var value = $select.data('value');
        value = value.split(separator);
        
        $.ajax({
            url: OMWMobileSearch.BaseURL + "LoadSearchProfileFieldItems",
            type: 'GET',
            traditional: true,
            dataType: 'json',
            data: {
                id: OMWMobileSearch.SearchProfileId,
                position: position
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


$(document).on("pageinit", "#searchHits", function () {

    $('.resultsPage').show();

    //Nav buttons
    $('.navBtnSeachFields').click(function () {
        $.mobile.loading('show');

        $('.resultsPage').hide();
        $('.searchFieldsPage').show();

        $.mobile.loading('hide');
    });
    $('.navBtnResults').click(function () {
        //OMWMobileStory.SetHeightOfStoryContents();
        $.mobile.loading('show');


        //Do search
        var selectedSearchProfile = $('#selectedSearchProfileItems').val();

        $('.listSearchHits').html('');
        var values = OMWMobileSearch.GetSearchFieldsValues();

        var model = {
            SearchProfileId: selectedSearchProfile,
            ResultsType: 0,
            Values: values,
            SortOrder: OMWMobileSearch.searchArray
        };

        OMWMobileSearch.StartSearch(model, OMWMobileSearch.searchArray);

    });

    $('.backButtonSearchPreview').click(function () {
        OMWMobileSearch.CloseStory();
    });
    $('.homeButtonSearchPreview').click(function () {
        OMWMobileSearch.CloseStory();
    });

    $('.richTextViewCarouselButton').click(function ()
    {
    	var scope = OMWMobileSearch.GetAngularScope();
	    if (scope)
			scope.setIsRichTextView(!scope.getIsRichTextView());
    });

    $('.editCarouselButton').click(function () {
        $.mobile.loading("show");
    });

    $('.parentButton').click(function () {
        OMWMobileSearch.GetParetPageData();
    });

    $('.backButtonParent').click(function () {
        OMWMobileSearch.CloseParent();
    });

    $(document).on('click', '.sort-button', OMWMobileSearch.CustomSort);

    for (var i = 0; i < OMWMobileSearch.searchArray.length; i++) {
        var element = $('.sort-button[data-fieldid="' + OMWMobileSearch.searchArray[i].FieldID + '"]');
        //Add class with current value
        element.addClass('sort-icon-' + i);

        var newSortArrayItem = {
            fieldId: OMWMobileSearch.searchArray[i].FieldID,
            element: element
        };
        if (OMWMobileSearch.searchArray[i].Ascending === 1) {
            element.addClass('sort-button-up');
            newSortArrayItem.sortDirection = 'asc';
        }
        else {
            element.addClass('sort-button-down');
            newSortArrayItem.sortDirection = 'desc';
        }

        OMWMobileSearch.sortArray.push(newSortArrayItem);
    }

    $('.searchFieldWrap').on('click', '.date-picker-swich-icon', function () {

        var $element = $(this);
        var $container = $element.parent().parent();
        if ($element.hasClass('ui-icon-bars')) {
            $element.removeClass('ui-icon-bars');
            $element.addClass('ui-icon-calendar');

            //Hide date picker, show dropdown
            $container.find('.date-fields').hide();
            $container.find('.date-select-box').show();
        }
        else {
            $element.removeClass('ui-icon-calendar');
            $element.addClass('ui-icon-bars');

            //Hide dropdown, show date picker
            $container.find('.date-select-box').hide();
            $container.find('.date-fields').show();
        }
    });

    //Click event for select menu
    $('.custom-menu-list').click(OMWMobileSearch.SelectListClick);
});

OMWMobileSearch.CustomSort = function () {
    var fieldId = $(this).data('fieldid');

    var position = -1;
    for (var i = 0; i < OMWMobileSearch.sortArray.length; i++) {
        if (OMWMobileSearch.sortArray[i].fieldId === fieldId) {
            position = i;
            break;
        }
    }
    if (position > -1) {
        //Remove this element from n position so it can be added to the first position
        OMWMobileSearch.sortArray.splice(position, 1);
    }

    var allSortButtons = $('.sort-button');

    //Remove all possible classes
    allSortButtons.removeClass('ui-icon-arrow-u');
    allSortButtons.removeClass('ui-icon-arrow-d');

    //Add to first place in array
    var newItem = { fieldId: fieldId, element: $(this), sortDirection: '' };

    if ($(this).data('sort-direction') === 'asc') {
        $(this).data('sort-direction', 'desc');
        newItem.sortDirection = 'desc';
    }
    else {
        $(this).data('sort-direction', 'asc');
        newItem.sortDirection = 'asc';
    }
    OMWMobileSearch.sortArray.unshift(newItem);


    if (OMWMobileSearch.sortArray.length > 3) {
        //Remove from the last place in array and make this column not sortable
        OMWMobileSearch.sortArray.pop();
    }

    //Remove all possible classes
    allSortButtons.removeClass('sort-icon-0');
    allSortButtons.removeClass('sort-icon-1');
    allSortButtons.removeClass('sort-icon-2');
    allSortButtons.removeClass('sort-button-up');
    allSortButtons.removeClass('sort-button-down');

    OMWMobileSearch.searchArray = [];
    for (var i = 0; i < OMWMobileSearch.sortArray.length; i++) {
        var newSearchArrayItem = { FieldID: OMWMobileSearch.sortArray[i].fieldId, Ascending: OMWMobileSearch.sortArray[i].sortDirection === 'asc' ? 1 : 0 };
        OMWMobileSearch.searchArray.push(newSearchArrayItem);

        //Get parent element
        var e = $(OMWMobileSearch.sortArray[i].element);

        //Add class with current value
        e.addClass('sort-icon-' + i);

        if (newSearchArrayItem.Ascending === 1) {
            e.addClass('sort-button-up');
        }
        else {
            e.addClass('sort-button-down');
        }
    }

    console.log(OMWMobileSearch.searchArray);
    //Call search method on server
    //$scope.searchModel.SortOrder = searchArray;
    //$scope.startSearch($scope.searchModel, false);
};

//Setting title of navigation pane
OMWMobileSearch.PaneName = "";
OMWMobileSearch.SearchHitsPaneName = '';
$(document).on("pageshow", "#searchProfiles", function () {
    $('.mobileNavigationPane').click(function () {
        OMWMobileSearch.PaneName = $(this).text();
    });
    $.mobile.loading('hide');
});
OMWMobileSearch.NavigatedFromPanes = false;
$(document).on("pageshow", "#paneItems", function () {

    //Restart data for session
    $('#hdnSessionData').val('');

    $('.paneItem').click(function () {
        OMWMobileSearch.NavigatedFromPanes = true;
        OMWMobileSearch.SearchHitsPaneName = $(this).text();
    });

    var name = $('#hdnPaneName').val();
    if (!name | name == "" | name == " ") {
        $('.navigationPaneName').text(OMWMobileSearch.PaneName);
    }
    else {
        $('.navigationPaneName').text(name);
    }
    $.mobile.loading('hide');
});

$(document).on("pageshow", "#searchHits", function () {

    $('.clearDatePicker').click(function () {
        $(this).parent().find('input').val('');
    });

    $.mobile.loading('hide');
});


$(document).on("pageinit", "#newStoryPage", function () {
    OMWMobileSearch.GetNewStoryData();
    $('#newStoryItemsList').on('click', '.createStory', function () {
        var id = $(this).data('id');
        OMWMobileSearch.CreateNewStory(id);
    });
});

OMWMobileSearch.GetNewStoryData = function () {

    $.ajax({
        type: 'POST',
        url: $('#hdnBaseUrl').val() + 'Document/SelectionLists/GetList',
        success: function (data) {
            var ul = $('#newStoryItemsList');
            for (var i = 0; i < data.length; i++) {
                var li = '<li><a class="listItem"><img src="' + data[i].IconURL + '" /><h2>' + data[i].Name + '</h2><p>Folder: ' + data[i].Directory + '</p></a><a data-id="' + data[i].ID + '" class="createStory"></a></li>';
                ul.append(li);
            }
            ul.listview("refresh");
        }
    });
};
OMWMobileSearch.CreateNewStory = function (DocumentTypeId) {
    var baseUrl = $('#hdnBaseUrl').val();
    $.ajax({
        type: 'POST',
        url: baseUrl + 'Document/SelectionLists/AddDocument',
        data: {
            documentTypeId: DocumentTypeId
        },
        success: function (data) {
            if (data != null) {
                console.log(data);
                //Remove ~/ from start
                var url = baseUrl + data.substr(2);
                $.mobile.changePage(url, { transition: "slideleft" });
            }
            else {
                OMWMobile.Notifications.ShowNotification('Error', 'Creating of new story failed, please try again.', false, '');
            }
        },
        error: function (xhr, textStatus, error) {
            OMWMobile.Notifications.ShowNotification('Error', 'Creating of new story failed, please try again.', false, '');
        }
    });
}

OMWMobileSearch.CloseParent = function () {
    $('#searchHits').css('marginLeft', '-' + ($(window).width() + 20) + 'px');
    $("#searchPreviewCarouselPage").animate({ marginLeft: 0 }, 350);
    $('#parentPage').animate({ marginLeft: $(document).width() + 20 }, 350);
    $("#parentPage").height(0);
    $("#parentPage").removeClass("ui-page ui-page-active");
    $('#searchPreviewCarouselPage').height($(window).height());
}

function openParentUrl(url) {
    window.location.href = url;
}

OMWMobileSearch.GetParetPageData = function () {
    $.mobile.loading('show');
    $('#parentPageItemsList').html('');

    $.ajax({
        type: 'GET',
        url: $('#hdnAppBaseUrl').val() + 'Document/Parent/GetData?name=test',
        success: function (data) {
            $.mobile.loading('hide');
            if (data==null) {
                console.error('Failed loading items for this field');
                return;
            }
            if (data.length > 1) {
                $('#searchHits').css('marginLeft', '-' + ($(window).width() + 20) + 'px');
                $("#searchPreviewCarouselPage").height(0);
                $("#searchPreviewCarouselPage").animate({ marginLeft: -($(document).width() + 20) }, 350);
                $('#parentPage').animate({ marginLeft: 0 }, 350);
                $("#parentPage").addClass("ui-page ui-page-active");
                var ul = $('#parentPageItemsList');
                for (var i = 0; i < data.length; i++) {
                    var li = '<li><a class="listItem"><img src="/OMWebiSearch/' + data[i].icon + '" /><h2>' + data[i].name + '</h2><p>Folder: ' + data[i].name + '</p></a><a href="javascript:;" onclick="openParentUrl(\'' + data[i].url + '\')"></a></li>';
                    ul.append(li);
                }
                ul.listview();
                ul.listview("refresh");
            } else if (data.length == 1) {
                var url = response.data[0].url;
                window.open(url, "_blank");
            } else {
                alert('No parent');
            }
        },
        error: function (data) {
            $.mobile.loading('hide');
        }
    });
};