(function ()
{
	'use strict';

	angular.module('omwCollection')
		.service('CollectionColumnsSvc',
			[
				function ()
				{
					function findColumn(columns, fieldId)
					{
						for (var i = 0; i < columns.length; i++)
						{
							var col = columns[i];
							if (col.FieldID == fieldId)
								return col;
						}

						return null;
					}

					function getColumnEditorType(columns, fieldId)
					{
						var column = findColumn(columns, fieldId);
						if (!!column)
							return column.editorType;

						return undefined;
					}

					function isDateTimeColumn(columns, fieldId)
					{
						var editorType = getColumnEditorType(columns, fieldId);
						return (editorType === 6 || editorType === 8 || editorType === 9); // date fields
					}

					function isCheckbBoxColumn(columns, fieldId)
					{
						var editorType = getColumnEditorType(columns, fieldId);
						return (editorType === 4); // checkbox field
					}

					function isDurationColumn(columns, fieldId)
					{
						var editorType = getColumnEditorType(columns, fieldId);
						return (editorType === 7); // duration field
					}

					function getCheckBoxOnState(columns, fieldId)
					{
						var column = findColumn(columns, fieldId);
						if (!!column)
						{
							var props = column._stateTextAndColor;
							if (!!props && Array.isArray(props) && props.length === 2)
							{
								if (props[0].state === 1)
									return props[0];

								if (props[1].state === 1)
									return props[1];
							}
						}

						return undefined;
					}

					function getCheckBoxOffState(columns, fieldId)
					{
						var column = findColumn(columns, fieldId);
						if (!!column)
						{
							var props = column._stateTextAndColor;
							if (!!props && Array.isArray(props) && props.length === 2)
							{
								if (props[0].state === 0)
									return props[0];

								if (props[1].state === 0)
									return props[1];
							}
						}

						return undefined;
					}

					function isColumnReadOnly(columns, fieldId)
					{
						var column = findColumn(columns, fieldId);
						if (!!column)
							return column.readOnly;

						return undefined;
					}

					return {
						getColumnEditorType: getColumnEditorType,
						isDateTimeColumn: isDateTimeColumn,
						isCheckbBoxColumn: isCheckbBoxColumn,
						isDurationColumn: isDurationColumn,
						getCheckBoxOnState: getCheckBoxOnState,
						getCheckBoxOffState: getCheckBoxOffState,
						isColumnReadOnly: isColumnReadOnly,
						findColumn: findColumn
					};
				}
			]);
})();