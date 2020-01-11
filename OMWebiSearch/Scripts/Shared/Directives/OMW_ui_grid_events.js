(function () {

    angular.module('omwShared')
            .directive('omwUiGridEvents', ['$compile', 'gridUtil', function ($compile, gridUtil) {
                return {
                    require: '^uiGrid',
                    scope: false,
                    link: function ($scope, $elm, $attrs, uiGridCtrl) {

                        var grid = uiGridCtrl.grid;
                        var focuser = $compile('<div class="ui-grid-focuser" role="region" aria-live="assertive" aria-atomic="false" tabindex="0" aria-controls="' + grid.id + '-aria-speakable ' + grid.id + '-grid-container' + '" aria-owns="' + grid.id + '-grid-container' + '"></div>')($scope);
                        $elm.append(focuser);

                        if (!$scope.eventFunctions) {
                            $scope.eventFunctions = {};
                        }

                        $elm.on('click', '.ui-grid-row', function () {
                            gridUtil.focus.byElement(focuser[0]);
                        });

                        focuser.bind('keydown', function (e)
                        {
	                        $scope.$apply(function () {
                                if ($scope.eventFunctions[e.keyCode] && typeof $scope.eventFunctions[e.keyCode] === "function") {
									$scope.eventFunctions[e.keyCode](e);
                                }
                            });
                        });
                    }
                };
            }])

})();