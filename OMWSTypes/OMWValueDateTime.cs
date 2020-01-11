using System;
using System.Runtime.Serialization;

namespace OMWSTypes
{
    [DataContract(Name = "OMWValueDateTime", Namespace = "OMWSTypes")]
    public class OMWValueDateTime : OMWValue
    { 
        public OMWValueDateTime(DateTime value)
        {
            Value = value;
            IsEmpty = false;

        }

        [DataMember]
        public DateTime Value;

        [DataMember]
        public long Ticks
        {
            get { return (long) Value.MillisecondsSinceEpoch(); }
            set { Value = DateTimeExtensions.Epoch.AddMilliseconds(value); }
        }

        public override EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_DateTime; }
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }

    [DataContract(Name = "OMWValueDate", Namespace = "OMWSTypes")]
    public class OMWValueDate : OMWValue
    {
        public OMWValueDate(DateTime value)
        {
            Value = value;
            IsEmpty = false;
        }

        [DataMember]
        public DateTime Value;

        [DataMember]
        public long Ticks
        {
            get { return (long)Value.MillisecondsSinceEpoch(); }
            set { Value = DateTimeExtensions.Epoch.AddMilliseconds(value); }
        }

        public override EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_Date; }
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }

    [DataContract(Name = "OMWValueTime", Namespace = "OMWSTypes")]
    public class OMWValueTime : OMWValue
    {
        public OMWValueTime(DateTime value)
        {
            Value = value;
            IsEmpty = false;
        }

        [DataMember]
        public DateTime Value;

        [DataMember]
        public long Ticks
        {
            get { return (long)Value.MillisecondsSinceEpoch(); }
            set { Value = DateTimeExtensions.Epoch.AddMilliseconds(value); }
        }

        public override EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_Time; }
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}