(function () {
    'use strict';

    angular.module('omwcSearch', [
        'ui.grid',
        'ui.grid.resizeColumns',
        'ui.grid.draggable-rows',
        'ui.grid.cellNav',
        'ui.grid.infiniteScroll',
        'angular-carousel',
        'ngSanitize',
        'omwShared',
        'omwHeaderSearch'
    ]);
})();
