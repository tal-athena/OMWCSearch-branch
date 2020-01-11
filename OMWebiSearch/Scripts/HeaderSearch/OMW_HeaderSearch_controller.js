(function () {
    angular.module('omwHeaderSearch')
		.controller('headerController', ['$scope', 'OMWListFieldDialogSvc', function ($scope, OMWListFieldDialogSvc) {
            var jsonString = $('#data').html(), jsonValue = JSON.parse(jsonString);
            $scope.fieldsList = jsonValue;

            $scope.firstTimeClick = true;
            //OK, sending true or false, can change that to 0 and 1
            $scope.checkBoxValueChange = function (index) {

                var elm = $scope.fieldsList[index];

                //Lock
                OMWClientContext.HeaderSearch.LockField(elm.Key);
                //alert(elm.Value);
                if (OMWClientContext.HeaderSearch.lockFieldStatus == false) {
                    var id = "#OMW_SearchCheckBox_" + index;

                    var label = $(id).parent().find('label');

                    if (elm.Value == 1) {

                        $scope.fieldsList[index].Value = 0;
                        label.css('background-position', '0px 0px');
                    }
                    else {

                        $scope.fieldsList[index].Value = 1;
                        label.css('background-position', '0px -20px');
                    }

                }
                else {
                    //Locked, can be changed to server
                    OMWClientContext.HeaderSearch.updateElementValue(elm.Key, elm.Value);
                }

            };

            $scope.updateElement = function (fieldId, fieldValue, position) {

                $scope.fieldsList[position].Value = fieldValue;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }

                var selector = "";
                // Getting the changed field, this can be done by adding ID-s to the $scope.fieldsList
                if (pageType == "Collection") {
                    selector = "#headerSearchController .collectionHeader > div:nth-child(" + (position + 1) + ") .searchFieldWrap";
                }
                else {
                    selector = "#headerSearchController div:first-child > div:nth-child(" + (position + 1) + ") .searchFieldWrap";
                }

                // Because the structure for some fields is different, we must see what field is updating,
                // and the depending on it get the object that is animating (eg. for the checkbox it is a label)
                var par = $(selector).find('>:first-child');

	            try
	            {
		            var type = par.attr('type');
		            if (!type) { // If there is no type it means that this is the select(combobox) or textarea(multiline)
			            if (par[0].tagName == "TEXTAREA") { //it is a multiline text

			            }
			            else {
				            par = par.find('input');

				            var _fieldId = "#" + "comboBox_" + fieldId;

				            var ds = $(_fieldId).data().kendoComboBox;

				            ds.value(fieldValue);
				            ds.text(fieldValue);

			            }
		            }
		            else {
						if (type == "checkbox")
						{
							par = $(par).next();
						}
						else if (type == "hidden")
						{
							par.val(fieldValue).change();
							return null;
						}
		            }
	            }
	            catch (e)
	            {
		            console.error(e.message);
	            }

	            return par;
            };

            // Function for updating, will be called from server, have to test it with live server version
            // With dummy data test hapening every 5 seconds it was ok
            $scope.updateElementFromServer = function (fieldId, fieldValue) {

                var position = OMWClientContext.HeaderSearch.findElementPosition($scope.fieldsList, 'Key', fieldId);
                if (position != null) {

                    $scope.updateElement(fieldId, fieldValue, position);

                    // Animating
                    par.addClass('borderColor');

                    par.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                        par.removeClass('borderColor');
                    });
                }
                else {
                    console.log('Update of value failed!');
                }
            };

            $scope.editListHeaderField = function (fieldId) {
                var currentItem;

                for (var i = 0; i < $scope.fieldsList.length; i++) {
                    if ($scope.fieldsList[i].Key === fieldId) {
                        currentItem = $scope.fieldsList[i];
                        break;
                    }
                }

                if (!currentItem) {
                    return;
                }

                var item = angular.copy(currentItem);

                //Open modal that will be used to edit this stuff
                var collectionId = angular.element('#hdnStoryId').val();
                var popUp = OMWListFieldDialogSvc.InitPopUp('collection');
                popUp.open({
                    item: item,
                    collectionId: collectionId,
                    fieldId: fieldId,
                    splitter: ';'
                }, function (result)
                {
	                currentItem.Value = result;
                });
            };

            //When everything finished initialize header controls (kendo dropdown....)
            OMWClientContext.HeaderSearch.InitControlls();

        }]);
})();