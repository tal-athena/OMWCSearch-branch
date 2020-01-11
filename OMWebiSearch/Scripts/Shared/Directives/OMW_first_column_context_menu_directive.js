(function () {

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    angular.module('omwShared')
            .directive('firstColContextMenu', ['FirstColContextMenuSvc', '$rootScope', function (FirstColContextMenuSvc, $rootScope) {
                return {
                    restrict: 'E',
                    templateUrl: currentScriptPath.replace('OMW_first_column_context_menu_directive.js', 'FirstColContextMenu.html'),
                    link: function($scope, $element)
                    {
	                    angular.element("html").keydown(function ($event)
						{
							$scope.$apply(function ()
							{
								if ($scope.contextMenu.visible)
									$scope.onKeyDown($event);
		                    });
	                    });
                    },
                    controller: ['$scope', function ($scope)
                    {
	                    var selectedItemIndex = -1;

	                    $scope.contextMenu = {
                            items: FirstColContextMenuSvc.getMenuItems().slice(),
                            visible: false
	                    };

	                    $scope.contextMenu.items.unshift({
		                    func: function ()
		                    {
			                    $scope.contextMenu.visible = false;
		                    }
	                    });

                        $scope.itemClicked = function ($event, item)
                        {
                        	$event.stopPropagation();

	                        if (!!item.checkIfEnabled && !item.checkIfEnabled()) {
                                return;
                            }

                            $scope.contextMenu.visible = false;
                            item.func();
                        };

                        $scope.toggleContextMenu = function ($event)
                        {
                        	$event.stopPropagation();

                        	$scope.contextMenu.visible = !$scope.contextMenu.visible;

	                        if ($scope.contextMenu.visible)
		                        $rootScope.$broadcast('gridContextMenuShownEvent');
						};

	                    angular.element("html").click(function()
	                    {
		                    $scope.$apply(function()
		                    {
			                    $scope.contextMenu.visible = false;
		                    });
	                    });

	                    $scope.onMouseEnter = function ($event, $index, item)
	                    {
		                    if (isItemActive(item))
	                    		selectItem($index);
	                    };

	                    $scope.onMouseLeave = function ($event, $index, item)
	                    {
	                    	selectItem(-1);
	                    };

	                    $scope.onKeyDown = function ($event)
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
	                    			$scope.itemClicked($event, $scope.contextMenu.items[selectedItemIndex]);
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
	                    	for (var i = 0; i < $scope.contextMenu.items.length; i++) {
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

		                    for (var i = index; i < $scope.contextMenu.items.length; i++) {
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

		                    for (var i = index; i >= 0; i--) {
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

	                    $rootScope.$on('rowContextMenuShownEvent',
		                    function ()
		                    {
			                    $scope.contextMenu.visible = false;
		                    });
                    }]
                };
                
            }])
            .service('FirstColContextMenuSvc', [function () {
                var contextMenuItems = [];
                return {
                    setMenuItems: function (items) {
                        contextMenuItems = items;
                    },
                    getMenuItems: function () {
                        return contextMenuItems;
                    }
                };
            }]);

})();