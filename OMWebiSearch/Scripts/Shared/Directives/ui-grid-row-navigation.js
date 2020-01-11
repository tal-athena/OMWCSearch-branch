'use strict';

angular.module("omwShared").directive('uiGridRowNavigation',
	[
		function ()
		{
			return {
				require: '^uiGrid',
				link: function($scope, $elm, $attrs, uiGridCtrl)
				{
					var grid = uiGridCtrl.grid;
					var canvas = $elm.find(".ui-grid-canvas");

					canvas.bind('keydown',
						function(e)
						{
							if (e.keyCode !== 38 && e.keyCode !== 40 && (e.keyCode < 33 || e.keyCode > 36))
								return;

							e.preventDefault();
							e.stopPropagation();

							$scope.$apply(function()
							{
								var selectedEntities,
								    visibleRows,
								    selectedIndex;

								visibleRows = grid.getVisibleRows();

								selectedEntities = grid.api.selection.getSelectedRows();
								if (selectedEntities.length === 1)
								{
									selectedIndex = visibleRows.map(function (item)
									{
										return item.entity;
									}).indexOf(selectedEntities[0]);

									if (selectedIndex < 0)
										return;

									if (e.keyCode === 38 && selectedIndex > 0) // Arrow up
										selectedIndex--;
									else if (e.keyCode === 40) // Arrow down
										selectedIndex++;
									else if (e.keyCode === 33) // Page up
										selectedIndex -= 10;
									else if (e.keyCode === 34) // Page down
										selectedIndex += 10;
									else if (e.keyCode === 36) // Home
										selectedIndex = 0;
									else if (e.keyCode === 35) // End
										selectedIndex = grid.options.data.length - 1;

									if (selectedIndex < 0)
										selectedIndex = 0;
									else if (selectedIndex >= grid.options.data.length - 1)
										selectedIndex = grid.options.data.length - 1;
								}
								else
									selectedIndex = 0;

								grid.api.selection.selectRowByVisibleIndex(selectedIndex, e);
								grid.api.core.scrollToIfNecessary(visibleRows[selectedIndex], grid.columns[0]);

								if (!!$scope.selectedRowChanged)
									$scope.selectedRowChanged(visibleRows[selectedIndex].entity, e);
							});
						});
				}
			}
		}
	]);
				