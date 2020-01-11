(function () {

    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    var _template = currentScriptPath.replace('Services/OMW_PopUpDialog.js', 'Templates/PopUpDialog.html');
    var _controller = 'OMWPopUpDialogCtrl';

    angular.module('omwShared')
        .factory('OMWPopUpDialogSvc', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout',
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

                    self.InitPopUp = function (firstColumnIcon, contentPopUp, columns) {

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
                                  modalScope.firstColumnIcon = firstColumnIcon;
                                  modalScope.contentPopUp = contentPopUp;
                                  modalScope.columns = columns;

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

                                  //  Finally, append the modal to the dom.
                                  if (contentPopUp) {
                                      // append to grid element

                                      //At the moment it is not working as expected 
                                      //because modal is having position fixed to body element
                                      //appendChild(angular.element('#searchResultsOptions'), modalElement);

                                      appendChild(body, modalElement);
                                  } else {
                                      // append to body when no custom append element is specified
                                      appendChild(body, modalElement);
                                  }

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
            .controller('OMWPopUpDialogCtrl', ['$scope', 'close', function ($scope, close) {

                $scope.selectedRow;

                $scope.close = function () {
                    close();
                };

                $scope.save = function () {
                    //Send here whatever was selected option
                    if (!$scope.selectedRow) {
                        return;
                    }

                    $scope.callback($scope.selectedRow.data);
                    close();
                };

                $scope.selectRow = function (row) {

                    if (!!$scope.selectedRow) {
                        $scope.selectedRow._selected = false;
                    }

                    row._selected = true;
                    $scope.selectedRow = row;
                };

                $scope.getRowValue = function (row, id) {
                    if (!row || !row.values || !row.values.length || !id) {
                        return '';
                    }

                    for (var i = 0; i < row.values.length; i++) {
                        if (row.values[i].ID === id) {
                            return row.values[i].value;
                        }
                    }

                    return '';
                };

                $scope.toggleRow = function (row, $event, $index) {
                    $event.stopPropagation();
                    $event.preventDefault();

                    //Set proper class to current element
                    var element = angular.element($event.target);
                    var collapsed = element.hasClass('collapsed');
                    if (collapsed) {
                        element.removeClass('collapsed');
                    }
                    else {
                        element.addClass('collapsed');
                    }

                    //Get this row, and make all after this one hidden
                    var currentRowIndex = $index;
                    for (var i = currentRowIndex + 1; i < $scope.data.length; i++) {
                        if (!!$scope.data[i].section) {
                            //This is section, break here
                            break;
                        }
                        else {
                            $scope.data[i].hide = !collapsed;
                        }
                    }
                };

            }]);

}());