(function () {

    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    var _template = currentScriptPath.replace('UndoDialog.js', 'UndoDialog.html');
    var _controller = 'UndoDialogCtrl';

    var rowTemplate = '<div grid="grid" class="customGridRow">' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
                        'ng-dblclick="grid.appScope.doubleClick($event)"' +
                        'ng-click="grid.appScope.selectRow(row.entity, $event)"' +
                        'class="ui-grid-cell"' +
                        'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'row-selected\': row.entity.selected }"' +
                        'ui-grid-cell>' +
                    '</div>' +
                '</div>';

    angular.module('omwHeaderSearch')
        .factory('UndoDialogSvc', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout', 'KeyboardNavigationSvc',
            function ($document, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout, KeyboardNavigationSvc)
            {

                //  Get the body of the document, we'll add the modal to this.
                var body = $document.find('body');

                function ModalService() {

                    var self = this;

                    //  Returns a promise which gets the template, either
                    //  from the template parameter or via a request to the
                    //  template url parameter.
                    var getTemplate = function (template, templateUrl) {
                        var deferred = $q.defer();
                        if (template) {
                            deferred.resolve(template);
                        } else if (templateUrl) {
                            $templateRequest(templateUrl, true)
                              .then(function (template) {
                                  deferred.resolve(template);
                              }, function (error) {
                                  deferred.reject(error);
                              });
                        } else {
                            $templateRequest(_template, true)
                              .then(function (template) {
                                  deferred.resolve(template);
                              }, function (error) {
                                  deferred.reject(error);
                              });
                        }
                        return deferred.promise;
                    };

                    var appendChild = function (parent, child) {
                        angular.element(parent).append(child);
                    };

                    self.InitPopUp = function (type) {

                        //return new dialog object that will have methods
                        var modalObject = {};

                        modalObject.open = function (data, callback, options) {

                            options = options || {};
                            options.controller = options.controller || _controller;

                            //  Create a deferred we'll resolve when the modal is ready.
                            var deferred = $q.defer();

                            //  Get the actual html of the template.
                            getTemplate(options.template, options.templateUrl)
                              .then(function (template) {

                                  //  Create a new scope for the modal.
                                  var modalScope = (options.scope || $rootScope).$new();
                                  modalScope.type = type;

                                  modalScope.data = data;
                                  modalScope.callback = callback;

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
                                      close: function (result, delay) {
                                          if (delay === undefined || delay === null) delay = 0;
                                          $timeout(function () {
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
                                          }, delay);
                                      }
                                  };

                                  //  If we have provided any inputs, pass them to the controller.
                                  if (options.inputs) angular.extend(inputs, options.inputs);

		                          KeyboardNavigationSvc.init();

                                  //  Compile then link the template element, building the actual element.
                                  //  Set the $element on the inputs so that it can be injected if required.
                                  var linkFn = $compile(template);
                                  var modalElement = linkFn(modalScope);
                                  inputs.$element = modalElement;
		                          modalScope.$element = modalElement;

                                  //  Create the controller, explicitly specifying the scope to use.
                                  var controllerObjBefore = modalScope[options.controllerAs];
                                  var modalController = $controller(options.controller, inputs, false, options.controllerAs);

                                  if (options.controllerAs && controllerObjBefore) {
                                      angular.extend(modalController, controllerObjBefore);
                                  }

                                  // append to body when no custom append element is specified
                                  appendChild(body, modalElement);

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
                              .then(null, function (error) { // 'catch' doesn't work in IE8.
                                  deferred.reject(error);
                              });

                            return deferred.promise;
                        };

                        return modalObject;
                    };
                }

                return new ModalService();
            }])
        .controller('UndoDialogCtrl', ['$scope', '$http', 'close', '$timeout', '$window', 'KeyboardNavigationSvc', function ($scope, $http, close, $timeout, $window, KeyboardNavigationSvc)
        {

            $scope.columnDefs = [];
            var selectedRow;

            //Grid options
            $scope.gridOptions = {
                enableColumnResizing: false,
                enableColumnMenus: false,
                enableSorting: false,
                multiSelect: false,
                columnDefs: $scope.columnDefs,
                rowTemplate: rowTemplate,
                showGridFooter: false,
            	onRegisterApi: function(gridApi)
	            {
		            $scope.gridApi = gridApi;
	            }
            };

            $scope.close = function ()
            {
	            $scope.contentPaneStyle = {};
            	close();
            };

            $scope.getItems = function () {

                $scope.showLoadingAnimation = true;

                $http({
                    url: '/OMWebiSearch/Document/HeaderFields/UndoValues',
                    method: 'GET',
                    params: {
                        fieldId: $scope.data.fieldId,
                        id: $scope.data.id
                    }
                }).then(function (response) {
                    if (!response.data) {
                        $scope.showLoadingAnimation = false;
                        console.error('Failed loading items for this field');
                        return;
                    }

                    $scope.processData(response.data);

                    $scope.showLoadingAnimation = false;
                });
            };

            $scope.processData = function (data) {
                var updatedData = [];

                //Init columns
                $scope.initColumns();

                for (var i = 0; i < data.length; i++) {
                    var obj = {
                        selected: false,
                        value: data[i]
                    };

                    updatedData.push(obj);
                }

                $scope.gridOptions.data = updatedData;
            };

            $scope.initColumns = function () {
                //Name
                $scope.columnDefs.push({ field: 'name', enableColumnResizing: false, cellTemplate: '<div class="listFieldValue">{{row.entity.value}}</div>' });
            };

            $scope.ok = function () {
                if (!selectedRow) {
                    return;
                }
                $scope.setValue(selectedRow);

	            $scope.contentPaneStyle = {};

                close();
            };

            function getContentPaneStyle(selected, value)
            {
	            var style = {};

	            if (selected && value && value.length > 45)
	            {
					var rowElement = $scope.$element.find(".row-selected");
		            if (rowElement.length > 0)
		            {
			            rowElement = rowElement.parent();
			            var rc = rowElement[0].getBoundingClientRect();

			            style = {
				            "display": "block",
				            "left": (rc.right + 2) + "px",
				            "top": (rc.top) + "px"
			            };
		            }
	            }

	            return style;
            }

		    var clicks = 0, timer = null;
		    $scope.selectRow = function (row, $event)
		    {
			    clicks++;  //count clicks
			    if (clicks === 1)
			    {
				    $scope.contentPaneStyle = {};

				    for (var i = 0; i < $scope.gridOptions.data.length; i++)
				    {
					    if ($scope.gridOptions.data[i] !== row)
						    $scope.gridOptions.data[i].selected = false;
				    }

				    var deselect = false;
				    if (row.selected) // deselect after interval
				    {
				    	deselect = true;
				    	selectedRow = null;
				    	$scope.longContent = null;
				    }
				    else // select immediately
				    {
				    	row.selected = true;
				    	selectedRow = row;

				    	$scope.longContent = row.value;

					    $timeout(function()
						    {
					    		$scope.contentPaneStyle = getContentPaneStyle(true, row.value);
						    },
						    100);
				    }

				    timer = $timeout(function ()
					    {
						    if (deselect)
						    {
						    	selectedRow = null;
						    	$scope.longContent = null;

						    	for (var i = 0; i < $scope.gridOptions.data.length; i++)
						    	{
								    $scope.gridOptions.data[i].selected = false;
						    	}

							    $scope.$digest();
						    }

						    clicks = 0;
					    },
					    200);
			    }
			    else
			    {
				    $timeout.cancel(timer); //prevent single-click action

				    //perform double-click action
				    $scope.setValue(row);
				    clicks = 0;             //after action performed, reset counter

				    $scope.contentPaneStyle = {};

				    //Close dialog
				    close();
			    }
		    };

            $scope.doubleClick = function ($event) {
                $event.preventDefault();
            };

            $scope.setValue = function (row) {

                var parentScope = angular.element('#headerSearchController').scope();

                var position = OMWClientContext.HeaderSearch.findElementPosition(parentScope.fieldsList, 'Key', $scope.data.fieldId);
                if (position != null) {

                    parentScope.updateElement($scope.data.fieldId, row.value, position);

                    //Event to server
                    OMWClientContext.HeaderSearch.updateElementValue($scope.data.fieldId, row.value);
                }
            };

            $scope.getItems();

		    $timeout(function()
		    {
				var grid = $scope.$element.find(".ui-grid");
				var canvas = grid.find(".ui-grid-canvas");
				KeyboardNavigationSvc.addControl(canvas, "1", grid);
				canvas.focus();

			    angular.element($window).on("resize",
				    function()
				    {
					    if (!!selectedRow)
					    	$scope.contentPaneStyle = getContentPaneStyle(true, $scope.longContent);
				    });

				var viewport = grid.find(".ui-grid-viewport");
			    viewport.on("scroll",
				    function()
				    {
						$scope.longContent = null;
						selectedRow = null;
				    });
		    });
	    }]);

}());