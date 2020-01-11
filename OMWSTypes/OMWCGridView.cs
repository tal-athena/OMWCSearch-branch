using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;

namespace OMWCSearch.ViewTypes
{
    public class OMWCGridView
    {
        [DataMember] public List<OMWCGridColumn> columns;

        [DataMember]
        public int previewLines { get; set; }

        [DataMember]
        // eg. 12px
        public string fontSize { get; set; }

        [DataMember]
        public string fontFamily { get; set; }

        [DataMember]
        public string lineHeight { get; set; }
    }
}