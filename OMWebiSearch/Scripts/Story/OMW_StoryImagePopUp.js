(function () {

    'use strict';

    var currentScript = function () {
        var scripts = document.getElementsByTagName("script");
        var currentScriptPath = scripts[scripts.length - 1].src;
        return currentScriptPath;
    };
    var currentScriptPath = currentScript();

    var _baseUrl = '/OMWebiSearch/Document/DevCmd/';
    var _template = _baseUrl + 'Fields/';
    var _controller = 'OMWStoryImagePopUpCtrl';
    var _saveUrl = '';

    var _templateHTML = '<div id="imagePopUpDialog" class="modalDialog pop-up-dialog">' +
                            '<div>' +
                                '<div class="dialogTitlebar">' +
                                    '<h2>Edit</h2>' +
                                    '<a id="closeX" title="Close" class="close" ng-click="close()"></a>' +
                                '</div>' +
                                '<div class="pop-up-body">' +
                                    '<div id="story-image-pop-up-fields">' +
                                        '<div class="items" ng-bind-html="rawHtml" ng-hide="showLoadingAnimation"></div>' +
                                        '<div id="loading" ng-show="showLoadingAnimation" style="display:block;">' +
                                            '<div class="imageHolder"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +

                                '<div>' +
                                    '<div class="buttons-row">' +
                                        '<button id="btnSave"' +
                                                'ng-click="save()"' +
                                                'class="linkButton save-button">' +
                                            'Save' +
                                        '</button>' +
                                        '<button id="btnCancel"' +
                                                'ng-click="close()"' +
                                                'class="linkButton cancel-button">' +
                                            'Cancel' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="clear-fix"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

    angular.module('omwStory')
        .factory('OMWStoryImagePopUpDialogSvc', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout',
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

                    self.InitPopUp = function (options) {

                        _saveUrl = options.saveUrl || _baseUrl + 'UpdateFields';

                        //return new dialog object that will have methods
                        var modalObject = {};

                        modalObject.open = function (data, callback, options) {

                            options = options || {};
                            options.controller = options.controller || _controller;
                            options.template = _templateHTML;

                            //  Create a deferred we'll resolve when the modal is ready.
                            var deferred = $q.defer();

                            //  Get the actual html of the template.
                            getTemplate(options.template, options.templateUrl)
                              .then(function (template) {

                                  //  Create a new scope for the modal.
                                  var modalScope = (options.scope || $rootScope).$new();

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
            .controller('OMWStoryImagePopUpCtrl', ['$scope', '$http', 'close', '$sce', '$timeout', '$compile', 'OMWListFieldDialogSvc',
                function ($scope, $http, close, $sce, $timeout, $compile, OMWListFieldDialogSvc) {

                    $scope.loadFields = function (storyId) {
                        //Show loading animation
                        $scope.showLoadingAnimation = true;
                        //Get fields html
                        $http.get(_template + storyId).then(function (response) {
                            var raw_html = response.data;
                            //Show html returned from service
                            $scope.rawHtml = $sce.trustAsHtml(raw_html);

                            //Init stuff
                            $timeout(function () {
                                //Compile this html
                                var content = angular.element('#story-image-pop-up-fields .items').contents();
                                $compile(content)($scope);

                                $scope.initFields();

                                //Hide loading animation
                                $scope.showLoadingAnimation = false;
                            }, 1);
                        });
                    };

                    $scope.initFields = function () {
                        var searchPageComboboxes = $('#imagePopUpDialog .combobox-field');
                        $(searchPageComboboxes).kendoComboBox({
                            autoComplete: true
                        });
                    };

                    $scope.close = function () {
                        $scope.callback();
                        close();
                    };

                    $scope.getChangedValues = function () {
                        var returnFields = [];
                        //Get text fields
                        var fields = angular.element('#story-image-pop-up-fields').find('.omw-field-type-text, .omw-field-type-number,  .omw-field-type-list, .omw-field-type-date-time, .omw-field-type-date, .omw-field-type-time').find('input');
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            if (field.dataset.originalval !== field.value.trim()) {
                                returnFields.push({
                                    FieldID: field.dataset.fieldid,
                                    FieldValue: field.value
                                });
                            }
                        }

                        fields = angular.element('#story-image-pop-up-fields').find('.omw-field-type-duration .time_pick').find('input');
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            if (field.dataset.originalval !== field.value.trim()) {
                                returnFields.push({
                                    FieldID: field.dataset.fieldid,
                                    FieldValue: field.value
                                });
                            }
                        }

                        fields = angular.element('#story-image-pop-up-fields').find('.omw-field-type-combobox').find('select');
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            if (field.dataset.originalval !== field.value.trim()) {
                                returnFields.push({
                                    FieldID: field.dataset.fieldid,
                                    FieldValue: field.value
                                });
                            }
                        }

                        fields = angular.element('#story-image-pop-up-fields').find('.omw-field-type-multiline').find('textarea');
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            if (field.dataset.originalval !== field.value.trim()) {
                                returnFields.push({
                                    FieldID: field.dataset.fieldid,
                                    FieldValue: field.value
                                });
                            }
                        }

                        fields = angular.element('#story-image-pop-up-fields').find('.omw-field-type-checkbox').find('input');
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            if (field.dataset.originalval.toString().toLowerCase() !== field.checked.toString()) {
                                returnFields.push({
                                    FieldID: field.dataset.fieldid,
                                    FieldValue: field.checked
                                });
                            }
                        }

                        return returnFields;
                    };

                    $scope.save = function () {
                        var editedFields = $scope.getChangedValues();
                        console.log(editedFields);

                        $http({
                            method: 'POST',
                            url: _saveUrl,
                            data: {
                                id: $scope.data.storyId,
                                HeaderFields: JSON.stringify(editedFields)
                            }
                        }).then(function (response) {
                            console.log(response);

                            $scope.callback(response);
                            close();
                        }, function (error) {
                            console.log(error);
                        });
                    };

                    $scope.editListHeaderField = function (id) {
                        //Open modal that will be used to edit this stuff
                        var element = angular.element('#OMW_Field_' + id);
                        if (element.length && element.length > 0) {
                            element = angular(element[0]);
                        }
                        var value = element.value;
                        var item = {
                            Value: value,
                            FieldID: id
                        };
                        var collectionId = angular.element('#hdnStoryId').val();
                        var popUp = OMWListFieldDialogSvc.InitPopUp('collection');
                        popUp.open({
                            item: item,
                            collectionId: collectionId,
                            fieldId: id,
                            splitter: ';',
                            dontSendUpdateEvent: true
                        }, function (result) {
                            console.log(result);
                            element.val(result).change();
                        });
                    };

                    $scope.loadFields($scope.data.storyId);

                }]);


    angular.module('omwDateFields', [])
    .directive('datepickerfield', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ngModelCtrl) {

                var format = element.data('dateformat');
                var locale = element.data('locale');

                if (!locale || !$.datepicker.regional[locale]) {
                    locale = "";
                }

                $.datepicker.setDefaults($.datepicker.regional['']);

                element.datepicker({
                    dateFormat: format
                });
            }
        }
    });

    angular.module('omwDateFields')
        .directive('durationpickerfield', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs, ngModelCtrl) {
                    var format = element.data('dateformat') || 'hh:mm:ss';
                    var locale = element.data('locale');
                    var date = element.data('val');

                    var showNegative = false;
                    var updatedFormat = format;
                    element[0].dataset['timepickiNeg'] = '';
                    if (format[0] === '-') {
                        showNegative = true;
                        element[0].dataset['timepickiNeg'] = '-';
                        //Remove the first char
                        updatedFormat = updatedFormat.substr(1);
                    }

                    //Parsing of date is tricky???
                    var parsedTime = date.split(':');
                    console.log(parsedTime);
                    if (parsedTime.length < 2) {
                        console.error('Failed while parsing time in duration field');
                    }

                    var hours = parsedTime[0];
                    var minutes = parsedTime[1];
                    var seconds = parsedTime[2];

                    //Set this values to timepicker
                    element[0].dataset['timepickiTim'] = hours;
                    element[0].dataset['timepickiMini'] = minutes;
                    element[0].dataset['timepickiSec'] = seconds;

                    element.timepicki({
                        show_meridian: false,
                        show_negative: showNegative,
                        max_hour_value: 99,
                        before_show: function (time) {
                        },
                        on_close: function (time) {
                        }
                    });
                }
            }
        });

    angular.module('omwDateFields')
        .directive('timepickerfield', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs, ngModelCtrl) {
                    var format = element.data('dateformat');

                    var hasSeconds = false;
                    if (format.indexOf('s') > -1 | format.indexOf('S') > -1) {
                        hasSeconds = true;
                    }

                    element.timepicker({
                        timeFormat: format,
                        showSecond: hasSeconds
                    });
                }
            }
        });

    angular.module('omwDateFields')
        .directive('datetimepickerfield', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs, ngModelCtrl) {

                    var format = element.data('dateformat').split(' ');
                    if (format.length < 2) {
                        format = ['dd.mm.yy', 'hh:mm:ss'];
                    }

                    var hasSeconds = false;
                    try {
                        if (format[1].indexOf('s') > -1) {
                            hasSeconds = true;
                        }
                        if (format[1].indexOf('s') > -1) {
                            hasSeconds = true;
                        }
                    }
                    catch (e) { }

                    var locale = element.data('locale');
                    if (!locale || !$.datepicker.regional[locale]) {
                        locale = "";
                    }

                    $.datepicker.setDefaults(locale);

                    element.datetimepicker({
                        timeFormat: format[1],
                        dateFormat: format[0],
                        showSecond: hasSeconds
                    });
                }
            }
        });
}());