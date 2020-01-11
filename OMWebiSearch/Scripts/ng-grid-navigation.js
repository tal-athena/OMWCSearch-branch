function ngGridNavigationPlugin() {

    var self = this;
    this.grid = null;
    this.scope = null;

    this.init = function (scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
    };

    this._scroll = function (amount) {
        if (amount >= self.grid.$viewport.height() - self.grid.config.rowHeight) {
            self.grid.$viewport.scrollTop(amount+100);
        } else {
            self.grid.$viewport.scrollTop(amount);
        }
    };

    this.scrollToRow = function (rowNumber) {

        self._scroll(rowNumber * self.grid.config.rowHeight);
    };

    this.scroll = function(rowCount) {
        self._scroll(self.grid.$viewport.scrollTop() + rowCount * self.grid.config.rowHeight);
    };

    this.getCurrentRow = function () {
        return self.grid.$viewport.scrollTop() / self.grid.config.rowHeight;
    };
}