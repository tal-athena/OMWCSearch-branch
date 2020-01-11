using System.Runtime.Serialization;

namespace OMWSTypes
{
    [DataContract(Name = "OMWValue", Namespace = "OMWSTypes")]
    [KnownType(typeof(OMWValueString))]
    [KnownType(typeof(OMWValueInt))]
    [KnownType(typeof(OMWValueDateTime))]
    [KnownType(typeof(OMWValueTimeSpan))]
    [KnownType(typeof(OMWValueDocumentID))]
    public abstract class OMWValue
    {

        public virtual EOMWDataType ValueType
        {
            get { return EOMWDataType.eOMDataType_Undefined; }
        }


        [DataMember]
        public bool IsEmpty { get; set; }

        [DataMember]
        public string BackgroundColor { get; set; }
    }

    /// <summary>
    /// DataContract of DocumentID Value
    /// </summary>
    [DataContract(Name = "OMWValueDocumentID", Namespace = "OMWSTypes")]
    public class OMWValueDocumentID : OMWValue
    {
        public OMWValueDocumentID()
        {
            Value = null;
            IsEmpty = true;
        }

        public OMWValueDocumentID(OMWDocumentID value)
        {
            Value = value;
            IsEmpty = (value == null);
        }

        [DataMember]
        public OMWDocumentID Value = null;

        //
        override public EOMWDataType ValueType
        {
            get
            {
                return EOMWDataType.eOMDataType_DocumentID;
            }
        }

        //
        public override string ToString()
        {
            if (Value == null)
                return "";

            return Value.ToString();
        }

    }   // class
}