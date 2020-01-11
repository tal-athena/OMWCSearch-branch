ko.bindingHandlers.sortableList = {
    init: function (element, valueAccessor, allBindingsAccessor, context) {
        var connectWith = allBindingsAccessor().connectWith;
        $(element).data("sortList", valueAccessor()); //attach meta-data

        $(element).sortable({
            //containment: connectWith ? connectWith : 'parent',
            handle: '.portlet-header',
            update: function (event, ui) {
                var item = ui.item.data("sortItem");
                if (item) {
                    //identify parents
                    var originalParent = ui.item.data("parentList");
                    var newParent = ui.item.parent().data("sortList");
                    //figure out its new position
                    var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                    if (position >= 0) {
                        //originalParent.remove(item);
                        //newParent.splice(position, 0, item);
                    }
                    //ui.item.remove();
                }
            },
            connectWith: connectWith
        });
    }
};

//attach meta-data
ko.bindingHandlers.sortableItem = {
    init: function (element, valueAccessor) {
        var options = valueAccessor();
        $(element).data("sortItem", options.item);
        $(element).data("parentList", options.parentList);
    }
};

//control visibility, give element focus, and select the contents (in order)
ko.bindingHandlers.visibleAndSelect = {
    update: function (element, valueAccessor) {
        ko.bindingHandlers.visible.update(element, valueAccessor);
        if (valueAccessor()) {
            setTimeout(function () {
                $(element).focus().select();
            }, 0); //new tasks are not in DOM yet
        }
    }
}