(function ()
{
	angular.module('omwHeaderSearch')
		.directive('customDuration',
			['$timeout', function ($timeout)
			{
				return {
					restrict: 'A',
					link: function (scope, element, attrs, ngModelCtrl)
					{
						var durationPattern = "-?(?:[01]\\d|2[0123]):(?:[012345]\\d):(?:[012345]\\d)";
						element.attr('pattern', durationPattern);
						var value = element.data('val');
						element.val(value);

						element.on("focus",
							function ($event)
							{
								if ($(element).prop('readonly'))
									return;

								$timeout(function ()
								{
									var input = $event.target;
									var selection = getDurationSelection(input, input.selectionStart);
									if (!!selection)
										setSelection(input, false, selection.start, selection.end);
								});
							});

						element.on("keydown",
							function ($event)
							{
								if ($(element).prop('readonly'))
									return;

								var input = $event.target;
								var value = input.value;
								var number;
								var isNegative = false;
								var selection;
								var start;

								if (($event.keyCode >= 48 && $event.keyCode <= 57) // digit buttons
									|| ($event.keyCode >= 96 && $event.keyCode <= 105) // numpad digit buttons
									|| ($event.keyCode >= 112 && $event.keyCode <= 123) // F1-F2 buttons
									|| ($event.keyCode === 186 && $event.shiftKey)
									|| $event.keyCode === 8 // backspace
									|| $event.keyCode === 46 // delete
									|| $event.keyCode === 9 // tab
									|| ($event.keyCode === 109 || $event.keyCode === 189)) // minus 
								{
									// do nothing
								}
								else if ($event.keyCode === 38) // up
								{
									selection = getDurationSelection(input, input.selectionStart);
									if (!!selection)
									{
										number = parseInt(selection.value);
										number++;

										if (selection.start > 0)
										{
											if (number >= 60)
												number = 0;
										}
										else
											isNegative = number < 0;

										number = Math.abs(number).toString();
										if (number.length < 2)
											number = "0" + number;

										if (isNegative)
											number = "-" + number;

										input.value = value.substring(0, selection.start) + number + value.substring(selection.end);
										setSelection(input, false, selection.start, selection.end);
										$(input).change();
									}
								}
								else if ($event.keyCode === 40) // down
								{
									selection = getDurationSelection(input, input.selectionStart);
									if (!!selection)
									{
										number = parseInt(selection.value);
										number--;

										if (selection.start > 0)
										{
											if (number < 0)
												number = 59;
										}
										else
											isNegative = number < 0;

										number = Math.abs(number).toString();
										if (number.length < 2)
											number = "0" + number;

										if (isNegative)
											number = "-" + number;

										input.value = value.substring(0, selection.start) + number + value.substring(selection.end);
										setSelection(input, false, selection.start, selection.end);
										$(input).change();
									}
								}
								else if ($event.keyCode === 37) // left
								{
									selection = getDurationSelection(input, input.selectionStart);
									if (!!selection)
									{
										start = selection.start - 1;
										if (start < 0)
											start = 0;

										selection = getDurationSelection(input, start);
										if (!!selection)
											setSelection(input, true, selection.start, selection.end);
										else
											setSelection(input, true);
									}
									else
										setSelection(input, true);

									$event.preventDefault();
								}
								else if ($event.keyCode === 39) // right
								{
									selection = getDurationSelection(input, input.selectionStart);
									if (!!selection)
									{
										start = selection.start + selection.value.length + 1;
										if (start > input.value.length)
											start = input.value.length;

										selection = getDurationSelection(input, start);
										if (!!selection)
											setSelection(input, false, selection.start, selection.end);
										else
											setSelection(input, false);
									}
									else
										setSelection(input, false);

									$event.preventDefault();
								}
								else
									$event.preventDefault();
							});

						function setSelection(input, left, start, end)
						{
							if (start === undefined)
								start = left ? 0 : input.value.length - 1;

							if (end === undefined)
								end = start;

							if (input.selectionStart !== start || input.selectionEnd !== end)
							{
								$timeout(function ()
								{
									input.setSelectionRange(start, end);
								});
							}
						}

						function getDurationSelection(input, start)
						{
							var value = input.value;
							if (!!value)
							{
								if (start === undefined || start < 0 || start > value.length)
									return undefined;

								start = indexOfBefore(value, ":", start);
								if (start === -1)
									start = value.length;
								else if (start > 0)
									start++;

								var end = value.indexOf(":", start + 1);
								if (end === -1)
									end = value.length;

								return {
									start: start,
									end: end,
									value: value.substring(start, end)
								};
							}

							return undefined;
						}

						function indexOfBefore(value, char, before)
						{
							for (var i = before - 1; i >= 0; i--)
							{
								if (value[i] === char)
									return i;
							}

							return 0;
						}
					}
				};
			}]);
})();