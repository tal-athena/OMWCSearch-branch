using System.Runtime.Serialization;

namespace OMWSTypes
{
    [DataContract(Name = "OMWValueString", Namespace = "OMWSTypes")]
    public class OMWValueString : OMWValue
    {

        public OMWValueString(string value)
        {
            Value = value;
            IsEmpty = (value == null);
        }

        [DataMember]
        public string Value = null;

        //
        public override EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_String; }
        }

        //
        public override string ToString()
        {
            return Value;
        }
    }
}