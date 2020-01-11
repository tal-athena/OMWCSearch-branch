(function()
{
	CKEDITOR.plugins.add('omwlocalstorage',
		{
			init: function(editor)
			{
				editor.on('change',
					function(event)
					{
						var storyId = $('#hdnStoryId').val();
						if (!!storyId)
						{
							var title = $("#storyHeader .blueBarPageTitle");
							if (title.length > 0)
								title = title.text();
							else
								title = $("#hdnTitle").val();

							OMWLocalStorage.SaveStory(editor, storyId, title);
						}
					});
			}
		});
})();
