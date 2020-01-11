using System;
using System.Collections.Generic;
using System.Linq;
using OMWCSearch.Enums;
using OMWCSearch.Interfaces;
using OMWCSearch.UnitTest;
using OMWSTypes;

namespace OMWCSearch.Domain
{
    public class SearchParametersParser : ISearchParametersParser
    {
        public IEnumerable<OMWSearchParam> GetSearchParams(DCOMWSearchProfile searchProfile, Dictionary<string, string> values)
        {
            return searchProfile.SearchParams.Select(omwSearchParam => GetSearchParam(omwSearchParam, values)).Where(x => x != null);
        }

        private OMWSearchParam GetSearchParam(OMWSearchParam omwSearchParam, Dictionary<string, string> values)
        {
	        try
	        {
				switch (omwSearchParam.DisplayType)
		        {
			        case EOMWFieldDisplayType.eOMFieldDisplayType_Text:
				        FillTextBoxValue(omwSearchParam, values);
				        break;
			        case EOMWFieldDisplayType.eOMFieldDisplayType_DateTime:
				        FillDateTimeValue(omwSearchParam, values);
				        break;
			        case EOMWFieldDisplayType.eOMFieldDisplayType_Number:
				        FillNumericValue(omwSearchParam, values);
				        break;
			        case EOMWFieldDisplayType.eOMFieldDisplayType_Check:
				        FillBooleanValue(omwSearchParam, values);
				        break;
			        case EOMWFieldDisplayType.eOMFieldDisplayType_List:
			        case EOMWFieldDisplayType.eOMFieldDisplayType_Combo:
				        FillDropDownValue(omwSearchParam, values);
				        break;
			        case EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly:
				        FillDateTimeValue(omwSearchParam, values);
				        break;
			        case EOMWFieldDisplayType.eOMFieldDisplayType_TimeOnly:
				        FillDateTimeValue(omwSearchParam, values);
				        break;
			        default:
				        throw new NotSupportedException("This search parameter type is not supported");
		        }
		        return omwSearchParam;
			}
	        catch (Exception ex)
	        {
		        
	        }

	        return null;
        }

        private void FillDropDownValue(OMWSearchParam omwSearchParam, Dictionary<string, string> values)
        {
            omwSearchParam.Value = new OMWValueString(values["OWM_SearchDropDownList_" + omwSearchParam.Position]);
        }

        private void FillBooleanValue(OMWSearchParam omwSearchParam, Dictionary<string, string> values)
        {
            omwSearchParam.Value = new OMWValueInt(values["OMW_SearchCheckBox_" + omwSearchParam.Position] == "1" ? 1 : 0);
        }

        private void FillNumericValue(OMWSearchParam omwSearchParam, Dictionary<string, string> values)
        {
            int intValue;
            if (!int.TryParse(values["OMW_SearchNumericTextBox_" + omwSearchParam.Position], out intValue)) return;
            omwSearchParam.Value = new OMWValueInt(intValue);
        }

        private void FillDateTimeValue(OMWSearchParam omwSearchParam, Dictionary<string, string> values)
        {
            var dateTimeSearchParam = omwSearchParam as OMWSearchParamDateTime;
            if (dateTimeSearchParam == null)
            {
                return;
            }

            switch (dateTimeSearchParam.Mode)
            {
                case DateTimeDisplayMode.Date:
                    var date = GetDateValue(dateTimeSearchParam, values);
                    omwSearchParam.Value = new OMWValueDateTime(new DateTime(date.Year, date.Month, date.Day));
                    break;
                case DateTimeDisplayMode.Time:
                    omwSearchParam.Value = new OMWValueDateTime(GetTime(dateTimeSearchParam, values));
                    break;
                case DateTimeDisplayMode.DateAndTime:
                    omwSearchParam.Value =
                        new OMWValueDateTime(MergeDateAndTime(GetDateValue(dateTimeSearchParam, values),
                                                              GetTime(dateTimeSearchParam, values)));
                    break;
            }
        }

        private DateTime MergeDateAndTime(DateTime date, DateTime time)
        {
            return new DateTime(date.Year, date.Month, date.Day, time.Hour, time.Minute, time.Second);
        }

        private DateTime GetTime(OMWSearchParamDateTime dateTimeSearchParam, Dictionary<string, string> values)
        {
            var strValue = values["OMW_SearchDatePickerTime_" + dateTimeSearchParam.Position];
            var splitted = strValue.Split(":".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
            try
            {
                var hour = int.Parse(splitted[0]);
                var minute = int.Parse(splitted[1]);
                var second = int.Parse(splitted[2]);
                return new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, hour, minute, second);
            }
            catch (Exception)
            {
                return DateTime.MinValue;
            }
        }

        private DateTime GetDateValue(OMWSearchParamDateTime omwSearchParam, Dictionary<string, string> values)
        {
            var strValue = values["OMW_SearchDatePicker_" + omwSearchParam.Position];
            DateTime date;
            if(!DateTime.TryParse(strValue, out date)) return DateTime.MinValue;
            return date.Date;
        }

        private void FillTextBoxValue(OMWSearchParam omwSearchParam, Dictionary<string, string> values)
        {
            omwSearchParam.Value = new OMWValueString(values["OMW_SearchTextBox_" + omwSearchParam.Position]);
        }
    }
}   