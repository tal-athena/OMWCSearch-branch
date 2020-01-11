(function()
{
	"use strict";

	// For input type=text for sending change to the server
	angular.module('omwHeaderSearch')
		.directive('textareaToolbar',
			[
				"$rootScope", "$compile", "$timeout",
				function($rootScope, $compile, $timeout)
				{
					return {
						restrict: 'A',
						require: 'ngModel',
						scope: {
							maxRows: "@?",
							minRows: "@?rows",
							model: "=ngModel"
						},
						link: function(scope, element, attr, ngModelCtrl)
						{
							element.unbind('textarea').unbind('keydown').unbind('change');

							var template = "<div ng-show='hasFocus' class='textarea-toolbar' ng-style='getStyle()'>" +
								"<button ng-click='insertTimestamp()' ng-mousedown='onMouseDown($event)'><div class='timestamp-button'></div><span>Timestamp</span></button>" +
								"</div>";

							var ignoreBlur = false;

							scope.hasFocus = false;

							scope.getStyle = function()
							{
								if (!scope.hasFocus)
									return { "display": "none" };

								return {
									left: (element[0].offsetLeft) + "px",
									top: (element[0].offsetTop - 30) + "px"
								};
							};

							scope.onMouseDown = function($event)
							{
								ignoreBlur = true;
								element.addClass("focused");
							};

							scope.insertTimestamp = function()
							{
								try
								{
									var now = new Date();

									var value = element.val();

									var scrollTop = element[0].scrollTop;

									var caretPos = element[0].selectionStart;
									var txtToAdd = now.toLocaleDateString() +
										" " +
										addLeadingZero(now.getHours()) +
										":" +
										addLeadingZero(now.getMinutes());
									var newValue = value.substring(0, caretPos) + txtToAdd + value.substring(caretPos);
									element.val(newValue);
									element.focus();

									element[0].selectionStart = caretPos + txtToAdd.length;
									element[0].selectionEnd = caretPos + txtToAdd.length;

									element[0].scrollTop = scrollTop;
								}
								catch (e)
								{
									console.error(e);
								}

								$timeout(function()
									{
										ignoreBlur = false;
										element.removeClass("focused");
									},
									300);
							};

							function addLeadingZero(val)
							{
								val = val.toString();

								if (val.length < 2)
									val = "0" + val;

								return val;
							}

							var linkFn = $compile(template);
							var content = linkFn(scope);
							element.parent().append(content);

							initMaxRows();

							element.bind('focus',
								function($event)
								{
									if (!scope.$$phase)
									{
										scope.$apply(function()
										{
											scope.hasFocus = true;

											////////////////////////////////////////////////////////////////////////////

											if (!ignoreBlur)
											{
												var currentId = OMWClientContext.HeaderSearch.findElementFieldId(element);

												OMWClientContext.HeaderSearch.LockField(currentId);

												OMWClientContext.HeaderSearch.updateTextField = true;
												if (OMWClientContext.HeaderSearch.lockFieldStatus == false)
													OMWClientContext.HeaderSearch.updateTextField = false;
											}
										});
									}
								});

							element.bind('blur',
								function($event)
								{
									if (ignoreBlur)
										return;

									if (!scope.$$phase)
									{
										scope.$apply(function()
										{
											scope.hasFocus = false;

											////////////////////////////////////////////////////////////////////////////

											ngModelCtrl.$setViewValue(element.val());
											//Update element value to server
											if (OMWClientContext.HeaderSearch.updateTextField == true)
											{
												var currentId = OMWClientContext.HeaderSearch.findElementFieldId(element);

												OMWClientContext.HeaderSearch.updateElementValue(currentId, element.val());
											}
										});
									}
								});

							function initMaxRows()
							{
								if (!!scope.maxRows && !!scope.minRows)
								{
									var maxRows = parseInt(scope.maxRows);
									var minRows = parseInt(scope.minRows);
									if (minRows < maxRows)
									{
										updateElementHeight(maxRows);

										element.on('input',
											function()
											{
												updateElementHeight(maxRows);
											});

										$rootScope.$on("updateHeaderFields",
											function()
											{
												updateElementHeight(maxRows);
											});

										scope.$watch("model",
											function()
											{
												updateElementHeight(maxRows);
											});
									}
								}
							}

							function updateElementHeight(maxRows)
							{
								if (hasScrollBar())
								{
									var node = element[0];

									var lineHeight = 15;

									var maxHeight = maxRows * lineHeight;
									var newHeight = Math.min(maxHeight, node.scrollHeight);
									element.css("height", newHeight + "px");
									OMWClientContext._FixContentMWidth(false);
								}
							}

							function hasScrollBar()
							{
								return element[0].clientHeight < element[0].scrollHeight;
							}
						}
					};
				}
			]);
})();