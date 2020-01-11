using System.Collections.Generic;
using OMWSTypes;
using System.Runtime.Serialization;
using OMWCSearch.Interfaces;
using OMWCSearch.ViewTypes;
using System;

namespace OMWCSearch
{
    public interface ICollectionsAccess
    {
        ErrorCode GetCollection(OMWDocumentID ID, out OMWACollection story);

        ErrorCode LockCollection(OMWDocumentID ID, int[] fieldIDsToLock);

        ErrorCode UnlockCollection(OMWDocumentID storyID, int[] fieldIDsToUnlock);

        ErrorCode UpdateCollection(OMWDocumentID storyID, OMWNamedField[] headerFields);

        OMWCGridView GetGridView(OMWDocumentID templateID);
    }

    public partial class OMWACollection
    {
        [DataMember]
        public string Title { get; set; }

        [DataMember]
        public IEnumerable<OMWNamedField> HeaderFields { get; set; }

        [DataMember]
        public bool ReadOnly { get; set; }

        [DataMember]
        public OMWDocumentID ID { get; set; }

        [DataMember]
        public IEnumerable<OMWACollectionRecord> Records { get; set; }

    }   // class

    public partial class OMWACollectionRecord
    {
        public OMWACollectionRecord()
        {
            //Random rand = new Random((int)DateTime.Now.Ticks);
            //int i = rand.Next(1);
            //if (i%2 == 0)
            //    SupportOpen = true;
        }
        [DataMember]
        public OMWField[] Fields;

        [DataMember]
        public OMWDocumentID ID { get; set; }

        [DataMember]
        public int RecordID { get; set; }

        [DataMember]
        public OMWDocumentID TemplateID { get; set; }

        [DataMember]
        public OMWCDocumentType DocumentType { get; set; }

        [DataMember]
        public bool SupportOpen { get; set; }

        [DataMember]
        public bool HasSubitems { get; set; }

        [DataMember]
        public string ParentID { get; set; }

        [DataMember]
        public string ItemStatus { get; set; }

        [DataMember]
        public int GroupID { get; set; }

    }

    public partial class OMWAMCollectionRecord
    {
        public OMWAMCollectionRecord(OMWACollectionRecord rec)
        {
            ID = rec.ID;
            RecordID = rec.RecordID;
            TemplateID = rec.TemplateID;
            DocumentType = rec.DocumentType;
            SupportOpen = rec.SupportOpen;
            HasSubitems = rec.HasSubitems;
            ParentID = rec.ParentID;
            Title1 = "";
            Title2 = "";
            Title3 = "";
            if (rec.Fields.Length > 1)
            {
                Title1 = rec.Fields[0].DisplayValue;
            }
            if (rec.Fields.Length > 2)
            {
                Title2 = rec.Fields[1].DisplayValue;
            }
            if (rec.Fields.Length > 3)
            {
                Title3 = rec.Fields[2].DisplayValue;
            }
        }

        [DataMember]
        public string Title1 { get; set; }

        [DataMember]
        public string Title2 { get; set; }

        [DataMember]
        public string Title3 { get; set; }

        [DataMember]
        public OMWDocumentID ID { get; set; }

        [DataMember]
        public int RecordID { get; set; }

        [DataMember]
        public OMWDocumentID TemplateID { get; set; }

        [DataMember]
        public OMWCDocumentType DocumentType { get; set; }

        [DataMember]
        public bool SupportOpen { get; set; }

        [DataMember]
        public bool HasSubitems { get; set; }

        [DataMember]
        public string ParentID { get; set; }
    }


}
