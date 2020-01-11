(function () {

    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    var _template = currentScriptPath.replace('OMW_Parent.js', 'Parent.html');
    var _controller = 'OMWParentDialogCtrl';

    var rowTemplate = '<div grid="grid" class="customGridRow">' +
        '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
        'ng-dblclick="grid.appScope.doubleClick($event)"' +
        'ng-click="grid.appScope.selectRow(row.entity, $event)"' +
        'class="ui-grid-cell"' +
        'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'row-selected\': row.entity.selected }"' +
        'ui-grid-cell>' +
        '</div>' +
        '</div>';

    angular.module('omwParent')
        .factory('OMWParetDialogSvc', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout',
            function ($document, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout) {

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

                                    //  Compile then link the template element, building the actual element.
                                    //  Set the $element on the inputs so that it can be injected if required.
                                    var linkFn = $compile(template);
                                    var modalElement = linkFn(modalScope);
                                    inputs.$element = modalElement;

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
        .controller('OMWParentDialogCtrl', ['$scope', '$http', 'close', '$timeout', function ($scope, $http, close, $timeout) {

            $scope.columnDefs = [];

            //Grid options
            $scope.gridOptions = {
                enableColumnResizing: false,
                enableColumnMenus: false,
                enableSorting: false,
                multiSelect: false,
                columnDefs: $scope.columnDefs,
                rowTemplate: rowTemplate,
                showGridFooter: false
            };

            $scope.close = function () {
                $("body").off("keydown");
                close();
            };

            $scope.processData = function (data) {
                var updatedData = [];

                //Init columns
                $scope.initColumns();

                for (var i = 0; i < data.length; i++) {
                    var obj = {
                        selected: false,
                        value: data[i].name,
                        icon: data[i].icon,
                        url: data[i].url
                    };

                    updatedData.push(obj);
                }

                $scope.gridOptions.data = updatedData;
            };

            $scope.initColumns = function () {

                //Selected
                $scope.columnDefs.push({ name: '_', width: 25, enableColumnResizing: false, cellTemplate: '<div><input type="checkbox" ng-click="grid.appScope.checkboxClicked(row.entity)" ng-model="row.entity.selected"/></div>', headerTemplate: '' });

                //Images
                $scope.columnDefs.push({ name: '__', width: 25, enableColumnResizing: false, cellTemplate: '<div class="list-field-icon"><img ng-if="row.entity.icon" ng-src="{{grid.appScope.getIconUrl(row.entity.icon)}}"/></div>', headerTemplate: '' });

                //Name
                $scope.columnDefs.push({ field: 'name', enableColumnResizing: false, cellTemplate: '<div class="listFieldValue">{{row.entity.value}}</div>' });
            };

            $scope.checkboxClicked = function (row) {
                row.selected = !row.selected;
            };

            $scope.ok = function () {
                var selected = 0;
                var url = "";

                for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                    if ($scope.gridOptions.data[i].selected) {
                        selected += 1;
                        url = $scope.gridOptions.data[i].url;
                    }
                }

                if (!!url && selected == 1) {
                    window.open(url, "_blank");

                    $scope.close();
                } else {
                    alert("Select only one object");
                }
            };

            var clicks = 0, timer = null;
            $scope.selectRow = function (row, $event) {
                clicks++;  //count clicks
                if (clicks === 1) {
                    var deselect = false;
                    if (row.selected) {
                        deselect = true; // deselect after interval
                    }
                    else {
                        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                            $scope.gridOptions.data[i].selected = false;
                        }
                        row.selected = true; // select immediately
                    }

                    timer = $timeout(function () {
                        if (deselect)
                            row.selected = false;

                        clicks = 0;
                    }, 200);
                }
                else {
                    $timeout.cancel(timer); //prevent single-click action

                    //perform double-click action
                    $scope.open(row);
                    clicks = 0;             //after action performed, reset counter

                    //Close dialog
                    $scope.close();
                }
            };

            $scope.doubleClick = function ($event) {
                $event.preventDefault();
            };

            $scope.open = function (row) {
                $scope.openInNewTab(row.url);
            };

            $scope.openInNewTab = function (url) {
                window.open(url, '_blank');
            };

            $scope.processData($scope.data);

            $scope.getIconUrl = function (icon) {
                return '/OMWebiSearch/' + icon;
            };

            $("body").on("keydown", function (event) {
                if ($("#parentListFieldGrid").length) {
                    if (event.which == 38) {//Up
                        var index = -1;
                        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                            if ($scope.gridOptions.data[i].selected) {
                                index = i;
                            }
                            $scope.gridOptions.data[i].selected = false;
                        }

                        if (index <= 0) {
                            index = $scope.gridOptions.data.length - 1;
                        } else {
                            index -= 1;
                        }
                        $scope.gridOptions.data[index].selected = true;
                    }
                    if (event.which == 40) {//Down
                        var index = -1;
                        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                            if ($scope.gridOptions.data[i].selected) {
                                index = i;
                            }
                            $scope.gridOptions.data[i].selected = false;
                        }

                        if (index == -1 || index == $scope.gridOptions.data.length - 1) {
                            index = 0;
                        } else {
                            index += 1;
                        }
                        $scope.gridOptions.data[index].selected = true;
                    }

                    if (event.key && event.key.trim() != "" && event.key.length == 1) {
                        var key = event.key;
                        var index = -1;
                        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                            var obj = $scope.gridOptions.data[i];
                            if (obj.value.toLowerCase().indexOf(key.toLowerCase()) == 0) {
                                index = i;
                                break;
                            }
                        }

                        if (index >= 0) {
                            for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                                $scope.gridOptions.data[i].selected = false;
                            }
                            $scope.gridOptions.data[index].selected = true;
                        }
                    }

                    if (event.which == 9) {
                        if ($("#btnSaveParent").is(":focus")) {
                            $("#btnCancelParent").focus();
                        } else {
                            $("#btnSaveParent").focus();
                        }
                        event.preventDefault();
                    }
                }
            });
        }])
        .controller('OMWParentCtrl', ['$scope', '$http', 'OMWParetDialogSvc', function ($scope, $http, OMWParetDialogSvc) {

            $scope.openModal = function () {
                $http({
                    url: '/OMWebiSearch/Document/Parent/GetData?name=test',
                    method: 'GET'
                }).then(function (response) {

                    if (!response.data) {
                        console.error('Failed loading items for this field');
                        return;
                    }
                    if (response.data.length > 1) {
                        var popUp = OMWParetDialogSvc.InitPopUp();
                        popUp.open(response.data, function (result) {
                            console.log(result);
                        });
                    } else if (response.data.length == 1) {
                        var url = response.data[0].url;
                        window.open(url, "_blank");
                    } else {
                        alert('No parent');
                    }

                });
            };

        }]);

}());