(function ($, undefined) {
    var getUniqueId = (function () {
        var uid = 1000;
        return function () { return ++uid; };
    })(),

    // Search profile
    searchProfile = function (id, guid, category, options) {
        this.id = id;
        this.guid = guid;
        this.category = category;
        this.options = options;
        this._init();
    }

    $.extend(searchProfile.prototype, {
        id: 0,
        guid: '',
        category: '',
        options: null,
        contextId: '',

        _init: function () {
        }
    });

    // Category
    category = function (id, name) {
        this.id = id;
        this.name = name;
    }

    $.extend(category.prototype, {
        id: 0,
        name: '',
        profiles: ko.observableArray([]),

        findSearchProfile: function (profileId) {
            for (var i = 0; i < this.profiles().length; i++) {
                if (this.profiles()[i].id == profileId) {
                    return this.profiles()[i];
                }
            }

            return null;
        },

        findSearchProfileByPortletGuid: function (guid) {
            for (var i = 0; i < this.profiles().length; i++) {
                if (this.profiles()[i].guid == guid) {
                    return this.profiles()[i];
                }
            }

            return null;
        },

        onPortletAdded: function (elements, data) {
            var ds = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: '/OMWebiSearch/Search/SearchMain/GetSearchResults',
                        dataType: 'json',
                        type: 'POST',
                        data: {
                            SearchContextID: function () { return data.contextId; },
                            PageNumber: 0
                        }
                    }
                },
                schema: {
                    data: 'SearchHits',
                    model: {
                        id: 'FormattedID',
                        fields: {
                            FormattedID: { type: 'string' },
                            PreviewHeader: { type: 'string' },
                            "Fields[0].DisplayValue": { type: 'string' }
                        }
                    },
                    total: function (data) {
                        return data.TotalSearchHits;
                    }
                },
                pageSize: 5,
                serverPaging: true
                    , change: function (data) {  }
            });

            $(elements).find('#portlet-data-' + data.guid).kendoGrid({
                autoBind: false,
                dataSource: ds,
                columns: [
                    { field: "Fields[0].DisplayValue", width: 100, title: "Date" },
                    { field: "PreviewHeader", width: 430, title: "PreviewHeader" }
                ],
                pageable: {
                    refresh: true,
                    pageSizes: false
                },
                resizable: true
            });

            $(elements).delegate("tbody>tr", "dblclick", function (event) {
                var uid = $(this).attr('data-uid');
                var row = ds.getByUid(uid);
                if (row) {
                    window.open('/OMWebiSearch/Story/EditStory/Index/' + row.id, '_blank');
                }
            });
        }
    });


    // Portlets container model
    portletsContainerModel = function (options) {
        $.extend(this.options, options);
        this._init();
    };

    $.extend(portletsContainerModel.prototype, {
        _model: null,
        _contextId: 0,

        _init: function () {
        },

        getCategories: function (callback, errorCallback) {
            $.ajax(
                '/OMWebiSearch/portlet/container/GetCategories',
                {
                    type: 'POST',
                    success: function (data, textStatus, jqXHR) {
                        callback.apply(this, [data.panes]);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        errorCallback.apply(this, [jqXHR.Reason]);
                    }
                });
        },

        getSearchProfiles: function (categoryId, callback, errorCallback) {
            $.ajax(
                '/OMWebiSearch/portlet/container/GetSearchProfiles',
                {
                    type: 'POST',
                    data: {
                        categoryId: categoryId
                    },
                    success: function (data, textStatus, jqXHR) {
                        callback.apply(this, [categoryId, data.profiles]);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        errorCallback.apply(this, [jqXHR.Reason]);
                    }
                });
        },

        removeSearchProfile: function (categoryId, portletGuid, callback, errorCallback) {
            $.ajax(
                '/OMWebiSearch/portlet/container/RemoveSearchProfiles',
                {
                    type: 'POST',
                    data: {
                        categoryId: categoryId,
                        portletGuid: portletGuid
                    },
                    success: function (data, textStatus, jqXHR) {
                        callback.apply(this, [categoryId, portletGuid]);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        errorCallback.apply(this, [jqXHR.Reason]);
                    }
                });
        },

        performSearch: function (categoryId, portletGuid, params, callback, errorCallback) {
            var self = this;
            var completeSearch = function (contextId) {
                $.ajax(
                    '/OMWebiSearch/Search/SearchMain/GetSearchResults',
                    {
                        type: 'POST',
                        data: {
                            SearchContextID: contextId,
                            PageNumber: 0
                        },
                        success: function (data, textStatus, jqXHR) {
                            callback.apply(this, [categoryId, portletGuid, data]);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            errorCallback.apply(this, [jqXHR.Reason]);
                        }
                    });
            };

            $.ajax(
                '/OMWebiSearch/Search/SearchMain/StartSearch',
                {
                    type: 'POST',
                    data: {
                        model: JSON.stringify(params)
                    },
                    success: function (data, textStatus, jqXHR) {
                        //completeSearch.apply(this, [data.SearchContextID]);
                        callback.apply(this, [categoryId, portletGuid, data.SearchContextID]);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        errorCallback.apply(this, [jqXHR.Reason]);
                    }
                });
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
        busy: ko.observable(false),

        _init: function (options) {
            this._model = this._createModel(options);
            this.loadCategories();
        },

        _createModel: function (options) {
            return new portletsContainerModel(options);
        },

        _onNetworkError: function (error) {
            this.busy(false);
            alert(error || 'Sorry, we\'re unable to perform the request.');
        },

        _onCategoriesLoaded: function (categories) {
            this.categories(
                $.map(categories, function (c) { return new category(c.id, c.name); }));
            this.selectCategory(
                this.categories()[0]);

            this.busy(false);
        },

        _onSearchProfileReceived: function (categoryId, profiles) {
            var self = this;
            var category = this._findCategory(categoryId);

            if (category != null) {
                category.profiles.removeAll();

                $.each(profiles, function (i, p) {
                    var sp = new searchProfile(p.profileId, p.guid, p.category, p.parameters);
                    category.profiles.push(sp);
                    self._model.performSearch(category.id, sp.guid, { "SearchProfileId": p.profileId, "Values": p.parameters }, self._onSearchPerformed.bind(self), self._onNetworkError.bind(self));
                });

                //category.profiles(
                //    $.map(profiles, function (p) { new searchProfile(p.profileId, p.parameters); }));
            }

            this.busy(false);
        },

        _onSearchProfileRemoved: function (categoryId, portletGuid) {
            var category = this._findCategory(categoryId);

            if (category) {
                var profile = category.findSearchProfileByPortletGuid(portletGuid);
                category.profiles.remove(profile);

                if (category.profiles().length == 0) {
                    this.categories.remove(category);

                    if (this.categories().length > 0) {
                        this.selectCategory(
                            this.categories()[0]);
                    }
                }
            }

            this.busy(false);
        },

        _onSearchPerformed: function (categoryId, portletGuid, results) {
            var profile = this._findSearchProfileByPortletGuid(categoryId, portletGuid);

            //ds.data(results.SearchHits);

            //ctxID = results;
            //sharedDS.read();

            profile.contextId = results;
            var ds = $('#portlet-data-' + portletGuid).data("kendoGrid").dataSource;
            ds.read();
        },

        _findCategory: function (categoryId) {
            for (var i = 0; i < this.categories().length; i++) {
                if (this.categories()[i].id == categoryId) {
                    return this.categories()[i];
                }
            }

            return null;
        },

        _findSearchProfile: function (categoryId, profileId) {
            var category = this._findCategory(categoryId);
            return (category != null ? category.findSearchProfile(profileId) : null);
        },

        _findSearchProfileByPortletGuid: function (categoryId, portletGuid) {
            var category = this._findCategory(categoryId);
            return (category != null ? category.findSearchProfileByPortletGuid(portletGuid) : null);
        },

        loadCategories: function () {
            this.busy(true);
            this._model.getCategories(this._onCategoriesLoaded.bind(this), this._onNetworkError.bind(this));
        },

        selectCategory: function (category) {
            this.busy(true);
            this.selectedCategory(category);

            this._model.getSearchProfiles(category.id, this._onSearchProfileReceived.bind(this), this._onNetworkError.bind(this));
        },

        createPortlet: function (data) {
            alert('CP');
        },

        removePortlet: function (category, profile) {
            this.busy(true);
            this._model.removeSearchProfile(category.id, profile.guid, this._onSearchProfileRemoved.bind(this), this._onNetworkError.bind(this));
        }
    });
})(jQuery);