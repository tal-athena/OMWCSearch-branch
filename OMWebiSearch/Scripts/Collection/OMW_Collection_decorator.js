(function ()
{
	'use strict';

	angular.module('omwCollection')
		.config(function ($provide)
		{
			$provide.decorator('uiGridEditService',
				function ($delegate, uiGridConstants)
				{
					var isStartEditKey = $delegate.isStartEditKey;
					$delegate.isStartEditKey = function (evt)
					{
						if (e.keyCode >= 49 && e.keyCode <= 57 && e.altKey)
							return false;

						if (evt.metaKey ||
							evt.keyCode === uiGridConstants.keymap.ESC ||
							evt.keyCode === uiGridConstants.keymap.SHIFT ||
							evt.keyCode === uiGridConstants.keymap.CTRL ||
							evt.keyCode === uiGridConstants.keymap.ALT ||
							evt.keyCode === uiGridConstants.keymap.WIN ||
							evt.keyCode === uiGridConstants.keymap.CAPSLOCK ||

							evt.keyCode === uiGridConstants.keymap.LEFT ||
							(evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey) ||

							evt.keyCode === uiGridConstants.keymap.RIGHT ||
							evt.keyCode === uiGridConstants.keymap.TAB ||

							evt.keyCode === uiGridConstants.keymap.UP ||
							(evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey) ||

							evt.keyCode === uiGridConstants.keymap.SPACE ||

							evt.keyCode === uiGridConstants.keymap.DOWN /*|| evt.keyCode === uiGridConstants.keymap.ENTER*/)
						{
							return false;

						}
						return true;
					};
					return $delegate;
				});

			$provide.decorator('uiGridCellNavService',
				function ($delegate, $rootScope, uiGridConstants, uiGridEditConstants, uiGridCellNavConstants)
				{
					var isEditMode = false;

					$rootScope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT,
						function()
						{
							isEditMode = true;
						});

					$rootScope.$on(uiGridEditConstants.events.END_CELL_EDIT,
						function ()
						{
							isEditMode = false;
						});

					$rootScope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT,
						function ()
						{
							isEditMode = false;
						});

					var getDirection = $delegate.getDirection;
					$delegate.getDirection = function (evt)
					{
						if (isEditMode)
							return null;

						if ((evt.keyCode === uiGridConstants.keymap.LEFT && !evt.ctrlKey) || (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey))
						{
							return uiGridCellNavConstants.direction.LEFT;
						}
						if ((evt.keyCode === uiGridConstants.keymap.RIGHT && !evt.ctrlKey) || evt.keyCode === uiGridConstants.keymap.TAB)
						{
							return uiGridCellNavConstants.direction.RIGHT;
						}

						if (evt.keyCode === uiGridConstants.keymap.UP /*|| (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)*/)
						{
							return uiGridCellNavConstants.direction.UP;
						}

						if (evt.keyCode === uiGridConstants.keymap.PG_UP)
						{
							return uiGridCellNavConstants.direction.PG_UP;
						}

						if (evt.keyCode === uiGridConstants.keymap.DOWN /*|| evt.keyCode === uiGridConstants.keymap.ENTER && !(evt.ctrlKey || evt.altKey)*/)
						{
							return uiGridCellNavConstants.direction.DOWN;
						}

						if (evt.keyCode === uiGridConstants.keymap.PG_DOWN)
						{
							return uiGridCellNavConstants.direction.PG_DOWN;
						}

						return null;
					};
					return $delegate;
				});
		});
})();