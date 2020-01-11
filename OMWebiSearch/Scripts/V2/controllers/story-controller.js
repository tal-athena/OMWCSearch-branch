angular.module('v2').controller('StoryController',
	[
		'$scope', '$http', '$timeout', function($scope, $http, $timeout)
		{
			var vm = this;

			vm.storyText = '';
			vm.isLoading = false;
			vm.isInitialLoad = true;
			vm.isSaveEnabled = false;

			var _baseUrl;
			var _storyID, _templateID, _systemID, _fieldID;
			var _originalStoryText = null;
			var _storyTitle;
			var _isLocked = false;

			vm.init = function(baseUrl, storyID, templateID, systemID, fieldID)
			{
				_baseUrl = baseUrl;
				_storyID = storyID;
				_templateID = templateID;
				_systemID = systemID;
				_fieldID = fieldID;

				initEditor();

				getStory();
			};

			vm.onChange = function()
			{
				if (!!_originalStoryText && !!vm.storyText)
				{
					var isModified = _originalStoryText.trim() !== vm.storyText.trim();

					vm.isSaveEnabled = isModified;

					if (!_isLocked && isModified)
						lockStory();
					else if (_isLocked && !isModified)
						unlockStory();
				}
			};

			vm.onSave = function()
			{
				saveStory();
			};

			function isSuccess(response)
			{
				if (!!response && !!response.data)
				{
					if (response.data.Status === "OK")
						return true;

					if (!!response.data.Message)
						alert(response.data.Message);
					else
						alert("Error");
				}
				else
					alert("Error");

				return false;
			}

			function requestDone()
			{
				vm.isLoading = false;
			}

			function handleError(error)
			{
				if (!!error && !!error.statusText)
					alert(error.statusText);
				else
					alert("Error");

				requestDone();
			};

			function get(action, params, onSuccess, onError)
			{
				http(action, "GET", params, undefined, onSuccess, onError);
			}

			function post(action, data, onSuccess, onError)
			{
				http(action, "POST", undefined, data, onSuccess, onError);
			}

			function http(action, method, params, data, onSuccess, onError)
			{
				if (vm.isLoading)
					return false;

				vm.isLoading = true;

				$http({
						url: _baseUrl + "StoryH/StoryH/" + action,
						method: method,
						params: params,
						data: data
					}).then(function(response)
					{
						if (isSuccess(response))
							onSuccess(response);

						requestDone();
					},
					function(error)
					{
						if (!!onError)
							onError();

						handleError(error);
					});
			}

			function getStory()
			{
				get("GetStoryV2",
					getParams(),
					function(response)
					{
						_originalStoryText = response.data.StoryText;
						_storyTitle = response.data.StoryTitle;

						vm.storyText = _originalStoryText;

						vm.isInitialLoad = false;
					});
			}

			function saveStory()
			{
				var params = getParams();
				params.text = escape(vm.storyText);

				post("SaveStoryV2",
					params,
					function (response)
					{
						_originalStoryText = vm.storyText;
						vm.isSaveEnabled = false;

						unlockStory();
					});
			}

			function lockStory()
			{
				get("LockStoryV2",
					getParams(),
					function (response)
					{
						_isLocked = true;
					});
			}

			function unlockStory()
			{
				get("UnlockStoryV2",
					getParams(),
					function (response)
					{
						_isLocked = false;
					});
			}

			function getParams()
			{
				return {
					documentID: _storyID,
					systemID: _systemID,
					templateID: _templateID,
					fieldID: _fieldID
				};
			}

			function initEditor()
			{
				vm.options = {};

				// Specify this property if you want to customize individual groups of buttons
				//vm.toolbar = [];

				// Specify this property if you want to only customize list of groups
				vm.options.toolbarGroups = [
					{ name: 'document', groups: ['mode', 'document', 'doctools'] },
					{ name: 'clipboard', groups: ['clipboard', 'undo'] },
					{ name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
					{ name: 'forms', groups: ['forms'] },
					'/',
					{ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
					{ name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
					{ name: 'links', groups: ['links'] },
					{ name: 'insert', groups: ['insert'] },
					'/',
					{ name: 'styles', groups: ['styles'] },
					{ name: 'colors', groups: ['colors'] },
					{ name: 'tools', groups: ['tools'] },
					{ name: 'others', groups: ['others'] },
					{ name: 'about', groups: ['about'] }
				];
			}
		}
	]);