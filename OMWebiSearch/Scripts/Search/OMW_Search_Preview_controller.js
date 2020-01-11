(function () {
    'use strict';

    angular.module('omwcSearch')
        .controller('SearchPreviewController', ['$scope', '$rootScope', 'SearchResultsService', function ($scope, $rootScope, SearchResultsService) {

            $scope.carouselIndex = 0;
            $scope.totalSearchHits = 0;
            $scope.viewTo = 1;
            $scope.viewFrom = 1;
            $scope.searchResults = [];
            $scope.selectedRow = {};

            $scope.$on('search:searchResultsUpdated', function (event, obj) {
                $scope.searchResults = obj.results;
                $scope.viewTo = obj.viewTo;
                $scope.viewFrom = obj.viewFrom;
                $scope.totalSearchHits = obj.totalSearchHits;
            });

            $scope.$on('search:rowClick', function (event, rowData) {
                $scope.onLineSelected(rowData);
            });

            ///ANGULAR CAROUSEL
            $scope.showPrev = function () {
                $('.rn-carousel-control-prev').click();

                if ($scope.carouselIndex > 0) {
                    $scope.selectRow($scope.searchResults[$scope.carouselIndex - 1]);
                }
            };

            $scope.showNext = function () {
                $('.rn-carousel-control-next').click();

                if ($scope.carouselIndex < $scope.searchResults.length - 1) {
                    $scope.selectRow($scope.searchResults[$scope.carouselIndex + 1]);

                    //Check if this is the last one and if there is more on server
                    if ($scope.carouselIndex == $scope.searchResults.length - 2 && $scope.carouselIndex + 1 < $scope.totalSearchHits) {
                        $rootScope.$broadcast('search:loadNewResults');
                    }
                }
            };

            $scope.onLineSelected = function (rowData) {
                $scope.selectedStoryId = rowData.systemId;

                //Change position in carousel
                var index = $scope.searchResults.indexOf(rowData);
                $scope.carouselIndex = index;
            };

            $scope.selectRow = function (row) {
                $rootScope.$broadcast('search:selectRow', row);
            };

        }]);
})();