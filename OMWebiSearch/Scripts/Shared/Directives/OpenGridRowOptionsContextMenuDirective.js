(function () {
    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    angular.module('omwShared')
        .directive('openGridRowOptionsMenu', ['$rootScope', function ($rootScope) {
            return {
                restrict: 'E',
                scope: {
                    menuItems: '&',
                    rowData: '=',
                    selectRow: '='
                },
                templateUrl: currentScriptPath.replace('OpenGridRowOptionsContextMenuDirective.js', 'OpenGridRowOptionsContextMenu.html'),
                controller: ['$scope', function ($scope)
                {
	                var selectedItemIndex = -1;

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

                    $scope.onMouseEnter = function ($event, $index, item)
	                {
						if (isItemActive(item))
							selectItem($index);
	                };

	                $scope.onMouseLeave = function($event, $index, item)
	                {
		                selectItem(-1);
	                };

	                $scope.onKeyDown = function($event)
	                {
						if ($event.keyCode == 38) // Up
						{
							moveSelection(true);
						}
	                	else if ($event.keyCode == 40) // Down
						{
							moveSelection(false);
						}
	                	else if ($event.keyCode == 13) // Enter
	                	{
							if (selectedItemIndex >= 0 && selectedItemIndex < $scope.contextMenu.items.length)
								$scope.itemClicked($scope.contextMenu.items[selectedItemIndex], $event);
						}
		                else if ($event.keyCode == 27) // Esc
						{
							selectedItemIndex = -1;
							$scope.hideElement();
						}
	                };

	                function moveSelection(up)
	                {
	                	if ($scope.contextMenu.items.length === 0)
			                return;

		                var index = up
			                ? findPreviousActiveElement(selectedItemIndex)
			                : findNextActiveElement(selectedItemIndex);
	                	
		                selectItem(index);
	                }

	                function selectItem(index)
	                {
	                	for (var i = 0; i < $scope.contextMenu.items.length; i++)
	                	{
	                		var item = $scope.contextMenu.items[i];
			                item.isSelected = i == index;
	                	}

		                selectedItemIndex = index;
	                }

	                function findNextActiveElement(index)
	                {
	                	index++;

		                if (index >= $scope.contextMenu.items.length)
		                	index = 0;

		                for (var i = index; i < $scope.contextMenu.items.length; i++)
		                {
		                	var item = $scope.contextMenu.items[i];
			                if (!isItemActive(item))
				                continue;

			                return i;
		                }

		                return 0;
	                }

	                function findPreviousActiveElement(index)
	                {
		                index--;

		                if (index < 0)
		                	index = $scope.contextMenu.items.length - 1;

		                for (var i = index; i >= 0; i--)
		                {
			                var item = $scope.contextMenu.items[i];
			                if (!isItemActive(item))
				                continue;

			                return i;
		                }

		                return $scope.contextMenu.items.length - 1;
	                }

	                function isItemActive(item)
	                {
		                if (item.id === "-")
			                return false;

		                if (!!item.checkIfEnabled && !item.checkIfEnabled())
		                	return false;

		                return true;
	                }
					
	                $rootScope.$on('gridContextMenuShownEvent',
		                function()
		                {
			                $scope.hideAllContextMenus();
		                });
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

	                $element.keydown(function($event)
	                {
		                $scope.$apply(function()
		                {
		                	$scope.onKeyDown($event);
		                });
	                });

                    var _isIE = function _isIE() {

                        var ua = window.navigator.userAgent;
                        var msie = ua.indexOf("MSIE ");

                        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
                        {
                            return true;
                        }

                        return false;
                    };
                    var isIE = _isIE();

                    $scope.showContextMenu = function ($event) {

	                    $rootScope.$broadcast('rowContextMenuShownEvent');

                        var position = $('.grid.ui-grid').offset();

                        if (isIE) {
                            position.left = 0;
                            position.top = 0;
                        }

                        $element.parent().find('.grid-item-context-menu').css({
                            left: $event.pageX - position.left - 30,
                            top: $event.pageY - position.top - 50
                        });

	                    if (!!$scope.selectRow && !!$scope.rowData)
							$scope.selectRow($scope.rowData);

                        $event.stopPropagation();
                        $scope.hideAllContextMenus();

                    	//Check if element visible
                        $scope.contextMenu.items = $scope.menuItems().slice();
	                    $scope.contextMenu.items.unshift({
	                    	func: function()
		                    {
			                    $scope.hideElement();
		                    }
	                    });
                        $scope.showElement();
                    };
                }
            };

        }]);

})();