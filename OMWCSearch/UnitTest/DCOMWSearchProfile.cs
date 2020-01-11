using System.Collections.Generic;
using System.Runtime.Serialization;
using OMWSTypes;

namespace OMWCSearch.UnitTest
{
    [DataContract(Name = "DCOMWSearchProfile", Namespace = "OMWSTypes")]
    public class DCOMWSearchProfile
    {
        [DataMember]
        public IEnumerable<OMWSearchParam> SearchParams { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public int ID { get; set; }

        [DataMember]
        public int isFWS { get; set; }

        [DataMember]
        public bool hasInstantPreview { get; set; }

        [DataMember]
        public bool notifyReadItems { get; set; }
    }

}