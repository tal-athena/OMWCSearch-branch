(function () {

	var currentScript = function () {
		var scripts = document.getElementsByTagName("script");
		var currentScriptPath = scripts[scripts.length - 1].src;
		return currentScriptPath;
	};
	var currentScriptPath = currentScript();

	angular.module('omwHeaderSearch')
			.directive('headerFieldContextMenu', ['HeaderFieldContextMenuSvc', function (HeaderFieldContextMenuSvc) {
				return {
					restrict: 'E',
					templateUrl: currentScriptPath.replace('HeaderFieldContextMenuDirective.js', 'HeaderFieldContextMenuDirective.html'),
					scope: {
						fieldId: '='
					},
					link: function($scope, $element)
					{
						$scope.$element = $element;
					},
					controller: ['$scope', function ($scope)
					{
						$scope.styles = {};

						$scope.contextMenu = {
							items: HeaderFieldContextMenuSvc.getMenuItems(),
							visible: false
						};

						$scope.itemClicked = function (item) {
							if (!!item.checkIfEnabled && !item.checkIfEnabled($scope.fieldId)) {
								return;
							}

							$scope.contextMenu.visible = false;
							item.func($scope.fieldId);
						};

						$scope.hideContextMenu = function () {
							$scope.contextMenu.visible = false;
						};

						$scope.toggleContextMenu = function ($event) {
							$scope.contextMenu.visible = !$scope.contextMenu.visible;

							$scope.styles = {};

							if ($scope.contextMenu.visible)
							{
								var ckEditorDialog = $scope.$element.closest(".cke_dialog_contents_body");
								if (ckEditorDialog.length > 0)
								{
									$scope.styles = { 'margin-top': '-' + ckEditorDialog.scrollTop() + 'px' };
								}
							}
						};
					}]
				};

			}])
			.service('HeaderFieldContextMenuSvc', [function () {
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