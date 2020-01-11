(function()
{
	angular.module('omwHeaderSearch')
		.directive('customTime',
			[
				'$timeout', function($timeout)
				{
					return {
							restrict: 'A',
							link: function(scope, element, attrs, ngModelCtrl)
							{
								var value = element.data('val');
								if (!!value)
								{
									var dt = new Date(value);
									value = padZero(dt.getHours()) + ":" + padZero(dt.getMinutes()) + ":" + padZero(dt.getSeconds());

									element.val(value);
								}

								function padZero(number)
								{
									var str = number.toString();
									if (str.length < 2)
										str = "0" + str;

									return str;
								}
							}
						};
				}
			]);
})();