(function () {
    'use strict';

    angular.module('omwcSearch')
        .service('SearchResultsService', ['$http', 'GridColumnSizeSvc', function ($http, GridColumnSizeSvc) {

            var __columns;

            var rowTemplate = '<div grid="grid" draggable="true" class="ui-grid-draggable-row customGridRow rowOpened-{{row.entity.itemRead}}">' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
                        'ng-click="grid.appScope.rowClick(row, $event)"' +
                        'class="ui-grid-cell"' +
                        'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader,\'row-selected\': row.entity.selected, \'row-checked\': row.entity.isChecked }"' +
                        'ui-grid-cell>' +
                    '</div>' +
                '</div>' + // row template for preview mode
                '<div ng-if="grid.appScope.isPreview()" class="preview-row" ng-style="{height: grid.appScope.previewModeHeight()}"><div class="preview-row-content" ng-bind-html="row.entity.previewMain"></div></div>';

            var getColumns = function getColumns(notifyReadItems) {
                var columns = columnsSpecification.columns;
                __columns = columns;

                var ignoredWidth = 50 + 51 + 42;
                if (notifyReadItems) {
                    ignoredWidth += 20;
                }

                columns = GridColumnSizeSvc.getColumnsSizes(columns, angular.element('#searchResultsOptions'), ignoredWidth);

                var angularColumns = [];

                //Checkboxes
                var firstCellTemplate = '<first-col-context-menu></first-col-context-menu>';
                angularColumns.push({
                    name: '______',
                    width: 25,
                    enableColumnResizing: false,
                    cellTemplate: '<div><input type="checkbox" ng-model="row.entity.isChecked" ng-click="grid.appScope.rowIsChecked(row.entity, $event)" /></div>',
                    headerCellTemplate: firstCellTemplate,
                    visible: true
                });

                angularColumns.push({
                    displayName: '',
                    field: 'systemId',
                    width: 51,
                    pinned: true,
                    enableColumnResizing: false,
                    cellTemplate: '<div ng-class="{ngRowHovered: row.rowIndex == hIndex}" class="ngCellText ngCellOpenIcons" ng-cell-text ng-class="col.colIndex()"><open-grid-row-options-menu menu-items="grid.appScope.getContextMenuItems(COL_FIELD, row.entity)" row-data="row.entity"></open-grid-row-options-menu><a href="{{grid.appScope.getStoryUrl(COL_FIELD, row.entity)}}" title="Open"><span class="open" alt="Open" /></a></div>'
                });

                angularColumns.push({
                    displayName: '',
                    field: 'documentType',
                    enableColumnResizing: false,
                    visible: false
                });

                angularColumns.push({
                    displayName: '',
                    field: 'supportOpen',
                    enableColumnResizing: false,
                    visible: false
                });

                angularColumns.push({
                    displayName: '',
                    field: 'previewHeader',
                    visible: false,
                    enableColumnResizing: false
                });

                angularColumns.push({
                    displayName: '',
                    field: 'previewMain',
                    enableColumnResizing: false,
                    visible: false
                });

                angularColumns.push({
                    displayName: '',
                    field: 'iconType',
                    width: 25,
                    pinned: true,
                    enableColumnResizing: false,
                    cellTemplate: '<div class="ngCellIcon search-grid-icon-column" ng-cell-text ng-class="col.colIndex()"><span ng-if="row.entity.itemStatus !== \'\'" class="grid-row-status grid-row-status-{{row.entity.itemStatus}}"></span><span class="icon" style="background: url({{row.entity.iconType}}) no-repeat;"  alt="Standard icon"/></div>'
                });

                if (notifyReadItems == true) {
                    angularColumns.push({
                        displayName: '',
                        field: 'itemRead',
                        width: 20,
                        cellTemplate: "<div class='previewStoryCircleBase previewedStory-{{COL_FIELD}}'></div>",
                        visible: true,
                        enableColumnResizing: false,
                        pinned: true
                    });
                }

                $(columns).each(function () {
                    var alignmentClass = "";
                    if (this.alignment == 0) {
                        alignmentClass = "leftAlign";
                    }
                    else if (this.alignment == 1) {
                        alignmentClass = "centerAlign";
                    }
                    else {
                        alignmentClass = "rightAlign";
                    }

					var cellTemp = '<div ng-style="{backgroundColor: (row.entity.selected || row.entity.isChecked) && !!grid.appScope.calcCellColor && grid.appScope.calcCellColor(COL_FIELD) === true ? \'transparent\' : COL_FIELD.color}">';
                    if (this.customColor) {
                        cellTemp += '<div class="ui-grid-cell-contents"><div class="';
                        cellTemp += alignmentClass;
                        cellTemp += ' ">{{COL_FIELD.value}}</div></div>';
                    }
                    else {
                        cellTemp += '<div class="ui-grid-cell-contents"><div class="';
                        cellTemp += alignmentClass;
                        cellTemp += '">{{COL_FIELD.value}}</div></div>';
                    }
                    cellTemp += '</div>';

                    //var headerTemplate = '<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }">    <div ng-click="grid.appScope.customSort($event, col, ' + this.FieldID + ')" ng-class="\'colt\' + col.index" class="ngHeaderText">{{col.displayName}}</div>    <div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>    <div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>    <div class="ngSortPriority">{{col.sortPriority}}</div>    <div ng-class="{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }" ng-click="togglePin(col)" ng-show="col.pinnable"></div></div><div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>';
                    var headerTemplate = "<div role=\"columnheader\" ng-class=\"{ 'sortable': sortable }\" ui-grid-one-bind-aria-labelledby-grid=\"col.uid + '-header-text ' + col.uid + '-sortdir-text'\" aria-sort=\"{{col.sort.direction == asc ? 'ascending' : ( col.sort.direction == desc ? 'descending' : (!col.sort.direction ? 'none' : 'other'))}}\"><div ng-click=\"grid.appScope.customSort($event, col, " + this.FieldID + " )\" tabindex=\"0\" class=\"ui-grid-cell-contents ui-grid-header-cell-primary-focus\" col-index=\"renderIndex\" title=\"TOOLTIP\"><span class=\"ui-grid-header-cell-label\" ui-grid-one-bind-id-grid=\"col.uid + '-header-text'\">{{ col.displayName CUSTOM_FILTERS }}</span> <span ui-grid-one-bind-id-grid=\"col.uid + '-sortdir-text'\" ui-grid-visible=\"col.sort.direction\" aria-label=\"{{getSortDirectionAriaLabel()}}\"><i ng-class=\"{ 'ui-grid-icon-up-dir': col.sort.direction == asc, 'ui-grid-icon-down-dir': col.sort.direction == desc, 'ui-grid-icon-blank': !col.sort.direction }\" title=\"{{col.sort.priority ? i18n.headerCell.priority + ' ' + col.sort.priority : null}}\" aria-hidden=\"true\"></i> <sub class=\"ui-grid-sort-priority-number\">{{col.sort.priority}}</sub></span></div><div role=\"button\" tabindex=\"0\" ui-grid-one-bind-id-grid=\"col.uid + '-menu-button'\" class=\"ui-grid-column-menu-button\" ng-if=\"grid.options.enableColumnMenus && !col.isRowHeader  && col.colDef.enableColumnMenu !== false\" ng-click=\"toggleMenu($event)\" ng-class=\"{'ui-grid-column-menu-button-last-col': isLastCol}\" ui-grid-one-bind-aria-label=\"i18n.headerCell.aria.columnMenuButtonLabel\" aria-haspopup=\"true\"><i class=\"ui-grid-icon-angle-down\" aria-hidden=\"true\">&nbsp;</i></div><div ui-grid-filter></div></div>";

                    angularColumns.push({
                        headerCellTemplate: headerTemplate,
                        displayName: this.columnName,
                        field: this.columnName.split(' ').join(''),
                        width: this.updatedColumnWidth,
                        cellTemplate: cellTemp
                    });
                });

                return angularColumns;
            };

            var getData = function getData(searchModel) {
                searchModel.PageSize = 20;
                return $http.post('/OMWebiSearch/Search/SearchMain/GetSearchResults', searchModel);
            };

            var moveToRecycleBin = function moveToRecycleBin(items) {
                return $http.post('/OMWebiSearch/Search/SearchMain/MoveToRecycleBin', { items: items });
            }

            var handleStartSearchData = function handleStartSearchData(data, keepOldResults, searchResults) {
                var searchHits = [];

                $(data.SearchHits).each(function () {
                    searchHits.push(prepareSearchHit(this, false, __columns));
                });

                if (keepOldResults) {
                    $(searchHits).each(function () {
                        searchResults.push(this);
                    });
                } else {
                    searchResults = searchHits;
                }
                return {
                    searchResults: searchResults,
                    totalSearchHits: data.TotalSearchHits
                };
            };

            var prepareSearchHit = function prepareSearchHit(h, added, columns) {
                var getFieldValue = function (fid, fields) {
                    var res = '';
                    $(fields).each(function () {
                        if (this.FieldID == fid) {
                            res = this.DisplayValue;
                        }
                    });
                    return res;
                };
                var getFieldBackground = function (fid, fields) {
                    var res = '';
                    $(fields).each(function () {
                        //   console.log(this);
                        if (this.FieldID == fid) {
                            res = this.FieldValue.BackgroundColor;
                        }
                    });
                    return res;
                };

                var hit = {
                };
                var that = h;
                $(columns).each(function () {
                    var column = this;
					var value = getFieldValue(column.FieldID, that.Fields);
                    var color = getFieldBackground(column.FieldID, that.Fields);
                    var obj = {
                    	color: color, value: value
                    };

                    hit[column.columnName.split(' ').join('')] = obj;
                });

                hit['iconType'] = OMWClientContext.SearchResults.GetIconForTemplate(this);
                hit['systemId'] = that.ID.EncodedID;
                hit['documentType'] = that.DocumentType;
                hit['supportOpen'] = that.SupportOpen ? 'true' : 'false';
                hit['previewHeader'] = that.PreviewHeader;
                hit['previewMain'] = that.PreviewMain;
                hit['hovered'] = false;
                hit['itemStatus'] = that.ItemStatus;
                hit['itemRead'] = that.ItemRead;

                hit.ID = that.ID;
                return hit;
            };

            return {
                rowTemplate: rowTemplate,
                getColumns: getColumns,
                getData: getData,
                moveToRecycleBin: moveToRecycleBin,
                handleStartSearchData: handleStartSearchData
            };

        }]);
})();