(function ()
{
	'use strict';

	angular.module('omwHeaderSearch').service('KeyboardNavigationSvc',
		[
			function ()
			{
				var controls = [];

				function init()
				{
					controls = [];
				}

				function addControl(element, tabOrder, outlineElement, skipElement)
				{
					if (!!tabOrder)
					{
						tabOrder = parseInt(tabOrder);

						if (tabOrder >= 0)
						{
							element.on("keydown",
								function($event)
								{
									if ($event.keyCode == 9) // Tab
									{
										$event.preventDefault();
										$event.stopPropagation();

										if ($event.shiftKey)
										{
											focusNextControl(element, false);
										}
										else
										{
											focusNextControl(element, true);
										}
									}
									else if ($event.keyCode == 13 || $event.keyCode == 32) // Enter or Space
									{
										if (element.is("a") || element.is("button"))
										{
											$event.preventDefault();
											$event.stopPropagation();

											element.trigger("click");
										}
									}
								});

							element.on("mousedown",
								function($event)
								{
									element.focus();
								});

							element.on("focus",
								function($event)
								{
									var ctrl = findControl($event.currentTarget);
									if (!!ctrl && ctrl.outlineElement)
									{
										outlineElement.addClass("focus-outline");
									}
								});

							element.on("blur",
								function ($event)
								{
									var ctrl = findControl($event.currentTarget);
									if (!!ctrl && ctrl.outlineElement) {
										outlineElement.removeClass("focus-outline");
									}
								});

							element.attr("tabindex", 0);

							if (!!skipElement)
							{
								skipElement.on("mousedown",
									function($event)
									{
										$event.preventDefault();
										$event.stopPropagation();

										for (var i = 0; i < controls.length; i++)
										{
											var ctrl = controls[i];
											if (ctrl.skipElement == skipElement)
											{
												ctrl.element.focus();
												break;
											}
										}
									});
							}

							controls.push({ element: element, tabOrder: tabOrder, outlineElement: outlineElement, skipElement: skipElement });

							controls.sort(function(a, b)
							{
								if (a.tabOrder > b.tabOrder)
									return 1;

								if (a.tabOrder < b.tabOrder)
									return -1;

								return 0;
							});
						}
					}
				}

				function findControl(element)
				{
					for (var i = 0; i < controls.length; i++) {
						var ctrl = controls[i];
						if (ctrl.element[0] == element)
						{
							return ctrl;
						}
					}

					return null;
				}

				function focusNextControl(element, forward)
				{
					if (controls.lenght == 0)
						return;

					var index = -1;

					for (var i = 0; i < controls.length; i++)
					{
						var ctrl = controls[i];
						if (ctrl.element == element)
						{
							index = i;
							break;
						}
					}

					if (index >= 0)
					{
						if (forward)
						{
							index++;
							if (index >= controls.length)
								index = 0;
						}
						else
						{
							index--;
							if (index < 0)
								index = controls.length - 1;
						}

						var nextControl = controls[index];
						nextControl.element.focus();
					}
				}

				return {
					init: init,
					addControl: addControl
				};
			}
		]);

	angular.module('omwHeaderSearch').directive('keyboardNavigation',
		[
			function ()
			{
				return {
					restrict: 'A',
					scope: {
						save: '&keyboardSave',
						cancel: '&keyboardCancel'
					},
					link: function (scope, element, attrs)
					{
						element.on("keydown",
							function($event)
							{
								if ($event.keyCode == 27) // Esc
								{
									scope.cancel();
								}
								else if ($event.keyCode == 13) // Enter
								{
									scope.save();
								}
							});
					}
				};
			}
		]
	);

	angular.module('omwHeaderSearch').directive('tabOrder',
		[
			'KeyboardNavigationSvc',
			function (KeyboardNavigationSvc)
			{
				return {
					restrict: 'A',
					scope: {
						tabOrder: '@'
					},
					link: function (scope, element, attrs)
					{
						KeyboardNavigationSvc.addControl(element, scope.tabOrder);
					}
				};
			}
		]
	);
})();