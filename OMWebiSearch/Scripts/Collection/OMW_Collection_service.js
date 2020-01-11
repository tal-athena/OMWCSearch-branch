(function () {
	'use strict';

	angular.module('omwCollection')
        .service('CollectionSvc', [function () {

            var rowTemplate = '<div grid="grid" class="ui-grid-draggable-row customGridRow" ng-attr-draggable="{{row.entity.level === 1}}" ng-attr-droppable="{{row.entity.level === 1}}">' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
                        'ng-click="grid.appScope.rowClick(row, $event)"' +
                        'class="ui-grid-cell"' +
                        'ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'ui-grid-row-not-expandable\': !row.entity.hasSubitems, \'row-level-2\': row.entity.level === 2, \'row-level-3\': row.entity.level === 3, \'row-selected\': row.entity.selected, \'expand-cell\': col.name === \'_\' }"' +
                        'ui-grid-cell>' +
                    '</div>' +
                '</div>';
            var footerTemplate = '<div class="collectionGridFooter">' +
                                    '<div class="pull-left">' +
                                        '<a ng-click="grid.appScope.goToTop()">Go to top</a>' +
                                        '<a ng-click="grid.appScope.goToBottom()">Go to bottom</a>' +
                                    '</div>' +
                                '</div>';

            var findRecordById = function findRecordById(records, id) {
                for (var i = 0, length = records.length; i < length; i++) {
                    if (records[i].id == id) {
                        return i;
                    }
                }
                return -1;
            };

            var findRecordIndex = function findRecordIndex(records, item) {
                for (var i = 0, length = records.length; i < length; i++) {
                    if (records[i] == item) {
                        return i;
                    }
                }
                return -1;
            };

            var parseItem = function parseItem(item, level) {
                var newObj = {
                    id: item.ID.EncodedID,
                    hasSubitems: level < 3 ? item.HasSubitems : false,
                    supportOpen: item.SupportOpen,
                    templateId: item.TemplateID,
                    parentId: item.ParentID,
                    documentType: item.DocumentType,
                    level: level,
                    showLoadingAnimation: false,
                    groupId: item.GroupID,
                    recordId: item.RecordID,
                    itemStatus: item.ItemStatus
				};

				for (var j = 0; j < item.Fields.length; j++)
				{
					newObj['Column_' + item.Fields[j].FieldID] = {
                        value: item.Fields[j].DisplayValue,
                        backgroundColor: item.Fields[j].FieldValue.BackgroundColor
                    };
                }
                return newObj;
            };

            var getSelectedItemHirarchy = function getSelectedItemHirarchy(records, selectedRow) {
                var results,
                    level,
                    index;

                if (!selectedRow) {
                    return null;
                }

                results = [];
                results.push(selectedRow);
                if (!selectedRow.level || selectedRow.level === 1) {
                    return results;
                }

                index = findRecordIndex(records, selectedRow);
                if (index < 0) {
                    return results;
                }

                level = selectedRow.level;
                //Get all parents of this row
                for (var i = index - 1; i >= 0 && level > 0; i--) {
                    if (records[i].level === (level - 1) && records[i].isExpanded) {
                        level--;
                        results.push(records[i]);
                    }
                }

                return results;
            };

            var findGroupIndicator = function findGroupIndicator(item, items, position) {

                if (!item.GroupID || item.GroupID === 0) {
                    return "none";
                }

                if (position < 1) {
                    if (items.length > position + 2) {
                        if (items[position].GroupID === items[position + 1].GroupID) {
                            return "start_group";
                        }
                        return "none";
                    }
                    else {
                        //This is the last and first item
                        return "none";
                    }
                }

                if (items.length > position + 2) {
                    if (items[position].GroupID === items[position + 1].GroupID &&
                        items[position].GroupID !== items[position - 1].GroupID) {
                        return "start_group";
                    }
                    if (items[position].GroupID === items[position + 1].GroupID &&
                        items[position].GroupID === items[position - 1].GroupID) {
                        return "group";
                    }
                    if (items[position].GroupID !== items[position + 1].GroupID &&
                        items[position].GroupID === items[position - 1].GroupID) {
                        return "end_group";
                    }
                    return "none";
                }
                else {
                    //This is the last item
                    if (items[position - 1].GroupID === items[position].GroupID) {
                        return "end_group";
                    }
                    return "none";
                }
            };

            return {
                rowTemplate: rowTemplate,
                footerTemplate: footerTemplate,
                findRecordById: findRecordById,
                parseItem: parseItem,
                getSelectedItemHirarchy: getSelectedItemHirarchy,
                findGroupIndicator: findGroupIndicator
            };
        }]);
})();