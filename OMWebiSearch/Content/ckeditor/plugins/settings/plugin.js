CKEDITOR.plugins.add('settings',
{
    init: function (editor) {
        editor.addCommand('settingsDialog', new CKEDITOR.dialogCommand('settingsDialog'));

        editor.ui.addButton('Settings',
		{
		    // Toolbar button tooltip.
		    label: 'Settings',
		    // Reference to the plugin command name.
		    command: 'settingsDialog',
		    // Button's icon file path.
		    icon: this.path + 'images/icon.png'
		});

        CKEDITOR.dialog.add('settingsDialog', function (editor) {
           // var dialogObj = this;
            return {
                title: 'Change settings',
                minWidth: 200,
                minHeight: 100,
                contents:
                [
                    {
                        id: 'general',
                        label: 'Settings',
                        elements:
                        [
                            // UI elements of the Settings tab.
                            {
                                type: 'checkbox',
                                id: 'autoSave',
                                label: 'Auto save',
                                //'default': true,
                                commit: function (data) {
                                    data.autoSave = this.getValue();
                                },
                                onClick: function () {
                                    var saveBeforeExit =  this.getDialog().getContentElement('general', 'saveBeforeExit');
                                    if (this.getValue() == true) {
                                        saveBeforeExit.setValue(true);
                                        saveBeforeExit.disable();
                                    }
                                    else {
                                        saveBeforeExit.enable();
                                    }
                                }
                            },
                            {
                                type: 'checkbox',
                                id: 'saveBeforeExit',
                                label: 'Save before exit',
                                //'default': true,
                                commit: function (data) {
                                    data.saveBeforeExit = this.getValue();
                                }
                            }
                        ]
                    }
                ],
                onOk: function () {
                    // The code that will be executed when the user accepts the changes.
                    var dialog = this,
						data = {};
                    // Populate the data object with data entered in the dialog window.
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html#commitContent
                    this.commitContent(data);

                    //Save localy
                    if (supports_html5_storage()) {
                        localStorage["OMWeb_CKEditor"] = JSON.stringify(data);
                    }

                },
                onShow: function () {
                    this.getContentElement('general', 'autoSave').setValue(_getAutoSaveValueForCKEditor());
                    this.getContentElement('general', 'saveBeforeExit').setValue(_getSaveBeforeExitValueForCKEditor());
                }
            };
        });
    }
});
