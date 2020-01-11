(function () {
    'use strict';

	angular.module('omwcSearch')
		.controller('SearchResultsController', [
			'$scope', '$timeout', 'SearchResultsService', '$window', '$rootScope', 'FirstColContextMenuSvc', 'OMWPopUpDialogSvc', 'CopyAsDialogSvc',
			function($scope, $timeout, SearchResultsService, $window, $rootScope, FirstColContextMenuSvc, OMWPopUpDialogSvc, CopyAsDialogSvc)
			{
				var firstColumnRows = {
					checkedRows: []
				};

				///////////////////////////////////
				//TEST FOR POP UP
				///////////////////////////////////
				window.popUp1 = function()
				{
					var _columns1 = [{ ID: 1, title: "First Column", width: 250 }, { ID: 2, title: "Column2", width: 200 }, { ID: 3, title: "Column3", width: 400 }, { ID: 5, title: "Column5", width: 200 }];
					var popUp1 = OMWPopUpDialogSvc.InitPopUp(true, true, _columns1);
					var _data1 = [
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "any 1", values: [{ ID: 1, value: "Value 1.1" }, { ID: 5, value: "Value 1.5" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "2. Not presented in GUI", values: [{ ID: 1, value: "Value 2.1" }, { ID: 5, value: "Value 2.5" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any 3", values: [{ ID: 2, value: "Value 2.2" }, { ID: 3, value: "Value 3.2" }, { ID: 5, value: "Value 5.2" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "4", values: [{ ID: 2, value: "Value 2.3" }, { ID: 3, value: "Value 3.3" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "5 any ", values: [{ ID: 2, value: "Value 2.4" }, { ID: 5, value: "Value 2.5" }, { ID: 5, value: "Value 5.4" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any 6", values: [{ ID: 1, value: "Value 6.1" }, { ID: 2, value: "Value 2.2" }, { ID: 3, value: "Value 3.2" }, { ID: 5, value: "Value 5.2" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/11.png", data: "7", values: [{ ID: 1, value: "Value 7.1" }, { ID: 2, value: "Value 2.3" }, { ID: 3, value: "Value 3.3" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "8 any ", values: [{ ID: 1, value: "Value 8.1" }, { ID: 2, value: "Value 2.4" }, { ID: 5, value: "Value 2.5" }, { ID: 5, value: "Value 5.4" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png", data: "9 data", values: [{ ID: 1, value: "Value 9.1" }, { ID: 2, value: "Value 2.5" }, { ID: 3, value: "Value 3.5" }, { ID: 5, value: "Value 5.5" }] }
					];
					var _cb1 = function(selected)
					{
						alert(selected);
					};
					popUp1.open(_data1, _cb1);
				}
				window.popUp2 = function()
				{
					var _firstColumnIcon = false;
					var _contentPopUp = false;
					var _columns = [{ ID: 1, title: "Column1", width: 100 }, { ID: 5, title: "Column5", width: 200 }];
					var popUp = OMWPopUpDialogSvc.InitPopUp(_firstColumnIcon, _contentPopUp, _columns);
					var _data = [
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/search-icon-20x20.png", data: "any type of string. Not presented in GUI", values: [{ ID: 1, value: "Value 1.1" }, { ID: 5, value: "Value 1.5" }] },
						{ icon: "http://localhost:12459/OMWebiSearch/Content/Images/icon_example_32.png", data: "any type of other string. Not presented in GUI", values: [{ ID: 1, value: "Value 2.1" }, { ID: 5, value: "Value 2.5" }] }
					];
					var _cb = function(selected)
					{
						alert(selected);
					};
					popUp.open(_data, _cb);
				}
				///////////////////////////////////

				$scope.carouselIndex = 0;
				$scope.totalSearchHits = 0;
				$scope.searchResults = [];
				$scope.columnDefs = SearchResultsService.getColumns(notifyReadItems);
				$scope.searchModel = {
					PageNumber: 0,
					PageSize: 20
				};
				$scope.selectedRow = {};
				$scope.gridApi = {};
				$scope.defaultPreviewRowHeight = 30;

				$scope.gridOptions = {
					enableColumnResizing: true,
					enableColumnMenus: false,
					enableSorting: false,
					multiSelect: false,
					rowHeight: getRowHeight(),
					columnDefs: $scope.columnDefs,
					rowTemplate: SearchResultsService.rowTemplate,
					infiniteScrollRowsFromEnd: 1,
					infiniteScrollDown: true,
					data: $scope.searchResults
				};

				///////////////////////////////////
                /// Preview Functionality 
                ///////////////////////////////////

                // Scopes settings 

                $scope.isPreview = function () {
                    return isPreviewMode();
                }

                $scope.previewModeHeight = function () {
                	return ($scope.gridOptions.rowHeight - 30) + "px";
                }

                ///////////////////////////////////
                /// Private functions - set grid settings
                ///////////////////////////////////

                function getRowHeight() {
                    var defaultValue = 30;

                    if (!isPreviewMode()) {
                        return defaultValue;
                    }

                    var previewTextSettings = getPreviewHeigth();

                    return (previewTextSettings + defaultValue);
                }

                function isPreviewMode() {
                    if (!!columnsSpecification && !!columnsSpecification.previewLines) {
                        if (columnsSpecification.previewLines !== 0) {
                            return true;
                        }
                    }

                    return false;
                }

                function getPreviewHeigth() {
                    var span = document.createElement("span");
                    var computedStyle = window.getComputedStyle(span, null);

                    var gridSettings = {
                        fontSize: computedStyle.fontSize,
                        fontFamily: computedStyle.fontFamily,
                        lineHeight: computedStyle.lineHeight
                    }

                    if (!!columnsSpecification) {
                        if (!!columnsSpecification.fontSize) {
                            gridSettings.fontSize = columnsSpecification.fontSize;
                        }

                        if (!!columnsSpecification.fontFamily) {
                            gridSettings.fontFamily = columnsSpecification.fontFamily;
                        }

                        if (!!columnsSpecification.lineHeight) {
                            gridSettings.lineHeight = columnsSpecification.lineHeight;
                        }
                    }

                    span.style.fontSize = gridSettings.fontSize;
                    span.style.fontFamily = gridSettings.fontFamily;
                    span.style.lineHeight = gridSettings.lineHeight;

                    span.innerText = document.createTextNode("Sample text");

                    document.body.appendChild(span);
                    var rect = span.getBoundingClientRect();
                    var height = rect.bottom - rect.top;
                    document.body.removeChild(span);

                    var previewLineSettings = columnsSpecification.previewLines;
                    if (previewLineSettings === null) {
                        previewLineSettings = 3;
                    }

                    var result = height * previewLineSettings;

                    return result;
                }

                ///////////////////////////////////

				function s4()
				{
					return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				}

				function createGuid()
				{
					return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
				}

                $scope.gridOptions.onRegisterApi = function (gridApi) {
                	$scope.gridApi = gridApi;
                    //Refresh for problem with resize
                    angular.element($window).bind('resize', function () {
                        $scope.gridApi.core.handleWindowResize();
                    });

                    gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.loadNewResults);

                    gridApi.draggableRows.on.rowDragged($scope, function (info, dropTarget) {

                        info.e.dataTransfer.dropEffect = 'copy';

                        info.e.dataTransfer.setData("text/plain", JSON.stringify({
                            collectionId: 'Search',
                            id: -1,
                            level: -1,
                            templateId: info.draggedRowEntity.documentType,
                            objectId: info.draggedRowEntity.ID.EncodedID
						}));

	                    let guid = createGuid();
						let imgUrl = info.draggedRowEntity.iconType;
						var title = info.draggedRowEntity.previewHeader;
	                    var id = info.draggedRowEntity.ID.EncodedID;

	                    let imgTag = '<img class="MediaInsert" title="' + title + '" data-id="' + id + '" src="' + imgUrl + '" data-guid="' + guid + '" />';

	                    info.e.dataTransfer.setData("text/html", imgTag);
                    });

                    $scope.$watch('gridApi.grid.isScrollingVertically', function watchFunc(newData) {
                        angular.element('body').find('.grid-item-context-menu').hide();
                    });
                };

                $scope.$on('search:selectRow', function (event, row) {
                    $scope.selectRow(row);
                });
                $scope.$on('search:loadNewResults', function (event, row) {
                    $scope.loadNewResults();
				});

				$scope.rowSpacePress = function($event)
				{
					if (!!$scope.selectedRow)
					{
						if ($scope.selectedRow.isChecked)
							uncheckRow($scope.selectedRow);
						else
							checkRow($scope.selectedRow);
					}
				};

                $scope.selectRow = function (rowData) {
                    if ($scope.selectedRow) {
                        delete $scope.selectedRow.selected;
                    }
                    rowData.selected = true;
					$scope.selectedRow = rowData;

	                $scope.updatePreviewPanel();
				};

				$scope.rowClick = function (row, $event) {
                    //if ($event) {
                    //    $event.stopPropagation();
                    //}

					if ($event.ctrlKey)
					{
						if (row.entity.isChecked)
						{
							uncheckRow(row.entity);
							if (firstColumnRows.checkedRows.length === 1)
							{
								if (!!$scope.selectedRow)
									uncheckRow($scope.selectedRow);
							}
						}
						else
						{
							checkRow(row.entity);
						}

						$scope.updatePreviewPanel();
					}
					else if ($event.shiftKey)
					{
						var selectedRowIndex = !!$scope.selectedRow ? getRowIndex($scope.selectedRow) : 0;
						var clickedRowIndex = getRowIndex(row.entity);

						var startIndex = Math.min(selectedRowIndex, clickedRowIndex);
						var endIndex = Math.max(selectedRowIndex, clickedRowIndex);

						for (var i = 0; i < $scope.gridOptions.data.length; i++)
						{
							if (i >= startIndex && i <= endIndex)
								checkRow($scope.gridOptions.data[i]);
							else
								uncheckRow($scope.gridOptions.data[i]);
						}

						$scope.updatePreviewPanel();
					}
					else
					{
						uncheckAllRows();

						$scope.selectRow(row.entity);

						$scope.rowSelectedByUser = true;
						$scope.onLineSelected(row.entity);
					}
				};

				function checkRow(rowData)
				{
					if (!rowData)
						return;

					uncheckRow(rowData);

					rowData.isChecked = true;
					firstColumnRows.checkedRows.push(rowData.systemId);
				}

				function uncheckRow(rowData)
				{
					if (!rowData)
						return;

					rowData.isChecked = false;

					var index = firstColumnRows.checkedRows.indexOf(rowData.systemId);
					if (index !== -1)
						firstColumnRows.checkedRows.splice(index, 1);
				}

				function uncheckAllRows()
				{
					for (var i = 0; i < $scope.gridOptions.data.length; i++)
					{
						var item = $scope.gridOptions.data[i];
						uncheckRow(item);
					}
				}

				function getRowIndex(entity)
				{
					return $scope.gridOptions.data.indexOf(entity);
				};

				$scope.updatePreviewPanel = function ()
				{
					var rowData = $scope.selectedRow;

					if (!!rowData && (firstColumnRows.checkedRows.length === 0 || (firstColumnRows.checkedRows.length === 1 && rowData.systemId === firstColumnRows.checkedRows[0])))
					{
						if ($("#rightSlidebarM").hasClass("openedRightTab"))
						{
							//if true then it can update
							if (notifyReadItems == true)
							{
								if (rowData.itemRead == false)
								{
									rowData.itemRead = true;
									OMWClientContext.StoryPreviewed(rowData.ID.EncodedID);
								}
							}
						}

						$scope.previewHeader = rowData.previewHeader;
						$('#previewHeaderContainer').html(rowData.previewHeader);
						$scope.previewMain = rowData.previewMain;

						//Replace all &nbsp; with spaces
						$scope.previewMain = $scope.previewMain.replace(/&nbsp;/gi, ' ');
						$scope.previewMain = $scope.previewMain.replace(/&lt;mark&gt;/gi, '<mark>');
						$scope.previewMain = $scope.previewMain.replace(/&lt;\/mark&gt;/gi, '</mark>');

						$('#searchResultGridDetailView').html($scope.previewMain);

						$timeout(function()
						{
							OMWClientContext.UpdateTableMode();
						});
					}
					else
					{
						$scope.previewHeader = '';
						$('#previewHeaderContainer').html('');
						$scope.previewMain = '';
						$('#searchResultGridDetailView').html('');
					}

					var event = document.createEvent("CustomEvent");
					event.initCustomEvent("previewRowChanged", true, true, rowData);
					document.dispatchEvent(event);

					//Scroll back to top of the instant preview panel
					//when the selected item in grid is changed
					$('#rightPreviewContainer').scrollTop(0);
                };

                $scope.calcCellColor = function (COL_FIELD)
				{
					return true;
				};

                $scope.startSearch = function (searchModel, keepOldResults) {
                    if (searchModel.newSearch) {
                        $scope.searchResults = [];
                        $scope.viewFrom = 0;
                    }
                    if ($scope.searchResults.length >= $scope.totalSearchHits && !searchModel.newSearch) {
                        $('.searchResultsLoader').hide();
                        return;
                    }
                    $('#loading').show();

                    SearchResultsService.getData(searchModel)
                      .success(function (data) {
                          $scope.totalSearchHits = data.TotalSearchHits;
                          $scope.handleStartSearchData(data, keepOldResults);
                          //$scope.initFWS();

                          $('.searchResultsLoader').hide();
                          $scope.gridApi.infiniteScroll.dataLoaded();
                      })
                      .error(function () {
                          $('#loading').hide();
                          $('.searchResultsLoader').hide();
                      });
                };

                $scope.handleStartSearchData = function (data, keepOldResults) {

                    if (!keepOldResults) {
                        $scope.toTopClick();
                    }
                    var result = SearchResultsService.handleStartSearchData(data, keepOldResults, $scope.searchResults);

                    $scope.searchResults = result.searchResults;
                    $scope.gridOptions.data = result.searchResults;
                    $scope.viewTo = result.searchResults.length;
                    $scope.viewTo = $scope.viewTo > result.totalSearchHits ? result.totalSearchHits : $scope.viewTo;
                    $scope.viewFrom = 1;
                    $('#loading').hide();              

                    var obj = {
                        results: $scope.searchResults,
                        viewFrom: $scope.viewFrom,
                        viewTo: $scope.viewTo,
                        totalSearchHits: result.totalSearchHits
                    };
                    
                    $rootScope.$broadcast('search:searchResultsUpdated', obj);
                };

                $scope.loadNewResults = function () {
                    $('.searchResultsLoader').show();
                    $scope.searchModel.PageNumber++;
                    OMWClientContext.SearchResults._NavigateToPage($scope.searchModel.PageNumber, true);
                };

                function getCurrentRowIndex(rows, row) {
                    for (var i = 0; i < rows.length; i++) {
                        if (rows[i].ID.EncodedID === row.ID.EncodedID) {
                            return i;
                        }
                    }
                    return -1;
                }

                function getFirstVisibleRowInGrid() {
                    var row = $scope.gridApi.core.getVisibleRows()[0];
                    return row.entity;
                }

                function getLastVisibleRowInGrid() {
                    var rows = $scope.gridApi.core.getVisibleRows();
                    var row = rows[rows.length - 1];
                    return row.entity;
                }

                $scope.prevClick = function () {
                    var index = getCurrentRowIndex($scope.gridOptions.data, getFirstVisibleRowInGrid());
                    //index -= $scope.searchModel.PageSize;

                    if (index < 0) {
                        index = 0;
                    }

                    $scope.gridApi.grid.scrollTo($scope.gridOptions.data[index], $scope.columnDefs[0]);
                };

                $scope.nextClick = function () {
                    if ($scope.searchModel.PageNumber < 2) {
                        $scope.loadNewResults();
                    }

                    var index = getCurrentRowIndex($scope.gridOptions.data, getLastVisibleRowInGrid());
                    //index += $scope.searchModel.PageSize;

                    if (index > $scope.gridOptions.data.length - 1) {
                        index = $scope.gridOptions.data.length - 1;
                    }

                    $scope.gridApi.grid.scrollTo($scope.gridOptions.data[index], $scope.columnDefs[0]);
                };

                $scope.toTopClick = function () {
                    $scope.gridApi.core.scrollTo($scope.gridOptions.data[0], $scope.gridOptions.columnDefs[0]);
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

                $scope.goUpClick = function ($event) {

					//Get current index
                    var index = $scope.getIndexOfSelectedRow();
                    if (index < 1) {
                        return;
                    }

                    ///////////////////////////////////////////////////////////////////////////////

	                if ($event.shiftKey)
	                {
						var blockStart = findBlockStart(index);
		                var blockEnd = findBlockEnd(index);

						if (blockStart !== -1 && blockEnd !== -1 && blockStart !== blockEnd)
						{
							if (blockStart === index)
								blockStart--;
							else
								blockEnd = index - 1;

			                for (var i = 0; i < $scope.gridOptions.data.length; i++)
			                {
				                var item = $scope.gridOptions.data[i];
								if (i >= blockStart && i <= blockEnd)
					                checkRow(item);
				                else
					                uncheckRow(item);
			                }
		                }
		                else
		                {
			                checkRow($scope.gridOptions.data[index - 1]);
			                checkRow($scope.gridOptions.data[index]);
		                }
	                }
	                else if (!$event.ctrlKey)
						uncheckAllRows();

	                //Select previous one
	                index = index - 1;

	                $scope.selectRow($scope.gridOptions.data[index]);
                };

                $scope.goDownClick = function ($event) {

					//Get current index
                    var index = $scope.getIndexOfSelectedRow();
                    if (index < 0 || index > $scope.gridOptions.data.length - 2) {
                        return;
                    }

                    ///////////////////////////////////////////////////////////////////////////////

	                if ($event.shiftKey)
	                {
		                var blockStart = findBlockStart(index);
		                var blockEnd = findBlockEnd(index);

		                if (blockStart !== -1 && blockEnd !== -1 && blockStart !== blockEnd)
		                {
			                if (blockEnd === index)
								blockEnd = index + 1;
							else
								blockStart = index + 1;

							for (var i = 0; i < $scope.gridOptions.data.length; i++)
							{
								var item = $scope.gridOptions.data[i];
								if (i >= blockStart && i <= blockEnd)
									checkRow(item);
								else
									uncheckRow(item);
							}
						}
						else
						{
							checkRow($scope.gridOptions.data[index + 1]);
							checkRow($scope.gridOptions.data[index]);
						}
	                }
	                else if (!$event.ctrlKey)
						uncheckAllRows();

	                //Select next one
	                index = index + 1;

	                $scope.selectRow($scope.gridOptions.data[index]);
				};

				function findBlockStart(index)
				{
					var lastCheckedIndex = -1;

					for (var i = index; i >= 0; i--)
					{
						var item = $scope.gridOptions.data[i];
						if (item.isChecked || item === $scope.selectedRow)
							lastCheckedIndex = i;
						else
							break;
					}

					return lastCheckedIndex;
				}

				function findBlockEnd(index)
				{
					var lastCheckedIndex = -1;

					for (var i = index; i < $scope.gridOptions.data.length; i++)
					{
						var item = $scope.gridOptions.data[i];
						if (item.isChecked || item === $scope.selectedRow)
							lastCheckedIndex = i;
						else
							break;
					}

					return lastCheckedIndex;
				}

				var privateSortArray = [];
                $scope.customSort = function ($event, col, fieldId) {
                    //Set column as sortable
                    col.sortable = true;

                    var position = -1;
                    for (var i = 0; i < privateSortArray.length; i++) {
                        if (privateSortArray[i].id === col.uid) {
                            position = i;
                            break;
                        }
                    }
                    if (position > -1) {
                        //Remove this element from n position so it can be added to the first position
                        privateSortArray.splice(position, 1);
                    }
                    //Add to first place in array
                    privateSortArray.unshift({ col: col, id: col.uid, fieldId: fieldId, element: $event.target });

                    if (col.sort.direction === 'asc') {
                        col.sort.direction = 'desc';
                    }
                    else {
                        col.sort.direction = 'asc';
                    }
                    if (privateSortArray.length > 3) {
                        //Remove from the last place in array and make this column not sortable
                        var col1 = privateSortArray[privateSortArray.length - 1].col;
                        col1.sortable = false;
                        delete col1.sort.direction;
                        privateSortArray.pop();
                    }

                    var searchArray = [];
                    for (var i = 0; i < privateSortArray.length; i++) {
                        searchArray.push({ FieldID: privateSortArray[i].fieldId, Ascending: privateSortArray[i].col.sortDirection === 'asc' ? 1 : 0 });

                        //Get parent element
                        var e = angular.element(privateSortArray[i].element).parent();
                        //Remove all possible classes
                        e.removeClass('sort-icon-0');
                        e.removeClass('sort-icon-1');
                        e.removeClass('sort-icon-2');
                        //Add class with current value
                        e.addClass('sort-icon-' + i);
                    }

                    //Call search method on server
                    $scope.searchModel.SortOrder = searchArray;
                    $scope.startSearch($scope.searchModel, false);
                };

                $scope.initFWS = function () {
                    //signalR
                    $.connection.hub.logging = true;
                    $scope.FWSProxy = $.connection.fWSHub;
                    $scope.FWSProxy.client.OnFWS = function (searchContextID, data) {

                        var updates = $.parseJSON(data);
                        for (var i = 0; i < updates.length; i++) {
                            var update = updates[i];
                            if (update.DeleteExisting) {
                                //$scope.DeleteSearchResultById(update.ID);
                            } else if (update.UpdateExisting == false && update.ChangedOrder == false) {

                                $scope.InsertAfterSearchResult(update, update.ReferenceObjectID);

                            } else {
                                if (update.UpdateExisting) {
                                    $scope.UpdateExistingSearchResult(update, update.ID);
                                }
                                if (update.ChangeOrder) {
                                    $scope.SwapExistingSearchResult(update.ID, update.ReferenceObjectID);
                                }
                            }
                        }

                        var selectorVal = ".ui-grid-canvas .ui-grid-row:eq(" + updates.length + ") .ui-grid-cell-contents";

                        var item = $(selectorVal);

                        item.addClass('newRowAnimation');

                        item.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                            item.removeClass('newRowAnimation');
                        });

                        $scope.viewTo = $scope.viewTo > $scope.totalSearchHits ? $scope.totalSearchHits : $scope.viewTo;

                    };
                    $.connection.hub.start().done(function () {
                        var contextID = $('#hdnSearchContextID').val();
                        $scope.FWSProxy.server.joinFWSGroup(contextID);
                        console.log('$scope.initFWS hub start:');
                    });
                };


                $scope.InsertAfterSearchResult = function (item, afterId) {
                    if (afterId.PinnID <= 0) {
                        $scope.gridOptions.data.unshift($scope.prepearSearchHit(item, true));
                        $scope.totalSearchHits++;
                    } else {
                        var found = false;
                        for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                            if (OMWClientContext.SearchResults.IsOMWDocumentIDsEqual(afterId, $scope.gridOptions.data[i].ID)) {
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            $scope.gridOptions.data.splice(i + 1, 0, $scope.prepearSearchHit(item, true));
                            $scope.totalSearchHits++;
                        }
                    }
                };

                $scope.UpdateExistingSearchResult = function (item, id) {
                    var found = false;
                    for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                        if (OMWClientContext.SearchResults.IsOMWDocumentIDsEqual(id, $scope.gridOptions.data[i].ID)) {
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        $scope.copyObject($scope.gridOptions.data[i], $scope.prepearSearchHit(item, false));
                    }
                };

                $scope.SwapExistingSearchResult = function (id1, id2) {
                    var found1 = false;
                    var found2 = false;
                    for (var i = 0; i < $scope.gridOptions.data.length; i++) {
                        if (OMWClientContext.SearchResults.IsOMWDocumentIDsEqual(id1, $scope.gridOptions.data[i].ID)) {
                            found1 = true;
                            break;
                        }
                    }

                    for (var j = 0; j < $scope.searchResults.length; j++) {
                        if (OMWClientContext.SearchResults.IsOMWDocumentIDsEqual(id2, $scope.gridOptions.data[j].ID)) {
                            found2 = true;
                            break;
                        }
                    }

                    if (found1 && found2) {
                        $scope.gridOptions.data[i] = $scope.gridOptions.data.splice(j, 1, $scope.gridOptions.data[i])[0];
                    }
                };

                $scope.updateLayout = function () {
                    $scope.gridApi.core.handleWindowResize();
                };

                $(function () {

                    var initTableHeight = function () {
                        setTimeout(function () {
                            if (OMWClientContext.SearchResults._GetAngularScope() != undefined) {
                                OMWClientContext.SearchResults.updateLayout();
                                OMWClientContext.SearchResults.DoSearch(SearchResultsType.Grid);
                            } else {
                                initTableHeight();
                            }
                        }, 500);
                    };

                    initTableHeight();
                });

                $scope.onLineSelected = function (rowData) {
                    $rootScope.$broadcast('search:rowClick', rowData);
                };

                //First column context menu

                $scope.rowIsChecked = function (rowData, $event) {
                    $event.stopPropagation();

                    if (rowData.isChecked) {
                        firstColumnRows.checkedRows.push(rowData.systemId);
                    }
                    else {
                        firstColumnRows.checkedRows.splice(firstColumnRows.checkedRows.indexOf(rowData.systemId), 1);
					}

	                $scope.updatePreviewPanel();
                };

                var moveToRecycleBin = function () {
                    SearchResultsService.moveToRecycleBin(firstColumnRows.checkedRows)
                        .then(function (response) {

                            if (response.data.status === 'success') {
                                $scope.indicateDeleted(firstColumnRows.checkedRows);
                            }
                        });
                };

                var checkedRowsExist = function () {
                    return firstColumnRows.checkedRows.length > 0;
                };

                FirstColContextMenuSvc.setMenuItems([
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist },
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist },
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist },

                        { id: '-', text: '' },
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist },
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist },

                        { id: '-', text: '' },
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist },
                        { id: 'move_to_recycle_bin', text: 'Move to recycle bin', func: moveToRecycleBin, checkIfEnabled: checkedRowsExist }
                ]);

                var copyAsPopUp = CopyAsDialogSvc.InitPopUp();
               
                //Used for middle button in open buttons in grid rows
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
                        func: function(selectedItem){
                            copyAsPopUp.open({
                                id: id
                            }, function (result) {
                                console.log(result);
                            });
                        }
                    }];

                    return items;
                };

                $scope.indicateDeleted = function (items) {
                    var dataLength = $scope.gridOptions.data.length;
                    for (var i = 0; i < items.length; i++) {
                        for (var j = 0; j < dataLength; j++) {
                            if (items[i] === $scope.gridOptions.data[j].systemId) {
                                $scope.gridOptions.data[j].itemStatus = 'recycled';

                                break;
                            }
                        }
                    }
                };

                $scope.eventFunctions = {
                    '38': $scope.goUpClick,
					'40': $scope.goDownClick,
					'32': $scope.rowSpacePress
                };

                $scope.getStoryUrl = function (id, row) {
                    if (!row.supportOpen) {
                        return '#';
                    }

                    if (row.documentType) {
                        return '/OMWebiSearch/Collection/Editor/Index/' + id;
                    }
                    return OMWClientContext.GetFullUrl('Story/EditStory/Index/' + id);
                };

                

            }]);
})();