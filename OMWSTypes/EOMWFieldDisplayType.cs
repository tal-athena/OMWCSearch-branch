namespace OMWSTypes
{
    public enum EOMWFieldDisplayType
    {
        /// <remarks/>
        eOMFieldDisplayType_Undefined,

        /// simple text box
        eOMFieldDisplayType_Text,

        /// combo box
        eOMFieldDisplayType_Combo,

        /// select only combo box
        eOMFieldDisplayType_List,

        /// check box - for integer types that get only values 0 or 1
        eOMFieldDisplayType_Check,

        /// text box that accepts only numbers
        eOMFieldDisplayType_Number,

        /// date time control
        eOMFieldDisplayType_DateTime,

        /// time duration
        eOMFieldDisplayType_Duration,

        /// only Time part
        eOMFieldDisplayType_TimeOnly,

        /// only the DatePart
        eOMFieldDisplayType_DateOnly,

        /// only the Hyperlink
        eOMFieldDisplayType_Hyperlink,

        /// multiline
        eOMFieldDisplayType_MultilineText,

        /// internal link
        eOMFieldDisplayType_InternalLink
    }
}