(function () {
	'use strict';

	angular.module('omwCollection')
		.controller('CollectionCtrl', ['$rootScope', '$scope', '$http', '$q', '$window', '$document', '$timeout', 'CollectionSvc', 'GridColumnSizeSvc', 'FirstColContextMenuSvc', 'OMWPopUpDialogSvc', 'EditFieldPopUpDialogSvc', 'HeaderFieldContextMenuSvc', 'UndoDialogSvc', 'CopyAsDialogSvc', 'OMWListFieldDialogSvc', 'OMWListFieldDialogSingleSvc', 'CollectionColumnsSvc', 'uiGridEditConstants',
			function ($rootScope, $scope, $http, $q, $window, $document, $timeout, CollectionSvc, GridColumnSizeSvc, FirstColContextMenuSvc, OMWPopUpDialogSvc, EditFieldPopUpDialogSvc, HeaderFieldContextMenuSvc, UndoDialogSvc, CopyAsDialogSvc, OMWListFieldDialogSvc, OMWListFieldDialogSingleSvc, CollectionColumnsSvc, uiGridEditConstants)
			{

				var _expandedRows = {
					level1: [],
					level2: []
				};
				var firstColumnRows = {
					checkedRows: []
				};
				var _gridScrollTop;

				///////////////////////////////////
				//TEST FOR POP UP
				///////////////////////////////////
				window.popUp1 = function () {
					var _columns1 = [{ ID: 1, title: "First Column", width: 250 }, { ID: 2, title: "Column2", width: 200 }, { ID: 3, title: "Column3", width: 400 }, { ID: 5, title: "Column5", width: 200 }];
					var popUp1 = OMWPopUpDialogSvc.InitPopUp(true, true, _columns1);
					var _data1 = [{section: 'Section 1'},
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "any 1", values: [{ ID: 1, value: "Value 1.1" }, { ID: 5, value: "Value 1.5" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "2. Not presented in GUI", values: [{ ID: 1, value: "Value 2.1" }, { ID: 5, value: "Value 2.5" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any 3", values: [{ ID: 2, value: "Value 2.2" }, { ID: 3, value: "Value 3.2" }, { ID: 5, value: "Value 5.2" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "4", values: [{ ID: 2, value: "Value 2.3" }, { ID: 3, value: "Value 3.3" }] },
					{ section: 'Section 2' },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "5 any ", values: [{ ID: 2, value: "Value 2.4" }, { ID: 5, value: "Value 2.5" }, { ID: 5, value: "Value 5.4" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any 6", values: [{ ID: 1, value: "Value 6.1" }, { ID: 2, value: "Value 2.2" }, { ID: 3, value: "Value 3.2" }, { ID: 5, value: "Value 5.2" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "7", values: [{ ID: 1, value: "Value 7.1" }, { ID: 2, value: "Value 2.3" }, { ID: 3, value: "Value 3.3" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "8 any ", values: [{ ID: 1, value: "Value 8.1" }, { ID: 2, value: "Value 2.4" }, { ID: 5, value: "Value 2.5" }, { ID: 5, value: "Value 5.4" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png", data: "9 data", values: [{ ID: 1, value: "Value 9.1" }, { ID: 2, value: "Value 2.5" }, { ID: 3, value: "Value 3.5" }, { ID: 5, value: "Value 5.5" }] }];
					var _cb1 = function (selected) {
						alert(selected);
					};
					popUp1.open(_data1, _cb1);
				}
				window.popUp2 = function () {

					var _firstColumnIcon = false;
					var _contentPopUp = false;
					var _columns = [{ ID: 1, title: "Column1", width: 100 }, { ID: 5, title: "Column5", width: 200 }];
					var popUp = OMWPopUpDialogSvc.InitPopUp(_firstColumnIcon, _contentPopUp, _columns);
					var _data = [{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png", data: "any type of string. Not presented in GUI", values: [{ ID: 1, value: "Value 1.1" }, { ID: 5, value: "Value 1.5" }] },
								{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any type of other string. Not presented in GUI", values: [{ ID: 1, value: "Value 2.1" }, { ID: 5, value: "Value 2.5" }] }];
					var _cb = function (selected) {
						alert(selected);
					};
					popUp.open(_data, _cb);

				}
				window.popUp3 = function () {
					var _columns1 = [{ ID: 1, title: "First Column", width: 250 }, { ID: 2, title: "Column2", width: 200 }, { ID: 3, title: "Column3", width: 400 }, { ID: 5, title: "Column5", width: 200 }];
					var popUp3 = OMWPopUpDialogSvc.InitPopUp(true, true, _columns1);
					var _data1 = [
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "any 1", values: [{ ID: 1, value: "Value 1.1" }, { ID: 5, value: "Value 1.5" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "2. Not presented in GUI", values: [{ ID: 1, value: "Value 2.1" }, { ID: 5, value: "Value 2.5" }] },
					{ section: 'Section 1' },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any 3", values: [{ ID: 2, value: "Value 2.2" }, { ID: 3, value: "Value 3.2" }, { ID: 5, value: "Value 5.2" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "4", values: [{ ID: 2, value: "Value 2.3" }, { ID: 3, value: "Value 3.3" }] },
					{ section: 'Section 2' },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "5 any ", values: [{ ID: 2, value: "Value 2.4" }, { ID: 5, value: "Value 2.5" }, { ID: 5, value: "Value 5.4" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any 6", values: [{ ID: 1, value: "Value 6.1" }, { ID: 2, value: "Value 2.2" }, { ID: 3, value: "Value 3.2" }, { ID: 5, value: "Value 5.2" }] },
					{ section: 'Section 3' },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "7", values: [{ ID: 1, value: "Value 7.1" }, { ID: 2, value: "Value 2.3" }, { ID: 3, value: "Value 3.3" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "8 any ", values: [{ ID: 1, value: "Value 8.1" }, { ID: 2, value: "Value 2.4" }, { ID: 5, value: "Value 2.5" }, { ID: 5, value: "Value 5.4" }] },
					{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png", data: "9 data", values: [{ ID: 1, value: "Value 9.1" }, { ID: 2, value: "Value 2.5" }, { ID: 3, value: "Value 3.5" }, { ID: 5, value: "Value 5.5" }] }];
					var _cb1 = function (selected) {
						alert(selected);
					};
					popUp3.open(_data1, _cb1);
				}
				///////////////////////////////////

				$scope.showAskUserContextMenu = false;
				$scope.askUserContextMenu = {
					items: []
				};
				$scope.columnDefs = [];
				$scope.gridApi = {};
				$scope.showLoadingAnimation1 = false;
				$scope.showLoadingAnimation2 = false;
				$scope.selectedRow;
				$scope.dragging = {
					ctrl: false
				};

				$scope.menuVisible = false;
				var menuDocId = null;
				var menuRowIndex = -1;
				var menuColumnIndex = -1;

				$scope.gridHeaderMessage = "Some long message to test ellipsis";
				$scope.gridHeaderTooltip = "This is a tooltip";

				$scope.getGridHeaderStyle = function()
				{
					if (!$scope.gridHeaderMessage || !$scope.columnDefs || $scope.columnDefs.length === 0)
						return {
							display: 'none'
						};

					var isScrolledHorizontally = angular.element("#collectionPage .ui-grid-viewport").scrollLeft() > 0;
					var left = isScrolledHorizontally ? 0 : $scope.columnDefs[0].width;

					var width = 0;
					for (var i = 1; i < $scope.columnDefs.length && i <= 5; i++)
					{
						var col = $scope.columnDefs[i];
						width += col.width;
					}

					return {
						left: left + 'px',
						width: width + 'px'
					}
				};

				angular.element("body").on("click",
					function()
					{
						$scope.$apply(function()
						{
							hideContextMenu();
						});
					});

				$document[0].addEventListener('scroll',
					function ()
					{
						$scope.$apply(function()
						{
							$scope.menuVisible = false;
						});
					},
					true);

				$scope.durationPattern = "-?(?:[01]\\d|2[0123]):(?:[012345]\\d):(?:[012345]\\d)";

				$scope.isCellEditing = false;

				$scope.$watch("showLoadingAnimation", function (newValue, oldValue)
				{
					if (newValue === false)
						$timeout(function()
						{
							angular.element("#idIframeLoader").hide();
						}, 500);
				});

				var editFieldPopUp = EditFieldPopUpDialogSvc.InitPopUp();

				$scope.init = function init(templateId, collectionId) {
					$scope.templateId = templateId;
					$scope.collectionId = collectionId;

					$scope.initColumns();
					$scope.initData();

					/*setInterval(function ()
						{
							if (!ServerUpdates.isSuspended)
								$scope.refreshGridData();
						},
						3000);*/
				};

				$scope.initColumns = function initColumns() {
					var data = {
						templateId: $scope.templateId,
						collectionId: $scope.collectionId
					};
					$http.post('/OMWebiSearch/Collection/Editor/ContentsFields', data).then(function (data) {

						var columns = data.data.grid.columns;
						$scope.columns = columns;

						//Get all columns sizes
						$scope.iconOffset = 6;
						var iconFieldWidth = 25 + (2 * $scope.iconOffset);
						var ignoredWidth = 25 + 60 + 62 + iconFieldWidth;
						columns = GridColumnSizeSvc.getColumnsSizes(columns, angular.element('#collectionPage'), ignoredWidth);

						//Checkboxes
						var firstCellTemplate = '<first-col-context-menu></first-col-context-menu>';
						$scope.columnDefs.push({ name: '______', width: 25, enableColumnResizing: false, cellTemplate: '<div><input type="checkbox" ng-model="row.entity.isChecked" ng-click="grid.appScope.rowIsChecked(row.entity, $event)" /></div>', headerCellTemplate: firstCellTemplate });

						//Open and open in new tab
						$scope.columnDefs.push({ field: '___', width: 62, enableColumnResizing: false, cellTemplate: '<div class="ngCellOpenIcons"><open-grid-row-options-menu menu-items="grid.appScope.getContextMenuItems(row.entity.id, row.entity)" row-data="row.entity" select-row="grid.appScope.selectRow"></open-grid-row-options-menu><a href="{{grid.appScope.getStoryUrl(row.entity.id, row.entity)}}" title="Open in the same window"><span class="open opacity2"></span></a></div>' });

						//Grouping1
						$scope.columnDefs.push({ name: '____', width: 20, enableColumnResizing: false, cellTemplate: '<div class="{{row.entity.groupIndicator_1}}"></div>' });

						//Expand
						$scope.columnDefs.push({ name: '_', width: 20, enableColumnResizing: false, cellTemplate: '<div><div class="level-2-group-indicator {{row.entity.groupIndicator_2}}"></div><div ng-class="{\'loadingRowData\': row.entity.showLoadingAnimation1}"></div><i ng-show="row.entity.hasSubitems && !row.entity.showLoadingAnimation1 && row.entity.level === 1" ng-click="grid.appScope.expandRow(row.entity, grid.renderContainers.body.visibleRowCache.indexOf(row), $event)" class="expand-icon" ng-class="{ \'grid-expand-row\' : !row.entity.isExpanded, \'grid-collapse-row\' : row.entity.isExpanded }"</i></div>' });

						//Expand
						$scope.columnDefs.push({ name: '_____', width: 20, enableColumnResizing: false, cellTemplate: '<div><div class="level-3-group-indicator {{row.entity.groupIndicator_3}}"></div><div ng-class="{\'loadingRowData\': row.entity.showLoadingAnimation2}"></div><i ng-show="row.entity.hasSubitems && !row.entity.showLoadingAnimation2 && row.entity.level === 2" ng-click="grid.appScope.expandRow(row.entity, grid.renderContainers.body.visibleRowCache.indexOf(row),$event)" class="expand-icon" ng-class="{ \'grid-expand-row\' : !row.entity.isExpanded, \'grid-collapse-row\' : row.entity.isExpanded }"</i></div>' });

						//Icon
						$scope.columnDefs.push({ name: '__', width: iconFieldWidth, enableColumnResizing: false, cellTemplate: '<div class="collection-grid-icon-column" ng-style="{\'margin-left\': ((row.entity.level - 1) * grid.appScope.iconOffset) + \'px\'}"><span ng-if="row.entity.itemStatus !== \'\'" class="grid-row-status grid-row-status-{{row.entity.itemStatus}}"></span><img ng-src="{{grid.appScope.getIcon(row.entity.templateId)}}" class="grid-custom-icon"></div>' });

						$scope.tags = [];

						for (var i = 0; i < columns.length; i++)
						{
							var column = columns[i];

							var template;
							var editableCellTemplate = undefined;

							var editorType = CollectionColumnsSvc.getColumnEditorType(columns, column.FieldID);

							var enableCellEdit = !column.readOnly;

							if (editorType === 2 || editorType === 3) // eOMFieldDisplayType_Combo or eOMFieldDisplayType_List
							{
								enableCellEdit = false;

								template = '<div class="ui-grid-cell-contents" ';

								if (!column.readOnly)
									template += 'ng-dblclick="grid.appScope.editField(' + column.FieldID.toString() + ', row.entity, COL_FIELD, $event)" ';

								template += 'style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '">{{COL_FIELD.value}}</div></div>';
							}
							else if (editorType === 4) // eOMFieldDisplayType_Check
							{
								template = '<div class="ui-grid-cell-contents ui-grid-cell-contents-checkbox" style="background-color: {{grid.appScope.getCheckboxBkColor(row.entity, ' + column.FieldID + ', COL_FIELD)}}; padding: 0;">' +
									'<div class="collectionCellValue cellValueCheckbox Column_' + column.FieldID.toString() + '" compile="grid.appScope.getCheckboxHtml(' + column.FieldID + ', COL_FIELD)">' +
									'</div>' +
									'</div>';
							}
							else if (editorType === 6) // eOMFieldDisplayType_DateTime
							{
								template = '<div class="ui-grid-cell-contents" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '">{{grid.appScope.formatDateTime(COL_FIELD.value)}}</div></div>';
							}
							else if (editorType === 9) // eOMFieldDisplayType_DateOnly
							{
								template = '<div class="ui-grid-cell-contents" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '">{{grid.appScope.formatDate(COL_FIELD.value)}}</div></div>';
							}
							else if (editorType === 7) // eOMFieldDisplayType_Duration
							{
								template = '<div class="ui-grid-cell-contents" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '">{{COL_FIELD.value}}</div></div>';
							}
							else if (editorType === 8) // eOMFieldDisplayType_TimeOnly
							{
								template = '<div class="ui-grid-cell-contents" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '">{{grid.appScope.formatTime(COL_FIELD.value)}}</div></div>';
							}
							else if (editorType === 12) // eOMFieldDisplayType_InternalLink
							{
								template = '<div class="ui-grid-cell-contents" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '" style="padding: 0; display: flex; align-items: stretch">' +
									'<div id="{{\'internal_link_\' + grid.appScope.getRowIndex(row.entity) + \'_\' + grid.appScope.getColumnIndex(' + column.FieldID + ')}}" ng-if="!!COL_FIELD.value" ng-mousedown="grid.appScope.onLinkClick($event, row.entity, COL_FIELD, ' + column.FieldID + ')" oncontextmenu="return false" class="flex flex-row flex-align-center flex-justify-center">' +
									'<img ng-src="{{grid.appScope.getFullUrl(\'Content/Images/link.png\')}}" />' +
									'</div>' +
									'</div></div>';

								enableCellEdit = false;
							}
							else
								template = '<div class="ui-grid-cell-contents" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;"><div class="collectionCellValue Column_' + column.FieldID.toString() + '">{{COL_FIELD.value}}</div></div>';

							///////////////////////////////////////////////////////////////////////////////

							if (!column.readOnly)
							{
								if (editorType === 4) // eOMFieldDisplayType_Check
								{
									var onState = CollectionColumnsSvc.getCheckBoxOnState($scope.columns, column.FieldID);
									var offState = CollectionColumnsSvc.getCheckBoxOffState($scope.columns, column.FieldID);
									if (!onState && !offState)
									{
										var inputId = 'checkbox_' + i + '_{{rowRenderIndex}}';
										editableCellTemplate = '<div class="ui-grid-cell-contents ui-grid-cell-contents-checkbox" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;">' +
											'<div class="collectionCellValue cellValueCheckboxEdit Column_' +
											column.FieldID.toString() +
											'">' +
											'<input id="' +
											inputId +
											'" type="checkbox" ng-model="COL_FIELD.value" ng-checked="COL_FIELD.value == 1" />' +
											'<label class="checker" for="' +
											inputId +
											'"></label>' +
											'<img ng-click="grid.appScope.onClearCheckboxClick($event, COL_FIELD)" src="../Content/styles/delete-tag.png" />' +
											'</div>' +
											'</div>';
									}
									else
										enableCellEdit = false;
								}
								else if (editorType === 6) // eOMFieldDisplayType_DateTime
								{
									editableCellTemplate = '<div class="ui-grid-cell-contents ui-grid-cell-contents-date" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;">' +
										'<div name=\"inputForm\" class="collectionCellValue cellValueCustomEdit">' +
										'<input type="datetime-local" ui-grid-editor ng-model="COL_FIELD.value" ng-keydown="grid.appScope.onInputKeyDown($event, ' + column.FieldID + ')" />' +
										'</div>' +
										'</div>';
								}
								else if (editorType === 9) // eOMFieldDisplayType_DateOnly
								{
									editableCellTemplate = '<div class="ui-grid-cell-contents ui-grid-cell-contents-date" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;">' +
										'<div class="collectionCellValue cellValueCustomEdit">' +
										'<input type="date" ui-grid-editor ng-model="COL_FIELD.value" ng-keydown="grid.appScope.onInputKeyDown($event, ' + column.FieldID + ')" />' +
										'</div>' +
										'</div>';
								}
								else if (editorType === 7) // eOMFieldDisplayType_Duration
								{
									editableCellTemplate = '<div class="ui-grid-cell-contents ui-grid-cell-contents-date" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;">' +
										'<form class="collectionCellValue cellValueCustomEdit">' +
										'<input type="text" ui-grid-editor ng-model="COL_FIELD.value" ng-focus="grid.appScope.onInputFocus($event)" ng-keydown="grid.appScope.onInputKeyDown($event, ' + column.FieldID + ', COL_FIELD)" pattern="{{grid.appScope.durationPattern}}" />' +
										'</form>' +
										'</div>';
								}
								else if (editorType === 8) // eOMFieldDisplayType_TimeOnly
								{
									editableCellTemplate = '<div class="ui-grid-cell-contents ui-grid-cell-contents-date" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;">' +
										'<div class="collectionCellValue cellValueCustomEdit">' +
										'<input type="time" step="1" ui-grid-editor ng-model="COL_FIELD.value" ng-keydown="grid.appScope.onInputKeyDown($event, ' + column.FieldID + ')" />' +
										'</div>' +
										'</div>';
								}
								else
								{
									editableCellTemplate = '<div class="ui-grid-cell-contents ui-grid-cell-contents-date" style="background-color: {{row.entity.selected && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.backgroundColor}}; padding: 0;">' +
										'<div class="collectionCellValue cellValueCustomEdit">' +
										'<input type="text" ui-grid-editor ng-model="COL_FIELD.value" ng-keydown="grid.appScope.onInputKeyDown($event, ' + column.FieldID + ')" />' +
										'</div>' +
										'</div>';
								}
							}

							$scope.columnDefs.push({ name: 'Column_' + column.FieldID.toString(), width: column.updatedColumnWidth, enableCellEdit: enableCellEdit, cellTemplate: template, editableCellTemplate: editableCellTemplate });
						}

					}, function (err) {
						console.log(err);
					});
				};

				$scope.openLink = function(action)
				{
					if (!!menuDocId)
					{
						navigate(menuDocId, action);

						hideContextMenu();
					}
				}

				function navigate(docId, action)
				{
					if (!!docId)
					{
						var url = 'https://www.google.com/search?q=' + docId;
						if (action === 'tab')
							window.open(url, '_blank');
						else if (action === 'window')
							window.open(url, '_blank', 'menubar=yes');
						else
							window.location.href = url;
					}
				}

				$scope.getRowIndex = function(entity)
				{
					return $scope.gridOptions.data.indexOf(entity);
				};

				$scope.getColumnIndex = function (fieldId)
				{
					var col = CollectionColumnsSvc.findColumn($scope.columns, fieldId);
					return $scope.columns.indexOf(col);
				};

				function hideContextMenu()
				{
					$scope.menuVisible = false;
					menuDocId = null;
					menuRowIndex = -1;
					menuColumnIndex = -1;
				}

				$scope.onLinkClick = function($event, entity, COL_FIELD, fieldId)
				{
					if ($event.which === 1)
					{
						hideContextMenu();

						navigate(COL_FIELD.value);
					}
					else if ($event.which === 3)
					{
						menuRowIndex = $scope.getRowIndex(entity);
						menuColumnIndex = $scope.getColumnIndex(fieldId);

						if (menuRowIndex !== -1 && menuColumnIndex !== -1)
						{
							menuDocId = COL_FIELD.value;

							$event.stopPropagation();
							$event.preventDefault();

							$timeout(function ()
							{
								$scope.menuVisible = true;
							});
						}
					}
				};

				$scope.toggleCheckboxValue = function (rowEntity, colDef, field, fieldId)
				{
					if (CollectionColumnsSvc.isColumnReadOnly($scope.columns, fieldId))
						return;

					var onState = CollectionColumnsSvc.getCheckBoxOnState($scope.columns, fieldId);
					var offState = CollectionColumnsSvc.getCheckBoxOffState($scope.columns, fieldId);

					if (!!onState && !!offState)
					{
						var prevValue = field.value;

						if (field.value == 1 || field.value == true || field.value === onState.str)
							field.value = offState.str;
						else if (field.value == 0 || field.value == false || field.value === offState.str)
							field.value = onState.str;

						updateField(rowEntity,
							colDef,
							function ()
							{
								console.log("Field updated successfully");
							},
							function ()
							{
								alert('Error updating field');

								setFieldValue(rowEntity, colDef, prevValue);
							});
					}
				};

				$scope.getCheckboxHtml = function(fieldId, COL_FIELD)
				{
					var onState = CollectionColumnsSvc.getCheckBoxOnState($scope.columns, fieldId);
					var offState = CollectionColumnsSvc.getCheckBoxOffState($scope.columns, fieldId);

					var html;

					if (!!onState && (COL_FIELD.value == 1 || COL_FIELD.value === true || (COL_FIELD.value === onState.str)))
						html = '<label class="checkbox-toggle" ng-dblclick="grid.appScope.toggleCheckboxValue(row.entity, col, grid.getCellValue(row, col), ' + fieldId + ')">' + onState.str + '</label>';
					else if (!!offState && (COL_FIELD.value == 0 || COL_FIELD.value == false || COL_FIELD.value === offState.str))
						html = '<label class="checkbox-toggle" ng-dblclick="grid.appScope.toggleCheckboxValue(row.entity, col, grid.getCellValue(row, col), ' + fieldId + ')">' + offState.str + '</label>';
					else
						html = '<label ng-class="{ \'check-value\': grid.getCellValue(row, col).value == 1 }"></label>';

					return html;
				};

				$scope.getCheckboxBkColor = function(entity, fieldId, COL_FIELD)
				{
					var onState = CollectionColumnsSvc.getCheckBoxOnState($scope.columns, fieldId);
					var offState = CollectionColumnsSvc.getCheckBoxOffState($scope.columns, fieldId);

					var color;

					if (!entity.selected)
					{
						if (!!onState && onState.color !== 'ffffffff' && (COL_FIELD.value == 1 || COL_FIELD.value === true || (COL_FIELD.value === onState.str)))
							color = "#" + onState.color;
						else if (!!offState && offState.color !== 'ffffffff' && (COL_FIELD.value == 0 || COL_FIELD.value == false || COL_FIELD.value === offState.str))
							color = "#" + offState.color;
						else
						{
							if (!!$scope.calcCellColor && $scope.calcCellColor(COL_FIELD) === true)
								color = 'transparent';
							else
								color = COL_FIELD.backgroundColor;
						}
					}
					else
						color = 'transparent';

					return color;
				};

				$scope.onInputFocus = function($event)
				{
					$timeout(function()
					{
						var input = $event.target;
						var selection = getDurationSelection(input, input.selectionStart);
						if (!!selection)
							setSelection(input, false, selection.start, selection.end);
					});
				};

				$scope.onInputKeyDown = function ($event, fieldId, COL_FIELD)
				{
					if ($event.keyCode === 13) // Enter
					{
						$event.preventDefault();
						$rootScope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);
					}
					else if (CollectionColumnsSvc.isDurationColumn($scope.columns, fieldId))
					{
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
								COL_FIELD.value = input.value;
								setSelection(input, false, selection.start, selection.end);
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
								COL_FIELD.value = input.value;
								setSelection(input, false, selection.start, selection.end);
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
					}
				};

				function setSelection(input, left, start, end)
				{
					if (start === undefined)
						start = left ? 0 : input.value.length - 1;

					if (end === undefined)
						end = start;

					if (input.selectionStart !== start || input.selectionEnd !== end)
					{
						$timeout(function()
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

				$scope.formatDateTime = function (value)
				{
					try
					{
						var dt = new Date(value);
						return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
					}
					catch (err)
					{
						console.error(err);
					}

					return 'Invalid datetime';
				};

				$scope.formatDate = function (value)
				{
					try
					{
						var dt = new Date(value);
						return dt.toLocaleDateString();
					}
					catch (err)
					{
						console.error(err);
					}

					return 'Invalid date';
				};

				$scope.formatTime = function (value)
				{
					try
					{
						var dt = new Date(value);
						return dt.toLocaleTimeString();
					}
					catch (err)
					{
						console.error(err);
					}

					return 'Invalid time';
				};

				$scope.onClearCheckboxClick = function ($event, COL_FIELD)
				{
					COL_FIELD.value = 0;

					$($event.currentTarget).prev().focus();
				};

				$scope.calcCellColor = function(COL_FIELD)
				{
					return true;
				};

				$scope.parseData = function parseData(items, level) {
					var newData = [];
					var item;
					for (var i = 0; i < items.length; i++)
					{
						for (var j = 0; j < items[i].Fields.length; j++)
						{
							var field = items[i].Fields[j];
							if (CollectionColumnsSvc.isDateTimeColumn($scope.columns, field.FieldID))
								field.DisplayValue = new Date(field.DisplayValue);
							else if (CollectionColumnsSvc.isDurationColumn($scope.columns, field.FieldID))
								field.DisplayValue = !!field.DisplayValue ? field.DisplayValue.trim() : '';
						}

						item = CollectionSvc.parseItem(items[i], level);
						item.collectionId = $scope.collectionId;
						item['groupIndicator_' + level] = CollectionSvc.findGroupIndicator(items[i], items, i);

						newData.push(item);
					}
					return newData;
				};

				$scope.initData = function initData(expandedRows) {
					$scope.showLoadingAnimation = true;
					firstColumnRows.checkedRows = [];

					var selectedRowId = null;
					var colDef = null;
					if (!!$scope.gridApi.cellNav)
					{
						var focusedCell = $scope.gridApi.cellNav.getFocusedCell();
						if (!!focusedCell)
						{
							selectedRowId = !!$scope.selectedRow ? $scope.selectedRow.id : null;
							colDef = focusedCell.col.colDef;
						}
					}

					var data = {
						templateId: $scope.templateId,
						collectionId: $scope.collectionId,
						subItemsID: expandedRows
					};

					$http.post('/OMWebiSearch/Collection/Editor/ContentsData', data).then(function (data) {

						//Parse returned data
						var items = data.data.items[$scope.collectionId];
						if (!items) {
							return;
						}

						var newData = $scope.parseData(items, 1);

						$scope.gridOptions.data = newData;

						if (!!selectedRowId && !!colDef)
						{
							var rowEntity = null;
							for (var i = 0; i < $scope.gridOptions.data.length; i++)
							{
								var entity = $scope.gridOptions.data[i];
								if (entity.id === selectedRowId)
								{
									rowEntity = entity;
									break;
								}
							}
							
							if (!!rowEntity)
							{
								$scope.selectRow(rowEntity);

								$timeout(function()
								{
									var columnIndex = -1;
									for (var i = 0; i < $scope.columnDefs.length; i++)
									{
										if ($scope.columnDefs[i].name === colDef.name)
										{
											columnIndex = i;
											break;
										}
									}

									if (columnIndex !== -1)
									{
										if (columnIndex > 0)
											scrollToFocus(rowEntity, $scope.columnDefs[0]);
										else
											scrollToFocus(rowEntity, $scope.columnDefs[1]);

										scrollToFocus(rowEntity, colDef);
									}
								});
							}
						}

						$scope.expandPreviousRows(data.data.items);
					});
				};

				function restoreGridFocus(fieldId, id)
				{
					var focusers = angular.element("#collectionPage .ui-grid-focuser");
					angular.element(focusers[0]).focus();

					$timeout(function()
						{
							var rowEntity = findRowEntityById(id);
							if (!!rowEntity)
								$scope.restoreCellFocus(fieldId, rowEntity);
						},
						50);
				}

				function findRowEntityById(id)
				{
					for (var i = 0; i < $scope.gridOptions.data.length; i++)
					{
						var rowEntity = $scope.gridOptions.data[i];
						if (rowEntity.id === id)
						{
							return rowEntity;
						}
					}

					return null;
				}

				function scrollToFocus(rowEntity, colDef)
				{
					var document = $document[0];

					if (!!document.activeElement && !!document.activeElement.className && document.activeElement.className.indexOf('ui-grid-focuser') !== -1)
					{
						$scope.gridApi.cellNav.scrollToFocus(rowEntity, colDef);
						console.log("Restoring focus");
					}
					else
						console.log("NOT restoring focus");
				}

				$scope.expandPreviousRows = function expandPreviousRows(items)
				{
					$timeout(function () {
						//Level 1 items
						for (var j = 0; j < _expandedRows.level1.length; j++) {
							var id = _expandedRows.level1[j];
							var length = $scope.gridOptions.data.length;
							for (var i = 0; i < length; i++) {
								if ($scope.gridOptions.data[i].level === 1 && $scope.gridOptions.data[i].id === id) {
									var item = items[id];
									$scope.expandRowData(item, $scope.gridOptions.data[i], i);

									break;
								}
							}
						}

						//Level 2 items
						for (var j = 0; j < _expandedRows.level2.length; j++) {
							var id = _expandedRows.level2[j];
							var length = $scope.gridOptions.data.length;
							for (var i = 0; i < length; i++) {
								if ($scope.gridOptions.data[i].level === 2 && $scope.gridOptions.data[i].id === id) {
									var item = items[id];
									$scope.expandRowData(item, $scope.gridOptions.data[i], i);

									break;
								}
							}
						}

						//Scroll to previous possition
						if (_gridScrollTop) {
							$timeout(function () {
								$('#collectionPageGrid .ui-grid-viewport').scrollTop(_gridScrollTop);
							}, 1);
						}

						//Remove loading animation
						$scope.showLoadingAnimation = false;
					}, 1);
				};

				$scope.getOpenTabLink = function (id, documentType) {
					if (documentType) {
						return '/OMWebiSearch/Collection/Editor/Index/' + id;
					}

					return OMWClientContext.GetFullUrl('Story/EditStory/Index/' + id);
				};

				$scope.restoreCellFocus = function (fieldId, rowData)
				{
					var columnName = 'Column_' + fieldId;
					for (var i = 0; i < $scope.columnDefs.length; i++)
					{
						var colDef = $scope.columnDefs[i];
						if (colDef.name === columnName)
						{
							if (i > 0)
								scrollToFocus(rowData, $scope.columnDefs[0]);
							else
								scrollToFocus(rowData, $scope.columnDefs[1]);

							scrollToFocus(rowData, colDef);
							break;
						}
					}
				};

				$scope.editField = function (fieldId, rowData, fieldValue, $event)
				{
					var editorType = CollectionColumnsSvc.getColumnEditorType($scope.columns, fieldId);
					if (editorType === 2 || editorType === 3) // eOMFieldDisplayType_Combo or eOMFieldDisplayType_List
					{
						var data = {
							item: {
								Value: fieldValue.value
							},
							collectionId: $scope.collectionId,
							lineElementId: rowData.id,
							parentId: getParentId(rowData),
							recordId: rowData.recordId,
							fieldId: fieldId,
							splitter: ';',
							dontSendUpdateEvent: true
						};

						var rowId = rowData.id;

						var popUp = editorType === 2 ? OMWListFieldDialogSingleSvc.InitPopUp('collection_editor') : OMWListFieldDialogSvc.InitPopUp('collection_editor');
						popUp.open(data, function (result)
						{
							restoreGridFocus(fieldId, rowId);

							var deferred = $q.defer();

							var _data = angular.copy(data);
							_data.newValue = result;

							$http.post('/OMWebiSearch/Collection/Editor/SetRecordField', _data)
								.then(function (response)
								{
									var rowEntity = findRowEntityById(rowId);
									if (!!rowEntity)
										rowEntity['Column_' + fieldId].value = result; // TODO: remove underscore

									deferred.resolve(response.data);
								}, function (response)
								{
									alert('Error while updating value');
									deferred.reject(response.status);
								});

							return deferred.promise;
						}, undefined,
							function()
							{
								restoreGridFocus(fieldId, rowId);
							}
						);
					}
					else
					{
						var data = {
							collectionId: $scope.collectionId,
							lineElementId: rowData.id,
							parentId: getParentId(rowData),
							recordId: rowData.recordId,
							fieldId: fieldId,
							value: fieldValue.value
						};

						editFieldPopUp.open(data,
							{
								width: $event.target.clientWidth
							},
							$event,
							function(result)
							{
								fieldValue.value = result;
							});
					}
				};

				var getParentId = function (row) {

					if (row.level < 2) {
						return '';
					}

					var position = CollectionSvc.findRecordById($scope.gridOptions.data, row.id);

					while (position > -1 && $scope.gridOptions.data[position].level > row.level) {
						if ($scope.gridOptions.data[position].level === row.level + 1) {
							return $scope.gridOptions.data[position].id;
						}
						position--;
					}

					return '';
				}

				$scope.rowClick = function rowClick(row, $event) {
					$event.stopPropagation();

					$rootScope.$broadcast('gridContextMenuShownEvent');

					$scope.selectRow(row.entity);
				};

				$scope.selectRow = function (rowData)
				{
					if ($scope.selectedRow) {
						delete $scope.selectedRow.selected;
					}
					rowData.selected = true;
					$scope.selectedRow = rowData;

					//Show selected row in right preview pane
					OMWClientContext.CollectionRightPanelLoadData($scope.selectedRow.id);
				};

				function collapseRow(rowData, index) {
					rowData.showLoadingAnimation = true;

					//Remove all rows and collapse this row
					var startingLevel = rowData.level;
					var i = index + 1;
					while ($scope.gridOptions.data[i] && $scope.gridOptions.data[i].level > startingLevel) {
						$scope.gridOptions.data.splice(i, 1);
					}

					rowData.isExpanded = false;
					rowData.showLoadingAnimation = false;
				}

				$scope.expandRow = function expandRow(rowData, index, $event) {
					if (!!$event) {
						$event.stopPropagation();
					}

					var expandedRowData = {
						rowData: rowData,
						index: index
					};

					var level = rowData.level;

					if (rowData.isExpanded) {
						//Remove all rows and collapse this row
						collapseRow(rowData, index);
						_expandedRows['level' + level].splice(_expandedRows['level' + level].indexOf(rowData.id), 1);
					}
					else {
						rowData['showLoadingAnimation' + level] = true;

						var data = {
							subCollection: rowData.id.toString(),
							templateId: '',
							collectionId: $scope.collectionId
						};

						$http.post('/OMWebiSearch/Collection/Editor/ContentsDataLevel', data).then(function (data) {

							//Parse returned data
							var items = data.data.items;

							$scope.expandRowData(items, rowData, index);

							_expandedRows['level' + level].push(rowData.id);
						}, function (err) {
							console.log(err);
						}).finally(function () {
							rowData['showLoadingAnimation' + level] = false;
						});
					}
				};

				$scope.expandRowData = function (items, rowData, index) {

					var rowGroupIndicator1 = rowData.groupIndicator_1;
					var rowGroupIndicator2 = rowData.groupIndicator_2;

					//Parse as next level
					var newData = $scope.parseData(items, rowData.level + 1);

					//Update previous row groups ?
					if (rowGroupIndicator1 && (rowGroupIndicator1 === 'start_group' || rowGroupIndicator1 === 'group')) {
						for (var i = 0; i < newData.length; i++) {
							newData[i].groupIndicator_1 = 'group';
						}
					}

					if (rowData.level == 2 && rowGroupIndicator2 && (rowGroupIndicator2 === 'start_group' || rowGroupIndicator2 === 'group')) {
						for (var i = 0; i < newData.length; i++) {
							newData[i].groupIndicator_2 = 'group';
						}
					}

					$scope.gridOptions.data.splice.apply($scope.gridOptions.data, [index + 1, 0].concat(newData));
					rowData.isExpanded = true;
				}

				$scope.goToTop = function () {
					$scope.gridApi.core.scrollTo($scope.gridOptions.data[0], $scope.gridOptions.columnDefs[0]);
				};

				$scope.goToBottom = function () {
					$scope.gridApi.core.scrollTo($scope.gridOptions.data[$scope.gridOptions.data.length - 1], $scope.gridOptions.columnDefs[0]);
				};

				$scope.getIcon = function getIcon(templateId) {
					return OMWClientContext.GetFullUrl('Content/RecordIcons/RecordIcon1.png');
				};

				$scope.getFullUrl = function(url)
				{
					return OMWClientContext.GetFullUrl(url);
				}

				$scope.gridOptions = {
					enableColumnResizing: true,
					enableColumnMenus: false,
					enableSorting: false,
					multiSelect: false,
					columnDefs: $scope.columnDefs,
					rowTemplate: CollectionSvc.rowTemplate,
					showGridFooter: true,
					gridFooterTemplate: CollectionSvc.footerTemplate,
					enableCellEdit: false,
					cellEditableCondition: function($gridScope)
					{
						return true;
					},
					editableCellTemplate: '<div class="ng-scope grid-cell-edit">\
												<form class="ng-pristine ng-valid">\
													<input type="text" ui-grid-editor ng-model="MODEL_COL_FIELD.value" class="ng-pristine ng-untouched ng-valid ng-scope">\
												</form>\
											</div>'
				};

				$scope.updateRecords = function updateRecords(encodedId, records) {

					for (var i = 0, length = records.length; i < length; i++) {
						var position = CollectionSvc.findRecordById($scope.gridOptions.data, records[i].id);

						//Hardcoded so it can update every time third row no matter what is the ID
						position = 2;

						if (position > -1) {
							var item = CollectionSvc.parseItem(records[i], $scope.gridOptions.data[position].level);
							item.isChanged = true;

							//Hardcoding records that are updated
							item.updateRecords = ['Column_2'];

							$scope.gridOptions.data[position].groupIndicator = CollectionSvc.findGroupIndicator(item, $scope.gridOptions.data, position);

							$scope.gridOptions.data[position].Column_2.value = 'TEST';
							$scope.gridOptions.data[position].updateRecords = item.updateRecords;
							$scope.gridOptions.data[position].isChanged = true;

							//$scope.gridOptions.data[position] = item;
						}
					}
					$scope.$apply();
				};

				$scope.addRecords = function addRecords(encodedId, insertBeforeRecordId, records, skipRecordsTransformation) {
					var position = CollectionSvc.findRecordById($scope.gridOptions.data, insertBeforeRecordId);
					var level = $scope.gridOptions.data[position].level;

					var recordsData = records;
					if (!skipRecordsTransformation) {
						recordsData = $scope.parseData(records, level);
					}
					//For animation
					for (var i = 0, length = recordsData.length; i < length; i++) {
						recordsData[i].isChanged = true;
					}

					$scope.gridOptions.data.splice.apply($scope.gridOptions.data, [position, 0].concat(recordsData));
					$scope.$apply();
				};

				$scope.deleteRecords = function deleteRecords(encodedId, arrayOfRecordId, skipAnimation) {
					for (var i = 0, length = arrayOfRecordId.length; i < length; i++) {
						var index = CollectionSvc.findRecordById($scope.gridOptions.data, arrayOfRecordId[i]);
						if (index > -1) {
							//Check if row at this index is expanded and if yes delete all items under
							var row = $scope.gridOptions.data[index];
							collapseRow(row, index);
							//Remove this row
							$scope.gridOptions.data.splice(index, 1);
						}
					}
					$scope.$apply();
				};

				$scope.moveRecords = function moveRecords(encodedId, arrayOfRecordId, insertBeforeRecordId) {
					var insertBeforeIndex = CollectionSvc.findRecordById($scope.gridOptions.data, insertBeforeRecordId);

					for (var i = 0, length = arrayOfRecordId.length; i < length; i++) {
						var index = CollectionSvc.findRecordById($scope.gridOptions.data, arrayOfRecordId[i]);
						if (index > -1) {
							//Check if row at this index is expanded and if yes delete all items under
							var row = $scope.gridOptions.data[index];
							collapseRow(row, index);

							row.isChanged = true;
							//Move row to some other index
							$scope.gridOptions.data.splice(index - 1, 0, row);

							//Remove this row
							$scope.gridOptions.data.splice(index, 1);
						}
					}
					$scope.$apply();

				};

				$scope.getSelectedItemHirarchy = function getSelectedItemHirarchy(records) {
					return CollectionSvc.getSelectedItemHirarchy(records, $scope.selectedRow);
				};

				$scope.refreshGridData = function refreshGridData() {

					_gridScrollTop = $('#collectionPageGrid .ui-grid-viewport').scrollTop();

					var expandedRowsIds = [];
					for (var i = 0; i < _expandedRows.level1.length; i++) {
						expandedRowsIds.push(_expandedRows.level1[i]);
					}
					for (var i = 0; i < _expandedRows.level2.length; i++) {
						expandedRowsIds.push(_expandedRows.level2[i]);
					}

					//Expand previously expanded rows
					$scope.initData(expandedRowsIds);
				};

				$scope.askUser = function askUser(items, info) {
					$scope.askUserContextMenu.items = items;
					$scope.showAskUserContextMenu = true;
				};

				$scope.userSelectedOption = function userSelectedOption(option) {
					$scope.showAskUserContextMenu = false;
					alert(option);
				};

				var move = function (from, to) {
					/*jshint validthis: true */
					this.splice(to, 0, this.splice(from, 1)[0]);
				};

				function getFieldId(colDef)
				{
					return colDef.name.replace('Column_', '');
				}

				function getFieldValue(rowEntity, colDef, isForUpdate)
				{
					var value = rowEntity[colDef.name].value;;

					if (isForUpdate)
					{
						var fieldId = getFieldId(colDef);
						if (CollectionColumnsSvc.isDateTimeColumn($scope.columns, fieldId))
						{
							if (value instanceof Date)
								return value.toISOString();
						}
						else if (CollectionColumnsSvc.isCheckbBoxColumn($scope.columns, fieldId))
						{
							var onState = CollectionColumnsSvc.getCheckBoxOnState($scope.columns, fieldId);
							var offState = CollectionColumnsSvc.getCheckBoxOffState($scope.columns, fieldId);
							if (!!onState && !!offState)
							{
								if (value == 1 || value == true || value === onState.str)
									return 1;
								else if (value == 0 || value == false || value === offState.str)
									return 0;

								return value;
							}
						}
					}

					return value;
				}

				function setFieldValue(rowEntity, colDef, value)
				{
					rowEntity[colDef.name].value = value;

					$scope.$apply();
				}

				function lockField(rowEntity, colDef, onSuccess, onError)
				{
					var data = {
						collectionId: $scope.collectionId,
						entityId: rowEntity.id,
						fieldId: getFieldId(colDef)
					};

					postData('LockCollectionField', data, onSuccess, onError);
				}

				function unlockField(rowEntity, colDef, onSuccess, onError)
				{
					var data = {
						collectionId: $scope.collectionId,
						entityId: rowEntity.id,
						fieldId: getFieldId(colDef)
					};

					postData('UnlockCollectionField', data, onSuccess, onError);
				}

				function updateField(rowEntity, colDef, onSuccess, onError)
				{
					var data = {
						item: {
							Value: getFieldValue(rowEntity, colDef, true)
						},
						collectionId: $scope.collectionId,
						lineElementId: rowEntity.id,
						parentId: getParentId(rowEntity),
						recordId: rowEntity.recordId,
						fieldId: getFieldId(colDef),
						splitter: ';',
						dontSendUpdateEvent: true
					};

					postData('SetRecordField', data, onSuccess, onError);
				}

				function postData(action, data, successCallback, errorCallback)
				{
					$.ajax({
						type: 'POST',
						url: OMWClientContext.GetFullUrl('Collection/Editor/' + action),
						data: data,
						success: function(response)
						{
							if (response.status === 'OK')
							{
								if (!!successCallback)
									successCallback();	
							}
							else
							{
								if (!!errorCallback)
									errorCallback();
							}
						},
						error: function(xhr, textStatus, error)
						{
							if (!!errorCallback)
								errorCallback();
						}
					});
				}

				function focusGrid(grid)
				{
					var focuser = grid.find(".ui-grid-focuser");
					if (focuser.length > 1)
					{
						focuser = focuser[1];

						if (!!document.activeElement)
						{
							var activeElement = angular.element(document.activeElement);
							activeElement = activeElement.closest(".ui-grid-viewport");
							if (activeElement.length === 0)
								focuser.focus();
						}
						else
						{
							focuser.focus();
						}
					}
				}

				$scope.gridOptions.onRegisterApi = function (gridApi)
				{
					$scope.gridApi = gridApi;

					var grid = angular.element('#collectionPageGrid');
					grid.on("click",
						".ui-grid-viewport", function(e)
						{
							focusGrid(grid);
						}).on("mousedown", ".ui-grid-viewport",
						function()
						{
							focusGrid(grid);
						});

					gridApi.cellNav.on.navigate($scope, function (newRowCol, oldRowCol)
					{
						$rootScope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);

						$scope.selectRow(newRowCol.row.entity);

						hideContextMenu();
					});

					gridApi.cellNav.on.viewPortKeyDown($scope,
						function($event, newRowCol)
						{
							var columnName = newRowCol.col.colDef.name;
							var fieldId = columnName.indexOf('Column_') !== -1 ? columnName.replace('Column_', '') : null;

							var editorType = CollectionColumnsSvc.getColumnEditorType($scope.columns, fieldId);

							if ($scope.isCellEditing)
							{
								if ($event.keyCode === 32) // space
								{
									if (editorType === 4) // eOMFieldDisplayType_Check
									{
										$event.preventDefault();
										var field = newRowCol.row.entity[newRowCol.col.field];
										field.value = field.value == 1 ? 0 : 1;
									}
								}
								else if ($event.keyCode === 13) // enter
								{
									$rootScope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);
								}
								else if ($event.keyCode === 27) // escape
								{
									$rootScope.$broadcast(uiGridEditConstants.events.CANCEL_CELL_EDIT);
								}
							}
							else
							{
								if ($event.keyCode === 13 || $event.keyCode === 113) // enter or F2
								{
									if (CollectionColumnsSvc.isColumnReadOnly($scope.columns, fieldId))
										return;

									if (!!fieldId)
									{
										$event.stopPropagation();
										$event.preventDefault();
										if (editorType === 2 || editorType === 3) // eOMFieldDisplayType_Combo or eOMFieldDisplayType_List
											$scope.editField(fieldId, newRowCol.row.entity, newRowCol.row.entity[columnName], $event);
										else
											$rootScope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
									}
									else
									{
										if (columnName === '_')
										{
											$scope.expandRow(newRowCol.row.entity, $scope.gridOptions.data.indexOf(newRowCol.row.entity), $event);
										}
									}
								}
								else if ($event.keyCode === 32) // space
								{
									if (CollectionColumnsSvc.isColumnReadOnly($scope.columns, fieldId))
										return;

									if (editorType === 4) // eOMFieldDisplayType_Check
									{
										$event.preventDefault();

										var field = newRowCol.row.entity[newRowCol.col.field];
										$scope.toggleCheckboxValue(newRowCol.row.entity, newRowCol.col, field, fieldId);
									}
								}
								else if ($event.keyCode === 37 && $event.ctrlKey) // ctrl + left-arrow
								{
									$event.stopPropagation();
									if (newRowCol.row.entity.isExpanded)
									{
										$timeout(function()
										{
											$scope.expandRow(newRowCol.row.entity, $scope.gridOptions.data.indexOf(newRowCol.row.entity), $event);
										});
									}
								}
								else if ($event.keyCode === 39 && $event.ctrlKey) // ctrl + right-arrow
								{
									$event.stopPropagation();
									if (!newRowCol.row.entity.isExpanded)
									{
										$timeout(function()
										{
											$scope.expandRow(newRowCol.row.entity, $scope.gridOptions.data.indexOf(newRowCol.row.entity), $event);
										});
									}
								}
							}
						});

					//Refresh for problem with resize
					angular.element($window).bind('resize', function () {
						$scope.gridApi.core.handleWindowResize();
					});

					gridApi.draggableRows.on.rowDragged($scope, function (info, dropTarget) {
						info.e.dataTransfer.setData("text/plain", JSON.stringify(info.draggedRowEntity));
					});

					gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {

						$scope.showLoadingAnimation = true;

						var startPosition = info.fromIndex;
						var endPosition = info.toIndex;

						var rowData = JSON.parse(info.e.dataTransfer.getData('text/plain'));

						var data = {
							sourceCollectionId: rowData.collectionId,
							sourceRecordId: rowData.id,
							sourceLevel: rowData.level,
							sourceTemplateId: rowData.templateId,
							sourceObjectId: rowData.objectId,

							targetCollectionId: $scope.gridOptions.data[info.toIndex].collectionId,
							targetRecordId: $scope.gridOptions.data[info.toIndex].id,
							targetLevel: $scope.gridOptions.data[info.toIndex].level,
							targetTemplateId: $scope.gridOptions.data[info.toIndex].templateId,
							targetObjectId: $scope.gridOptions.data[info.toIndex].id, //id is ID.EncodedID, see OMW_Collection_service.js parseItem()

							//Test
							response: 2,
							ctrlPressed: info.e.ctrlKey
						};

						if (data.sourceCollectionId !== data.targetCollectionId)
						{
							$http.post('/OMWebiSearch/Collection/Editor/CollectionRecordDNDNew', data).then(function (response) {
								console.log(response);

								if (response.data.status === "fail") {
									alert(response.data.error);
								}
								else if (response.data.status === "ask") {
									//Ask user 
									$scope.askUser(response.data.options, info);
								}
								else {
									$scope.refreshGridData();
								}

							}).finally(function () {
								$scope.showLoadingAnimation = false;
							});
						}
						else {
							//Same collection
							if (info.e.dataTransfer.dropEffect === 'move') {
								$http.post('/OMWebiSearch/Collection/Editor/CollectionRecordDNDMove', data).then(function (response) {
									if (response.data.status === "fail") {

										//No need to return to previous state as we didnt change state at all
										////Return to previous state
										//returnToPreviousState(startPosition, endPosition, rowData);
										alert(response.data.error);
									}
									else {
										//Move row
										move.apply($scope.gridOptions.data, [info.fromIndex, info.toIndex]);
									}
								}, function (error) {
									//No need to return to previous state as we didnt change state at all
									//returnToPreviousState(startPosition, endPosition, rowData);
									alert(error);
								}).finally(function () {
									$scope.showLoadingAnimation = false;
								});
							}
							else if (info.e.dataTransfer.dropEffect === 'copy') {

								$http.post('/OMWebiSearch/Collection/Editor/CollectionRecordDNDCopy', data).then(function (response) {
									if (response.data.status === "fail") {
										//Return to previous state
										alert(response.data.error);
									}
									else {
										//Create new element in endPosition
										console.log($scope.gridOptions.data[endPosition]);
										var id = $scope.gridOptions.data[endPosition].id;
										$scope.addRecords('', id, [response.data.record], false);
									}
								}, function (error) {
									alert(error);
								}).finally(function () {
									$scope.showLoadingAnimation = false;
								});
							}
						}

					});

					gridApi.draggableRows.on.rowEnterRow($scope, function (info, rowElement) {
						//Check if drop is allowed
						var allowed = $scope.dragAllowed(info.draggedRow, rowElement);
						if (allowed) {
							angular.element(rowElement).removeClass('dropNotAllowed');
							if (info.removeDropEffect) {
								info.removeDropEffect();
							}
						}
						else {
							info.setDropEffect('none');
							angular.element(rowElement).addClass('dropNotAllowed');
						}
					});
					gridApi.draggableRows.on.rowLeavesRow($scope, function (info, rowElement) {
						//Remove class
						angular.element(rowElement).removeClass('dropNotAllowed');
					});

					var oldValue;
					var isCancelled;

					gridApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef)
					{
						ServerUpdates.suspendPolling();

						$rootScope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);

						oldValue = getFieldValue(rowEntity, colDef);
						lockField(rowEntity, colDef, function()
						{
							isCancelled = false;
							$scope.isCellEditing = true;
						}, function ()
						{
							isCancelled = true;
							$scope.isCellEditing = false;

							$rootScope.$broadcast("uiGridEventEndCellEdit");

							alert('Error locking field');
						});
					});

					gridApi.edit.on.cancelCellEdit($scope, function (rowEntity, colDef)
					{
						unlockField(rowEntity, colDef);

						$scope.isCellEditing = false;
						$rootScope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);

						setFieldValue(rowEntity, colDef, oldValue);

						oldValue = undefined;
						isCancelled = false;
					});

					gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue)
					{
						ServerUpdates.enablePolling();

						$scope.isCellEditing = false;

						if (!isCancelled)
						{
							if (CollectionColumnsSvc.isDurationColumn($scope.columns, getFieldId(colDef)) && newValue.value === undefined)
							{
								setFieldValue(rowEntity, colDef, oldValue);
								return;
							}

							updateField(rowEntity,
								colDef,
								function ()
								{
									unlockField(rowEntity, colDef);
								},
								function ()
								{
									alert('Error updating field');
									unlockField(rowEntity, colDef);

									setFieldValue(rowEntity, colDef, oldValue);
								});
						}

						isCancelled = false;
					});

					$scope.$watch('gridApi.grid.isScrollingVertically', function watchFunc(newData) {
						angular.element('body').find('.grid-item-context-menu').hide();
					});
				};

				function returnToPreviousState(startPosition, endPosition, rowData) {

					$scope.gridOptions.data.splice(endPosition, 1);
					$scope.gridOptions.data.splice(startPosition, 0, rowData);
				}

				$scope.dragAllowed = function dragAllowed(draggedLine, draggedOverLine) {

					if ($(draggedOverLine).attr('droppable') == 'false') {
						return false;
					}

					return true;

					//var seconds = new Date().getSeconds();
					//return seconds % 2 === 0;
				};


				//First column context menu

				$scope.rowIsChecked = function (rowData, $event) {
					$event.stopPropagation();

					if (rowData.isChecked) {
						firstColumnRows.checkedRows.push(rowData.id);
					}
					else {
						firstColumnRows.checkedRows.splice(firstColumnRows.checkedRows.indexOf(rowData.id), 1);
					}
				};

				var firstColumnGroupItems = function () {
					var data = {
						id: $scope.collectionId,
						items: firstColumnRows.checkedRows
					};
					$http.post('/OMWebiSearch/Collection/Editor/FirstColumnGroupItems', data).then(function (data) {
						$scope.refreshGridData();
					}, function (error) {
						alert(error);
					});
				};
				var firstColumnUngroupItems = function () {
					var data = {
						id: $scope.collectionId,
						items: firstColumnRows.checkedRows
					};
					$http.post('/OMWebiSearch/Collection/Editor/FirstColumnUngroupItems', data).then(function (data) {
						$scope.refreshGridData();
					}, function (error) {
						alert(error);
					});
				};

				var checkedRowsExist = function () {
					return firstColumnRows.checkedRows.length > 0;
				};

				FirstColContextMenuSvc.setMenuItems([
						{ id: 'group', text: 'Group', func: firstColumnGroupItems, checkIfEnabled: checkedRowsExist },
						{ id: 'ungroup', text: 'Ungroup', func: firstColumnUngroupItems, checkIfEnabled: checkedRowsExist },
						{ id: '-', text: '' },
						{ id: 'refresh', text: 'Refresh', func: $scope.refreshGridData }
				]);

				$scope.undoHeaderField = function (fieldId) {
					var popUp = UndoDialogSvc.InitPopUp();
					popUp.open({
						fieldId: fieldId,
						id: $scope.collectionId
					}, function (result) {
						console.log(result);
					});
				};

				$scope.clearHeaderField = function (fieldId)
				{
					if (!!fieldId)
					{
						var parentScope = angular.element('#headerSearchController').scope();

						var position = OMWClientContext.HeaderSearch.findElementPosition(parentScope.fieldsList, 'Key', fieldId);
						if (position != null) {
							
							var element = parentScope.updateElement(fieldId, null, position);

							//console.log(dateFormat);
							//OMWClientContext.HeaderSearch.updateDateElementValue(currentId, date, dateFormat);

							//Event to server
							if (!!element)
								OMWClientContext.HeaderSearch.updateElementValue(fieldId, null);
						}
					}
				};

				$scope.isClearEnabled = function (fieldId)
				{
					if (!!fieldId) {
						var element = angular.element("header-field-context-menu[field-id=" + fieldId + "]");
						if (element.length > 0)
						{
							var children = element.parent().children(":not([field-id=" + fieldId + "])");
							var readonly = children.find("*[disabled]");
							if (readonly.length === 0)
								return true;
						}
					}

					return false;
				};

				HeaderFieldContextMenuSvc.setMenuItems([
					{ id: 'undo', text: 'Undo', func: $scope.undoHeaderField },
					{ id: 'clear', text: 'Clear', func: $scope.clearHeaderField, checkIfEnabled: $scope.isClearEnabled }
				]);

				var copyAsPopUp = CopyAsDialogSvc.InitPopUp();

				$scope.getContextMenuItems = function (id, rowData) {
					var items = [{
						id: 'open_in_new_tab',
						text: 'Open in new Tab',
						icon: 'http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png',
						func: function (selectedItem) {
							OMWClientContext.OpenStoryInNewTab(id, rowData.documentType);
						},
						checkIfEnabled: function () { return true; }
					}, {
						id: 'copy_as_item',
						text: 'Copy As',
						icon: 'http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png',
						func: function (selectedItem) {
							copyAsPopUp.open({
								id: id
							}, function (result) {
								console.log(result);
							});
						}
					}];

					return items;
				};

				$scope.getIndexOfSelectedRow = function () {
					if (!$scope.selectedRow) {
						return -1;
					}

					var length = $scope.gridOptions.data.length;
					for (var i = 0; i < length; i++) {
						if ($scope.gridOptions.data[i].selected) {
							return i;
						}
					}
					return -1;
				};

				$scope.goUp = function () {
					//Get current index
					var index = $scope.getIndexOfSelectedRow();
					if (index < 1) {
						return;
					}

					index = index - 1;

					//Select previous one
					$scope.selectRow($scope.gridOptions.data[index]);
				};

				$scope.goDown = function () {
					//Get current index
					var index = $scope.getIndexOfSelectedRow();
					if (index < 0 || index > $scope.gridOptions.data.length - 2) {
						return;
					}

					index = index + 1;

					//Select next one
					$scope.selectRow($scope.gridOptions.data[index]);
				};

				$scope.leftKey = function () {
					//Get current index
					var index = $scope.getIndexOfSelectedRow();
					if (index < 0) {
						return;
					}

					//Collapse row
					if ($scope.gridOptions.data[index].isExpanded) {
						var rowData = $scope.gridOptions.data[index];
						collapseRow(rowData, index);
						_expandedRows['level' + level].splice(_expandedRows['level' + level].indexOf(rowData.id), 1);
					}
				};

				$scope.rightKey = function () {
					//Get current index
					var index = $scope.getIndexOfSelectedRow();
					if (index < 0) {
						return;
					}

					//Expand row
					if ($scope.gridOptions.data[index].hasSubitems && !$scope.gridOptions.data[index].isExpanded) {
						$scope.expandRow($scope.gridOptions.data[index], index);
					}
				};

				$scope.eventFunctions = {
					'37': $scope.leftKey,
					'38': $scope.goUp,
					'39': $scope.rightKey,
					'40': $scope.goDown
				};

				$scope.getStoryUrl = function (id, row) {
					//console.log(row)
					//if (!row.supportOpen) {
					//    return '#';
					//}

					if (row.documentType) {
						return '/OMWebiSearch/Collection/Editor/Index/' + id;
					}
					return OMWClientContext.GetFullUrl('Story/EditStory/Index/' + id);
				};

				$scope.getContextMenuStyles = function ()
				{
					if (!$scope.menuVisible)
						return { };

					var el = angular.element("#internal_link_" + menuRowIndex + "_" + menuColumnIndex);
					if (el.length > 0)
					{
						el = el[0];
						var left = el.offsetLeft;
						var top = el.offsetTop + el.clientHeight + 40;

						var viewport = angular.element(".ui-grid-viewport");

						left -= viewport.scrollLeft();
						top -= viewport.scrollTop();

						return {
							left: left + "px",
							top: top + "px"
						};
					}
				};

				function recurseGetScrollOffset(element)
				{
					var parent = element.parent();
					if (parent.length > 0)
						return element.scrollTop() + recurseGetScrollOffset(parent);

					return element.scrollTop();
				}

			}]);

})();



/**
 * Test functions
 */
function getSelectedItemHier() {
	var scope = $('#collectionPage').scope();
	var res = scope.getSelectedItemHirarchy(scope.gridOptions.data);
	console.log(res);
	return res;
};

function addRow1() {
	$('#collectionPage').scope().addRecords('', 'PDIsMjM3MDksNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==',
[{
	"Fields": [
	{ "FieldID": 2, "FieldValue": { "Value": "/Date(1447777449391)/", "Ticks": 1447781049391, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#163530" }, "DisplayValue": "11/17/2015 5:24:09 PM" },
	{
		"FieldID": 1, "FieldValue": { "Value": "/Date(1447868934491)/", "Ticks": 1447872534491, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#812528" }, "DisplayValue": "11/18/2015 6:48:54 PM"
	},
	{
		"FieldID": 4, "FieldValue": { "Value": 612558645, "ValueType": 2, "IsEmpty": false, "BackgroundColor": "#475543" }, "DisplayValue": "612558645"
	},
	{
		"FieldID": 66, "FieldValue": { "Value": { "Ticks": 14215327830000000, "Days": 16452, "Hours": 22, "Milliseconds": 0, "Minutes": 13, "Seconds": 3, "TotalDays": 16452.925729166665, "TotalHours": 394870.21749999997, "TotalMilliseconds": 1421532783000, "TotalMinutes": 23692213.05, "TotalSeconds": 1421532783 }, "Ticks": 1421532783000, "ValueType": 4, "IsEmpty": false, "BackgroundColor": "#671160" }, "DisplayValue": "16452.22:13:03"
	}],
	"ID": { "PoolID": 2, "PinnID": 23699, "SystemID": "545105ec-63c3-4ff4-9024-e5e60630e069", "EncodedID": "PDIsMjM2OTksNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" },
	"RecordID": 18, "TemplateID": null, "DocumentType": 1, "SupportOpen": false, "HasSubitems": false, "ParentID": "PDIsMjM2ODgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
},
{
	"Fields": [
	{ "FieldID": 2, "FieldValue": { "Value": "/Date(1447777449391)/", "Ticks": 1447781049391, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#163530" }, "DisplayValue": "11/17/2015 5:24:09 PM" },
	{
		"FieldID": 1, "FieldValue": { "Value": "/Date(1447868934491)/", "Ticks": 1447872534491, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#812528" }, "DisplayValue": "11/18/2015 6:48:54 PM"
	},
	{
		"FieldID": 4, "FieldValue": { "Value": 612558645, "ValueType": 2, "IsEmpty": false, "BackgroundColor": "#475543" }, "DisplayValue": "612558645"
	},
	{
		"FieldID": 66, "FieldValue": { "Value": { "Ticks": 14215327830000000, "Days": 16452, "Hours": 22, "Milliseconds": 0, "Minutes": 13, "Seconds": 3, "TotalDays": 16452.925729166665, "TotalHours": 394870.21749999997, "TotalMilliseconds": 1421532783000, "TotalMinutes": 23692213.05, "TotalSeconds": 1421532783 }, "Ticks": 1421532783000, "ValueType": 4, "IsEmpty": false, "BackgroundColor": "#671160" }, "DisplayValue": "16452.22:13:03"
	}],
	"ID": { "PoolID": 2, "PinnID": 23699, "SystemID": "545105ec-63c3-4ff4-9024-e5e60630e069", "EncodedID": "PDIsMjM2OTksNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" },
	"RecordID": 18, "TemplateID": null, "DocumentType": 1, "SupportOpen": false, "HasSubitems": false, "ParentID": "PDIsMjM2ODgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
}], false);
}

function addRow3() {
	$('#collectionPage').scope().addRecords('', 'PDIsMjM3MDcsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==',
[{
	"Fields": [
	{ "FieldID": 2, "FieldValue": { "Value": "/Date(1447777449391)/", "Ticks": 1447781049391, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#163530" }, "DisplayValue": "11/17/2015 5:24:09 PM" },
	{
		"FieldID": 1, "FieldValue": { "Value": "/Date(1447868934491)/", "Ticks": 1447872534491, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#812528" }, "DisplayValue": "11/18/2015 6:48:54 PM"
	},
	{
		"FieldID": 4, "FieldValue": { "Value": 612558645, "ValueType": 2, "IsEmpty": false, "BackgroundColor": "#475543" }, "DisplayValue": "612558645"
	},
	{
		"FieldID": 66, "FieldValue": { "Value": { "Ticks": 14215327830000000, "Days": 16452, "Hours": 22, "Milliseconds": 0, "Minutes": 13, "Seconds": 3, "TotalDays": 16452.925729166665, "TotalHours": 394870.21749999997, "TotalMilliseconds": 1421532783000, "TotalMinutes": 23692213.05, "TotalSeconds": 1421532783 }, "Ticks": 1421532783000, "ValueType": 4, "IsEmpty": false, "BackgroundColor": "#671160" }, "DisplayValue": "16452.22:13:03"
	}],
	"ID": { "PoolID": 2, "PinnID": 23699, "SystemID": "545105ec-63c3-4ff4-9024-e5e60630e069", "EncodedID": "PDIsMjM2OTksNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" },
	"RecordID": 18, "TemplateID": null, "DocumentType": 1, "SupportOpen": false, "HasSubitems": false, "ParentID": "PDIsMjM2ODgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
},
{
	"Fields": [
	{ "FieldID": 2, "FieldValue": { "Value": "/Date(1447777449391)/", "Ticks": 1447781049391, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#163530" }, "DisplayValue": "11/17/2015 5:24:09 PM" },
	{
		"FieldID": 1, "FieldValue": { "Value": "/Date(1447868934491)/", "Ticks": 1447872534491, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#812528" }, "DisplayValue": "11/18/2015 6:48:54 PM"
	},
	{
		"FieldID": 4, "FieldValue": { "Value": 612558645, "ValueType": 2, "IsEmpty": false, "BackgroundColor": "#475543" }, "DisplayValue": "612558645"
	},
	{
		"FieldID": 66, "FieldValue": { "Value": { "Ticks": 14215327830000000, "Days": 16452, "Hours": 22, "Milliseconds": 0, "Minutes": 13, "Seconds": 3, "TotalDays": 16452.925729166665, "TotalHours": 394870.21749999997, "TotalMilliseconds": 1421532783000, "TotalMinutes": 23692213.05, "TotalSeconds": 1421532783 }, "Ticks": 1421532783000, "ValueType": 4, "IsEmpty": false, "BackgroundColor": "#671160" }, "DisplayValue": "16452.22:13:03"
	}],
	"ID": { "PoolID": 2, "PinnID": 23699, "SystemID": "545105ec-63c3-4ff4-9024-e5e60630e069", "EncodedID": "PDIsMjM2OTksNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" },
	"RecordID": 18, "TemplateID": null, "DocumentType": 1, "SupportOpen": false, "HasSubitems": false, "ParentID": "PDIsMjM2ODgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
}], false);
}

function updateRows() {
	$('#collectionPage').scope().updateRecords('PDIsMjM3MDcsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==',
[{
	"Fields": [
	{ "FieldID": 8, "FieldValue": { "Value": "TEST", "Ticks": 1447781049391, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#163530" }, "DisplayValue": "TEST" },
	{
		"FieldID": 10, "FieldValue": { "Value": "TEST", "Ticks": 1447872534491, "ValueType": 3, "IsEmpty": false, "BackgroundColor": "#812528" }, "DisplayValue": "TEST"
	},
	{
		"FieldID": 1, "FieldValue": { "Value": 1, "ValueType": 2, "IsEmpty": false, "BackgroundColor": "#475543" }, "DisplayValue": "612558645"
	},
	{
		"FieldID": 4, "FieldValue": { "Value": { "Ticks": 14215327830000000, "Days": 16452, "Hours": 22, "Milliseconds": 0, "Minutes": 13, "Seconds": 3, "TotalDays": 16452.925729166665, "TotalHours": 394870.21749999997, "TotalMilliseconds": 1421532783000, "TotalMinutes": 23692213.05, "TotalSeconds": 1421532783 }, "Ticks": 1421532783000, "ValueType": 4, "IsEmpty": false, "BackgroundColor": "#671160" }, "DisplayValue": "16452.22:13:03"
	}],
	"ID": { "PoolID": 2, "PinnID": 23699, "SystemID": "545105ec-63c3-4ff4-9024-e5e60630e069", "EncodedID": "PDIsMjM3MTAsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" },
	"RecordID": 18, "TemplateID": null, "DocumentType": 1, "SupportOpen": false, "HasSubitems": false, "ParentID": "PDIsMjM2ODgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
}]);
}

function deleteRecords() {
	$('#collectionPage').scope().deleteRecords('PDIsMjM3MDcsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==',
	['PDIsMjM3MDksNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==', 'PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=='], false);
}

function moveRows1() {
	$('#collectionPage').scope().moveRecords('', ['PDIsMjM3MDQsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==', 'PDIsMjM3MDgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==', 'PDIsMjM3MDcsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=='], 'PDIsMjM3MTAsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==');
}

function moveRows2() {
	$('#collectionPage').scope().moveRecords('', ['PDIsMjM3MDgsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==', 'PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=='], 'PDIsMjM3MTAsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==');
}