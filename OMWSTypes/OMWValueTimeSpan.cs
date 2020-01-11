using System;
using System.Runtime.Serialization;

namespace OMWSTypes
{
    [DataContract(Name = "OMWValueTimeSpan", Namespace = "OMWSTypes")]
    public class OMWValueTimeSpan : OMWValue
    {
        public OMWValueTimeSpan(TimeSpan value)
        {
            Value = value;
            IsEmpty = false;
        }

        [DataMember]
        public TimeSpan Value;

        [DataMember]
        public long Ticks
        {
            get { return (long) Value.TotalMilliseconds; }
            set { Value = TimeSpan.FromMilliseconds(value); }
        }

        public override EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_TimeSpan; }
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}