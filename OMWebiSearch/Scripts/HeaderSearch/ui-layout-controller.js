(function ()
{
	angular.module('omwHeaderSearch')
		.controller('uiLayoutController',
			[
				'$scope', '$timeout', function ($scope, $timeout)
				{
					$scope.dividerSize = 20;
					$scope.size = 0;

					var headerPanel = OMWClientContext.GetHeaderPanel();

					var containers = OMWClientContext.GetHeaderPanelContainers(headerPanel);
					if (containers.length > 0)
					{
						$timeout(function()
						{
							var totalFieldsCount = containers.length;

							var maxFieldsPerLine = OMWClientContext.GetMaxFieldsPerLine();
							var visibleNumberOfLines = OMWClientContext.GetNumberOfLines();

							var totalHeight;
							var fieldsPerLine;

							var isVertical = OMWClientContext.IsHeaderFieldsOrientationVertical();
							if (isVertical)
							{
								var columnsInfo = OMWClientContext.GetHeaderFieldsColumnsCountAndHeight(containers, 0);

								var fieldsPerColumn = columnsInfo.fieldsPerColumn;

								totalHeight = 0;

								var rows = [];

								var fieldIndex = 0;
								for (var i = 0; i < containers.length; i++)
								{
									var container = $(containers[i]);
									var fieldHeight = OMWClientContext.GetFieldHeight(container);

									var rowHeight = rows[fieldIndex];
									if (rowHeight !== undefined)
										rows[fieldIndex] = Math.max(rowHeight, fieldHeight);
									else
										rows[fieldIndex] = fieldHeight;

									fieldIndex++;

									if (fieldIndex >= fieldsPerColumn || fieldIndex >= visibleNumberOfLines)
									{
										fieldIndex = 0;
										i += fieldsPerColumn;
										i--;
									}
								}

								for (var j = 0; j < rows.length; j++)
								{
									totalHeight += rows[j];
								}
							}
							else
							{
								fieldsPerLine = Math.ceil(containers.length / visibleNumberOfLines);
								if (fieldsPerLine > maxFieldsPerLine)
									fieldsPerLine = maxFieldsPerLine;

								containers = containers.splice(0, visibleNumberOfLines * fieldsPerLine);

								totalHeight = OMWClientContext.GetTotalFieldsRowsHeight(containers, fieldsPerLine);
							}

							if (totalFieldsCount > visibleNumberOfLines * maxFieldsPerLine)
							{
								if (isVertical)
									totalHeight += 1;
								else
									totalHeight += 3;
							}
							else
							{
								if (isVertical)
									totalHeight += 22;
								else
									totalHeight += 8;
							}

							moveSplitter(totalHeight);

							//$scope.size = totalHeight;
							OMWClientContext._FixContentMWidth(true);
						}, 500);
					}

					var _dt = 0;
					var _resizeTimeout = null;

					$scope.$on('ui.layout.toggle', function (e, beforeContainer, afterContainer)
					{
						OMWClientContext._FixContentMWidth(false);
					});

					$scope.$on('ui.layout.resize', function (e, beforeContainer, afterContainer)
					{
						if (!_resizeTimeout)
						{
							if (OMWClientContext.IsHeaderFieldsOrientationVertical())
							{
								var headerPanel = OMWClientContext.GetHeaderPanel();
								var parentHeight = headerPanel.height();
								headerPanel.css("height", parentHeight + "px");
							}
						}

						if (!!_resizeTimeout)
							clearTimeout(_resizeTimeout);

						_resizeTimeout = setTimeout(function ()
						{
							OMWClientContext._FixContentMWidth(false);

							_resizeTimeout = null;
						}, 600);

						var editor = $("#idStoryContainer .storyH-wrap #contentPanel");
						if (editor.length > 0)
						{
							editor.css("pointer-events", "none");
							_dt = new Date().getTime();

							$timeout(function ()
							{
								if (new Date().getTime() - _dt > 50)
									editor.css("pointer-events", "all");
							}, 50);
						}
					});

					function moveSplitter(height)
					{
						var c = angular.element("[ui-layout]").controller('uiLayout');

						var e = new Event("mousemove");

						var m = offset($("[ui-layout]"));

						c.movingSplitbar = c.containers[1];

						e.clientX = c.movingSplitbar["left"] + m.left;
						e.clientY = c.movingSplitbar["top"] + m.top + height;

						c.mouseMoveHandler(e);
					}

					function offset(element)
					{
						var rawDomNode = element[0];
						var body = document.documentElement || document.body;
						var scrollX = window.pageXOffset || body.scrollLeft;
						var scrollY = window.pageYOffset || body.scrollTop;
						var clientRect = (!!rawDomNode) ? rawDomNode.getBoundingClientRect() : { left: 0, top: 0 };
						var x = clientRect.left + scrollX;
						var y = clientRect.top + scrollY;
						return { left: x, top: y };
					};
				}
			]);
})();