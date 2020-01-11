OMWLocalStorage = {
		LocalStorageEnabled: true,
		StorageKey: "stories",
		IsOffline: false
};

OMWLocalStorage.SetCurrentStoryId = function(id)
{
	localStorage.CurrentStory = id;
};

OMWLocalStorage.GetCurrentStoryId = function()
{
	return localStorage.CurrentStory;
};

OMWLocalStorage.UpdateOfflineState = function(isOffline)
{
	var mobileIndicator = $("#idOffline");
	if (mobileIndicator.length > 0)
	{
		if (isOffline)
			mobileIndicator.show();
		else
			mobileIndicator.hide();

		OMWLocalStorage.IsOffline = isOffline;
	}
	else
	{
		if (OMWLocalStorage.IsOffline !== isOffline)
		{
			OMWLocalStorage.IsOffline = isOffline;

			var $body = angular.element(document.body);
			var $rootScope = $body.scope().$root;
			$rootScope.$apply(function ()
			{
				$rootScope.$broadcast("offline-status-changed", { isOffline: isOffline });
			});
		}
	}
};

OMWLocalStorage.SaveStory = function (editor, id, title)
{
	var stories = OMWLocalStorage.LoadStories();
	var story = OMWLocalStorage.FindStory(stories, id);
	if (!story)
	{
		story = {
				ID: id
			};

		stories.push(story);
	}

	var text = editor.getData();

	if (story.Title !== title || story.Text !== text)
	{
		story.Title = title;
		story.Text = text;

		OMWLocalStorage.SaveStories(stories);
	}
};

OMWLocalStorage.LoadStory = function (editor, id)
{
	var stories = OMWLocalStorage.LoadStories();
	var story = OMWLocalStorage.FindStory(stories, id);
	if (!!story)
	{
		editor.setData(story.Text);
	}
};

OMWLocalStorage.ClearStory = function (id)
{
	var stories = OMWLocalStorage.LoadStories();
	var story = OMWLocalStorage.FindStory(stories, id);
	if (!!story)
	{
		var index = stories.indexOf(story);
		stories.splice(index, 1);
		OMWLocalStorage.SaveStories(stories);
	}
};

OMWLocalStorage.Ping = function ()
{
	var baseUrl = '';

	if (!!window.OMWMobileStory)
		baseUrl = OMWMobileStory.OMWBaseUrl;
	else
		baseUrl = $("#hdnAppBaseUrl").val();

	$.ajax({
			url: baseUrl + "Story/EditStory/Ping",
			type: "GET",
			success: function (response)
			{
				if (response)
					OMWLocalStorage.UpdateOfflineState(false);
				else
					OMWLocalStorage.UpdateOfflineState(true);
			},
			error: function (err)
			{
				OMWLocalStorage.UpdateOfflineState(true);
			}
		});
};

OMWLocalStorage.SaveStories = function(stories)
{
	localStorage.setItem(OMWLocalStorage.StorageKey, JSON.stringify(stories));
};

OMWLocalStorage.LoadStories = function()
{
	try
	{
		var json = localStorage.getItem(OMWLocalStorage.StorageKey);
		if (!!json)
			return JSON.parse(json);
	}
	catch (e)
	{
	}

	return [];
};

OMWLocalStorage.FindStory = function(stories, id)
{
	for (var i = 0; i < stories.length; i++)
	{
		var story = stories[i];
		if (story.ID === id)
			return story;
	}

	return null;
};

OMWLocalStorage.GetSavedStoriesCount = function()
{
	return OMWLocalStorage.LoadStories().length;
}

setInterval(OMWLocalStorage.Ping, 10000);