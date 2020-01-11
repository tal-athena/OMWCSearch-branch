(function ()
{
	angular.module('omwcSearch')
            .directive('gridPreviewScroll', ['$window', '$timeout', function ($window, $timeout)
            {
            	return {
            		restrict: 'A',
            		scope: {
			            gridApi: '=gridApi'
		            },
					link: function (scope, element, attrs)
					{
						$timeout(function()
			            {
				            var viewportElement = element[0].querySelector(".ui-grid-viewport");
            				if (!!viewportElement)
            				{
            					var oldScrollLeft = viewportElement.scrollLeft;

            					alignPreviewText(viewportElement);

            					angular.element(viewportElement).bind("scroll", function ($event)
					            {
						            if (oldScrollLeft !== viewportElement.scrollLeft)
            						{
            							alignPreviewText(viewportElement);
						            }				            

									///////////////////////////////////////////

						            oldScrollLeft = viewportElement.scrollLeft;
            					});

            					angular.element($window).bind("resize", function ($event)
					            {
						            alignPreviewText(viewportElement);
            					});

					            if (!!scope.gridApi)
            					{
            						if (!!scope.gridApi.colResizable)
						            {
            							scope.gridApi.colResizable.on.columnSizeChanged(scope, function (colDef, deltaChange)
            							{
            								alignPreviewText(viewportElement);
            							});
						            }

            						scope.gridApi.core.on.rowsRendered(scope, function (colDef, deltaChange)
						            {
							            $timeout(function()
							            {
							            	alignPreviewText(viewportElement);
							            });
						            });
					            }
            				}
            			});

            			function alignPreviewText(viewport)
			            {
				            var previewElements = viewport.querySelectorAll(".preview-row");
            				for (var i = 0; i < previewElements.length; i++)
            				{
            					if (viewport.clientWidth < viewport.scrollWidth)
					            {
						            previewElements[i].style.paddingLeft = viewport.scrollLeft + "px";
            						previewElements[i].style.width = viewport.clientWidth + "px";
								}
								else
            					{
            						previewElements[i].style.paddingLeft = "0";
									previewElements[i].style.width = "100%";
								}
            				}
			            }
		            }
            	};
            }]);
})();