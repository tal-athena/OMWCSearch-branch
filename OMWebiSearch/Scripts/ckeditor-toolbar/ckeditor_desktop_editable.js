OMWClientContext.EditorToolbar = (function()
{
	var buttons = ['Insert Image Dialog'];

	var bodyEl = $("body");
	var editorOnly = !!bodyEl.data("editor-only");

	if (editorOnly && bodyEl.data("hide-max-button") === undefined)
		buttons.push('Maximize');

	return [
		['Maximize', 'Source', 'DocProps', '-', 'Save', 'NewPage', 'Preview', '-', 'Templates'],
		['Cut', 'Copy', 'Paste', 'PasteText', 'PasteWord', '-', 'Print', 'SpellCheck'],
		['Undo', 'Redo', '-', 'Find', 'Replace', '-', 'SelectAll', 'RemoveFormat'],
		'/',
		['Bold', 'Italic', 'Underline', 'StrikeThrough', '-', 'Subscript', 'Superscript'],
		['OrderedList', 'UnorderedList', '-', 'Outdent', 'Indent', 'Blockquote'],
		['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull'],
		'/',
		['Style', 'FontFormat', 'FontName', 'FontSize'],
		['TextColor', 'BGColor'],
		['FitWindow', 'ShowBlocks', '-', 'About'],
		['records', 'Settings', 'Insert Date Time'],
		buttons
	];
})();