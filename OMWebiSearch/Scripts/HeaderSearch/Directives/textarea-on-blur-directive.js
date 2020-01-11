(function () {

angular.module('omwHeaderSearch')
    .directive('ngModelTextareaOnblur', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elm, attr, ngModelCtrl) {
                elm.unbind('textarea').unbind('keydown').unbind('change');
                elm.bind('blur', function () {
                    if (!scope.$$phase) {

                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(elm.val());
                            //Update element value to server
                            if (OMWClientContext.HeaderSearch.updateTextField == true) {

                                var currentId = OMWClientContext.HeaderSearch.findElementFieldId(elm);

                                OMWClientContext.HeaderSearch.updateElementValue(currentId, elm.val());
                            }

                        });
                    }
                });
                elm.bind('focus', function () {

                    var currentId = OMWClientContext.HeaderSearch.findElementFieldId(elm);

                    OMWClientContext.HeaderSearch.LockField(currentId);

                    lastValue = $(elm).val();

                    OMWClientContext.HeaderSearch.updateTextField = true;
                    if (OMWClientContext.HeaderSearch.lockFieldStatus == false) {
                        OMWClientContext.HeaderSearch.updateTextField = false;
                    }
                });
            }
        };
    });
})();