using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;
using OMWSTypes;

namespace OMWCSearch.ViewTypes
{
    public class OMWCGridColumn
    {
        [DataMember]
        public int FieldID;

        [DataMember]
        public string columnName;

        [DataMember]
        public string columnWidth;

        [DataMember]
        public bool customColor;

	    [DataMember]
	    public EOMWFieldDisplayType editorType;

	    [DataMember]
		public object editorFormat;

        [DataMember]
        public OMWSTypes.EAlignment alignment;

		[DataMember]
		public bool readOnly { get; set; }

	    [DataMember] public List<StateTextAndColor> _stateTextAndColor;
    }

	public class StateTextAndColor
	{
		public int state { get; set; }
		public string str { get; set; }
		public string color { get; set; }
	}
}
