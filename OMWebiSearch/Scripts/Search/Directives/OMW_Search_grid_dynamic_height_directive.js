(function () {

    angular.module('omwcSearch')
            .directive('gridDynamicHeight', ['$window', '$timeout', function ($window, $timeout) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        var minHeight = attrs.gridDynamicHeight;

                        var $mainContent = angular.element('#contentM');
                        var $headerItemsContainer = angular.element('#headerItemsContainer');

                        var setGridHeight = function () {
                            element.css({
                                'height': function () {
                                    var newHeight = $mainContent.height() - $headerItemsContainer.height() - 45;

                                    if (newHeight < minHeight) {
                                        newHeight = minHeight;
                                    }

                                    return newHeight;
                                }
                            });
                            element.find('.grid').css({
                                'height': function () {
                                    var newHeight = $mainContent.height() - $headerItemsContainer.height() - 45;

                                    if (newHeight < minHeight) {
                                        newHeight = minHeight;
                                    }

                                    return newHeight;
                                }
                            });
                        };

                        $timeout(setGridHeight);
                        angular.element($window).bind('resize', setGridHeight);
                    }
                };
            }]);
})();