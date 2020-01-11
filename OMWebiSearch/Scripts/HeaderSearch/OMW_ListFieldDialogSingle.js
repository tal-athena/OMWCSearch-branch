(function ()
{
	'use strict';

	var currentScript = function ()
	{
		var scripts = document.getElementsByTagName("script");
		var currentScriptPath = scripts[scripts.length - 1].src;
		return currentScriptPath;
	};
	var currentScriptPath = currentScript();

	//var _template = currentScriptPath.replace('OMW_ListFieldDialog.js', 'ListFieldDialog.html');
	var _template = '/OMWebiSearch/Helpers/Helper/Single';
	var _controller = 'OMWListFieldDialogSingleCtrl';

	var rowTemplate = '<div grid="grid" class="customGridRow">' +
		'<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
		'ng-click="grid.appScope.rowClicked(row.entity, $event)"' +
		'class="ui-grid-cell"' +
		'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'row-selected\': row.entity.selected }"' +
		'ui-grid-cell>' +
		'</div>' +
		'</div>';

	angular.module('omwHeaderSearch')
		.factory('OMWListFieldDialogSingleSvc',
			[
				'$document', '$window', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout', 'KeyboardNavigationSvc',
				function ($document, $window, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout, KeyboardNavigationSvc)
				{
					//  Get the body of the document, we'll add the modal to this.
					var body = $document.find('body');

					function ModalService()
					{
						var self = this;

						//  Returns a promise which gets the template, either
						//  from the template parameter or via a request to the
						//  template url parameter.
						var getTemplate = function (template, templateUrl)
						{
							var deferred = $q.defer();
							if (template)
								deferred.resolve(template);
							else if (templateUrl) {
								$templateRequest(templateUrl, true)
									.then(function (template)
									{
										deferred.resolve(template);
									},
										function (error)
										{
											deferred.reject(error);
										});
							}
							else {
								$templateRequest(_template, true)
									.then(function (template)
									{
										deferred.resolve(template);
									},
										function (error)
										{
											deferred.reject(error);
										});
							}
							return deferred.promise;
						};

						var appendChild = function (parent, child)
						{
							angular.element(parent).append(child);
						};

						self.InitPopUp = function (type)
						{
							//return new dialog object that will have methods
							var modalObject = {};

							modalObject.open = function (data, callback, options, closeCallback)
							{
								options = options || {};
								options.controller = options.controller || _controller;

								//  Create a deferred we'll resolve when the modal is ready.
								var deferred = $q.defer();

								//  Get the actual html of the template.
								getTemplate(options.template, options.templateUrl)
									.then(function (template)
									{
										//  Create a new scope for the modal.
										var modalScope = (options.scope || $rootScope).$new();
										modalScope.type = type;

										modalScope.data = data;
										modalScope.callback = callback;
										modalScope.closeCallback = closeCallback;

										//  Create the inputs object to the controller - this will include
										//  the scope, as well as all inputs provided.
										//  We will also create a deferred that is resolved with a provided
										//  close function. The controller can then call 'close(result)'.
										//  The controller can also provide a delay for closing - this is
										//  helpful if there are closing animations which must finish first.
										var closeDeferred = $q.defer();
										var closedDeferred = $q.defer();
										var inputs = {
											$scope: modalScope,
											close: function (result, delay)
											{
												if (delay === undefined || delay === null)
													delay = 0;
												$timeout(function ()
												{
													//  Resolve the 'close' promise.
													closeDeferred.resolve(result);

													//  Remove element from the DOM.
													modalElement.remove();

													//  Resolve the 'closed' promise.
													closedDeferred.resolve(result);

													//  We can now clean up the scope
													modalScope.$destroy();

													//  Unless we null out all of these objects we seem to suffer
													//  from memory leaks, if anyone can explain why then I'd
													//  be very interested to know.
													inputs.close = null;
													deferred = null;
													closeDeferred = null;
													modal = null;
													inputs = null;
													modalElement = null;
													modalScope = null;
												},
													delay);
											}
										};

										//  If we have provided any inputs, pass them to the controller.
										if (options.inputs)
											angular.extend(inputs, options.inputs);

										KeyboardNavigationSvc.init();

										//  Compile then link the template element, building the actual element.
										//  Set the $element on the inputs so that it can be injected if required.
										var linkFn = $compile(template);
										var modalElement = linkFn(modalScope);
										inputs.$element = modalElement;

										//  Create the controller, explicitly specifying the scope to use.
										var controllerObjBefore = modalScope[options.controllerAs];
										var modalController = $controller(options.controller, inputs, false, options.controllerAs);

										if (options.controllerAs && controllerObjBefore)
											angular.extend(modalController, controllerObjBefore);

										// append to body when no custom append element is specified
										appendChild(body, modalElement);

										modalScope.element = modalElement;

										modalScope.getStyle = function()
										{
											var marginTop = ($window.innerHeight - 500) / 2;
											if (marginTop < 0)
												marginTop = 0;

											return {
												marginTop: marginTop + "px",
												height: '405px'
											};
										};

										//  We now have a modal object...
										var modal = {
											controller: modalController,
											scope: modalScope,
											element: modalElement,
											close: closeDeferred.promise,
											closed: closedDeferred.promise
										};

										//  ...which is passed to the caller via the promise.
										deferred.resolve(modal);
									})
									.then(null,
										function (error)
										{ // 'catch' doesn't work in IE8.
											deferred.reject(error);
										});

								return deferred.promise;
							};

							return modalObject;
						};
					}

					return new ModalService();
				}
			])
		.controller('OMWListFieldDialogSingleCtrl',
			[
				'$scope', '$http', '$q', '$timeout', 'close', 'KeyboardNavigationSvc', function ($scope, $http, $q, $timeout, close, KeyboardNavigationSvc)
				{
					var hasImages = false;
					var _columnsInitialized = false;

					$scope.fieldData = {
						items: [],
						selectedItems: []
					};

					var splitter = $scope.data.splitter || ';';

					$scope.fieldData.selectedItems = [];

					$scope.columnDefs = [];

					//Grid options
					$scope.gridOptions = {
						enableColumnResizing: false,
						enableColumnMenus: false,
						enableSorting: false,
						multiSelect: false,
						columnDefs: $scope.columnDefs,
						rowTemplate: rowTemplate,
						showGridFooter: false,
						enableRowSelection: false,
						onRegisterApi: function (gridApi)
						{

						}
					};

					$scope.close = function ()
					{
						close();
						if (!!$scope.closeCallback)
							$scope.closeCallback();
					};

					$scope.processData = function (data)
					{
						var updatedData = [];

						if (!_columnsInitialized) {
							_columnsInitialized = true;

							hasImages = false;
							if (data.icons && data.icons.length === data.items.length)
								hasImages = true;

							//Init columns
							$scope.initColumns();

							$timeout(function()
							{
								var grid = $scope.element.find(".ui-grid");
								var canvas = grid.find(".ui-grid-canvas");
								KeyboardNavigationSvc.addControl(canvas, "1", grid);
								canvas.focus();
							});
						}

						$scope.fieldData.selectedItems = [$scope.data.item.Value];

						for (var i = 0; i < data.items.length; i++) {
							var obj = {
								selected: itemSelected($scope.fieldData.selectedItems, data.items[i]),
								value: data.items[i]
							};

							if (hasImages)
								obj.icon = data.icons[i];

							updatedData.push(obj);
						}

						$scope.gridOptions.data = updatedData;
					};

					$scope.getItems = function (url, data)
					{
						$scope.showLoadingAnimation = true;

						$http({
							url: url,
							method: 'GET',
							params: data
						}).then(function (response)
						{
							if (!(response.data && response.data.items)) {
								$scope.showLoadingAnimation = false;
								console.error('Failed loading items for this field');
								return;
							}

							$scope.fieldData.items = response.data.items;
							$scope.fieldData.icons = response.data.icons;

							$scope.processData($scope.fieldData);

							$scope.showLoadingAnimation = false;
						});
					};

					$scope.initColumns = function ()
					{
						//Selected
						$scope.columnDefs.push({
							name: '_',
							width: 25,
							enableColumnResizing: false,
							cellTemplate:
								'<div><input type="radio" ng-click="grid.appScope.rowClicked(row.entity)" ng-checked="row.entity.selected"/></div>',
							headerTemplate: ''
						});

						if (hasImages) {
							//Selected
							$scope.columnDefs.push({
								name: '__',
								width: 25,
								enableColumnResizing: false,
								cellTemplate:
									'<div class="list-field-icon"><img ng-if="row.entity.icon" ng-src="{{grid.appScope.getIconUrl(row.entity.icon)}}"/></div>',
								headerTemplate: ''
							});
						}

						//Name
						$scope.columnDefs.push({
							field: 'name',
							enableColumnResizing: false,
							cellTemplate: '<div class="listFieldValue">{{row.entity.value}}</div>'
						});

						$timeout(function ()
						{
							$scope.element.find('.ui-grid-header-cell-primary-focus').removeAttr('tabindex');
						});
					};

					$scope.save = function ()
					{
						$scope.data.item.Value = '';

						for (var i = 0; i < $scope.gridOptions.data.length; i++)
						{
							var row = $scope.gridOptions.data[i];
							if (row.selected)
							{
								$scope.data.item.Value = row.value;
								break;
							} 
						}

						var $q = $scope.callback($scope.data.item.Value);
						if (!!$q)
							$q.then(onSuccess);
						else
							onSuccess();

						function onSuccess()
						{
							if ($scope.type !== 'search' && !$scope.data.dontSendUpdateEvent)
								OMWClientContext.HeaderSearch.updateElementValue($scope.data.fieldId, $scope.data.item.Value);

							close();
							if (!!$scope.closeCallback)
								$scope.closeCallback();
						}
					};

					$scope.clearValue = function ()
					{
						$scope.deselectAllRows(null);

						$scope.save();
					};

					$scope.onKeyDown = function($event)
					{
						if ($event.keyCode === 38) // Up
						{
							$event.stopPropagation();
							$scope.moveSelection(false);
						}
						else if ($event.keyCode === 40) // Down
						{
							$event.stopPropagation();
							$scope.moveSelection(true);
						}
						else if ($event.keyCode === 36) // Home
						{
							$event.stopPropagation();
							$scope.moveSelection(false, true);
						}
						else if ($event.keyCode === 35) // End
						{
							$event.stopPropagation();
							$scope.moveSelection(true, true);
						}
					};

					$scope.moveSelection = function(down, startOrEnd)
					{
						var selectRowIndex = -1;

						if ($scope.gridOptions.data.length > 0)
						{
							if (!startOrEnd)
							{
								if (down)
									selectRowIndex = 0;
								else
									selectRowIndex = $scope.gridOptions.data.length - 1;

								for (var i = 0; i < $scope.gridOptions.data.length; i++)
								{
									var entity = $scope.gridOptions.data[i];
									if (entity.selected)
									{
										if (down)
										{
											if (i + 1 < $scope.gridOptions.data.length)
												selectRowIndex = i + 1;
										}
										else
										{
											if (i - 1 >= 0)
												selectRowIndex = i - 1;
										}
									}
								}
							}
							else
							{
								if (down)
									selectRowIndex = $scope.gridOptions.data.length - 1;
								else
									selectRowIndex = 0;
							}

							if (selectRowIndex >= 0 && selectRowIndex < $scope.gridOptions.data.length)
							{
								$scope.deselectAllRows();
								$scope.gridOptions.data[selectRowIndex].selected = true;
							}
						}
					};

					$scope.deselectAllRows = function(exceptEntity)
					{
						for (var i = 0; i < $scope.gridOptions.data.length; i++)
						{
							if (!exceptEntity || $scope.gridOptions.data[i] !== exceptEntity)
								$scope.gridOptions.data[i].selected = false;
						}
					};

					var clicks = 0, timer = null;
					$scope.rowClicked = function (entity)
					{
						clicks++;

						if (clicks === 1)
						{
							timer = $timeout(function()
							{
								clicks = 0;

								// Execute single-click action
							}, 200);

							$scope.toggleRowSelection(entity);
						}
						else
						{
							$timeout.cancel(timer);
							clicks = 0;

							// Execute double-click action
							$scope.deselectAllRows();
							entity.selected = true;

							$scope.save();
						}
					};

					$scope.toggleRowSelection = function (entity)
					{
						$scope.deselectAllRows(entity);

						entity.selected = !entity.selected;
					};

					if ($scope.type === 'search') {
						var data = {
							id: $scope.data.id,
							position: $scope.data.position
						};
						$scope.getItems('/OMWebiSearch/Search/SearchMain/LoadSearchProfileFieldItems', data);
					}
					else if ($scope.type === 'collection_editor')
					{
						var data = {
							collectionId: $scope.data.collectionId,
							fieldId: $scope.data.fieldId,
							recordId: $scope.data.recordId,
							viewId: $scope.data.viewId
						};
						$scope.getItems('/OMWebiSearch/Collection/Editor/GetCollectionFieldValues', data);
					}
					else
					{
						var data = {
							collectionId: $scope.data.collectionId,
							fieldId: $scope.data.fieldId
						};
						$scope.getItems('/OMWebiSearch/Collection/Editor/GetHeaderFieldValues', data);
					}

					var itemSelected = function (selectedItems, item)
					{
						item = item.trim();
						for (var i = 0; i < selectedItems.length; i++) {
							if (selectedItems[i].trim() === item) {
								console.info(item);
								return true;
							}
						}
						return false;
					}

					$scope.getIconUrl = function (icon)
					{
						return '/OMWebiSearch/Content/RecordIcons/' + icon;
					};
				}
			]);
}());
