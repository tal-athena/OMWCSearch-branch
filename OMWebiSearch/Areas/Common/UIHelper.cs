using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web;
using System.Web.Configuration;

namespace OMWebiSearch.Areas.Common
{
    public static class UIHelper
    {
        /// <summary>
        /// Calculates CSS width for the top labels
        /// </summary>
        /// <returns></returns>
        public static string CalculateLabelWidth(int maxChars)
        {
            maxChars = maxChars > 20 ? 20 : maxChars; //fix max width
            var labelWidth = (maxChars * 10) + "px"; // width formula. this is not optimal as the font is not fixed width e.g. "www" and "lll" width is different
            return labelWidth;
        }

        public static int GetMaxChars(string input, int maxChars)
        {
            if (string.IsNullOrEmpty(input))
            {
                return maxChars;
            }
            return input.Length > maxChars ? input.Length : maxChars;
        }

        /// <summary>
        /// returns locale to use in a datepicker
        /// </summary>
        /// <returns></returns>
        public static string GetLocale()
        {
            return Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;
        }

        public static bool IsAnyCharacterRightToLeft(string text, bool isHtml)
        {
            string firstBlockOfText = "";
            if (isHtml)
            {
                firstBlockOfText = OMWCSearch.Utils.RTFToHTML.GetFirstBlockOfText(text);
            }
            else
            {
                if (text.Length > 10)
                {
                    firstBlockOfText = text.Substring(0, 9);
                }
                else
                {
                    firstBlockOfText = text;
                }
            }

            Regex r = new Regex(@"\p{IsArabic}|\p{IsHebrew}");
            if (r.IsMatch(text))
            {
                return true;
            }
            return false;
        }
    }
}