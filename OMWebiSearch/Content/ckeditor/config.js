/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    // config.uiColor = '#AADC6E';
    config.fontSize_sizes = '8/8pt;9/9pt;10/10pt;11/11pt;12/12pt;14/14pt;16/16pt;18/18pt;20/20pt;22/22pt;24/24pt;26/26pt;28/28pt;36/36pt;48/48pt';
    //config.protectedSource.push(/<span[^>]*><\/span>/g);
    config.allowedContent = true;
    //config.browserContextMenuOnCtrl = false;
    
    //config.fillEmptyBlocks = true;
    config.enterMode = CKEDITOR.ENTER_BR;
    config.disableNativeSpellChecker = false;
    
    config.defaultLanguage = 'en';
    config.removePlugins = 'elementspath';
    config.assets_languages = ['en'];
};
