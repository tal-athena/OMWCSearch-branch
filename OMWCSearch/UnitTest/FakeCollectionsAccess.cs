using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Text;
using System.Xml;

namespace OMWCSearch.UnitTest
{
    using ViewTypes;
    using OMWSTypes;
    using Interfaces;
    using System.Globalization;

    public class FakeCollectionsAccess : ICollectionsAccess
    {
        #region Fields
        private static List<OMWACollection> _collections;
        private static Dictionary<string, OMWCGridView> _gridViews = new Dictionary<string, OMWCGridView>();
        #endregion Fields

        #region Static members
        public static List<OMWACollection> GetCollectionList()
        {
            if (_collections == null)
            {
                DataContractSerializer ds = new DataContractSerializer(typeof(IEnumerable<OMWACollection>));
                Assembly a = Assembly.GetExecutingAssembly();

                using (Stream strm = a.GetManifestResourceStream("OMWCSearch.collections.xml"))
                {
                    var reader = XmlDictionaryReader.CreateTextReader(strm, new XmlDictionaryReaderQuotas());
                    _collections = ((IEnumerable<OMWACollection>)ds.ReadObject(reader, true)).ToList();
                }

                _collections.ForEach(c => c.Records = GetFakeRecords());
            }
            return _collections;
        }
        #endregion Static members

        #region ICollectionsAccess member
        public ErrorCode GetCollection(OMWDocumentID ID, out OMWACollection story)
        {
            if(_collections == null)
            {
                _collections = GetCollectionList();
            }
            story = _collections.FirstOrDefault(c => c.ID.ToString().GetHashCode() == ID.ToString().GetHashCode());
            
            if(story == null)
            {
                story = _collections[0];
            }
            AddMandatoryTestHeaderFields(story);
            story.Records = GetFakeRecords();
            return new ErrorCode();
        }

        protected void AddMandatoryTestHeaderFields(OMWACollection collection)
        {
			collection.HeaderFields = new List<OMWNamedField>();

            // copy the random header fields
            var lst = new List<OMWNamedField>(collection.HeaderFields);
            // add the mandatory fields
            var fieldValue = new OMWValueDateTime(DateTime.ParseExact("26.02.2012 18:37:58", "dd.MM.yyyy HH:mm:ss", CultureInfo.InvariantCulture));

            //var fieldValue = new OMWValueDateTime(DateTime.ParseExact("26.02.2012 18:37:58", "dd.MM.yyyy HH:mm:ss", CultureInfo.InvariantCulture));
            var checkVal = new OMWValueInt(1);
            var data = new OMWValueDate(DateTime.ParseExact("26.02.2012", "dd.MM.yyyy", CultureInfo.InvariantCulture));
            var time = new OMWValueTime(DateTime.ParseExact("18:37:28", "HH:mm:ss", new CultureInfo("en-US")));
            var time2 = new OMWValueTime(DateTime.ParseExact("19:11:17", "HH:mm:ss", CultureInfo.InvariantCulture));

            var time3 = new OMWValueTime(new DateTime(2013, 11, 6, 19, 11, 17));
            var readOnlyText = new OMWValueString("1");
            //lst.Insert(0, new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateTime,
            //    FieldID = 23231992,
            //    FieldValue = fieldValue,
            //    Format = "dd/MM/yyyy hh:mm:ss",
            //    Label = "DateTime",
            //    RecordID = 2303,
            //    ReadOnly = false,
            //    SelectionList = null
            //});
            ////Format = "HH:mm",
            ////  Format = "HH:mm:ss",
            ////Format = "mm"ss",
            //lst.Insert(1, new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Duration,
            //    FieldID = 123457,
            //    FieldValue = time,
            //    Format = "HH:mm:ss",
            //    Label = "Duration",
            //    RecordID = 4321,
            //    SelectionList = null,
            //    ReadOnly = false
            //});
            //lst.Insert(2, new OMWNamedField()
            //{
            //    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly,
            //    FieldID = 123458,
            //    FieldValue = data,
            //    Format = "dd/MM/yyyy",
            //    Label = "Date",
            //    ReadOnly = false,
            //    // NumberOfLines = 11,
            //    RecordID = 4321,
            //    SelectionList = null
            //});

            var dataF = new OMWValueString("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
            var combo = new OMWValueString("opt2");
            var combo1 = new OMWValueString("Dont exists");
            var combo2 = new OMWValueString("opt5val;opt25val;opt3val;optINVALIDval;opt5368val");
            var daC = new List<string>();
            for (int i = 0; i < 10000; i++)
            {
                daC.Add("opt" + i.ToString() + "val");
            }

	        for (var i = 0; i < 12; i++)
	        {
		        if (i == 7)
		        {
			        lst.Add(new OMWNamedField()
			        {
				        DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_MultilineText,
				        FieldID = 123456 + i,
				        FieldValue = new OMWValueString("This is multiline text field. Should occupy more than one line"),
				        Label = "Text",
				        RecordID = 4321,
				        ReadOnly = false,
				        SelectionList = null
			        });
				}
		        else
		        {
					lst.Add(new OMWNamedField()
					{
						DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Text,
						FieldID = 123456 + i,
						FieldValue = new OMWValueString("Value " + i),
						Label = i.ToString(),
						RecordID = 4321,
						ReadOnly = false,
						SelectionList = null
					});
				}
			}

			/*lst.Insert(0, new OMWNamedField()
			{
				DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_MultilineText,
				NumberOfLines = 6,
				FieldID = 23031991,
				FieldValue = dataF,
				ReadOnly = false,
				Label = "Multiline Text",
				RecordID = 3323,
				SelectionList = null
			});
			lst.Insert(1, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 999,
                FieldValue = combo2,
                Label = "Second list with invalid options",
                ReadOnly = false,
                // NumberOfLines = 11,
                RecordID = 4555,
                SelectionList = daC
            });
            
            lst.Add(new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Check,
                FieldID = 123456,
                FieldValue = checkVal,
                Label = "CHECKBOX",
                RecordID = 4321,
                ReadOnly = false,
                SelectionList = null
            });
	        lst.Add(new OMWNamedField
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
			var reNumber = new OMWValueInt(123456);

			lst.Add(new OMWNamedField()
			{
			    DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_MultilineText,
			    FieldID = 23231992,
			    FieldValue = new OMWValueString("1"),
			    Label = "read only text",
			    RecordID = 2303,
			    ReadOnly = false,
			    SelectionList = null
			});

	        lst.Add(new OMWNamedField
	                {
		                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Undefined,
		                FieldValue = new OMWValueString("http://hpr.dogphilosophy.net/test/mp3.mp3"),
		                FieldID = 555,
		                Label = "Internal Link",
		                RecordID = 4321,
		                ReadOnly = false,
		                InternalLink = new OMWInternalLink
		                               {
			                               Title = "Click me",
			                               docIdValue = "http://hpr.dogphilosophy.net/test/mp3.mp3",
			                               iconURL = "Content/Images/link.png"
		                               }
	                });*/

			// Re-assign to the collection
			collection.HeaderFields = lst;
        }

        public ErrorCode LockCollection(OMWDocumentID ID, int[] fieldIDsToLock)
        {
            return new ErrorCode();
        }

        public ErrorCode UnlockCollection(OMWDocumentID storyID, int[] fieldIDsToUnlock)
        {
            return new ErrorCode();
        }

        public ErrorCode UpdateCollection(OMWDocumentID storyID, OMWNamedField[] headerFields)
        {
            return new ErrorCode();
        }

        public OMWCGridView GetGridView(OMWDocumentID templateID)
        {
            var tid = templateID.ToString();
            if (_gridViews.ContainsKey(tid))
            {
                return _gridViews[tid];
            }

            var fields = SearchService.GetFakeFields();
            var rnd = new System.Random();
            var result = new OMWCGridView() { columns = new List<OMWCGridColumn>() };

			foreach (var field in fields)
			{
				var col = new OMWCGridColumn
				          {
					          columnName = String.Format("Column {0}", field.FieldID),
					          columnWidth = field.EditorType == EOMWFieldDisplayType.eOMFieldDisplayType_Check
						                        ? "50"
						                        : rnd.Next(300)
						                             .ToString(),
					          FieldID = field.FieldID,
					          editorType = field.EditorType,
							  readOnly = false,//field.EditorType != EOMWFieldDisplayType.eOMFieldDisplayType_Check || field.FieldID == 1,
					          _stateTextAndColor = field.EditorType == EOMWFieldDisplayType.eOMFieldDisplayType_Check && field.FieldID != 1000
						                               ? new List<StateTextAndColor>
						                                 {
							                                 new StateTextAndColor
							                                 {
																 state = 0,
								                                 str = "Unchecked",
																 color = field.FieldID == 1 ? "ff0000ff" : "00ff00ff"
															 },
							                                 new StateTextAndColor
							                                 {
								                                 state = 1,
								                                 str = "Checked",
								                                 color = field.FieldID == 1 ? "98fb98ff" : "ffff00ff"
															 }
														 }
						                               : null
				          };

				result.columns.Add(col);
			}

			_gridViews[tid] = result;
            return result;
        }

        #endregion ICollectionsAccess member

        static int[] recordIDs = { 9, 8, 4, 6, 2, 3, 7, 5, 11, 1, 20, 18, 16, 14, 12, 13, 15, 17, 19, 30, 32, 28, 34, 26, 36, 24, 38, 22, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 44, 45, 50, 49, 48, 47, 46 };
        static int[] groupIDs = { 1, 1, 1, 2, 2, 0, 0, 5, 5, 5, 5, 3, 3, 1, 1, 1, 1, 0, 2, 2, 3, 3, 3 };
        static string[] itemStatuses = { "", "recycled", "archived", "flaged" };
        internal static OMWACollectionRecord[] GetFakeRecords()
        {
            var rnd = new Random();
            var count = 12;
            var records = new List<OMWACollectionRecord>(count);
            bool hasKids = false;
            for (int i = 0; i < count; i++)
            {
                hasKids = !hasKids;
                var docType = (OMWCDocumentType)(i % 2);
                var docId = (docType == OMWCDocumentType.Story ?
                    FakeDataAccess.GetStoryList()[i].ID : _collections[i].ID);

                records.Add(
                    new OMWACollectionRecord { Fields = SearchService.GetFakeFields(), ID = docId, RecordID = recordIDs[i], DocumentType = docType, HasSubitems = hasKids, GroupID = groupIDs[i % (groupIDs.Length - 1)], ItemStatus = itemStatuses[i % itemStatuses.Length] });

	            records.Add(
		            new OMWACollectionRecord { Fields = SearchService.GetFakeFields(), ID = docId, RecordID = recordIDs[i], DocumentType = docType, HasSubitems = hasKids, GroupID = groupIDs[i % (groupIDs.Length - 1)], ItemStatus = itemStatuses[i % itemStatuses.Length] });

	            records.Add(
		            new OMWACollectionRecord { Fields = SearchService.GetFakeFields(), ID = docId, RecordID = recordIDs[i], DocumentType = docType, HasSubitems = hasKids, GroupID = groupIDs[i % (groupIDs.Length - 1)], ItemStatus = itemStatuses[i % itemStatuses.Length] });

	            records.Add(
		            new OMWACollectionRecord { Fields = SearchService.GetFakeFields(), ID = docId, RecordID = recordIDs[i], DocumentType = docType, HasSubitems = hasKids, GroupID = groupIDs[i % (groupIDs.Length - 1)], ItemStatus = itemStatuses[i % itemStatuses.Length] });

	            records.Add(
		            new OMWACollectionRecord { Fields = SearchService.GetFakeFields(), ID = docId, RecordID = recordIDs[i], DocumentType = docType, HasSubitems = hasKids, GroupID = groupIDs[i % (groupIDs.Length - 1)], ItemStatus = itemStatuses[i % itemStatuses.Length] });
			}

            return records.ToArray();
        }

    }
}
