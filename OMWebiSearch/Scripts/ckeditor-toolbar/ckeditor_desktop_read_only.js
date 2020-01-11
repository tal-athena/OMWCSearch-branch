OMWClientContext.EditorToolbar = (function ()
{
	var buttons = ['Print'];

	var bodyEl = $("body");
	var editorOnly = !!bodyEl.data("editor-only");

	if (editorOnly && bodyEl.data("hide-max-button") === undefined)
		buttons.push('Maximize');

	buttons.push('Maximize');

	return [
		buttons
	];
})();