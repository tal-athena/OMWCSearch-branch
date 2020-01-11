(function()
{
	'use strict';

	var currentScript = function()
	{
		var scripts = document.getElementsByTagName("script");
		var currentScriptPath = scripts[scripts.length - 1].src;
		return currentScriptPath;
	};
	var currentScriptPath = currentScript();

	//var _template = currentScriptPath.replace('OMW_ListFieldDialog.js', 'ListFieldDialog.html');
	var _template = '/OMWebiSearch/Helpers/Helper/ListOfflineStoriesDialog';
	var _controller = 'OMWOfflineStoriesDialogCtrl';

	var rowTemplate = '<div grid="grid" class="customGridRow">' +
		'<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
		'ng-click="grid.appScope.selectRow(row.entity, $event)"' +
		'class="ui-grid-cell"' +
		'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'row-selected\': row.entity.selected }"' +
		'ui-grid-cell>' +
		'</div>' +
		'</div>';

	angular.module('omwShared')
		.factory('OMWOfflineStoriesDialogSvc',
			[
				'$document', '$window', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout', 'KeyboardNavigationSvc',
				function($document, $window, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout, KeyboardNavigationSvc)
				{
					//  Get the body of the document, we'll add the modal to this.
					var body = $document.find('body');

					function ModalService()
					{
						var self = this;

						//  Returns a promise which gets the template, either
						//  from the template parameter or via a request to the
						//  template url parameter.
						var getTemplate = function(template, templateUrl)
						{
							var deferred = $q.defer();
							if (template)
								deferred.resolve(template);
							else if (templateUrl)
							{
								$templateRequest(templateUrl, true)
									.then(function(template)
										{
											deferred.resolve(template);
										},
										function(error)
										{
											deferred.reject(error);
										});
							} else
							{
								$templateRequest(_template, true)
									.then(function(template)
										{
											deferred.resolve(template);
										},
										function(error)
										{
											deferred.reject(error);
										});
							}
							return deferred.promise;
						};

						var appendChild = function(parent, child)
						{
							angular.element(parent).append(child);
						};

						self.InitPopUp = function(type)
						{
							//return new dialog object that will have methods
							var modalObject = {};

							modalObject.open = function(data, callback, options, closeCallback)
							{
								options = options || {};
								options.controller = options.controller || _controller;

								//  Create a deferred we'll resolve when the modal is ready.
								var deferred = $q.defer();

								//  Get the actual html of the template.
								getTemplate(options.template, options.templateUrl)
									.then(function(template)
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
											close: function(result, delay)
											{
												if (delay === undefined || delay === null)
													delay = 0;
												$timeout(function()
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
												height: "400px"
											}
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
										function(error)
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
		.controller('OMWOfflineStoriesDialogCtrl',
			[
				'$scope', '$http', '$q', '$timeout', 'close', 'KeyboardNavigationSvc', function($scope, $http, $q, $timeout, close, KeyboardNavigationSvc)
				{
					var _columnsInitialized = false;

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
						onRegisterApi: function(gridApi)
						{
						}
					};

					$scope.close = function()
					{
						close();
						if (!!$scope.closeCallback)
							$scope.closeCallback();
					};

					$scope.init = function()
					{
						if (!_columnsInitialized)
						{
							_columnsInitialized = true;

							//Init columns
							$scope.initColumns();
						}

						$scope.gridOptions.data = OMWLocalStorage.LoadStories();
					};

					$scope.initColumns = function()
					{
						//Selected
						$scope.columnDefs.push({
							name: '_',
							width: 25,
							enableColumnResizing: false,
							cellTemplate:
								'<div><input type="checkbox" ng-click="grid.appScope.checkboxClicked(row.entity)" ng-model="row.entity.selected"/></div>',
							headerTemplate: ''
						});

						//Name
						$scope.columnDefs.push({
							field: 'Title',
							enableColumnResizing: false,
							cellTemplate: '<div class="listFieldValue">{{row.entity.Title}}</div>'
						});

						$timeout(function()
						{
							$scope.element.find('.ui-grid-header-cell-primary-focus').removeAttr('tabindex');

							var grid = $scope.element.find(".ui-grid");
							var canvas = grid.find(".ui-grid-canvas");
							KeyboardNavigationSvc.addControl(canvas, "1", grid);

							canvas.focus();
						});
					};

					$scope.open = function()
					{
						var close = false;

						var baseUrl = $("#hdnAppBaseUrl").val() + 'StoryH/StoryH/Index/';

						for (var i = 0; i < $scope.gridOptions.data.length; i++)
						{
							var item = $scope.gridOptions.data[i];
							if (item.selected)
							{
								window.open(baseUrl + item.ID, '_blank');
								close = true;
							}
						}

						if (close)
							$scope.close();
					};

					$scope.checkboxClicked = function(row)
					{
						row.selected = !row.selected;
					};

					$scope.selectRow = function(row)
					{
						if (!!row.selected)
							row.selected = false;
						else
							row.selected = true;
					};

					$scope.init();
				}
			]).controller('OMWLocalStorageCtrl',
			[
				'$rootScope', '$scope', 'OMWOfflineStoriesDialogSvc', function ($rootScope, $scope, OMWOfflineStoriesDialogSvc)
				{
					$scope.isInitialized = true;
                    $scope.isOffline = false;
                    $scope.storiesCount = 0;

                    window.addEventListener('storage', function (e) {  
                        if (e.key == 'stories') {
                            $scope.getStoriesCount();
                        }
                    });

                    $rootScope.$on("story_updated", function ($event, data) {
                        $scope.getStoriesCount();
                    })

                    $scope.getStoriesCount = function () {    
                        setTimeout(function(){
                            $scope.$apply(function () {
                                $scope.storiesCount = OMWLocalStorage.GetSavedStoriesCount();
                            });
                        })                        
                    }
                    $scope.getStoriesCount();

					$rootScope.$on('offline-status-changed',
						function(e, args)
						{
							$scope.isOffline = args.isOffline;
						});

					$scope.openModal = function()
					{
						var popUp = OMWOfflineStoriesDialogSvc.InitPopUp();
						popUp.open({
							},
							function(result)
							{
								console.log(result);
							});
					};
				}
			]);
}());