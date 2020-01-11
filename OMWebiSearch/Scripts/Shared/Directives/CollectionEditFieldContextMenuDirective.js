(function () {
    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    angular.module('omwShared')
        .directive('openGridRowOptionsMenu', [function () {
            return {
                restrict: 'E',
                scope: {
                    menuItems: '&',
                    rowData: '='
                },
                templateUrl: currentScriptPath.replace('CollectionEditFieldContextMenuDirective.js', 'CollectionEditFieldContextMenuDirective.html'),
                controller: ['$scope', function ($scope) {

                    $scope.contextMenu = {
                        items: []
                    };

                    $scope.itemClicked = function (item, $event) {
                        $event.stopPropagation();

                        if (!!item.checkIfEnabled && !item.checkIfEnabled()) {
                            return;
                        }

                        $scope.hideElement();
                        item.func($scope.rowData);
                    };
                }],
                link: function ($scope, $element) {
                    $scope.hideElement = function () {
                        $element.parent().find('.grid-item-context-menu').hide();
                    };

                    $scope.showElement = function () {
                        $element.parent().find('.grid-item-context-menu').show();
                    };
                    $scope.hideAllContextMenus = function () {
                        angular.element('body').find('.grid-item-context-menu').hide();
                    };

                    angular.element('html').click(function () {
                        $scope.hideAllContextMenus();
                    });

                    $scope.showContextMenu = function ($event) {

                        var position = $('.grid.ui-grid').offset();
                        $element.parent().find('.grid-item-context-menu').css({
                            left: $event.pageX - position.left - 30,
                            top: $event.pageY - position.top - 50
                        });

                        $event.stopPropagation();
                        $scope.hideAllContextMenus();

                        //Check if element visible
                        $scope.contextMenu.items = $scope.menuItems();
                        $scope.showElement();
                    };
                }
            };

        }]);

})();