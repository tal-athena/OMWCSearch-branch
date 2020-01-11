(function () {
    'use strict';

    var contentPasted = false;
    CKEDITOR.plugins.add('omwinsertimg', {
        init: function (editor) {
            editor.addCommand('getNewImageInsert', {
                exec: function (edt) {

                    //Check if angular exists
                    if (!window.angular) {
                        console.error('angular is required to run this command');
                        return;
                    }

                    //Save url
                    var _saveUrl = '/OMWebiSearch/Story/EditStory/GetNewInsert';

                    //Get story controller
                    var scope = angular.element('#contentM').scope();
                    
                    //Call method that opens ImagePopUpDialog
                    var options = {
                        saveUrl: _saveUrl
                    };
                    scope.openImagePopUpFromCkeditor(options, function (result) {
                        //Function that is executed when dialog is closed

                        //Return focus to editor
                        if (edt) {
                            edt.focus();
                        }

                        //Check if result exists and if yes append it to the ckeditor text
                        if (result) {
                            editor.insertHtml(result);
                        }
                    });
                }
            });

            editor.ui.addButton('Insert Image Dialog',
            {
                // Toolbar button tooltip.
                label: 'Insert Image Dialog',
                // Reference to the plugin command name.
                command: 'getNewImageInsert',
                // Button's icon file path.
                icon: this.path + 'images/icon.png'
            });

        }
    });
})();
