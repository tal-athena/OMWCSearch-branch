angular.module('v2').directive('ckEditor', [function ()
{
	return {
		require: '?ngModel',
		restrict: 'A',
		scope: {
			onChange: "&",
			onSave: "&",
			isSaveEnabled: "=",
			options: "="
		},
		link: function (scope, elm, attr, model)
		{
			var isReady = false;
			var data = [];

			var ck = CKEDITOR.replace(elm[0], scope.options);

			function setData()
			{
				if (!data.length) { return; }

				var d = data.splice(0, 1);
				ck.setData(d[0] || '<span></span>', function ()
				{
					setData();
					isReady = true;
				});
			}

			ck.on('instanceReady', function (e)
			{
				if (model) { setData(); }
			});

			elm.bind('$destroy', function ()
			{
				ck.destroy(false);
			});

			scope.$watch("isSaveEnabled",
				function(newValue, oldValue)
				{
					if (newValue !== undefined && newValue !== oldValue)
					{
						if (newValue)
							ck.getCommand('save').enable();
						else
							ck.getCommand('save').disable();
					}
				});

			if (model)
			{
				ck.on('change', function ()
				{
					scope.$apply(function ()
					{
						var data = ck.getData();
						if (data == '<span></span>')
						{
							data = null;
						}
						model.$setViewValue(data);

						if (!!scope.onChange)
							scope.onChange();
					});
				});

				ck.on('save',
					function()
					{
						scope.$apply(function()
						{
							if (!!scope.onSave)
								scope.onSave();
						});
					});

				model.$render = function (value)
				{
					if (model.$viewValue === undefined)
					{
						model.$setViewValue(null);
						model.$viewValue = null;
					}

					data.push(model.$viewValue);

					if (isReady)
					{
						isReady = false;
						setData();
					}
				};
			}

		}
	};
}]);