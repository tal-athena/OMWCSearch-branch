using System.Runtime.Serialization;

namespace OMWSTypes
{
    public class OMWField
    {
        [DataMember]
        public int FieldID;

        /// an "empty" value is represented by a FieldValue == null here
        [DataMember]
        public OMWValue FieldValue;

	    public EOMWFieldDisplayType EditorType { get; set; }

		[DataMember]
        public string DisplayValue
        {
            get
            {
                return FieldValue.ToString();
            }
        }
    }
}