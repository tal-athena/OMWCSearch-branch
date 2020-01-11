using System;
using System.Runtime.Serialization;

namespace OMWSTypes
{
    public class OMWSearchHit : ICloneable
    {
        public OMWSearchHit()
        {
            UpdateExisting = false;
            DeleteExisting = false;
            ChangedOrder = false;
        }

        private readonly Random _random = new Random();

        [DataMember]
        public OMWField[] Fields;

        [DataMember]
        public OMWDocumentID ID { get; set; }

        [DataMember]
        public string FormattedID { get 
        {
            return ID.GetEncoded();
        } }

        [DataMember]
        public string PreviewHeader { get; set; }

        [DataMember]
        public string PreviewMain { get; set; }

        [DataMember]
        public string SearchresultPreview { get { return PreviewMain.Substring(0, PreviewMain.Length/5) + "..."; } }

        [DataMember]
        public OMWDocumentID TemplateID { get; set; }

        [DataMember]
        public OMWCDocumentType DocumentType { get; set; }

        [DataMember]
        public bool SupportOpen { get; set; }

        [DataMember]
        public string ItemStatus { get; set; }

        /// <summary>
        /// Valid for FWS hits only 
        /// </summary>

        // The new search result should appear after the object with this ID 
        // - relevant only for results delivered through INTWSearchNotificationSink
        public OMWDocumentID ReferenceObjectID { get; set; }

        // If true - the new result is an update to an existing result
        // - relevant only for results delivered through INTWSearchNotificationSink
        public bool UpdateExisting { get; set; }

        // If true - the result that has the ID must be deleted
        // - relevant only for results delivered through INTWSearchNotificationSink
        public bool DeleteExisting { get; set; }

        // If true - the result is already included in the result set. We need to first remove it and then insert it again after the object with
        // the ID: ReferenceObjectID
        public bool ChangedOrder { get; set; }

        public bool ItemRead { get; set; }

		public bool HasRichText { get; set; }

        public object Clone()
        {
            var copy = (OMWSearchHit) this.MemberwiseClone();
            return copy;
        }
    }
}