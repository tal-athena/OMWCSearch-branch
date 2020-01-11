using System.Runtime.Serialization;

namespace OMWSTypes
{
    [DataContract(Name = "OMWValueInt", Namespace = "OMWSTypes")]
    public class OMWValueInt : OMWValue
    {
        public OMWValueInt(int value)
        {
            Value = value;
            IsEmpty = false;
        }

        [DataMember]
        public int Value;
        
        public override EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_Integer; }
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}