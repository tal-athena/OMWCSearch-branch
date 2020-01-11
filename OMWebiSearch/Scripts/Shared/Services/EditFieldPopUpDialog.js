(function () {

    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    var _template = currentScriptPath.replace('Services/EditFieldPopUpDialog.js', 'Templates/EditFieldPopUpDialog.html');
    var _controller = 'EditFieldPopUpDialogCtrl';

    angular.module('omwShared')
        .factory('EditFieldPopUpDialogSvc', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout',
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

                    self.InitPopUp = function () {

                        //return new dialog object that will have methods
                        var modalObject = {};

                        modalObject.open = function (data, options, event, callback) {

                            options = options || {};
                            options.controller = options.controller || _controller;

                            //  Create a deferred we'll resolve when the modal is ready.
                            var deferred = $q.defer();

                            //  Get the actual html of the template.
                            getTemplate(options.template, options.templateUrl)
                              .then(function (template) {

                                  //  Create a new scope for the modal.
                                  var modalScope = (options.scope || $rootScope).$new();

                                  modalScope.options = options;
                                  modalScope.data = data;
                                  modalScope.callback = callback;
                                  var offset = angular.element(event.target).offset();
                                  modalScope.position = {
                                      //left: event.clientX - 100,
                                      left: offset.left - 1,
                                      //top: event.clientY - 50
                                      top: offset.top - 8
                                  };

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
        .controller('EditFieldPopUpDialogCtrl', ['$scope', 'close', '$http', '$sce', '$timeout', '$document',
            function ($scope, close, $http, $sce, $timeout, $document)
            {
            	$scope.showEditFieldPopUp = false;
	            $scope.showLoadingAnimation = false;

	            $scope.cancel = function ()
	            {
		            close();
                };

                $scope.saveUpdatedFieldValue = function () {
                    var _data = angular.copy($scope.data);
                    _data.newValue = getValue();

	                updateLoadingState(true);

	                $http.post('/OMWebiSearch/Collection/Editor/SetRecordField', _data)
			            .then(function (result)
			            {
							//Send back new value
			                $scope.callback(_data.newValue);

			                close();
			            }, function ()
			            {
				            alert('Error while updating value');
			                updateLoadingState(false);
			            });
                };

	            var focusableElements = [];

                $scope.onKeyDown = function($event)
                {
                	if ($event.keyCode == 9) // Tab
	                {
		                $event.preventDefault();
		                $event.stopPropagation();

		                var index = -1;

		                var activeElement = $($document[0].activeElement);
                		for (var i = 0; i < focusableElements.length; i++)
		                {
                			if ($(focusableElements[i]).is(activeElement))
			                {
				                index = i;
				                break;
			                }
		                }

                		var focusElement = $event.shiftKey ? getPreviousElement(index) : getNextElement(index);
		                if (!!focusElement)
			                focusElement.focus();
	                }
	                else if ($event.keyCode == 46) // Delete
	                {
		                if (isTextInput())
						{
							var input = getInputControl();
							if (!input.is($($event.target)))
							{
								$event.preventDefault();
								$event.stopPropagation();

								input.val("");
								input.focus();
							}
						}
	                }
	                else if ($event.keyCode == 27) // Esc
	                {
		                $event.preventDefault();
	                	$event.stopPropagation();

		                $scope.cancel();
	                }
                };

                $scope.init = function () {
                    var _data = angular.copy($scope.data);

                    //Used for testing 
                    //Undefined
                    _data.recordId = '1';
                    //Check
                    _data.recordId = '2';
                    //Combo
                    _data.recordId = '3';
                    //Date
                    _data.recordId = '4';
                    //Date time
                    _data.recordId = '5';
                    //Duration
                    _data.recordId = '6';
                    //Time
                    _data.recordId = '7';
                    //List
                    _data.recordId = '8';
                    //Multiline
                    _data.recordId = '9';
                    //Number
                    _data.recordId = '10';
                    //Text
                    _data.recordId = '11';


                    _data.recordId = '9';

                    $http.post('/OMWebiSearch/Collection/Editor/GetInputControlForRecord', _data)
                        .then(function (result) {
                            $scope.showEditFieldPopUp = true;
                            $scope.editFieldContextMenuHtml = $sce.trustAsHtml(result.data);

                            $timeout(function () {

                                if ($scope.options && $scope.options.width > 220) {
                                    angular.element('#editFieldPopUpContent').width($scope.options.width);
                                }

	                            //Set value
                                setValue();

                                var buttonOk = $("#editFieldPopUp #btnSave");
	                            buttonOk.focus();

	                            focusableElements = [
									getInputControl(),
									buttonOk,
									$("#editFieldPopUp #btnCancel")
                                ];
                            });
                        });
                };

                var setValue = function () {
                    if ($('#editFieldPopUp .omw-field-type-checkbox').length) {
                        var val = $('#editFieldPopUp input').data('val') > 0 ? true : false;
                        
                        $('#editFieldPopUp input').prop('checked', val);
                    }
                    else if ($('#editFieldPopUp .omw-field-type-combobox').length || $('#editFieldPopUp .omw-field-type-list').length) {
                        var val = $('#editFieldPopUp select').data('val');
                        $('#editFieldPopUp select').kendoComboBox({
                            autoComplete: false,
                            value: val
                        });
                    }
                    else if ($('#editFieldPopUp .omw-field-type-date').length) {
                        var val = $('#editFieldPopUp input').data('val');

                        var dateFormat = $('#editFieldPopUp input').data('dateformat');
                        if (!!dateFormat && dateFormat != "") {
                            $('#editFieldPopUp input').datepicker({
                                dateFormat: dateFormat,
                            });
                        }
                        else {
                            //Important for DEV version
                            //Show date time picker with default values
                            $('#editFieldPopUp input').datepicker();
                        }

                        $('#editFieldPopUp input').datepicker('setDate', new Date(val));
                    }
                    else if ($('#editFieldPopUp .omw-field-type-date-time').length) {
                        var val = $('#editFieldPopUp input').data('val');

                        var Format = $('#editFieldPopUp input').data('dateformat').split(' ');
                        if (Format != "") {
                            var dateFormat = Format[0];
                            var timeFormat = Format[1];

                            var showHours = true;
                            if (timeFormat.indexOf('h') < 0 & timeFormat.indexOf('H') < 0) {
                                showHours = false;
                            }
                            var showSeconds = true;
                            if (timeFormat.indexOf('s') < 0 & timeFormat.indexOf('S') < 0) {
                                showSeconds = false;
                            }

                            $('#editFieldPopUp input').datetimepicker({
                                timeFormat: timeFormat,
                                dateFormat: dateFormat,
                                showSecond: showSeconds,
                                showHour: showHours
                            });
                        }
                        else {
                            //Important for DEV version
                            //Just show date time picker with default values
                            $('#editFieldPopUp input').datetimepicker();
                        }

                        $('#editFieldPopUp input').datetimepicker('setDate', new Date(val));
                    }
                    else if ($('#editFieldPopUp .omw-field-type-duration').length) {
                        var val = $('#editFieldPopUp input').data('val');

                        $('#editFieldPopUp input').timepicker({
                            timeFormat: 'HH:mm:ss',
                            showSecond: true,
                        });

                        $('#editFieldPopUp input').timepicker('setTime', new Date(val));
                    }
                    else if ($('#editFieldPopUp .omw-field-type-time').length) {
                        var val = $('#editFieldPopUp input').data('val');

                        var timeFormat = $('#editFieldPopUp input').data('timeformat');
                        if (!!timeFormat && timeFormat != "") {
                            var showHours = true;
                            if (timeFormat.indexOf('h') < 0 & timeFormat.indexOf('H') < 0) {
                                showHours = false;
                            }
                            var showSeconds = true;
                            if (timeFormat.indexOf('s') < 0 & timeFormat.indexOf('S') < 0) {
                                showSeconds = false;
                            }

                            $('#editFieldPopUp input').timepicker({
                                showSecond: showSeconds,
                                showHour: showHours,
                                timeFormat: timeFormat,
                            });
                        }
                        else {
                            //Important for DEV version
                            //Show date time picker with default values
                            $('#editFieldPopUp input').timepicker({
                                timeFormat: 'HH:mm:ss',
                                showSecond: true,
                            });
                        }

                        $('#editFieldPopUp input').timepicker('setTime', new Date(val));
                    }
                };

                var getValue = function () {
                    if ($('#editFieldPopUp .omw-field-type-text').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-number').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-checkbox').length) {
                        return $('#editFieldPopUp input').is(':checked');
                    }
                    else if ($('#editFieldPopUp .omw-field-type-combobox').length || $('#editFieldPopUp .omw-field-type-list').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-date').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-date-time').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-duration').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-time').length) {
                        return $('#editFieldPopUp input').val();
                    }
                    else if ($('#editFieldPopUp .omw-field-type-multiline').length) {
                        return $('#editFieldPopUp textarea').val();
                    }

                    return '';
                };

                function isTextInput()
                {
                	return ($('#editFieldPopUp .omw-field-type-text').length > 0 || $('#editFieldPopUp .omw-field-type-multiline').length);
                }

                function getInputControl()
                {
	                if ($('#editFieldPopUp .omw-field-type-multiline').length)
		                return $('#editFieldPopUp textarea');
	                else
		                return $('#editFieldPopUp input');
                }

	            function getNextElement(index)
	            {
		            if (focusableElements.length === 0)
			            return null;

		            if (index >= 0 && index < focusableElements.length - 1)
			            index++;
		            else
		            	index = 0;

		            return focusableElements[index];
	            }

	            function getPreviousElement(index)
	            {
		            if (focusableElements.length === 0)
			            return null;

		            if (index > 0 && index < focusableElements.length)
			            index--;
		            else
			            index = focusableElements.length - 1;

		            return focusableElements[index];
	            }

	            function updateLoadingState(busy)
	            {
		            $scope.showLoadingAnimation = busy;

	            	for (var i = 0; i < focusableElements.length; i++)
		            {
			            focusableElements[i].prop("disabled", busy);
		            }
	            }

	            $scope.init();

            }]);

}());