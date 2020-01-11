(function () {
    'use strict';

    angular.module('omwShared')
        .service('GridColumnSizeSvc', [function () {

            var getColumnsSizes = function getColumnsSizes(columns, element, ignoredWidth) {
                var gridWidth = element.width();

                //First 3 columns should be ignored
                gridWidth = gridWidth - ignoredWidth;

                var columnsWidth = 0;
                for (var i = 0; i < columns.length; i++) {
                    columnsWidth += parseInt(columns[i].columnWidth);
                }

                //Scale column widths
                if (columnsWidth < gridWidth) {
                    var ratio = gridWidth / columnsWidth;
                    for (var i = 0; i < columns.length - 1; i++) {
                        var newWidth = columns[i].columnWidth * ratio;
                        columns[i].updatedColumnWidth = newWidth;
                    }
                    columns[columns.length - 1].updatedColumnWidth = '*';
                }
                else {
                    for (var i = 0; i < columns.length; i++) {
                        columns[i].updatedColumnWidth = columns[i].columnWidth;
                    }
                }
                return columns;
            };

            return {
                getColumnsSizes: getColumnsSizes
            };
        }]);
})();