(function () {

    angular.module('omwCollection')
            .directive('gridDynamicHeightCollection', ['$window', '$timeout', function ($window, $timeout) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs)
                    {
	                    var minHeight = parseInt(attrs.gridDynamicHeightCollection);
                        var pageType = attrs.page || '';

                        var $mainContent = angular.element('#contentM');
                        var $headerItemsContainer = angular.element('#headerItemsContainer');

                        var setGridHeight = function () {
                            var height = $mainContent.height() - $headerItemsContainer.height() - 15;

                            if (pageType === 'collection') {
                                height -= angular.element('#collectionTitle').height();
                            }

                            if (height < minHeight) {
                                height = minHeight;
                            }

                            element.css({
                                'height': height
                            });

                            if (pageType === 'collection') {
                                element.find('#collectionPageGrid').height(height);
                            }
                        };

                        $timeout(setGridHeight);
                        angular.element($window).bind('resize', setGridHeight);
                    }
                };
            }]);
})();