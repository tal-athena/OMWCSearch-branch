(function ()
{
	angular.module('omwShared')
		.directive('autoFocus', function ($timeout)
	{
		return {
			link: function (scope, element, attrs)
			{
				attrs.$observe("autoFocus", function (newValue)
				{
					if (newValue === "true")
						$timeout(function () { element.focus() });
				});
			}
		};
	});

	angular.module('omwShared')
		.directive('internalLink',
			[
				'$rootScope', '$window', '$document', '$http', '$timeout', '$sce', function ($rootScope, $window, $document, $http, $timeout, $sce)
				{
					return {
						restrict: 'E',
						scope: {
							collectionId: '@',
							fieldId: '@',
							title: '@',
							iconUrl: '@',
							buttonIconUrl: '@',
							baseUrl: '@',
							docId: '@',
							type: '@',
							noUpdate: '@',
							isReadOnly: '@'
						},
						template: '<div class="internal-link-container">' +
									'<div ng-if="type !== \'collection-grid\'" class="searchFieldWrap"><input type="hidden" id="{{\'OMW_InternalLink_\' + fieldId}}" ng-value="docIdModel" /></div>' +
									'<div ng-if="type === \'collection-header\' || type ===\'media-insert\'" ng-mousedown="onClick($event)" oncontextmenu="return false" class="internal-link">' +
										'<div ng-show="!isEditMode && !isAudio" class="link-content">' +
											'<img ng-if="iconModel" ng-src="{{baseUrl + iconModel}}" />' +
											'<span ng-click="open()">{{titleModel}}</span>' +
										'</div>' +
										'<div ng-show="!isEditMode && isAudio" class="link-content audio">' +
											'<audio ng-src="{{audioUrl}}" controls></audio>' +
										'</div>' +
										'<div ng-show="!isEditMode && (!isReadOnly || isReadOnly.toLowerCase() !== \'true\')" class="internal-link-button" ng-click="onEditClick()">' +
											'<img ng-src="{{baseUrl + \'Content/Images/edit.png\'}}" />' +
										'</div>' +
										'<div ng-if="isEditMode" class="flex-col flex"><input spellcheck="false" type="text" auto-focus="true" ng-model="editData.docId" /></div>' +
									'</div>' +
									'<div ng-show="isEditMode" class="link-toolbar" ng-style="getToolbarStyles()">' +
										'<div><img ng-src="{{!!baseUrl ? baseUrl + \'Content/Images/toolbar-ok.png\' : \'\'}}" ng-click="save()" /></div>' +
										'<div><img ng-src="{{!!baseUrl ? baseUrl + \'Content/Images/toolbar-cancel.png\' : \'\'}}" ng-click="cancel()" /></div>' +
									'</div>' +
									'<div class="link-menu context-menu" ng-show="menuVisible" ng-style="getContextMenuStyles()">' +
										'<ul>' +
											'<li ng-mousedown="open()">Open</li>' +
											'<li ng-mousedown="open(\'tab\')">Open in New Tab</li>' +
											'<li ng-mousedown="open(\'window\')">Open in New Window</li>' +
										'</ul>' +
									'</div>' +
								'</div>',
						link: function(scope, element, attrs)
						{
							scope.titleModel = scope.title;
							scope.docIdModel = scope.docId;
							scope.iconModel = scope.iconUrl;

							updateAudio();

							scope.editData = {
								docId: ''
							};

							scope.isEditMode = false;

							$document[0].addEventListener('scroll',
								function()
								{
									if (scope.menuVisible || scope.isEditMode)
										scope.$apply();
								},
								true);

							element.on('change', '#OMW_InternalLink_' + scope.fieldId, function()
								{
									scope.editData.docId = '';
									scope.save();
								});

							$rootScope.$on('hide-internal-link-context-menu',
								function()
								{
									scope.menuVisible = false;
								});

							scope.onClick = function($event)
							{
								if ($event.which === 3 && !scope.isEditMode)
								{
									$event.stopPropagation();
									$event.preventDefault();

									$rootScope.$broadcast('hide-internal-link-context-menu');

									$timeout(function()
									{
										scope.menuVisible = true;
									});
								}
							};

							function updateAudio()
							{
								scope.isAudio = !!scope.docIdModel && endsWith(scope.docIdModel, '.mp3');
								if (scope.isAudio)
									scope.audioUrl = $sce.trustAsResourceUrl(scope.docIdModel);
								else
									scope.audioUrl = null;
							}

							function endsWith(value, suffix)
							{
								return value.toLowerCase().indexOf(suffix.toLowerCase(), this.length - suffix.length) !== -1;
							}

							function navigate(docId, action)
							{
								var url;

								if (scope.isAudio)
									url = scope.docIdModel;
								else
									url = 'https://www.google.com/search?q=' + docId;

								if (action === 'tab')
									window.open(url, '_blank');
								else if (action === 'window')
									window.open(url, '_blank', 'menubar=yes');
								else
									window.location.href = url;
							}

							scope.open = function(action)
							{
								navigate(scope.docIdModel, action);
							};

							function update()
							{
								$http.get(OMWClientContext.GetFullUrl('Collection/Editor/GetInternalLinkInfo?docId=' + scope.docIdModel)).then(function (response)
									{
										if (!!response && !!response.data)
										{
											scope.titleModel = response.data.Title;
											scope.iconModel = response.data.IconUrl;
										}
									},
									function (xhr, textStatus, error)
									{
										alert('Error');
									});
							}

							scope.onEditClick = function()
							{
								scope.isEditMode = true;

								scope.menuVisible = false;

								scope.editData.docId = scope.docIdModel;
							};

							scope.save = function()
							{
								if (scope.type === 'collection-header')
								{
									var url;

									var dataToUpdate;

									var collectionId = angular.element('#hdnCollectionId').val();
									var storyId = angular.element('#hdnStoryId').val();

									if (!!collectionId)
									{
										url = 'Collection/Editor/UpdateField';

										dataToUpdate = {
											collectionId: collectionId,
											fieldId: scope.fieldId,
											fieldValue: scope.editData.docId
										};
									}
									else if (!!storyId)
									{
										url = 'StoryH/StoryH/SaveStory';

										dataToUpdate = {
											storyId: storyId,
											fieldId: scope.fieldId,
											fieldValue: scope.editData.docId,
											htmlUpdated: false,
											html: null
										};
									}

									$http.post(OMWClientContext.GetFullUrl(url), dataToUpdate).then(function(response)
										{
											if (!!response.data)
											{
												if (response.data.status !== 'Error')
												{
													scope.docIdModel = scope.editData.docId;
													scope.isEditMode = false;

													updateAudio();

													if (!!scope.fieldId)
													{
														$timeout(function()
														{
															$rootScope.$broadcast('internal-link-changed');
														});
													}

													update();
												} else
													alert(response.data.message);
											} else
												alert('Error');
										},
										function(xhr, textStatus, error)
										{
											alert('Error');
										});
								}
								else
								{
									scope.docIdModel = scope.editData.docId;
									scope.isEditMode = false;

									updateAudio();

									if (!!scope.fieldId)
									{
										$timeout(function ()
										{
											$rootScope.$broadcast('internal-link-changed');
										});
									}

									update();
								}
							};

							scope.cancel = function()
							{
								scope.isEditMode = false;

								scope.editData.docId = '';
							};

							function getScrollOffset(element)
							{
								var collectionId = angular.element('#hdnCollectionId').val();
								var storyId = angular.element('#hdnStoryId').val();

								if (!collectionId && !!storyId)
									return recurseGetScrollOffset(element);

								return 0;
							}

							function recurseGetScrollOffset(element)
							{
								var parent = element.parent();
								if (parent.length > 0)
									return element.scrollTop() + recurseGetScrollOffset(parent);

								return element.scrollTop();
							}

							scope.getToolbarStyles = function()
							{
								var el = element[0];

								var left;
								var top;

								if (scope.type === 'media-insert')
								{
									left = (el.offsetLeft + el.clientWidth) - 52;
									top = (el.offsetTop + el.clientHeight) + 42;

									top -= getScrollOffset(element);
								}
								else
								{
									left = (el.offsetLeft + el.clientWidth) - 60;
									top = (el.offsetTop + el.clientHeight) - 1;

									top -= getScrollOffset(element);
								}

								return {
									left: left + "px",
									top: top + "px"
								};
							};

							scope.getContextMenuStyles = function()
							{
								var el = element[0];

								var left;
								var top;

								if (scope.type === 'media-insert')
								{
									left = el.offsetLeft;
									top = (el.offsetTop + el.clientHeight) + 42;

									top -= getScrollOffset(element);
								}
								else
								{
									left = el.offsetLeft;
									top = (el.offsetTop + el.clientHeight) - 5;

									top -= getScrollOffset(element);
								}

								return {
									left: left + "px",
									top: top + "px"
								};
							};
						}
					};
				}
			]);
})();