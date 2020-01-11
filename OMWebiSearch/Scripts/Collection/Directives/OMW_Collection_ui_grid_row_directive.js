(function () {
    angular.module('omwCollection')
        .directive('uiGridRow', ['$animate', '$timeout', function ($animate, $timeout) {
            return {
                priority: -1,
                link: function ($scope, $elm, $attrs) {
                    var className = 'newRowAnimation';

                    $scope.$watch('row.entity', function () {
                        if ($scope.row.entity.isChanged) {
                            if ($scope.row.entity.updateRecords && $scope.row.entity.updateRecords.length > 0) {
                                //Animate only cells that are in this row
                                for (var i = 0; i < $scope.row.entity.updateRecords.length; i++) {
                                    var element = $elm.find('.' + $scope.row.entity.updateRecords[i]);

                                    if (!element) {
                                        continue;
                                    }

                                    $animate.addClass(element, className).then(function (el) {
                                        $timeout(function (element) {
                                            $animate.removeClass(element, className)
                                        }.bind(this, el));
                                    }.bind(this, element));
                                }

                                $scope.row.entity.updateRecords = [];
                            }
                            else {
                                $animate.addClass($elm, className).then(function () {
                                    $timeout(function () { $animate.removeClass($elm, className) });
                                });
                            }

                            $scope.row.entity.isChanged = false;
                        }
                    }, true);
                }
            };
        }]);

})();
