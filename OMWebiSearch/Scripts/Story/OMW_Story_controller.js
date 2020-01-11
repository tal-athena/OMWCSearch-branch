(function ()
{
	angular.module('omwStory')
		.controller('OMWStoryController', ['$rootScope', '$scope', '$q', '$http', '$compile', '$timeout', 'OMWListFieldDialogSvc', 'HeaderFieldContextMenuSvc', 'UndoDialogSvc', 'VersionStorySvc', 'CopyAsDialogSvc', 'OMWStoryImagePopUpDialogSvc', 'OMWOfflineStoryDialogSvc',
			function ($rootScope, $scope, $q, $http, $compile, $timeout, OMWListFieldDialogSvc, HeaderFieldContextMenuSvc, UndoDialogSvc, VersionStorySvc, CopyAsDialogSvc, OMWStoryImagePopUpDialogSvc, OMWOfflineStoryDialogSvc)
			{
				var _storyId = null;
				var _mediaInsertId = null;
				var _deferred = null;

				$scope.fieldsList = [];
				$scope.dialog = null;

				$scope.openImagePopUp = function (storyId)
				{
					console.log(storyId);
					var imgPopUp = OMWStoryImagePopUpDialogSvc.InitPopUp({});
					imgPopUp.open({
						storyId: storyId
					}, function (result)
					{
						console.log(result);
					});
				};

				function checkLocalStorage()
				{
					if (!!window.OMWLocalStorage && OMWLocalStorage.LocalStorageEnabled)
					{
						var storyId = $("#hdnStoryId").val();

						var stories = OMWLocalStorage.LoadStories();
						var story = OMWLocalStorage.FindStory(stories, storyId);
						if (!!story)
						{
							OMWLocalStorage.SetCurrentStoryId(storyId);

							var popup = OMWOfflineStoryDialogSvc.InitPopUp({});
							popup.open({},
								function(result)
								{
									
										
								});
						}
					}
				}

				$scope.openImagePopUpFromCkeditor = function (options, cb)
				{
					var imgPopUp = OMWStoryImagePopUpDialogSvc.InitPopUp(options);
					imgPopUp.open({
						storyId: angular.element('#hdnStoryId').val()
					}, function (result)
					{
						console.log(result);
						if (result && result.status == 200)
						{
							cb(result.data);
						}
						else
						{
							cb();
						}
					});
				};

				$scope.undoHeaderField = function (fieldId)
				{
					var popUp = UndoDialogSvc.InitPopUp();
					popUp.open({
						fieldId: fieldId,
						id: angular.element('#hdnStoryId').val()
					}, function (result)
					{
						console.log(result);
					});
				};

				$scope.versionStory = function (storyId)
				{
					var popUp = VersionStorySvc.InitPopUp();
					popUp.open({
						id: storyId
					}, function (result)
					{
						console.log(result);
					});
				};

				angular.element('#copyAsButton').click(function ()
				{
					var popUp = CopyAsDialogSvc.InitPopUp('some type', "/OMWebiSearch/Document/CopyAs/GetCopyAsListForObject", "/OMWebiSearch/Document/CopyAs/CopyAsCmd");
					popUp.open({
						id: angular.element('#hdnStoryId').val()
					}, function (result)
					{
						console.log(result);
					});
				});

				$scope.clearHeaderField = function (fieldId)
				{
					if (!!fieldId)
					{
						if (!!$scope.dialog)
						{
							for (var i = 0; i < $scope.fieldsList.length; i++)
							{
								var field = $scope.fieldsList[i];
								if (field.FieldID == fieldId)
								{
									field.IsEmpty = true;

									var input = $scope.dialog.find("#" + field.Prefix + field.FieldID);

									if (field.DisplayType == 2) // eOMFieldDisplayType_Combo
									{
										input.data('kendoComboBox').value("");
										var cmbTextBox = input.closest(".searchFieldWrap").find(".k-input");
										cmbTextBox.val("");
									}
									else if (field.DisplayType == 4) // eOMFieldDisplayType_Check									
										input.prop('checked', false).change();

									input.val("").change();

									$scope.updateDirtyIndicator();
									break;
								}
							}
						}
						else
						{
							var parentScope = angular.element('#headerSearchController').scope();

							var position = OMWClientContext.HeaderSearch.findElementPosition(parentScope.fieldsList, 'Key', fieldId);
							if (position != null)
							{

								parentScope.updateElement(fieldId, null, position);

								//Event to server
								OMWClientContext.HeaderSearch.updateElementValue(fieldId, null);
							}
						}
					}
				};

				$scope.isClearEnabled = function (fieldId)
				{
					if (!!fieldId)
					{
						var element = angular.element("header-field-context-menu[field-id=" + fieldId + "]");
						if (element.length > 0)
						{
							var children = element.parent().children(":not([field-id=" + fieldId + "])");
							var readonly = children.find("*[disabled]");
							if (readonly.length === 0)
								return true;
						}
					}

					return false;
				};

				$scope.isVisible = function ()
				{
					return !$scope.dialog;
				};

				$scope.initMediaInsertDialog = function (editor)
				{
					editor.addCommand('mediaInsertDialog', new CKEDITOR.dialogCommand('mediaInsertDialog'));

					CKEDITOR.dialog.add('mediaInsertDialog', function (editor)
					{
						return {
							title: 'Media Insert',
							minWidth: 650,
							minHeight: 400,
							contents:
								[
									{
										id: 'general',
										label: 'Media Insert',
										elements:
											[
												{
													id: 'content',
													type: 'html',
													html: '<div></div>'
												}
											]
									}
								],
							onOk: function ()
							{
								var changedFields = $scope.getChangedValues();
								if (changedFields.length > 0)
								{
									var url = '/OMWebiSearch/StoryH/StoryH/UpdateMediaInsertFields';

									$http({
											url: url,
											method: "POST",
											data: { storyId: _storyId, imageId: _mediaInsertId, fields: JSON.stringify(changedFields) }
										}).then(function (response)
										{

										},
										function (response)
										{
											alert('Failed to update fields');
										});
								}
							},
							onHide: function ()
							{
								$scope.dialog = null;

								if (!!_deferred)
									_deferred.resolve();
							},
							onShow: function ()
							{
								$(".cke_dialog_background_cover").css("z-index", 1000);
								$(".cke_dialog").css("z-index", 1001);

								var content = this.getContentElement('general', 'content');
								var id = content.domId;
								var $div = $('#' + id);
								$div.height(400);

								$div.keydown(function(e)
								{
									if (e.keyCode === 9) // Tab
										e.stopPropagation();
								});

								$scope.dialog = angular.element(this._.element.$);

								$scope.dialog.find(".cke_dialog_ui_button_ok").keydown(
									function (e)
									{
										if (e.keyCode === 9) // Tab
										{
											e.stopPropagation();
											e.preventDefault();

											if (e.shiftKey)
											{
												var allInputs = $scope.getAllEditableInputs();
												if (allInputs.length > 0)
													$(allInputs[allInputs.length - 1]).focus();
											}
											else
												$scope.dialog.find(".cke_dialog_ui_button_cancel").focus();
										}
									});

								$scope.dialog.find(".cke_dialog_ui_button_cancel").keydown(
									function (e)
									{
										if (e.keyCode === 9) // Tab
										{
											e.stopPropagation();
											e.preventDefault();

											if (!e.shiftKey)
											{
												var allInputs = $scope.getAllEditableInputs();
												if (allInputs.length > 0)
													$(allInputs[0]).focus();
											}
											else
												$scope.dialog.find(".cke_dialog_ui_button_ok").focus();
										}
									});

								$scope.dialog.removeClass("cke_reset_all");
								$scope.dialog.addClass("media-insert-dialog");

								$div.html('<div class="media-insert-loader"></div>');

								var url = '/OMWebiSearch/StoryH/StoryH/MediaInsertFields';

								$http({
									url: url,
									method: "GET",
									params: { storyId: _storyId, imageId: _mediaInsertId }
								}).then(function (response)
								{
									if (!!response.data)
									{
										var fields = response.data;
										$div.html(fields);

										var fieldsList = JSON.parse($div.find("[name='fields-data']").val());
										$scope.fieldsList = fieldsList;

										var html = angular.element('#' + id);
										html.removeClass('cke_reset_all');

										html = html.contents();
										$compile(html)($scope);

										$timeout(function()
										{
											$scope.initFields();
										});
									}
									else
									{
										alert('Failed to get fields from server');
									}
								},
									function (response)
									{
										alert('Failed to get fields from server');
									});
							}
						};
					});

					//editor.execCommand('mediaInsertDialog');
				};

				$scope.initFields = function ()
				{
					var searchPageComboboxes = $scope.dialog.find('.customCombobox,.customComboboxNotEditable');
					$(searchPageComboboxes).kendoComboBox({
						autoComplete: true
					});

					searchPageComboboxes.each(function ()
					{
						var ds = $(this).data().kendoComboBox;
						var indexInArray = $(this).data('indexofelement');

						var fieldValue = $scope.fieldsList[indexInArray].Value;

						ds.value(fieldValue);
						ds.text(fieldValue);
					});

					for (var i = 0; i < $scope.fieldsList.length; i++)
					{
						var field = $scope.fieldsList[i];
						var input = $scope.dialog.find("#" + field.Prefix + field.FieldID);
						if (input.length > 0)
						{
							$scope.addChangeListener(input, field);
						}
						else
						{
							console.error("Cannot find field withd ID " + field.FieldID);
						}
					}


					var allInputs = $scope.getAllEditableInputs();
					if (allInputs.length > 0)
						$(allInputs[0]).focus();

					$rootScope.$on('internal-link-changed',
						function()
						{
							$scope.updateDirtyIndicator();
						});
				};

				$scope.getAllEditableInputs = function()
				{
					var inputs = $scope.dialog.find(".tags input, select.customCombobox, select.customComboboxNotEditable, .SearchInput");
					for (let i = 0; i < inputs.length; i++)
					{
						var input = $(inputs[i]);
						var disabled = !!input.attr("disabled") || input[0].hasAttribute("disabled");
						var readonly = !!input.attr("readonly") || input[0].hasAttribute("readonly");

						if (disabled || readonly)
						{
							inputs.splice(i, 1);
							i--;
						}
					}

					return inputs;
				};

				$scope.addChangeListener = function(input, field)
				{
					input.change(function()
					{
						field.IsEmpty = false;

						$scope.updateDirtyIndicator();
					});
				};

				$scope.editListHeaderField = function(fieldId)
				{
					var field = null;
					for (var i = 0; i < $scope.fieldsList.length; i++)
					{
						if ($scope.fieldsList[i].FieldID == fieldId)
						{
							field = $scope.fieldsList[i];
							break;
						}
					}

					if (!!field)
					{
						var value = $scope.dialog.find("#" + field.Prefix + field.FieldID).val();

						var item = {
								Value: value,
								FieldID: fieldId
							};

						var popUp = OMWListFieldDialogSvc.InitPopUp('collection');
						popUp.open({
								item: item,
								collectionId: _storyId,
								fieldId: fieldId,
								splitter: ';',
								dontSendUpdateEvent: true
							}, function (result)
							{
								field.IsEmpty = false;
								$scope.dialog.find("#list_" + fieldId).val(result).change();

								$scope.updateDirtyIndicator();
							});
					}
				};

				$scope.updateDirtyIndicator = function()
				{
					var changedFields = $scope.getChangedValues();

					for (var i = 0; i < $scope.fieldsList.length; i++)
					{
						var field = $scope.fieldsList[i];

						var isChanged = false;
						for (var j = 0; j < changedFields.length; j++)
						{
							var changedField = changedFields[j];
							if (field.FieldID == changedField.FieldID)
							{
								isChanged = true;
								break;
							}
						}

						/////////////////////////////////////////////////////////////////////

						var input = $scope.dialog.find("#" + field.Prefix + field.FieldID);
						var item = input.closest(".media-insert-field-item");
						var label = item.find(".searchFieldLabel");
						if (label.length > 0)
						{
							var indicator;

							if (isChanged)
							{
								indicator = label.find(".dirty-indicator");
								if (indicator.length === 0)
									label.append('<span class="dirty-indicator">*</span>');
							}
							else
							{
								indicator = label.find(".dirty-indicator");
								if (indicator.length > 0)
									indicator.remove();
							}
						}
					}
				};

				$scope.getChangedValues = function ()
				{
					var changedFields = [];

					for (var i = 0; i < $scope.fieldsList.length; i++)
					{
						var field = $scope.fieldsList[i];
						var input = $scope.dialog.find("#" + field.Prefix + field.FieldID);
						if (input.length > 0)
						{
							var value;

							var isChanged = false;
							if (field.DisplayType == 4) // eOMFieldDisplayType_Check
							{
								value = input.prop("checked") ? 1 : 0;
								if (value !== 0 || field.OriginalValue)
									isChanged = value != field.OriginalValue;
							}
							else
							{
								value = input.val();
								isChanged = value != field.OriginalValue;
							}

							if (isChanged)
							{
								value = $scope.formatForServer(field, value);

								changedFields.push({
										FieldID: field.FieldID,
										Value: value,
										IsEmpty: field.IsEmpty
									});
							}
						}
						else
						{
							console.error("Cannot find field withd ID " + field.FieldID);
						}
					}

					return changedFields;
				};

				$scope.formatForServer = function(field, value)
				{
					if (field.DisplayType == 6) // eOMFieldDisplayType_DateTime
					{

					}
					else if (field.DisplayType == 7) // eOMFieldDisplayType_Duration
					{

					}
					else if (field.DisplayType == 8) // eOMFieldDisplayType_TimeOnly
					{

					}
					else if (field.DisplayType == 9) // eOMFieldDisplayType_DateOnly
					{

					}

					return value;
				};

				$scope.openMediaInsertDialog = function (editor, storyId, mediaInsertId)
				{
					_deferred = $q.defer();

					_storyId = storyId;
					_mediaInsertId = mediaInsertId;

					editor.execCommand("mediaInsertDialog");

					return _deferred.promise;
				};

				HeaderFieldContextMenuSvc.setMenuItems([
					{ id: 'undo', text: 'Undo', func: $scope.undoHeaderField, checkIfVisible: $scope.isVisible },
					{ id: 'clear', text: 'Clear', func: $scope.clearHeaderField, checkIfEnabled: $scope.isClearEnabled }
				]);

				checkLocalStorage();
			}]);
})();