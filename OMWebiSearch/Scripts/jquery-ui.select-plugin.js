(function($)
	{
		$.widget("mobile.selectWidget",
			$.mobile.widget,
			{
				options: {
					id: "",
					className: "",
					title: "",
					fieldId: -1,
					storyId: "",
					value: "",
					separator: ";",
					isReadOnly: false,
					isEditable: false,
					isDynamic: false,
					showSuggestions: true,
					hasSelectionList: false,
					isMultiSelect: true,
					autoSave: false,
					dynamicUrl: "",
					suggestionsUrl: "",
					contentUrl: "",
					scrollTop: 0,
					suggestionsLimit: 30,
					showTags: true
				},

				_create: function()
				{
					var rootElement = this.element;
					var thisObj = this;

					thisObj.loadingSuggestions = false;

					if (this.options.isReadOnly)
					{
						var label = '<label class="field-value">' + this.options.value + '</label>';

						rootElement.append(label);
					}
					else if (this.options.isEditable)
					{
						var placeholder = this.options.showTags ? ' placeholder="Type to add value"' : '';

						var textBox =
							'<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><div class="tags"><div class="input-container"><input class="text-input" type="text"' + placeholder + ' /></div></div></div>';

						var container = '<div class="edit-container">' + textBox;
						if (this.options.hasSelectionList)
						{
							var style = this.options.showTags ? ' style="padding-top: 6px"' : '';

							var button =
								'<div class="dropdown-button-container"><div class="dropdown-button"' + style + '><span class="ui-icon ui-icon-bullets ui-btn-icon-right"></span></div></div>';
							container += button;
						}

						container += "</div>";

						if (thisObj.options.showSuggestions)
						{
							container +=
								'<div class="suggestions-container" style="display: none"><img class="suggestion-loader" style="display: none" src="' +
								this.options.contentUrl +
								'/Images/loader1.gif" /><ul class="suggestions"></ul><div>';
						}

						rootElement.append(container);

						if (!!thisObj.options.id)
						{
							var hiddenInput = '<input type="text" id="' + thisObj.options.id + '" class="' + thisObj.options.className;
							hiddenInput += '" style="width: 0; height: 0; border-width: 0" data-defaultvalue="' + thisObj.options.value + '" data-label="' + thisObj.options.title + '" />';
							rootElement.append(hiddenInput);

							hiddenInput = rootElement.find("#" + thisObj.options.id);
							hiddenInput.on("change",
								function(e)
								{
									triggerChangeEvent($(e.target).val());
								});
						}

						if (thisObj.options.showSuggestions)
						{
							var suggestions = rootElement.find(".suggestions");
							suggestions.listview();
						}

						textBox = rootElement.find("input.text-input");
						if (this.options.showTags)
							updateTagsFromValue();
						else
							textBox.val(this.options.value);

						textBox.on("focus",
							function(e)
							{
								$(this).closest(".ui-input-text").addClass("ui-focus");
							});

						textBox.on("blur",
							function(e)
							{
								$(this).closest(".ui-input-text").removeClass("ui-focus");

								if (!thisObj.options.showTags)
								{
									triggerChangeEvent($(e.target).val());
								}

								if (thisObj.options.showSuggestions)
								{
									setTimeout(function()
									{
										var sugList = rootElement.find('.suggestions');
										sugList.html("");
										sugList.listview("refresh");

										var container = rootElement.find(".suggestions-container");
										container.hide();
									}, 150);
								}
							});

						textBox.on("input.text-input", onTextBoxInput);

						textBox.on("keydown", onTextBoxKeydown);

						if (this.options.hasSelectionList)
							rootElement.on("click", ".dropdown-button", onDropdownButtonClick);
					}
					else if (this.options.hasSelectionList)
					{
						var label = '<label class="field-value">' + this.options.value + '</label>';
						var button = '<div tabindex="0" class="ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow">' +
							label +
							'</div>';

						rootElement.append(button);

						rootElement.on("click", ".ui-btn", onDropdownButtonClick);
					}

					$(document).trigger("selectWidgetCreate");

					function onDropdownButtonClick(event)
					{
						var popup = $("#idSelectPluginPopup");

						var content = popup.find(".select-plugin-content");

						var list = content.find(".select-plugin-list");
						list.unbind();
						list.empty();
						list.scrollTop(0);

						var buttons = popup.find(".select-plugin-popup-buttons");
						buttons.css("visibility", "hidden");

						var btnCancel = $(buttons.children()[0]);
						var btnOK = $(buttons.children()[1]);

						btnCancel.unbind();
						btnCancel.click(function()
						{
							thisObj.options.scrollTop = list.scrollTop();
							hidePopup(popup);
						});

						btnOK.unbind();

						if (thisObj.options.isMultiSelect)
						{
							btnOK.css("display", "inline-block");
							btnOK.click(function()
							{
								thisObj.options.scrollTop = list.scrollTop();

								var selectedValues = [];

								var checkedItems = list.find(":checked");
								for (var i = 0; i < checkedItems.length; i++)
									selectedValues.push($(checkedItems[i]).data("value"));

								setSelectedValues(selectedValues, thisObj.options.autoSave);
								hidePopup(popup);
							});
						}
						else
							btnOK.css("display", "none");

						var loader = popup.find(".select-plugin-loader");

						if (thisObj.options.isDynamic)
						{
							loader.show();

							showPopup(popup);

							$.post(thisObj.options.dynamicUrl, { storyID: thisObj.options.storyId, fieldID: thisObj.options.fieldId }).then(
								function(response)
								{
									try
									{
										addTagsToList(response);

										var splittedFieldValues = getSplittedFieldValues();

										for (var i = 0; i < response.length; i++)
										{
											var val = response[i];

											var isSelected = isValueSelected(splittedFieldValues, val);

											var type = thisObj.options.isMultiSelect ? "checkbox" : "radio";

											var displayValue = !!(response[i].trim()) ? response[i] : "&nbsp;";

											var html = '<li><div class="ui-' +
												type +
												'">' +
												'<label class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ' +
												(isSelected ? 'ui-' + type + '-on' : 'ui-' + type + '-off') +
												'">' +
												displayValue +
												'</label>' +
												'<input type="' +
												type +
												'" class="headerFieldCheckBox" data-value="' +
												val +
												'"' +
												(isSelected ? 'checked="checked"' : '') +
												'/>' +
												'</div></li>';

											list.append(html);
										}

										list.on("click", "li", toggleCheckbox);

										buttons.css("visibility", "visible");
									}
									catch (e)
									{
										alert(e);
										hidePopup(popup);
									}

									loader.hide();
								},
								function(error)
								{
									loader.hide();
									hidePopup(popup);
									alert(error.statusText);
								});
						}
						else
						{
							loader.hide();

							var splittedFieldValues = getSplittedFieldValues();

							var values = [];
							var options = rootElement.find("select option");
							for (var j = 0; j < options.length; j++)
							{
								var opt = $(options[j]);
								values.push(opt.val());
							}

							addTagsToList(values);

							for (var i = 0; i < values.length; i++)
							{
								var val = values[i];

								var isSelected = isValueSelected(splittedFieldValues, val);

								var displayValue = !!(val.trim()) ? val : "&nbsp;";

								var html = '<li><div class="ui-checkbox">' +
									'<label class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ' +
									(isSelected ? 'ui-checkbox-on' : 'ui-checkbox-off') +
									'">' +
									displayValue +
									'</label>' +
									'<input type="checkbox" class="headerFieldCheckBox" data-value="' +
									val +
									'"' +
									(isSelected ? 'checked="checked"' : '') +
									'/>' +
									'</div></li>';

								list.append(html);
							}

							list.on("click", "li", toggleCheckbox);
							list.scrollTop(thisObj.options.scrollTop);

							buttons.css("visibility", "visible");

							showPopup(popup);
						}
					}

					function addTagsToList(values)
					{
						var tags = getTagsValuesArray();
						var addedTagsCount = 0;

						for (var i = 0; i < tags.length; i++)
						{
							var tagValue = tags[i];
							if (values.indexOf(tagValue) === -1)
							{
								if (values.length > 0 && values[0] === '')
									addedTagsCount++;

								values.splice(addedTagsCount, 0, tagValue);
								addedTagsCount++;
							}
						}
					}

					function toggleCheckbox(e)
					{
						if (thisObj.options.isMultiSelect)
						{
							var checkbox = $(e.currentTarget).find("input");

							var checkedAttr = checkbox.attr("checked");
							isChecked = checkedAttr == "checked";

							isChecked = !isChecked;

							if (isChecked)
								checkbox.attr("checked", "checked");
							else
								checkbox.removeAttr("checked");

							var label = $(e.currentTarget).find("label");
							if (isChecked)
							{
								label.addClass("ui-checkbox-on");
								label.removeClass("ui-checkbox-off");
							}
							else
							{
								label.addClass("ui-checkbox-off");
								label.removeClass("ui-checkbox-on");
							}
						}
						else
						{
							var list = rootElement.find(".select-plugin-list");
							thisObj.options.scrollTop = list.scrollTop();

							var radio = $(e.currentTarget).find("input");

							var selectedValues = [radio.data("value")];

							setSelectedValues(selectedValues, thisObj.options.autoSave);

							var popup = $("#idSelectPluginPopup");
							hidePopup(popup);
						}
					}

					function getSplittedFieldValues()
					{
						var fieldValue = thisObj.options.value;

						if (!fieldValue || fieldValue.length === 0)
							return [];

						var values = fieldValue.split(thisObj.options.separator);
						return values;
					}

					function isValueSelected(splittedValues, value)
					{
						value = value.trim();

						for (var i = 0; i < splittedValues.length; i++)
						{
							if (splittedValues[i].trim() == value)
							{
								splittedValues.splice(i, 1);

								for (var j = i; j < splittedValues.length; j++)
								{
									if (splittedValues[j].trim() == value)
									{
										splittedValues.splice(j, 1);
										j--;
									}
								}

								return true;
							}
						}

						return false;
					}

					function setSelectedValues(values, save)
					{
						var fieldValue = "";
						for (var i = 0; i < values.length; i++)
						{
							var val = values[i];
							values.splice(i, 1);
							i--;

							var duplicate = false;
							for (var j = 0; j < values.length; j++)
							{
								if (values[j].trim() == val.trim())
								{
									duplicate = true;
									break;
								}
							}

							if (!duplicate)
							{
								if (fieldValue.length > 0)
									fieldValue += thisObj.options.separator;

								fieldValue += val;
							}
						}

						if (thisObj.options.isEditable)
						{
							if (thisObj.options.showTags)
								rootElement.find("input.text-input").val("");
							else
								rootElement.find("input.text-input").val(fieldValue);
						}
						else
							rootElement.find(".field-value").text(fieldValue);

						triggerChangeEvent(fieldValue, save);
					}

					function triggerChangeEvent(value, save)
					{
						thisObj.options.value = value;

						if (!!thisObj.options.id)
						{
							var input = rootElement.find("#" + thisObj.options.id);
							input.val(value);

							input = rootElement.find("input.text-input");
							if (thisObj.options.showTags)
								input.val("");
							else
								input.val(value);
						}

						if (thisObj.options.showTags)
							updateTagsFromValue();

						$(document).trigger("selectWidgetValueChanged",
							{ fieldId: thisObj.options.fieldId, value: thisObj.options.value, save: save });
					}

					function showPopup(popup)
					{
						popup.popup();

						var label = popup.find(".select-plugin-field-title");
						label.text(thisObj.options.title);

						var buttons = popup.find("ul:first-child");
						popup.show();
						popup.popup("open");

						var list = popup.find(".select-plugin-list");

						var height = window.innerHeight - 20;
						popup.css("height", height + "px");
						list.css("height", ((height - (buttons.height() + 15)) + "px"));
					}

					function hidePopup(popup)
					{
						popup.popup("close");
						popup.hide();

						//if (thisObj.options.isEditable)
						//	rootElement.find("input").focus();
					}

					function onTextBoxKeydown(e)
					{
						var val;

						if (e.keyCode == 13)
						{
							val = $(e.currentTarget).val();
							addTag(val);
						}
						else if (e.keyCode == 8)
						{
							val = $(e.currentTarget).val();
							if (val.length === 0)
							{
								var focused = rootElement.find("div.focused");
								if (focused.length > 0) {
									focused.parent().remove();

									updateValueFromTags();
								}
								else {
									var tag = rootElement.find("div.tags div.tag-element").last().find("div");
									tag.addClass("focused");
								}
							}
						}
						else
						{
							var items = rootElement.find("div.focused");
							items.removeClass("focused");
						}
					}

					function onTextBoxInput(e)
					{
						var $input = $(this);
						var text = $input.val();

						if (!thisObj.options.showSuggestions)
						{
							if (!thisObj.options.showTags)
							{
								triggerChangeEvent(text);
							}

							return;
						}

						var updatedValue;
						if (thisObj.options.showTags)
						{
							updatedValue = text;
						}
						else
						{
							var oldVal = $input.attr('data-previous-val');
							if (oldVal === undefined) {
								oldVal = thisObj.options.value;
							}

							var newVal = text.split(thisObj.options.separator);
							oldVal = oldVal.split(thisObj.options.separator);

							//Find difference in arrays and only work with one of them
							var length = newVal.length;
							if (oldVal.length < newVal.length)
								length = oldVal.length;

							var index = -1;
							for (var i = 0; i < length; i++) {
								if (newVal[i].trim() !== oldVal[i].trim()) {
									//Found different one
									index = i;
									break;
								}
							}

							updatedValue = !!(newVal[index]) ? newVal[index].trim() : '';
						}

						var sugList = rootElement.find('.suggestions');
						sugList.unbind('click');

						sugList.html("");
						sugList.listview("refresh");

						if (!thisObj.options.showTags)
							triggerChangeEvent(text);

						if (updatedValue.length > 0 && !thisObj.loadingSuggestions)
						{
							var container = rootElement.find(".suggestions-container");
							var loader = rootElement.find(".suggestion-loader");

							if (thisObj.options.isDynamic || !thisObj.options.hasSelectionList)
							{
								container.show();
								loader.show();

								thisObj.loadingSuggestions = true;

								$.post(thisObj.options.suggestionsUrl,
									{ storyID: thisObj.options.storyId, fieldID: thisObj.options.fieldId, value: updatedValue }).then(
									updateSuggestions,
									function(error)
									{
										thisObj.loadingSuggestions = false;
										loader.hide();
										container.hide();
										alert(error.statusText);
									});
							}
							else
							{
								var suggestions = [];
								var options = rootElement.find("select option");

								for (var i = 0; i < options.length; i++)
								{
									var opt = $(options[i]);
									var val = opt.val();

									if (val.toLowerCase().indexOf(updatedValue.toLowerCase()) !== -1)
										suggestions.push(val);
								}

								container.show();

								updateSuggestions(suggestions);
							}

							function updateSuggestions(response)
							{
								try
								{
									function highlightSuggestion(suggestion, value)
									{
										var pos = suggestion.toLowerCase().indexOf(value);
										if (pos !== -1)
										{
											var prefix = pos > 0 ? suggestion.substr(0, pos) : '';
											var match = suggestion.substr(pos, value.length);
											var suffix = pos < suggestion.length - 1 ? suggestion.substr(pos + value.length) : '';

											return '<span>' +
												prefix +
												'</span><span class="suggestion-match">' +
												match +
												'</span><span>' +
												suffix +
												'</span>';
										}

										return '';
									}

									if (thisObj.options.showTags)
									{
										var tags = getTagsValuesArray();

										var str;
										for (var j = 0; j < response.length; j++) {
											if (tags.indexOf(response[j]) !== -1) {
												response.splice(j, 1);
												j--;
											}
										}
									}

									if (response.length === 0)
									{
										thisObj.loadingSuggestions = false;
										container.hide();
										loader.hide();
										return;
									}

									updatedValue = updatedValue.toLowerCase();

									var limit = response.length < thisObj.options.suggestionsLimit
										? response.length
										: thisObj.options.suggestionsLimit;

									str = "";
									for (var i = 0; i < limit; i++)
									{
										str += "<li>" + highlightSuggestion(response[i], updatedValue) + "</li>";
									}

									var sugList = rootElement.find('.suggestions');
									sugList.html(str);
									sugList.listview("refresh");

									sugList.on('click',
										'li',
										function(e)
										{
											if (thisObj.options.showTags)
											{
												addTag($(this).text());
											}
											else
											{
												newVal[index] = $(this).text();
												newVal = newVal.join(thisObj.options.separator);
												$input.val(newVal);

												triggerChangeEvent(newVal);
											}

											//Hide suggestion list
											sugList.html("");
											sugList.listview("refresh");

											$input.attr('data-previous-val', "");

											$input.focus();

											container.hide();
										});
								}
								catch (e)
								{
									alert(e);
								}

								thisObj.loadingSuggestions = false;
								loader.hide();
							}
						}
						//Update previous value after change
						$input.attr('data-previous-val', text);
					}

					function addTag(newValue)
					{
						if (!thisObj.options.showTags)
							return;

						if (!newValue || newValue.length === 0)
							return;

						if (newValue.indexOf(thisObj.options.separator) !== -1)
							return;

						var tags = getTagsValuesArray();
						if (tags.indexOf(newValue) !== -1)
							return;

						if (!thisObj.options.isMultiSelect && tags.length > 0)
							return;

						var value = thisObj.options.value;
						if (value.length > 0)
							value += thisObj.options.separator;

						value += newValue;

						rootElement.find("input").val("");

						triggerChangeEvent(value);
					}

					function updateTagsFromValue()
					{
						var fieldValues = getSplittedFieldValues();
						var list = rootElement.find("div.tags");

						var elements = list.find("div.tag-element");
						elements.remove();

						if (fieldValues.length > 0)
						{
							for (var i = fieldValues.length - 1; i >= 0; i--) {
								var val = fieldValues[i];
								var html = '<div class="tag-element"><div><span class="delete-button"></span><span class="tag-value">' + val + '</span></div></div>';
								list.prepend(html);
							}

							list.css("margin-top", "2px");
						}
						else
							list.css("margin-top", "0");

						var buttons = list.find(".delete-button");
						buttons.on("click",
							function(e)
							{
								var btn = $(e.currentTarget);
								btn.parent().parent().remove();

								updateValueFromTags();
							});
					}

					function getTagsValuesArray()
					{
						var values = [];

						var tags = rootElement.find(".tag-value");
						for (var i = 0; i < tags.length; i++)
						{
							var tag = $(tags[i]);

							values.push(tag.text());
						}

						return values;
					}

					function getValueFromTags()
					{
						var value = "";

						var tags = rootElement.find(".tag-value");
						for (var i = 0; i < tags.length; i++)
						{
							var tag = tags[i];

							if (value.length > 0)
								value += thisObj.options.separator;

							value += $(tag).text();
						}

						return value;
					}

					function updateValueFromTags()
					{
						var value = getValueFromTags();
						triggerChangeEvent(value);
					}
				},

				_update: function()
				{
					var rootElement = this.element;
					var opts = $.extend(this.options, rootElement.data("options"));

					$(document).trigger("selectWidgetUpdate");
				},

				refresh: function()
				{
					return this._update();
				}
			});

		$(document).bind("pagecreate",
			function(e)
			{
				$(document).trigger("selectWidgetBeforeCreate");
				return $(":jqmData(role='selectWidget')", e.target).selectWidget();
			});
	}
)(jQuery);