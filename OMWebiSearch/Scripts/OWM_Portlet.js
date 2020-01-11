(function ($, undefined) {
    // Category
    category = function (id, name) {
        this.id = id;
        this.name = name || '';
    }

    // Portlets container model
    portletsContainerModel = function (options) {
        $.extend(this.options, options);
        this._init();
    };

    $.extend(portletsContainerModel.prototype, {
        _model: null,

        _init: function () {
        }
    });


    // Portlets container view model
    portletsContainerViewModel = function (options) {
        this._init(options);
    };

    $.extend(portletsContainerViewModel.prototype, {
        _model: null,
        categories: ko.observableArray([]),
        selectedCategory: ko.observable(''),

        _init: function (options) {
            this._model = this._createModel(options);

            this.categories([new category(1, 'Agencies'), new category(2, 'Events and more'), new category(3, 'Cross media')]);
            this.selectedCategory(
                this.categories()[0]);
        },

        _createModel: function (options) {
            return new portletsContainerModel(options);
        },

        selectCategory: function (category) {
            this.selectedCategory(category);
        }
    });

    $(document).ready(function () {
        var containerVM = new portletsContainerViewModel();
        ko.applyBindings(containerVM, $('#portletsContainer').get(0));
    });

})(jQuery);