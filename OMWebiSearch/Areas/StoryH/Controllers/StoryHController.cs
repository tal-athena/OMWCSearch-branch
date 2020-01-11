using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using Newtonsoft.Json;
using OMWCSearch;
using OMWCSearch.Domain;
using OMWCSearch.Interfaces;
using OMWCSearch.UnitTest;
using OMWSTypes;
using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Areas.Story.Controllers;
using OMWebiSearch.Areas.ViewModels;
using OMWebiSearch.Helpers;
using OMWebiSearch.Models;

namespace OMWebiSearch.Areas.StoryH.Controllers
{
    public class StoryHController : Controller
    {
        #region Properties and fields
      //  private readonly INavigation _navigationService = new OMSNavigation();

        private readonly IDocumentsAccess _documentDataAccess = new FakeDataAccess();
        protected readonly ToolbarManager _toolbarManager = new ToolbarManager();

        #endregion


        #region Public Methods (actions)
        //[AuthenticationRequired]
        //[SessionExpireFilter]

        //[Authorize]
        public ActionResult Index(string id, bool? checkReadonly, string viewID, bool isCompactView = false, bool editorOnly = false, bool hideMaxButton = false)
        {
            //IEnumerable<OMWPaneE> navigationPanes;
            //_navigationService.GetPanes(out navigationPanes);

	        /*if (IsPureHTMLStory(id))
		        return RenderPureHTMLStory(id);*/
      
            var model = new StoryPageViewModel
            {
                Story = GetStory(id)
            };
            

            if (checkReadonly.HasValue && (bool)checkReadonly)
            {
                //model.Story.ReadOnly = IsReadOnly(id);
                //if (model.Story.ReadOnly)
                //{
                //    //Make all header fields readonly
                //    foreach (var item in model.Story.HeaderFields)
                //    {
                //        item.ReadOnly = true;
                //    }
                //}
            }






			//Check if text is RTL, testing cases
			//model.Story.isHTML = false;
			//model.Story.Text = "العربية";//Arabic
			//model.Story.Text = "עברית";//Hebrew

			//model.Story.Text = @"<html><head>	<title></title>	<meta content=""text/html; charset=utf-8"" http-equiv=""Content-Type"" />	<meta content=""Microsoft Exchange Server"" name=""Generator"" /><!-- converted from rtf -->	<style type=""text/css"">body{font-family:'Arial'; font-size:10pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">العربيةThis is an image that should be opened: <img alt="""" class=""OMInsert"" data-id=""PDIsNDQ1ODMsOTczZDRiY2MtM2QwNi00MzkxLTlhZmItNGI1NWNhNjA0ZTEzPg==#"" height=""20"" id=""19urn"" src=""/OMWebiSearch/Content/icons/10017.png"" title=""AUDIO"" width=""20"" /></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is an image that should NOT be opened: <div class=""MediaInsert"" src=""/OMWebiSearch/Content/images/media-insert.png"" data-omid=""PDIsNDQ1ODMsOTczZDRiY2MtM2QwNi00MzkxLTlhZmItNGI1NWNhNjA0ZTEzPg==#"" data-iconsize=""36""></div></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is hyperlink:<br /><a href=""https://www.google.com/""><font color=""#666666"" size=""2""><span style=""font-size:10pt;""><u>Use Google.com</u></span></font></a><br />&nbsp;</span></font></div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div></body></html>";
			//model.Story.Text = @"<html><head>	<title></title>	<style type=""text/css"">body{font-family:'Courier&#32;New'; font-size:12pt;}	</style></head><body><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;""><img alt="""" class=""mediaInsert"" data-iconsize=""35"" data-id=""urn_media_1eeef1aa-bd18-466d-ae49-d482875505cb_00000007007646F7"" data-recordid=""2"" height=""82"" id=""2,urn:media:1eeef1aa-bd18-466d-ae49-d482875505cb:00000007007646F7"" src=""/OMWebiSearch/Content/images/media-insert.png"" title=""(MW SCHALTE)"" /><img alt="""" class=""mediaInsert"" data-iconsize=""35"" data-id=""urn_media_1eeef1aa-bd18-466d-ae49-d482875505cb_00000007003E4F97"" data-recordid=""3"" height=""60"" id=""3,urn:media:1eeef1aa-bd18-466d-ae49-d482875505cb:00000007003E4F97"" src=""/OMWebiSearch/Content/images/media-insert.png"" title=""Live11"" /></span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;""><img alt="""" class=""mediaInsert"" data-iconsize=""35"" data-id=""urn_media_1eeef1aa-bd18-466d-ae49-d482875505cb_000000070091AD01"" data-recordid=""1"" height=""82"" id=""1,urn:media:1eeef1aa-bd18-466d-ae49-d482875505cb:000000070091AD01"" src=""/OMWebiSearch/Content/images/media-insert.png"" title=""(INS LT Live) Sebastian Kraft/LIVE/aus München"" /></span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">Was plant Horst Seehofer, Sebastian Kraft in München? Der CSU-Vorsitzende spannt alle auf die Folter. Was ist die wahrscheinlichste Variante?</span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">*</span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">Wie tritt Horst Seehofer heute auf, was bedeutet das Scheitern der Jamaica-Sondierungen für seine Position? </span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">*</span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">((Der Vorschlag von Wirtschaftsministerin Aigner zu einer Urwahl hat für einigen Wirbel in der Partei gesorgt, wie ist das Echo zu diesem Vorschlag?))</span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">Sebastian Kraft, München</span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;"">((Studio))</span></font></div><div><font face=""Courier New"" size=""3""><span style=""font-size:12pt;""><img alt="""" class=""mediaInsert"" data-iconsize=""35"" data-id=""urn_media_1eeef1aa-bd18-466d-ae49-d482875505cb_00000007003E4F97"" data-recordid=""4"" height=""60"" id=""4,urn:media:1eeef1aa-bd18-466d-ae49-d482875505cb:00000007003E4F97"" src=""/OMWebiSearch/Content/images/media-insert.png"" title=""Live11"" /></span></font></div></body></html>";

	        var mediaInsert = new MediaInsert().GetInsertMarkup();
	        model.Story.Text = @"<html><head>	<title></title>	<meta content=""text/html; charset=utf-8"" http-equiv=""Content-Type"" />	<meta content=""Microsoft Exchange Server"" name=""Generator"" /><!-- converted from rtf -->	<style type=""text/css"">body{font-family:'Arial'; font-size:10pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">العربيةThis is an image that should be opened: <img alt="""" class=""OMInsert"" data-id=""PDIsNDQ1ODMsOTczZDRiY2MtM2QwNi00MzkxLTlhZmItNGI1NWNhNjA0ZTEzPg==#"" height=""20"" id=""19urn"" src=""/OMWebiSearch/Content/icons/10017.png"" title=""AUDIO"" width=""20"" /></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is an image that should NOT be opened: " + mediaInsert + @"</span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is hyperlink:<br /><a href=""https://www.google.com/""><font color=""#666666"" size=""2""><span style=""font-size:10pt;""><u>Use Google.com</u></span></font></a><br />&nbsp;</span></font></div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div>
							<div class=""simplebox"">
							<h2 class=""simplebox-title"">Title</h2>
							<div class=""simplebox-content"">
							<p>Content...</p>
							</div>
							</div>
							<div>This is an image that should NOT be opened</div></body></html>";

			model.Story.Title = "Some article";

			model.Story.isHTML = true;

            ViewBag.IsRTLText = OMWebiSearch.Areas.Common.UIHelper.IsAnyCharacterRightToLeft(model.Story.Text, model.Story.isHTML);
	        ViewBag.isCompactView = isCompactView;


			//Get toolbar buttons
			OMWDocumentID documentId = new OMWDocumentID(model.Story.ID.PoolID, model.Story.ID.PinnID);
            ViewBag.ToolbarButtons = _toolbarManager.GetToolbarButtonsForDocID(documentId);
            ViewBag.ToolbarComboBox = _toolbarManager.GetToolbarComboBoxItemsForDocID(documentId);
            ViewBag.ViewID = viewID;

	        ViewBag.EditorOnly = editorOnly;
	        ViewBag.HideMaxButton = hideMaxButton;

			//For testing
			model.Story.ShowText = true;

            ViewBag.CollectionPreviewReadonly = checkReadonly;
            ViewBag.StoryId = id;

			ViewBag.LocalStorageEnabled = Convert.ToBoolean(ConfigurationManager.AppSettings["LocalStorageEnabled"]);

	        ViewBag.NumberOfLines = Convert.ToInt32(ConfigurationManager.AppSettings["NumberOfLines"]);
	        ViewBag.MaxFieldsPerLine = Convert.ToInt32(ConfigurationManager.AppSettings["MaxFieldsPerLine"]);
	        ViewBag.HeaderFieldsOrientation = "vertical";

			return View(model);
        }

	    public JsonResult GetStoryV2(string documentID, string systemID, long templateID, long fieldID)
	    {
		    try
		    {
			    ValidateStoryParameters(documentID, systemID, templateID, fieldID);

				var story = GetStory(documentID);

			    return Json(new
			    {
				    Status = "OK",
					StoryTitle = story.Title,
				    StoryText = story.Text
			    }, JsonRequestBehavior.AllowGet);
			}
		    catch (Exception ex)
		    {
			    return Json(new
			    {
				    Status = "Error",
				    Message = ex.Message
			    }, JsonRequestBehavior.AllowGet);
		    }
	    }

		[HttpPost]
	    public JsonResult SaveStoryV2(SaveStoryV2Model model)
	    {
		    try
		    {
			    ValidateStoryParameters(model.documentID, model.systemID, model.templateID, model.fieldID);

				return Json(new
			    {
				    Status = "OK"
			    }, JsonRequestBehavior.AllowGet);
		    }
		    catch (Exception ex)
		    {
			    return Json(new
			    {
				    Status = "Error",
				    Message = ex.Message
			    }, JsonRequestBehavior.AllowGet);
		    }
	    }

	    public JsonResult LockStoryV2(string documentID, string systemID, long templateID, long fieldID)
	    {
		    try
		    {
				ValidateStoryParameters(documentID, systemID, templateID, fieldID);

				return Json(new
			    {
				    Status = "OK"
			    }, JsonRequestBehavior.AllowGet);
		    }
		    catch (Exception ex)
		    {
			    return Json(new
			    {
				    Status = "Error",
				    Message = ex.Message
			    }, JsonRequestBehavior.AllowGet);
		    }
	    }

	    public JsonResult UnlockStoryV2(string documentID, string systemID, long templateID, long fieldID)
	    {
		    try
		    {
				ValidateStoryParameters(documentID, systemID, templateID, fieldID);

				return Json(new
			    {
				    Status = "OK"
			    }, JsonRequestBehavior.AllowGet);
		    }
		    catch (Exception ex)
		    {
			    return Json(new
			    {
				    Status = "Error",
				    Message = ex.Message
			    }, JsonRequestBehavior.AllowGet);
		    }
	    }

	    protected void ValidateStoryParameters(string documentID, string systemID, long templateID, long fieldID)
	    {
		    if (String.IsNullOrEmpty(documentID))
			    throw new ArgumentException("documentID");

		    if (String.IsNullOrEmpty(systemID))
			    throw new ArgumentException("systemID");

		    if (templateID <= 0)
			    throw new ArgumentException("templateID");

		    if (fieldID <= 0)
			    throw new ArgumentException("fieldID");
		}

		protected bool IsPureHTMLStory(string documentID)
	    {
		    try
		    {
				var json = ConfigurationManager.AppSettings["HTMLStories"];
			    if (!String.IsNullOrEmpty(json))
			    {
				    var stories = JsonConvert.DeserializeObject<List<HtmlStory>>(json);
					// TODO: mapping documentID to systemID and TemplateID

				    return true;
			    }
			}
		    catch (Exception ex)
		    {
				return false;
			}

		    return false;
		}

	    protected ActionResult RenderPureHTMLStory(string documentID)
	    {
			return View("IndexV2", new HtmlStory
			{
				storyId = documentID,
				systemId = "123",
				templateId = 456,
				srcFieldId = 1
			});
	    }

	    private bool IsReadOnly(string id)
        {
            //return false;
            return true;
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult LoadStoryCommandPanel(string id)
        {
            var model = new StoryViewModel
            {
                Story = GetStory(id),
            };
            return PartialView(model);
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult Stories(string id)
        {
            return new JsonResult { Data = new { story = GetStory(id) } };
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult LoadStoryFields(string id)
        {
            var model = new StoryViewModel
            {
                StoryId = id,
                Story = GetStory(id),
            };
            return PartialView(model);
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult LoadStoryContent(string id)
        {
            var model = new StoryViewModel
            {
                Story = GetStory(id)
            };
            return PartialView(model);
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult LockStory(string storyId, int fieldId)
        {
            _documentDataAccess.LockStory(OMWDocumentID.FromString(storyId), new int[] { fieldId });
            var message = new LockMessage()
            {
                status = "OK",
                message = "Story Locked by user 1"
            };
            return new JsonResult { Data = message };
        }

        struct LockMessage
        {
            public string status;
            public string message;
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult UnLockStory(string storyId, int fieldId)
        {
            _documentDataAccess.UnlockStory(OMWDocumentID.FromString(storyId), new int[] { fieldId });
            var message = new LockMessage()
            {
                status = "OK",
                message = "Story Unlocked by user 1"
            };
            return new JsonResult { Data = message };
        }

        //[AuthenticationRequired]
        //[SessionExpireFilterAjaxJsonAttribute]
        //[SessionExpireFilter]
        public ActionResult SaveStory(string storyId, int fieldId, string fieldValue, bool htmlUpdated, string html)
        {
            OMWDocumentID docId = OMWDocumentID.FromString(storyId);

            OMWAStory story = new OMWAStory();
            _documentDataAccess.GetStory(docId, out story);
            OMWNamedField field = story.HeaderFields.FirstOrDefault(f => f.FieldID == fieldId);
            try
            {


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
                                field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, "dd/MM/yyyy", CultureInfo.InvariantCulture));
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
            }
            catch { }

            _documentDataAccess.UpdateStory(docId, html, htmlUpdated, new[] { field });


            var message = new LockMessage()
            {
                status = "OK",
                message = "Story saved by user 1"
            };
            return new JsonResult { Data = message };
           // return new JsonResult() { JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }




        //ADDED, didnt do anything with the fieldFormat


        //[AuthenticationRequired]
        //[SessionExpireFilter]
        //[SessionExpireFilterAjaxJsonAttribute]
        public ActionResult SaveStoryDateTime(string storyId, int fieldId, string fieldValue, string fieldFormat, bool htmlUpdated, string html)
        {

            //Changing date format
            fieldFormat = DateTimeCSJSConvert.JSToCS(fieldFormat);



            OMWDocumentID docId = OMWDocumentID.FromString(storyId);

            OMWAStory story = new OMWAStory();
            _documentDataAccess.GetStory(docId, out story);
            OMWNamedField field = story.HeaderFields.FirstOrDefault(f => f.FieldID == fieldId);
            try
            {

                //Problem with year, it have only two yy on client side, but on server side it should have 4y



                switch (field.FieldValue.ValueType)
                {
                    case EOMWDataType.eOMDataType_DateTime:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss", fieldFormat }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                // field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss", fieldFormat }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Date:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Time:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueTime(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture));
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
            }
            catch { }

            _documentDataAccess.UpdateStory(docId, html, htmlUpdated, new[] { field });


            var message = new LockMessage()
            {
                status = "OK",
                message = "Story saved by user 1"
            };
            return new JsonResult { Data = message };
            //return new JsonResult() { JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }


        //[AuthenticationRequired]
        //[SessionExpireFilter]
        public ActionResult GetRecordIcons(string storyId)
        {
            List<OMWAStoryRecordType> recordTypes = new List<OMWAStoryRecordType>();
            _documentDataAccess.GetRecordTypes(OMWDocumentID.FromString(storyId), out recordTypes);

            return new JsonResult { Data = recordTypes };
        }

        //[AuthenticationRequired]
        //[SessionExpireFilter]
        // fieldId = recordTypeName due to the routing engine
        public ActionResult CanAddStoryRecord(string storyId, string fieldId)
        {
            OMWAStoryRecord record = null;
            _documentDataAccess.AddStoryRecord(OMWDocumentID.FromString(storyId), fieldId, null, out record);

            return new JsonResult { Data = record };
        }

		[HttpPost]
	    public ActionResult PasteInStoryText(string storyId, string viewId, string html)
	    {
		    html = html.Replace("MediaInsert", "REPLACED");

			return new JsonResult
		    {
			    Data = new
			    {
				    markup = html
				}
			};
	    }

	    public struct MediaInsertField
	    {
		    public int FieldID;
		    public string Value;
		    public bool IsEmpty;
	    }

		public ActionResult MediaInsertFields(string storyId, string imageId)
	    {
		    var story = GetStory(storyId);
		    var model = story.HeaderFields.ToList();

		    return View("MediaInsertFields", model);
	    }

	    [HttpPost]
	    public ActionResult UpdateMediaInsertFields(string storyId, string imageId, string fields)
	    {
		    var fieldsList = Newtonsoft.Json.JsonConvert.DeserializeObject<List<MediaInsertField>>(fields);

		    return new JsonResult { Data = new { status = "OK" } };
	    }

		#endregion


		#region Private methods
		private OMWAStory GetStory(string storyId)
        {
            OMWAStory story = null;
            _documentDataAccess.GetStory(OMWDocumentID.FromString(storyId), out story);

            return story;

            //return (from t in FakeDataAccess.GetStoryList() where t.ID.GetEncoded() == storyId select t).FirstOrDefault();
        }
        #endregion
    }
}
