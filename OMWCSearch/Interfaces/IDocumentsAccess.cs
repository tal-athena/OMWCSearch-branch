using System.Collections.Generic;
using OMWSTypes;
using System.Runtime.Serialization;
using OMWCSearch.Interfaces;

namespace OMWCSearch
{
    public interface IDocumentsAccess
    {
        ErrorCode GetStory(OMWDocumentID storyID, out OMWAStory story);

        ErrorCode LockStory(OMWDocumentID storyID, int[] fieldIDsToLock);

        ErrorCode UnlockStory(OMWDocumentID storyID, int[] fieldIDsToUnlock);

        ErrorCode UpdateStory(OMWDocumentID storyID, string text, bool isHTML, OMWNamedField[] headerFields);

        ErrorCode AddStoryRecord(OMWDocumentID storyID, string type, OMWDocumentID recordDocID, out OMWAStoryRecord newInsert);

        ErrorCode RemoveStoryRecord(OMWDocumentID storyID, OMWAStoryRecord insertToRemove);

        ErrorCode GetRecordTypes(OMWDocumentID storyID, out List<OMWAStoryRecordType> recordTypes);

        ErrorCode UpdateRecordPosition(OMWDocumentID storyID, int RecordID, int newPosition);

		ErrorCode GetComboFieldOptionValues(string fieldID, string value, out List<string> values);
		ErrorCode GetListFieldOptionValues(string storyID, string fieldID, out List<string> values);
        ErrorCode GetListFieldSuggestions(string storyID, string fieldID, string value, out List<string> values);

    }

    public partial class OMWAStoryRecord
    {
        [DataMember]
        public OMWDocumentID DocID { get; set; }

        [DataMember]
        public int RecordID { get; set; }

        [DataMember]
        public int TextPosition { get; set; } /* -1 means - record is not inserted to the text */

        [DataMember]
        public string TooltipText { get; set; }

        [DataMember]
        public string Type { get; set; }
    }

    public partial class OMWAStoryRecordType
    {
        [DataMember]
        public string IconURL { get; set; }

        [DataMember]
        public string Type { get; set; }

        [DataMember]
        public string Name { get; set; }
    }

    public partial class OMWAStory
    {
        [DataMember]
        public string Title { get; set; }

        [DataMember]
        public string Text { get; set; }

        [DataMember]
        public bool isHTML { get; set; }

        [DataMember]
        public bool ShowText { get; set; }

        [DataMember]
        public IEnumerable<OMWNamedField> HeaderFields { get; set; }

        [DataMember]
        public bool ReadOnly { get; set; }

        [DataMember]
        public OMWDocumentID ID { get; set; }

        [DataMember]
        public IEnumerable<OMWAStoryRecord> Records { get; set; }

    }   // class

    public partial class OMWNamedField
    {
        [DataMember]
        public string Label;

        [DataMember]
        public string Format;

        [DataMember]
        public EOMWFieldDisplayType DisplayType;

        [DataMember]
        public IEnumerable<string> SelectionList;

        [DataMember]
        public int FieldID;

        [DataMember]
        public int RecordID;

        /// <summary>
        /// an "empty" value is represented by a FieldValue == null here
        /// </summary>
        [DataMember]
        public OMWValue FieldValue;

        [DataMember]
        public bool ReadOnly;

        [DataMember]
        public int NumberOfLines;

	    public bool Dynamic;
	    public bool HasSelectionList;

	    public OMWInternalLink InternalLink;
    }

	public partial class OMWInternalLink
	{
		[DataMember]
		public string iconURL;
		[DataMember]
		public string Title;
		[DataMember]
		public string docIdValue;
	}
}
