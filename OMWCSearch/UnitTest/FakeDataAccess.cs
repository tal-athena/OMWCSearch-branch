using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OMWCSearch.Interfaces;
using OMWSTypes;
using System.Runtime.Serialization;
using System.IO;
using System.Xml;
using System.Reflection;
using System.Globalization;

namespace OMWCSearch.UnitTest
{
    public class FakeDataAccess : IDocumentsAccess
    {
        #region Private Data
        private static List<OMWAStory> _lstStory;
        #endregion


        #region Public Methods
        public static List<OMWAStory> GetStoryList()
        {
            if (_lstStory == null)
            {
                DataContractSerializer ds = new DataContractSerializer(typeof(IEnumerable<OMWAStory>));
                Assembly a = Assembly.GetExecutingAssembly();

                using (Stream strm = a.GetManifestResourceStream("OMWCSearch.stories.xml"))
                {
                    var reader = XmlDictionaryReader.CreateTextReader(strm, new XmlDictionaryReaderQuotas());
                    _lstStory = ((IEnumerable<OMWAStory>)ds.ReadObject(reader, true)).ToList();
                }

            }
            return _lstStory;
        }
        #endregion Public Methods

        #region IDocumentsAccess members
        public ErrorCode GetStory(OMWDocumentID storyID, out OMWAStory story)
        {
            story = null;

            foreach (var lStory in GetStoryList())
            {
                if (lStory.ID.ToString().GetHashCode() == storyID.ToString().GetHashCode())
                    story = lStory;
            }

            if (story == null)
                story = GetStoryList()[0];

			AddMandatoryTestHeaderFields(story);

	        story.HeaderFields = story.HeaderFields.Distinct(new FieldEqualityComparer()).ToList();

            return new ErrorCode();
        }

        protected void AddMandatoryTestHeaderFields(OMWAStory story)
        {
            // copy the random header fields
            var lst = new List<OMWNamedField>(story.HeaderFields);
            // add the mandatory fields
            var fieldValue = new OMWValueDateTime(DateTime.ParseExact("26/02/2012 18:37:58", "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture));
            var data = new OMWValueDate(DateTime.ParseExact("26/02/2012", "dd/MM/yyyy", CultureInfo.InvariantCulture));
            var time = new OMWValueTime(DateTime.ParseExact("18:37:58", "HH:mm:ss", CultureInfo.InvariantCulture));
            var textField = new OMWValueString("simple text");
            var hyperlink = new OMWValueString("http://www.bing.com");
            var checkBox = new OMWValueInt(1);



            //Add test list to story every story
            var daC = new List<string> { "" };
            for (int i = 1; i <= 100; i++)
            {
                daC.Add("opt" + i.ToString() + "val");
            }
            var combo = new OMWValueString("opt1val;opt2val;opt3val;opt4val");
            var dynamicComboValue = new OMWValueString("field 999 option 27 value");

            lst.Insert(0, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1011,
                FieldValue = combo,
                Label = "READ-ONLY",
                RecordID = 4555,
                SelectionList = daC,
                ReadOnly = true
            });
            lst.Insert(1, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1012,
                FieldValue = combo,
                Label = "EDITABLE, no selection list",
                RecordID = 4555,
                SelectionList = daC,
	            ReadOnly = true
			});
            lst.Insert(2, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1013,
                FieldValue = combo,
                Label = "EDITABLE, has STATIC selection list",
	            ReadOnly = true,
                RecordID = 4555,
                SelectionList = daC,
                HasSelectionList = true
            });
            lst.Insert(3, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1014,
                FieldValue = combo,
                Label = "EDITABLE, has STATIC selection list",
	            ReadOnly = true,
                RecordID = 4555,
                SelectionList = daC,
                HasSelectionList = true
            });
            lst.Insert(3, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1015,
                FieldValue = combo,
                Label = "NOT editable, has DYNAMIC selection list",
	            ReadOnly = true,
                RecordID = 4555,
                SelectionList = daC,
                HasSelectionList = true,
                Dynamic = true
            });
            lst.Insert(4, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1016,
                FieldValue = combo,
                Label = "EDITABLE, has DYNAMIC selection list",
	            ReadOnly = true,
                RecordID = 4555,
                SelectionList = daC,
                HasSelectionList = true,
                Dynamic = true
            });

            lst.Insert(5, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Combo,
                FieldID = 1017,
                FieldValue = dynamicComboValue,
                Label = "Combo, static",
	            ReadOnly = true,
                RecordID = 4555,
                SelectionList = new List<string> { "field 999 option 25 value", "field 999 option 26 value", "field 999 option 27 value" }
            });
            lst.Insert(6, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Combo,
                FieldID = 1018,
                FieldValue = dynamicComboValue,
                Label = "Combo, dynamic",
	            ReadOnly = true,
                RecordID = 4555,
                SelectionList = new List<string>(),
                HasSelectionList = true,
                Dynamic = true
            });

            lst.Insert(11, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Number,
                FieldID = 1019,
                FieldValue = new OMWValueInt(3),
	            ReadOnly = true,
                Label = "Number"
            });
	        lst.Insert(12, new OMWNamedField()
	        {
		        DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Duration,
		        FieldID = 1020,
		        FieldValue = time,
		        Format = "HH:mm:ss",
		        ReadOnly = false,
		        Label = "Duration"
	        });
			lst.Insert(13, new OMWNamedField()
			{
				DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Undefined,
				FieldValue = new OMWValueString("http://hpr.dogphilosophy.net/test/mp3.mp3"),
				FieldID = 5,
				Label = "Internal Link",
				RecordID = 4321,
				ReadOnly = false,
				InternalLink = new OMWInternalLink
				{
					Title = "Click me",
					docIdValue = "http://hpr.dogphilosophy.net/test/mp3.mp3",
					iconURL = "Content/Images/link.png"
				}
			});
            lst.Insert(14, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_TimeOnly,
                FieldID = 1021,
                FieldValue = new OMWValueTime(DateTime.Now),
	            ReadOnly = false,
                Label = "Time"
            });
            lst.Insert(15, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly,
                FieldID = 1022,
                FieldValue = data,
                Format = "dd/MM/yyyy",
	            ReadOnly = false,
                Label = "Date"
            });

            //lst.Insert(2, new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Hyperlink,
            //    FieldID = 1231111,
            //    FieldValue = new OMWValueString(""),
            //    Format = "",
            //    Label = "Hyperlink Readonly",
            //    RecordID = 230,
            //    ReadOnly = false,
            //    SelectionList = null
            //});

            //////Text input
            ////lst.Insert(2, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Text,
            ////    FieldID = 3,
            ////    FieldValue = textField,
            ////    Label = "Text",
            ////    ReadOnly = false,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});
            //lst.Insert(3, new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Text,
            //    FieldID = 4,
            //    FieldValue = textField,
            //    Label = "Readonly Text",
            //    ReadOnly = true,
            //    RecordID = 4321,
            //    SelectionList = null
            //});


            //Datetime
            lst.Insert(15, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateTime,
                FieldID = 1023,
                FieldValue = fieldValue,
                Label = "MyDateTime",
                Format = "dd/M/yy hh:mm:ss",
	            ReadOnly = false,
                RecordID = 4321,
                SelectionList = null
            });
            ////lst.Insert(5, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateTime,
            ////    FieldID = 6,
            ////    FieldValue = fieldValue,
            ////    Label = "MyDateTime",
            ////    Format = "dd/M/yy hh:mm:ss",
            ////    ReadOnly = true,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});

            //////Date only
            ////lst.Insert(6, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly,
            ////    FieldID = 7,
            ////    FieldValue = data,
            ////    Label = "MyDate",
            ////    Format = "dd/MMM/yy",
            ////    ReadOnly = false,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});
            ////lst.Insert(7, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly,
            ////    FieldID = 8,
            ////    FieldValue = data,
            ////    Label = "MyDate",
            ////    Format = "dd/MMM/yy",
            ////    ReadOnly = true,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});

            //////Time only
            ////lst.Insert(8, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_TimeOnly,
            ////    FieldID = 9,
            ////    FieldValue = time,
            ////    Label = "MyTime",
            ////    Format = "HH:mm:ss",
            ////    ReadOnly = false,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});
            ////lst.Insert(9, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_TimeOnly,
            ////    FieldID = 10,
            ////    FieldValue = time,
            ////    Label = "MyTime",
            ////    Format = "HH:mm:ss",
            ////    ReadOnly = true,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});

            //////Duration
            ////lst.Insert(10, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Duration,
            ////    FieldID = 11,
            ////    FieldValue = time,
            ////    Label = "MyDuration",
            ////    Format = "HH:mm:ss",
            ////    ReadOnly = false,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});
            ////lst.Insert(11, new OMWNamedField()
            ////{
            ////    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Duration,
            ////    FieldID = 12,
            ////    FieldValue = time,
            ////    Label = "MyDuration",
            ////    Format = "HH:mm:ss",
            ////    ReadOnly = true,
            ////    RecordID = 4321,
            ////    SelectionList = null
            ////});





            //var combo = new OMWValueString("opt5val;opt15val;optBADONE;opt250val");
            //var combo1 = new OMWValueString("opt5val;opt15val;opt1560val;opt250val");
            //var combo2 = new OMWValueString("opt5");
            //var daC = new List<string>();
            //for (int i = 0; i < 10000; i++)
            //{
            //    daC.Add("opt" + i.ToString() + "val");
            //}

            ////List
            //lst.Add(new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
            //    FieldID = 13,
            //    FieldValue = combo,
            //    Label = " Readonly list",
            //    ReadOnly = false,
            //    RecordID = 4321,
            //    SelectionList = daC
            //});
            //lst.Add(new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
            //    FieldID = 14,
            //    FieldValue = combo,
            //    Label = "List",
            //    ReadOnly = false,
            //    RecordID = 4321,
            //    SelectionList = daC
            //});

            ////Combobox
            //lst.Add(new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
            //    FieldID = 15,
            //    FieldValue = combo1,
            //    Label = "Combo",
            //    ReadOnly = true,
            //    RecordID = 4554,
            //    SelectionList = daC
            //});

            //lst.Add(new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Combo,
            //    FieldID = 16,
            //    FieldValue = combo2,
            //    Label = "Readonly Cmb",
            //    ReadOnly = true,
            //    // NumberOfLines = 11,
            //    RecordID = 4555,
            //    SelectionList = daC
            //});


            ////Checkbox
            //lst.Add(new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Check,
            //    FieldID = 17,
            //    FieldValue = checkBox,
            //    Label = "Checkbox",
            //    ReadOnly = false,
            //    RecordID = 4321,
            //    SelectionList = null
            //});
            //lst.Add(new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Check,
            //    FieldID = 18,
            //    FieldValue = checkBox,
            //    Label = "Readonly Checkbox",
            //    ReadOnly = true,
            //    RecordID = 4321,
            //    SelectionList = null
            //});*/





            // Re-assign to the collection
            story.HeaderFields = lst;
        }

	    public ErrorCode GetComboFieldOptionValues(string fieldID, string value, out List<string> values)
	    {
			System.Threading.Thread.Sleep(1000);

			var count = new Random().Next(5, 100);

			values = new List<string>();
			for (int i = 0; i < count; i++)
			{
				values.Add("field " + fieldID + " option " + (i + 1).ToString() + " value");
                values.Add("field " + fieldID + " option " + (i + 1).ToString() + " value");
                values.Add("field " + fieldID + " option " + (i + 1).ToString() + " value");
            }

			return new ErrorCode();
	    }

		public ErrorCode GetListFieldOptionValues(string storyID, string fieldID, out List<string> values)
		{
			var count = new Random().Next(5, 50);

            values = new List<string> { "" };
			for (int i = 1; i <= count; i++)
			{
				values.Add("opt" + i.ToString() + "val");
            }

			return new ErrorCode();
		}

        public ErrorCode GetListFieldSuggestions(string storyID, string fieldID, string value, out List<string> values)
        {
			var count = new Random().Next(5, 50);

			values = new List<string> { "" };
			for (int i = 1; i <= count; i++)
			{
				values.Add("opt" + i.ToString() + "val");
			}

	        values = values.Where(x => x.Contains(value))
	                       .ToList();

			return new ErrorCode();
        }

        public ErrorCode LockStory(OMWDocumentID storyID, int[] fieldIDsToLock)
        {
            return new ErrorCode();
        }

        public ErrorCode UnlockStory(OMWDocumentID storyID, int[] fieldIDsToUnlock)
        {
            return new ErrorCode();
        }

        public ErrorCode UpdateStory(OMWDocumentID storyID, string text, bool isHTML, OMWNamedField[] headerFields)
        {
            return new ErrorCode();
        }

        public ErrorCode AddStoryRecord(OMWDocumentID storyID, string type, OMWDocumentID recordDocID, out OMWAStoryRecord newInsert)
        {
            newInsert = new OMWAStoryRecord();
            newInsert.TooltipText = "This is the tooltip!";
            return new ErrorCode();
        }

        public ErrorCode RemoveStoryRecord(OMWDocumentID storyID, OMWAStoryRecord insertToRemove)
        {
            return new ErrorCode();
        }

        public ErrorCode GetRecordTypes(OMWDocumentID storyID, out List<OMWAStoryRecordType> recordTypes)
        {
            recordTypes = new List<OMWAStoryRecordType>();
            recordTypes.Add(new OMWAStoryRecordType() { Name = "Record 1", IconURL = "RecordIcon1.png" });
            recordTypes.Add(new OMWAStoryRecordType() { Name = "Record 2", IconURL = "RecordIcon2.png" });
            recordTypes.Add(new OMWAStoryRecordType() { Name = "Record 3", IconURL = "RecordIcon3.png" });
            recordTypes.Add(new OMWAStoryRecordType() { Name = "Record 4", IconURL = "RecordIcon4.png" });

            return new ErrorCode();
        }

        public ErrorCode UpdateRecordPosition(OMWDocumentID storyID, int RecordID, int newPosition)
        {
            return new ErrorCode();
        }
        #endregion IDocumentsAccess members
    }

	public class FieldEqualityComparer : IEqualityComparer<OMWNamedField>
	{
		public bool Equals(OMWNamedField x, OMWNamedField y)
		{
			return x.FieldID == y.FieldID;
		}

		public int GetHashCode(OMWNamedField obj)
		{
			return obj.FieldID;
		}
	}
}
