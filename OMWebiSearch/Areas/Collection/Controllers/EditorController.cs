using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Collection.Controllers
{
    using OMWSTypes;
    using OMWCSearch;
    using OMWebiSearch.Areas.Common.ActionFilters;
    using OMWebiSearch.Areas.ViewModels;
    using OMWebiSearch.Models;
    using OMWCSearch.UnitTest;

    public class EditorController : Controller
    {


        protected readonly ToolbarManager _toolbarManager = new ToolbarManager();

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Index(string id, string templateId, string viewID)
        {
            INavigation navigationService = new OMSNavigation();
            IEnumerable<OMWPaneE> navigationPanes;
            navigationService.GetPanes(out navigationPanes);

            var model = new CollectionViewModel
            {
                CollectionId = id,
                TemplateId = templateId ?? new OMWDocumentID(1, 2, "3").GetEncoded(),
                NavigationPanes = navigationPanes.ToList(),
                IsNewInEnabled = IsNewInSupported(id)
            };

            OMWDocumentID tid = OMWDocumentID.FromString(templateId);
            ViewBag.ToolbarButtons = _toolbarManager.GetToolbarButtonsForDocID(tid);
            ViewBag.ToolbarComboBox = _toolbarManager.GetToolbarComboBoxItemsForDocID(tid);
            ViewBag.ViewID = viewID;

	        ViewBag.NumberOfLines = Convert.ToInt32(ConfigurationManager.AppSettings["NumberOfLines"]);
	        ViewBag.MaxFieldsPerLine = Convert.ToInt32(ConfigurationManager.AppSettings["MaxFieldsPerLine"]);
	        ViewBag.HeaderFieldsOrientation = "vertical";

			if (Request.Browser.IsMobileDevice)
            {
                return View("MobileIndex", model);
            }
            else
            {
                return View(model);
            }
        }

		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult IFrame(string id, string templateId, string viewID, bool isCompactView = false)
	    {
			INavigation navigationService = new OMSNavigation();
			IEnumerable<OMWPaneE> navigationPanes;
			navigationService.GetPanes(out navigationPanes);

			var model = new CollectionViewModel
			{
				CollectionId = id,
				TemplateId = templateId ?? new OMWDocumentID(1, 2, "3").GetEncoded(),
				NavigationPanes = navigationPanes.ToList(),
				IsNewInEnabled = IsNewInSupported(id)
			};

			OMWDocumentID tid = OMWDocumentID.FromString(templateId);
			ViewBag.ToolbarButtons = _toolbarManager.GetToolbarButtonsForDocID(tid);
			ViewBag.ToolbarComboBox = _toolbarManager.GetToolbarComboBoxItemsForDocID(tid);
			ViewBag.ViewID = viewID;
		    ViewBag.IsCompactView = isCompactView;

		    ViewBag.NumberOfLines = Convert.ToInt32(ConfigurationManager.AppSettings["NumberOfLines"]);
		    ViewBag.MaxFieldsPerLine = Convert.ToInt32(ConfigurationManager.AppSettings["MaxFieldsPerLine"]);
		    ViewBag.HeaderFieldsOrientation = "vertical";

			if (Request.Browser.IsMobileDevice)
			{
				return View("MobileIndex", model);
			}
			else
			{
				return PartialView(model);
			}
		}

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    public ActionResult GetCollectionFieldValues(string collectionId, string fieldId, int recordId, string viewId = "-1")
	    {
			var cid = OMWDocumentID.FromString(collectionId);
			var collectionAccess = new FakeCollectionsAccess();
			var collection = (OMWACollection)null;

			collectionAccess.GetCollection(cid, out collection);
			if (collection == null)
			{
				return Json(new { status = "failed", Reason = "Unknown collection." }, JsonRequestBehavior.AllowGet);
			}

			var field = collection.HeaderFields.First();

			//if (DateTime.Now.Minute % 2 == 0)
			//{
				List<string> selListPossibleItems = new List<string>();
				selListPossibleItems.Add("RecordIcon1.png");
				selListPossibleItems.Add("RecordIcon2.png");
				selListPossibleItems.Add("RecordIcon3.png");
				selListPossibleItems.Add("");
				List<string> selListIcons = new List<string>();
				if (field.SelectionList == null)
					field.SelectionList = new List<string> { "opt1val", "opt2val", "opt3val", "opt4val", "opt5val", "opt6val" };

				for (int i = 0; i < field.SelectionList.Count(); i++)
				{
					selListIcons.Add(selListPossibleItems[i % 4]);
				}
				return Json(new { items = field.SelectionList, icons = selListIcons }, JsonRequestBehavior.AllowGet);
			//}

			//return Json(new { items = field.SelectionList }, JsonRequestBehavior.AllowGet);
		}


		[AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Fields(string id)
        {
            var model = new CollectionViewModel { CollectionId = id };
            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        [HttpPost]
        public ActionResult GetInputControlForRecord(string collectionId, string lineElementId, string parentId, string recordId, string fieldId, string value)
        {
            OMWNamedField field = new OMWNamedField();
            switch (recordId)
            {
                case "1":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Undefined;
                    field.Label = "Undefined";
                    break;
                case "2":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Check;
                    field.Label = "Check";
                    field.FieldValue = new OMWValueInt(value.Length % 2);
                    break;
                case "3":
                    var daC = new List<string>();
                    daC.Add("opt1");
                    daC.Add("opt2");
                    daC.Add("opt3");
                    daC.Add("opt4");
                    daC.Add("opt5");
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Combo;
                    field.Label = "Combo";
                    field.SelectionList = daC;
                    field.FieldValue = new OMWValueString(value);
                    break;
                case "4":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateOnly;
                    field.Label = "Date";
                    field.FieldValue = new OMWValueDate(DateTime.Now);
                    break;
                case "5":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateTime;
                    field.Label = "Date time";
                    field.FieldValue = new OMWValueDateTime(DateTime.Now);
                    break;
                case "6":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Duration;
                    field.Label = "Duration";
                    field.FieldValue = new OMWValueTimeSpan(new TimeSpan());
                    break;
                case "7":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_TimeOnly;
                    field.Label = "Time";
                    field.FieldValue = new OMWValueTime(DateTime.Now);
                    break;
                case "8":
                    var list = new List<string>();
                    list.Add("opt1");
                    list.Add("opt2");
                    list.Add("opt3");
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List;
                    field.Label = "List";
                    field.SelectionList = list;
                    field.FieldValue = new OMWValueString(value);
                    break;
                case "9":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_MultilineText;
                    field.Label = "Multiline";
                    field.FieldValue = new OMWValueString(value);
                    break;
                case "10":
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Number;
                    field.Label = "Number";
                    int val = 0;
                    Int32.TryParse(value, out val);

                    field.FieldValue = new OMWValueInt(val);
                    break;
                default:
                    field.DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Text;
                    field.Label = "Text";
                    field.FieldValue = new OMWValueString(value);
                    break;
            }

            return PartialView("EditCollectionGridField", field);
        }
        [AuthenticationRequired]
        [SessionExpireFilter]
        [HttpPost]
        public ActionResult SetRecordField(string collectionId, string lineElementId, string parentId, string recordId, string fieldId, string newValue)
        {
            return Json(new { status = "OK" });
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Contents(string id)
        {
            var model = new CollectionViewModel { CollectionId = id, TemplateId = new OMWDocumentID(1, 2, "3").GetEncoded() };
            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult ContentsFields(string templateId)
        {
            var tid = OMWDocumentID.FromString(templateId);
            var collectionAccess = new FakeCollectionsAccess();
            var gridView = collectionAccess.GetGridView(tid);

            if (gridView == null)
            {
                return Json(new { status = "failed", Reason = "Unknown grid view." });
            }

            return Json(new { grid = gridView });
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult CollectionRecordDND(string sourceCollectionId, string sourceRecordId, string targetCollectionId, string targetRecordId)
        {
            Console.WriteLine("sourceCollectionId:" + sourceCollectionId + " sourceRecordId:" + sourceRecordId + " targetCollectionId:" + targetCollectionId + " targetRecordId:" + targetRecordId);
            //TODO add implementation
            CollectionManager.Instance.OnCollectionChange(targetCollectionId, (JsonResult)Collections(targetCollectionId));
            if (sourceCollectionId != targetCollectionId)
            {
                CollectionManager.Instance.OnCollectionChange(sourceCollectionId, (JsonResult)Collections(sourceCollectionId));
            }
            return Json(new { result = "OK" });
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult CollectionRecordDNDNew(DragAndDropViewModel model)
        {
            return Json(new { status = "success" });

            //TODO add implementation
            //if (model.response == 0)
            //{
            //    return Json(new { status = "success" });
            //}
            //else if (model.response == 1)
            //{
            //    return Json(new { status = "fail", error = "Something went wrong, please try again" });
            //}
            //else
            //{
            //    List<Tuple<string, string, string>> options = new List<Tuple<string, string, string>>();
            //    options.Add(new Tuple<string, string, string>("copy", "Copy", "commandId1"));
            //    options.Add(new Tuple<string, string, string>("paste", "Paste", "commandId2"));
            //    options.Add(new Tuple<string, string, string>("quit", "Quit", "commandId3"));

            //    return Json(new { status = "ask", options = options });
            //}
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult CollectionRecordDNDMove(DragAndDropViewModel model)
        {
            //TODO add implementation
            if (model.response == 0)
            {
                return Json(new { status = "success" });
            }
            else
            {
                return Json(new { status = "fail", error = "Something went wrong, please try again" });
            }
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult CollectionRecordDNDCopy(DragAndDropViewModel model)
        {
            //TODO add implementation
            if (model.response == 0)
            {
                var record = new OMWACollectionRecord();

                return Json(new { status = "success", record = record }); //object is reserved word
            }
            else
            {
                return Json(new { status = "fail", error = "Something went wrong, please try again" });
            }
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult ContentsDataLevel(string templateId, string collectionId, string subCollection)
        {
            var cid = OMWDocumentID.FromString(subCollection);
            var collectionAccess = new FakeCollectionsAccess();
            var collection = (OMWACollection)null;

            collectionAccess.GetCollection(cid, out collection);
            if (collection == null)
            {
                return Json(new { status = "failed", Reason = "Unknown collection." });
            }

            var tid = OMWDocumentID.FromString(templateId);
            var gridView = collectionAccess.GetGridView(tid);
            var records = new OMWACollectionRecord[collection.Records.Count()];
            collection.Records.ToArray().CopyTo(records, 0);

            foreach (var rec in records)
            {
                rec.ParentID = subCollection;
            }

            foreach (var r in records)
            {
                r.Fields = (from field in r.Fields
                            join col in gridView.columns on field.FieldID equals col.FieldID
                            select field)
                            .Distinct()
                            .ToArray();
            }

            return Json(new { items = records, totalCount = records.Count() });
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetHeaderFieldValues(string collectionId, string fieldId)
        {
			var cid = OMWDocumentID.FromString(collectionId);
            var collectionAccess = new FakeCollectionsAccess();
            var collection = (OMWACollection)null;

            collectionAccess.GetCollection(cid, out collection);
            if (collection == null)
            {
                return Json(new { status = "failed", Reason = "Unknown collection." }, JsonRequestBehavior.AllowGet);
            }

            OMWNamedField field = null;
            var headerFields = collection.HeaderFields.ToList();
            for (int i = 0; i < headerFields.Count; i++)
            {
                if (headerFields[i].FieldID.ToString() == fieldId)
                {
                    field = headerFields[i];
                    break;
                }
            }

            if (field == null)
            {
	            return Json(new { items = new List<string> { "Opt 1 val", "Opt 2 val", "Opt 3 val" } }, JsonRequestBehavior.AllowGet);
				//return Json(new { status = "failed", Reason = "Unknown field." }, JsonRequestBehavior.AllowGet);
            }


            if (DateTime.Now.Minute % 2 == 0)
            {
                List<string> selListPossibleItems = new List<string>();
                selListPossibleItems.Add("RecordIcon1.png");
                selListPossibleItems.Add("RecordIcon2.png");
                selListPossibleItems.Add("RecordIcon3.png");
                selListPossibleItems.Add("");
                List<string> selListIcons = new List<string>();
                for (int i = 0; i < field.SelectionList.Count(); i++)
                {
                    selListIcons.Add(selListPossibleItems[i % 4]);
                }
                return Json(new { items = field.SelectionList, icons = selListIcons }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { items = field.SelectionList }, JsonRequestBehavior.AllowGet);
        }


        //[AuthenticationRequired]
        //[SessionExpireFilter]
        //public ActionResult ContentsData(string templateId, string collectionId)
        //{
        //    var cid = OMWDocumentID.FromString(collectionId);
        //    var collectionAccess = new FakeCollectionsAccess();
        //    var collection = (OMWACollection)null;

        //    collectionAccess.GetCollection(cid, out collection);
        //    if (collection == null)
        //    {
        //        return Json(new { status = "failed", Reason = "Unknown collection." });
        //    }

        //    var tid = OMWDocumentID.FromString(templateId);

        //    var gridView = collectionAccess.GetGridView(tid);

        //    var records = new OMWACollectionRecord[collection.Records.Count()];
        //    collection.Records.ToArray().CopyTo(records, 0);

        //    foreach (var rec in records)
        //    {
        //        rec.ParentID = collectionId;
        //    }

        //    foreach (var r in records)
        //    {
        //        r.Fields = (from field in r.Fields
        //                    join col in gridView.columns on field.FieldID equals col.FieldID
        //                    select field)
        //                    .Distinct()
        //                    .ToArray();
        //    }

        //    return Json(new { items = records, totalCount = records.Count() });
        //}

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult ContentsData(string templateId, string collectionId, IEnumerable<string> subItemsID)
        {
            Dictionary<string, List<OMWACollectionRecord>> returnListNew = new Dictionary<string, List<OMWACollectionRecord>>();

            var cid = OMWDocumentID.FromString(collectionId);
            var collectionAccess = new FakeCollectionsAccess();
            var collection = (OMWACollection)null;

            collectionAccess.GetCollection(cid, out collection);
            if (collection == null)
            {
                return Json(new { status = "failed", Reason = "Unknown collection." });
            }

            var tid = OMWDocumentID.FromString(templateId);

            var gridView = collectionAccess.GetGridView(tid);

            var records = new OMWACollectionRecord[collection.Records.Count()];
            collection.Records.ToArray().CopyTo(records, 0);

            foreach (var rec in records)
            {
                rec.ParentID = collectionId;
            }

            returnListNew.Add(collectionId, records.ToList());

            if (subItemsID != null)
            {
                var subItems = subItemsID.ToList();
                for (int i = 0; i < subItems.Count; i++)
                {
                    var cid1 = OMWDocumentID.FromString(subItems[i]);
                    var collection1 = (OMWACollection)null;
                    collectionAccess.GetCollection(cid1, out collection1);

                    if (!returnListNew.ContainsKey(subItems[i]))
                    {
                        returnListNew.Add(subItems[i], records.ToList());
                    }
                }
            }

            return Json(new { items = returnListNew, totalCount = records.Count() });
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult ContentsDataMobile(string templateId, string collectionId)
        {
            var cid = OMWDocumentID.FromString(collectionId);
            var collectionAccess = new FakeCollectionsAccess();
            var collection = (OMWACollection)null;

            collectionAccess.GetCollection(cid, out collection);
            if (collection == null)
            {
                return Json(new { status = "failed", Reason = "Unknown collection." });
            }

            var tid = OMWDocumentID.FromString(templateId);

            var gridView = collectionAccess.GetGridView(tid);

            var records = new OMWACollectionRecord[collection.Records.Count()];
            collection.Records.ToArray().CopyTo(records, 0);

            foreach (var rec in records)
            {
                rec.ParentID = collectionId;
            }

            foreach (var r in records)
            {
                r.Fields = (from field in r.Fields
                            join col in gridView.columns on field.FieldID equals col.FieldID
                            select field)
                            .Distinct()
                            .ToArray();
            }

            var returnRecords = new List<OMWAMCollectionRecord>();
            foreach (var rec in records)
            {
                returnRecords.Add(new OMWAMCollectionRecord(rec));
            }

            return Json(new { items = returnRecords, totalCount = records.Count() });
        }



        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Collections(string id)
        {
            var cid = OMWDocumentID.FromString(id);
            var collectionAccess = new FakeCollectionsAccess();
            var collection = (OMWACollection)null;

            collectionAccess.GetCollection(cid, out collection);
            if (collection == null)
            {
                return Json(new { status = "failed", Reason = "Unknown collection." }, JsonRequestBehavior.AllowGet);
            }

            return Json(collection);
        }

	    [AuthenticationRequired]
	    [SessionExpireFilter]
		[HttpPost]
	    public ActionResult LockCollectionField(string collectionId, string row, int fieldId)
	    {
		    return Json(new { status = "OK" });
		}

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    [HttpPost]
	    public ActionResult UnlockCollectionField(string collectionId, string row, int fieldId)
	    {
		    return Json(new { status = "OK" });
	    }

	    [AuthenticationRequired]
        [SessionExpireFilter]
        //[ActionName("Locks")]
        public ActionResult LockField(string collectionId, int fieldId)
        {
            var cid = OMWDocumentID.FromString(collectionId);
            var collectionAccess = new FakeCollectionsAccess();
            collectionAccess.LockCollection(cid, new[] { fieldId });

            return Json(new { status = "success" }, JsonRequestBehavior.AllowGet);

            // return Json(new { status = "failed" });
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        // [ActionName("Locks")]
        // [HttpDelete]
        public ActionResult UnlockField(string collectionId, int fieldId)
        {
            var cid = OMWDocumentID.FromString(collectionId);
            var collectionAccess = new FakeCollectionsAccess();
            collectionAccess.UnlockCollection(cid, new[] { fieldId });

            return Json(new { status = "success" }, JsonRequestBehavior.AllowGet);
		}

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    public ActionResult GetInternalLinkInfo(string docId)
	    {
			if (String.IsNullOrEmpty(docId))
				return Json(new { Title = "Empty", IconUrl = "" }, JsonRequestBehavior.AllowGet);

			return Json(new { Title = "New title", IconUrl = "Content/Images/toolbar-ok.png" }, JsonRequestBehavior.AllowGet);
	    }


		[AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult UpdateField(string collectionId, int fieldId, string fieldValue)
        {
            try
            {
                var cid = OMWDocumentID.FromString(collectionId);
                var collectionAccess = new FakeCollectionsAccess();
                collectionAccess.UnlockCollection(cid, new[] { fieldId });

                var collection = (OMWACollection)null;
                collectionAccess.GetCollection(cid, out collection);

                var field = collection.HeaderFields.FirstOrDefault(f => f.FieldID == fieldId);

                switch (field.FieldValue.ValueType)
                {
                    case EOMWDataType.eOMDataType_DateTime:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Date:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy", "dd.MM.yyyy", "dd.MM.yyyy" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Time:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueTime(DateTime.ParseExact(fieldValue, "H:mm:ss", CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Integer:
                        {
                            field.FieldValue = new OMWValueInt(int.Parse(fieldValue, CultureInfo.InvariantCulture));
                            break;
                        }
                    case EOMWDataType.eOMDataType_String:
                        {
                            field.FieldValue = new OMWValueString(fieldValue);
                            break;
                        }
                }

                collectionAccess.UpdateCollection(cid, collection.HeaderFields.ToArray());
                return Json(new { status = "OK", message = "" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "Error", message = "Error happend while updating field value to server" }, JsonRequestBehavior.AllowGet);
			}
        }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult FirstColumnGroupItems(string id, List<string> items)
        {
            return Json(new { status = "success" });
        }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult FirstColumnUngroupItems(string id, List<string> items)
        {
            return Json(new { status = "success" });
        }


        //Should be changed what to do when updating the date fields, the fieldFormat is the format of deta-time fields
        //Problem with JQuery is that it have yy for yyyy format
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult UpdateDateField(string collectionId, int fieldId, string fieldValue, string fieldFormat)
        {
            try
            {

                fieldFormat = DateTimeCSJSConvert.JSToCS(fieldFormat);

                var cid = OMWDocumentID.FromString(collectionId);
                var collectionAccess = new FakeCollectionsAccess();
                collectionAccess.UnlockCollection(cid, new[] { fieldId });

                var collection = (OMWACollection)null;
                collectionAccess.GetCollection(cid, out collection);

                var field = collection.HeaderFields.FirstOrDefault(f => f.FieldID == fieldId);

                switch (field.FieldValue.ValueType)
                {
                    case EOMWDataType.eOMDataType_DateTime:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                //field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Date:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                //field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy", "dd.MM.yyyy", "dd.MM.yyyy" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Time:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueTime(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture));
                                // field.FieldValue = new OMWValueTime(DateTime.ParseExact(fieldValue, "H:mm:ss", CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Integer:
                        {
                            field.FieldValue = new OMWValueInt(int.Parse(fieldValue, CultureInfo.InvariantCulture));
                            break;
                        }
                    case EOMWDataType.eOMDataType_String:
                        {
                            field.FieldValue = new OMWValueString(fieldValue);
                            break;
                        }
                }

                collectionAccess.UpdateCollection(cid, collection.HeaderFields.ToArray());
                return Json(new { status = "OK", message = "" });
            }
            catch (Exception ex)
            {
                return Json(new { status = "Error", message = "Error happend while updating field value to server" });
            }
        }

        private bool IsNewInSupported(string documentID)
        {

            return true;
        }
    }


    public class ContentDataReturnObject
    {
        public string collectionId;
        public List<OMWACollectionRecord> list;

        public ContentDataReturnObject(string collectionId, List<OMWACollectionRecord> list)
        {
            this.collectionId = collectionId;
            this.list = list;
        }
    }

}
