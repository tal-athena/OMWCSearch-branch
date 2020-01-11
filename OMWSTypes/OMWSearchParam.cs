using System.Collections.Generic;
using System.Runtime.Serialization;

namespace OMWSTypes
{
    [DataContract(Name = "OMWSearchParam", Namespace = "OMWSTypes")]
    public class OMWSearchParam
    {
        [DataMember]
        public int Position { get; set; }

        [DataMember]
        public string Label { get; set; }

        [DataMember]
        public string Format { get; set; }


        [DataMember]
        public OMWValue Value { get; set; }

        [DataMember]
        public EOMWFieldDisplayType DisplayType { get; set; }

        [DataMember]
        public int DateCode { get; set; }

        [DataMember]
        public IEnumerable<string> SelectionList { get; set; }
    }
}