(function()
{
	"use strict";

	var currentScript = function()
	{
		var scripts = document.getElementsByTagName("script");
		var currentScriptPath = scripts[scripts.length - 1].src;
		return currentScriptPath;
	};
	var currentScriptPath = currentScript();
	var templateUrl = currentScriptPath.replace("HeaderFieldDirective.js", "HeaderFieldDirective.html");

	angular.module("omwShared")
		.directive("headerField",
			[
				"$http", "$q", "$timeout", "$window",
				function ($http, $q, $timeout, $window)
				{
					return {
						restrict: "E",
						scope: {
							paramFieldType: "@",
							paramEnableSuggestions: "=?",
							paramStaticSuggestions: "@?",
							paramIsDynamic: "=?",
							paramIsReadOnly: "=?",
							paramSeparator: "@",
							paramFieldId: "=?",
							paramPosition: "=?",
							paramFieldsList: "=?",
							paramOriginalValue: "@?",
							paramControlId: "@",
							paramOnEditClick: "=?",
							paramIsStoryDialog: "=?"
						},
						templateUrl: templateUrl,
						link: function(scope, element, attrs)
						{
							var staticSuggestions = null;
							var dynamicSuggestions = null;
							var promise = null;

							scope.$element = element;

							if (!scope.paramSeparator)
								scope.paramSeparator = ";";

							initTags(scope.paramOriginalValue);

							scope.inputValue = scope.paramOriginalValue;
							scope.isStoryDialog = scope.paramIsStoryDialog === "true";

							if (scope.paramFieldType == "search" || scope.isStoryDialog)
								watchSearchChanges();
							else
								watchCollectionChanges();

							if (scope.paramEnableSuggestions)
							{
								if (!!scope.paramStaticSuggestions && !scope.paramIsDynamic)
									staticSuggestions = scope.paramStaticSuggestions.split(scope.paramSeparator);
							}

							function watchSearchChanges()
							{
								var input = element.find("div > input");
								input.on("change",
									function()
									{
										if (scope.ignoreChange)
											return;

										var newValue = input.val();
										if (newValue != tagsToString())
										{
											initTags(newValue);

											updateFieldValue();
										}
									});
							}

							function watchCollectionChanges()
							{
								if (!!scope.paramFieldsList && !!scope.paramFieldId)
								{
									var index = -1;

									for (var i = 0; i < scope.paramFieldsList.length; i++)
									{
										var field = scope.paramFieldsList[i];
										if (field.Key == scope.paramFieldId)
										{
											index = i;
											break;
										}
									}

									if (index !== -1)
									{
										scope.$watch("paramFieldsList[" + index + "].Value",
											function(newValue, oldValue)
											{
												if (newValue != scope.paramOriginalValue)
												{
													initTags(newValue);

													updateFieldValue();
												}
											});
									}
								}
							}

							function initTags(value)
							{
								scope.tags = [];

								if (!!value)
								{
									var values = value.split(scope.paramSeparator);
									for (var i = 0; i < values.length; i++)
									{
										scope.tags.push({
											text: values[i].trim()
										});
									}
								}
							}

							function getAjaxUrl()
							{
								if (scope.paramFieldType === 'search')
									return '/OMWebiSearch/Search/SearchMain/LoadSearchProfileFieldItems';
								else
									return '/OMWebiSearch/Collection/Editor/GetHeaderFieldValues';
							}

							function getAjaxParams()
							{
								if (scope.paramFieldType === 'search')
								{
									return {
										id: angular.element('#hdnSearchProfileId').val(), // profileID
										position: scope.paramPosition
									};
								}
								else
								{
									return {
										collectionId: angular.element('#hdnStoryId').val(),
										fieldId: scope.paramFieldId
									};
								}
							}

							function loadAllSuggestions()
							{
								if (!!promise)
									return;

								var deferred = $q.defer();
								promise = deferred.promise;

								var url = getAjaxUrl();
								var data = getAjaxParams();

								$http({
									url: url,
									method: 'GET',
									params: data
								}).then(function(response)
								{
									promise = null;

									if (!(response.data && response.data.items))
									{
										console.error('Failed loading items for field');
										dynamicSuggestions = null;
										deferred.reject();
									}
									else
									{
										dynamicSuggestions = response.data.items;
										deferred.resolve();
									}

								}, function()
								{
									promise = null;
									deferred.reject();
								});
							}

							scope.getLoadingPopupStyles = function()
							{
								if (!scope.showLoadingPopup)
									return {};

								var rc = element[0].getBoundingClientRect();
								return {
									left: rc.left + "px",
									top: (rc.bottom + 2) + "px"
								}
							};

							function updateFieldValue()
							{
								var newValue = tagsToString();
								scope.inputValue = newValue;

								angular.element($window).trigger("resize");

								setTimeout(function()
								{
									scope.ignoreChange = true;
									angular.element(scope.$element).find("#list_" + scope.paramFieldId).trigger("change");
									scope.ignoreChange = false;
								});

								setTimeout(function()
									{
										angular.element($window).trigger("resize");
									},
									200);

								if (!!scope.paramFieldsList)
								{
									for (var i = 0; i < scope.paramFieldsList.length; i++)
									{
										var field = scope.paramFieldsList[i];
										if (field.Key == scope.paramFieldId)
										{
											field.Value = newValue;
											break;
										}
									}
								}
							}

							function tagsToString()
							{
								var newValue = "";

								for (var i = 0; i < scope.tags.length; i++)
								{
									var tag = scope.tags[i];
									if (newValue.length > 0)
										newValue += scope.paramSeparator;

									newValue += tag.text.trim();
								}

								return newValue;
							}

							scope.loadSuggestions = function($query)
							{
								var suggestions;

								if (scope.paramIsDynamic)
								{
									if (!!dynamicSuggestions)
									{
										scope.showLoadingPopup = false;

										suggestions = filterSuggestions(dynamicSuggestions, $query);
										return $q.when(suggestions);
									}

									var deferred = $q.defer();

									if (!promise)
										loadAllSuggestions();

									scope.showLoadingPopup = true;

									promise.then(function (response)
									{
										scope.showLoadingPopup = false;

										if (!!dynamicSuggestions)
										{
											suggestions = filterSuggestions(dynamicSuggestions, $query);
											deferred.resolve(suggestions);
										}
									},
									function()
									{
										scope.showLoadingPopup = false;

										deferred.reject();
									});

									return deferred.promise;
								}
								else if (!!staticSuggestions)
								{
									suggestions = filterSuggestions(staticSuggestions, $query);

									return $q.when(suggestions);
								}

								return $q.when([]);
							};

							function filterSuggestions(values, $query)
							{
								var suggestions = [];

								for (var i = 0; i < values.length; i++)
								{
									$query = $query.toLowerCase();

									var item = values[i];
									if (!!item && item.toLowerCase().indexOf($query) !== -1)
									{
										var selected = false;

										for (var j = 0; j < scope.tags.length; j++)
										{
											var tag = scope.tags[j];
											if (tag.text == item)
											{
												selected = true;
												break;
											}
										}

										if (!selected)
											suggestions.push({ text: item });
									}
								}

								return suggestions;
							}

							scope.onTagAdded = function($tag)
							{
								updateFieldValue();

								var tagsList = element.find(".tag-list");
								$timeout(function()
								{
									tagsList.scrollTop(tagsList.height());
								});
							};

							scope.onTagRemoved = function($tag)
							{
								updateFieldValue();
							};

							scope.onFocus = function()
							{
								if (scope.paramIsDynamic)
								{
									dynamicSuggestions = null;
									promise = null;

									loadAllSuggestions();
								}

								if (scope.paramFieldType !== 'search' && !scope.isStoryDialog)
									OMWClientContext.HeaderSearch.LockField(scope.paramFieldId, scope.paramOriginalValue);
							};

							scope.onBlur = function()
							{
								if (scope.paramIsDynamic)
								{
									dynamicSuggestions = null;
									promise = null;
									scope.showLoadingPopup = false;
								}

								var value = tagsToString();

								if (value == scope.paramOriginalValue)
								{
									if (scope.paramFieldType !== 'search' && !scope.isStoryDialog)
									{
										console.log("Element value wasn't changed, no need for AJAX call");
										OMWClientContext.HeaderSearch.UnlockField(scope.paramFieldId);
									}

									return;
								}

								scope.paramOriginalValue = value;

								updateFieldValue();

								if (scope.paramFieldType !== 'search' && !scope.isStoryDialog)
									OMWClientContext.HeaderSearch.updateElementValue(scope.paramFieldId, value);
							};

							scope.onEditClick = function($event)
							{
								if (!!scope.paramOnEditClick)
								{
									if (scope.paramFieldType === "search")
										scope.paramOnEditClick(scope.paramPosition, $event);
									else
										scope.paramOnEditClick(scope.paramFieldId, $event);
								}
							};

							scope.onMouseEnter = function($event)
							{
								var tags = element.find(".tags");
								tags.addClass("edit-button-hover");
							};

							scope.onMouseLeave = function($event)
							{
								var tags = element.find(".tags");
								tags.removeClass("edit-button-hover");
							};
						},
						controller: [
							"$scope", function($scope)
							{
							}
						]
					};
				}
			]);
})();