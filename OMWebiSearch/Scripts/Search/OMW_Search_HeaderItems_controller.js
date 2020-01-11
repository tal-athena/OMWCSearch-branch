(function () {
    'use strict';

    angular.module('omwcSearch')
        .controller('HeaderItems', ['$scope', 'OMWListFieldDialogSvc', function ($scope, OMWListFieldDialogSvc)
	    {
		    $scope.editListHeaderField = function (position, $event) {
                var id = angular.element('#hdnSearchProfileId').val();

                var element = angular.element($event.currentTarget).parent().find('input').first();

                var currentItem = {
                    Value: element.val()
                };

                //Open modal that will be used to edit this stuff
                var popUp = OMWListFieldDialogSvc.InitPopUp('search');
                popUp.open({
                    item: currentItem,
                    id: id,
                    position: position,
                    splitter: ','
                }, function (result)
                {
                	element.val(result).change();
                });
            };
        }]);
})();