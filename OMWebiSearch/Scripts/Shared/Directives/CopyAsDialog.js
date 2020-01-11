(function () {

    'use strict';

    var _template = "../../../Document/CopyAs/CopyAsDialog?type=";
    var _controller = 'CopyAsDialogCtrl';

    var rowTemplate = '<div grid="grid" class="customGridRow">' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
                        'ng-dblclick="grid.appScope.doubleClick($event)"' +
                        'ng-click="grid.appScope.selectRow(row.entity, $event)"' +
                        'class="ui-grid-cell"' +
                        'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'row-selected\': row.isSelected }"' +
                        'ui-grid-cell>' +
                    '</div>' +
                '</div>';

    angular.module('omwShared')
        .factory('CopyAsDialogSvc', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout', 'KeyboardNavigationSvc',
            function ($document, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout, KeyboardNavigationSvc) {

                //  Get the body of the document, we'll add the modal to this.
                var body = $document.find('body');

                function ModalService() {

                    var self = this;

                    //  Returns a promise which gets the template, either
                    //  from the template parameter or via a request to the
                    //  template url parameter.
                    var getTemplate = function (template, templateUrl, type) {
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
                        } else
                        {
	                        if (type === undefined)
		                        type = '';

                            $templateRequest(_template + type, true)
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

                    self.InitPopUp = function (type, getItemsURL, setValueURL) {

                        //return new dialog object that will have methods
                        var modalObject = {};

                        modalObject.open = function (data, callback, options) {

                            options = options || {};
                            options.controller = options.controller || _controller;

                            //  Create a deferred we'll resolve when the modal is ready.
                            var deferred = $q.defer();

							//  Get the actual html of the template.
                            getTemplate(options.template, options.templateUrl, type)
                              .then(function (template) {

                                  //  Create a new scope for the modal.
                                  var modalScope = (options.scope || $rootScope).$new();
                                  modalScope.type = type;
                                  modalScope.getItemsURL = getItemsURL;
                                  modalScope.setValueURL = setValueURL;

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

                                  modalScope.element = modalElement;

		                            if (!modalScope.getItemsURL)
		                            	modalScope.getItemsURL = '/OMWebiSearch/Document/CopyAs/GetCopyAsListForObject';

		                            if (!modalScope.setValueURL)
		                            	modalScope.setValueURL = '/OMWebiSearch/Document/CopyAs/CopyAsCmd';

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
        .controller('CopyAsDialogCtrl', ['$scope', '$http', 'close', '$timeout', 'KeyboardNavigationSvc', 'uiGridConstants', function ($scope, $http, close, $timeout, KeyboardNavigationSvc, uiGridConstants)
        {

            $scope.columnDefs = [];
            var selectedRow;

            //Grid options
            $scope.gridOptions = {
                enableColumnResizing: false,
                enableColumnMenus: false,
                enableSorting: true,
                multiSelect: false,
                columnDefs: $scope.columnDefs,
                rowTemplate: rowTemplate,
                showGridFooter: false,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                onRegisterApi: function (gridApi)
                {
                	$scope.gridApi = gridApi;
	                $scope.gridApi.selection.selectRowByVisibleIndex(0);
                }
            };

		    $scope.saveOnClose = true;

            $scope.close = function () {
                close();
            };

            $scope.getItems = function () {

            	$scope.showLoadingAnimation = true;

            	$scope.errorMessage = '';
	            $scope.saveOnClose = true;

                $http({
                    url: $scope.getItemsURL,
                    method: 'GET',
                    params: {
                        id: $scope.data.id
                    }
                }).then(function (response) {
                    if (!response.data)
                    {
	                    handleError();
                        return;
                    }

	                response.data = [];

	                for (var i = 4; i < 50; i++)
	                {
		                response.data.push({
			                "iconID": "icon " + i,
			                "Template": i,
			                "DirectoryPath": "/dist",
			                "data": { "directoryID": i.toString() + i + i, "templateID": i, "objectID": i.toString() + i + i }
		                });
	                }

					$scope.processData(response.data);

	                $timeout(function()
	                {
	                	var grid = $scope.element.find(".ui-grid");
		                var viewport = grid.find(".ui-grid-viewport");
		                var canvas = viewport.find(".ui-grid-canvas");
		                KeyboardNavigationSvc.addControl(canvas, "0", grid, viewport);

		                canvas.focus();
	                }, 100);

                    $scope.showLoadingAnimation = false;
                }, function(error)
                {
	                handleError(error);
                });

                function handleError(error)
                {
                	$scope.errorMessage = 'Failed loading items for this field';
                	$scope.showLoadingAnimation = false;
	                $scope.saveOnClose = false;
                }
            };

            $scope.processData = function (data) {
                var updatedData = [];

                //Init columns
                $scope.initColumns();

                $scope.gridOptions.data = data;

	            $timeout(function($event)
		            {
			            if (data.length > 0)
			            {
			            	$scope.gridApi.selection.selectRowByVisibleIndex(0, $event);
				            data[0].selected = true;
				            selectedRow = data[0];
			            }
		            },
		            1);
            };

            $scope.initColumns = function () {
                //iconID
            	$scope.columnDefs.push({ field: 'iconID', sortDirectionCycle: [uiGridConstants.ASC, uiGridConstants.DESC], displayName: 'Icon ID', enableColumnResizing: false, cellTemplate: '<div class="listFieldValue">{{row.entity.iconID}}</div>', sort: { direction: 'asc' } });
                //Template
            	$scope.columnDefs.push({ field: 'Template', sortDirectionCycle: [uiGridConstants.ASC, uiGridConstants.DESC], enableColumnResizing: false, cellTemplate: '<div class="listFieldValue">{{row.entity.Template}}</div>' });
                //DirectoryPath
            	$scope.columnDefs.push({ field: 'DirectoryPath', sortDirectionCycle: [uiGridConstants.ASC, uiGridConstants.DESC], enableColumnResizing: false, cellTemplate: '<div class="listFieldValue">{{row.entity.DirectoryPath}}</div>' });

	            $timeout(function ()
	            {
		            $scope.element.find('.ui-grid-header-cell-primary-focus').removeAttr('tabindex');
	            });
            };

            $scope.ok = function ()
            {
            	if (!$scope.saveOnClose)
	            {
	            	close();
		            return;
	            }

	            if (!selectedRow)
	            {
		            $scope.errorMessage = 'Please select row';
                    return;
                }

                $scope.setValue(selectedRow);
            };

	        $scope.selectedRowChanged = function(row, $event)
	        {
		        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
			        $scope.gridOptions.data[i].selected = false;
		        }

		        row.selected = true;
		        selectedRow = row;
	        };

            var clicks = 0, timer = null;
			$scope.selectRow = function (row, $event) {
                clicks++;  //count clicks
                if (clicks === 1) {
                    timer = $timeout(function () {

                        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                            $scope.gridOptions.data[i].selected = false;
                        }

                        //perform single-click action    
                        row.selected = !row.selected;
	                    $scope.errorMessage = '';
                        selectedRow = row;
                        clicks = 0;             //after action performed, reset counter
                    }, 200);

                } else {
                    $timeout.cancel(timer);//prevent single-click action
                    //perform double-click action
                    $scope.setValue(row);
                    clicks = 0;             //after action performed, reset counter
                }
            };

            $scope.doubleClick = function ($event) {
                $event.preventDefault();
            };

            $scope.setValue = function (row)
            {
	            console.log(row.data);

            	$scope.errorMessage = '';
				$scope.showLoadingAnimation = true;

                $http({
                	url: $scope.setValueURL,
                    method: 'POST',
                    data: row.data
                }).then(function (response) {
                    if (!response.data)
                    {
	                    handleError();
                        return;
                    }

                    console.log('success');
					close();

                }, function (error)
                {
	                handleError(error);
                });

                function handleError(error)
                {
                	$scope.errorMessage = 'Failed saving field value';
	                $scope.showLoadingAnimation = false;
                }
            };

            $scope.getItems();

        }]);

}());