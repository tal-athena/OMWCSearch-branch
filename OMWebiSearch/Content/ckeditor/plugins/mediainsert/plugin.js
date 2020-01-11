CKEDITOR.plugins.add('mediainsert', {
	requires: 'widget',
	init: function (editor)
	{
		editor.widgets.add('mediainsert', {

			requiredContent: 'div(MediaInsert)',

			upcast: function (element)
			{
				return element.hasClass('MediaInsert');
			},

			init: function()
			{
				var parent = this.element.$.parentElement;
				parent.style.display = 'inline-block';
				parent = parent.parentElement;
				parent.style.display = 'inline-block';
			}

		});

		editor.addFeature(editor.widgets.registered.mediainsert);
	}
});