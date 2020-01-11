(function () {

    angular.module('omwHeaderSearch')
        .directive('datepicker', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {

                    var format = element.data('dateformat');
					var locale = element.data('locale');

	                var noUpdate = element.data('noupdate');

                    if (!locale || !$.datepicker.regional[locale]) {
                        locale = "";
                    }

                    $.datepicker.setDefaults($.datepicker.regional['']);

                    element.datepicker({
                        dateFormat: format,
                        onClose: function (date) {

                            ngModelCtrl.$setViewValue(date);
                            if (!scope.$$phase) {
                                scope.$apply();
							}

	                        element.change();

	                        if (noUpdate === undefined)
	                        {
		                        var currentId = OMWClientContext.HeaderSearch.findElementFieldId(this);

		                        var dateFormat = element.data('dateformat');
		                        //console.log(dateFormat);
		                        OMWClientContext.HeaderSearch.updateDateElementValue(currentId, date, dateFormat);
	                        }
                        },
                        beforeShow: function (date) {

	                        if (noUpdate === undefined)
	                        {
		                        var currentId = OMWClientContext.HeaderSearch.findElementFieldId(date);

		                        OMWClientContext.HeaderSearch.LockField(currentId);

		                        lastValue = $(this).val();

		                        if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
		                        {
			                        return false;
		                        }
	                        }
                        }
                    });


                }
            }
        });

    angular.module('omwHeaderSearch')
        .directive('durationpicker', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {

                    var format = element.data('dateformat');
                    var locale = element.data('locale');
					var date = element.data('val');

	                var noUpdate = element.data('noupdate');

                    //TESTING
                    format = '-' + format;

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

                    var beforeShow = function (time) {
                        console.log('SHOWING');
						console.log(time);

	                    if (noUpdate === undefined)
	                    {
		                    var currentId = OMWClientContext.HeaderSearch.findElementFieldId(time);

		                    OMWClientContext.HeaderSearch.LockField(currentId);

		                    lastValue = $(time).val();

		                    if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
		                    {
			                    return false;
		                    }
	                    }
                    };

                    var onClose = function (time) {
                        ngModelCtrl.$setViewValue(time.value);
                        if (!scope.$$phase) {
                            scope.$apply();
						}

	                    element.change();

	                    if (noUpdate === undefined)
	                    {
		                    var currentId = OMWClientContext.HeaderSearch.findElementFieldId(time);

		                    OMWClientContext.HeaderSearch.updateElementValue(currentId, time.value);
	                    }
                    };

                    $(element).focus(function () {
                        beforeShow(element[0]);
                    });

                    $(element).blur(function () {
                        onClose(element[0]);
                    });

                    element.timepicki({
                        show_meridian: false,
                        show_negative: showNegative,
                        max_hour_value: 99,
                        before_show: function (time) {
                            beforeShow(time);
                        },
                        on_close: function (time) {
                            onClose(time);
                        }
                    });
                }
            }
        });


    angular.module('omwHeaderSearch')
        .directive('timepicker', function () {

            return {
                restrict: 'A',
                require: 'ngModel',

                link: function (scope, element, attrs, ngModelCtrl) {
					var format = element.data('dateformat');

	                var noUpdate = element.data('noupdate');

                    var hasSeconds = false;
                    if (format.indexOf('s') > -1 | format.indexOf('S') > -1) {
                        hasSeconds = true;
                    }

                    element.timepicker({
                        timeFormat: format,

                        showSecond: hasSeconds,

                        onClose: function (time) {
                            ngModelCtrl.$setViewValue(time);
                            if (!scope.$$phase) {
                                scope.$apply();
							}

	                        element.change();

	                        if (noUpdate === undefined)
	                        {
		                        var currentId = OMWClientContext.HeaderSearch.findElementFieldId(this);

		                        var dateFormat = element.data('dateformat');
		                        OMWClientContext.HeaderSearch.updateDateElementValue(currentId, time, dateFormat);
	                        }
                        },
                        beforeShow: function (time) {

	                        if (noUpdate === undefined)
	                        {
		                        var currentId = OMWClientContext.HeaderSearch.findElementFieldId(time);

		                        OMWClientContext.HeaderSearch.LockField(currentId);

		                        lastValue = $(this).val();

		                        if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
		                        {
			                        return false;
		                        }
	                        }
                        }
                    });
                }
            }
        });


    angular.module('omwHeaderSearch')
        .directive('datetimepicker', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {

                    var format = element.data('dateformat').split(' ');
                    if (format.length < 2) {
                        format = ['dd.mm.yy', 'hh:mm:ss'];
					}

	                var noUpdate = element.data('noupdate');

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
                        //timeFormat: 'HH:mm:ss',
                        //dateFormat: 'dd.mm.yy',
                        timeFormat: format[1],
                        dateFormat: format[0],

                        showSecond: hasSeconds,

                        onClose: function (dateText) {

                            ngModelCtrl.$setViewValue(dateText);
                            if (!scope.$$phase) {
                                scope.$apply();
							}

	                        element.change();

							if (noUpdate === undefined)
							{
								var dateFormat = element.data('dateformat');

								var currentId = OMWClientContext.HeaderSearch.findElementFieldId(this);

								//It should update DateTimeValue, that should have id, value and the format
								OMWClientContext.HeaderSearch.updateDateElementValue(currentId, dateText, dateFormat);
							}
                        },
                        beforeShow: function (date) {

							if (noUpdate === undefined)
							{
								var currentId = OMWClientContext.HeaderSearch.findElementFieldId(date);

								OMWClientContext.HeaderSearch.LockField(currentId);

								lastValue = $(this).val();

								if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
								{
									return false;
								}
							}

                        }
                    });
                }
            }
        });
})();