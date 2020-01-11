using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Configuration;
using System.Web.Mvc;
using OMWCSearch.Domain;
using OMWCSearch.Interfaces;
using OMWCSearch;
using OMWCSearch.UnitTest;
using OMWSTypes;
using OMWSessionManagement;
using OMWSessionManagement.Interfaces;
using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Areas.Search.Models;
using OMWebiSearch.Areas.ViewModels;
using OMWebiSearch.Models;
using OMWCSearch.Enums;
using OMWebiSearch.Hubs;
using OMWCSearch.Utils;

namespace OMWebiSearch.Areas.Search.Controllers
{
    public class SearchMainController : Controller
    {
        #region Properties and fields
        /// <summary>
        /// Should be injected here in further versions
        /// </summary>
        protected readonly ISearchProvider SearchProvider = new FakeSearchProvider();

        private readonly ISearchService _searchService = new SearchService();

	    private readonly IDocumentsAccess _documentDataAccess = new FakeDataAccess();

		private readonly ICollectionsAccess _collectionAccess = new FakeCollectionsAccess();

        protected readonly ISearchParametersParser SearchParametersParser = new SearchParametersParser();

        protected readonly ToolbarManager _toolbarManager = new ToolbarManager();

        private readonly INavigation _navigationService = new OMSNavigation();

        private IEnumerable<DCOMWSearchProfile> _searchProfiles;

        private IOMWSearchSessionService CacheService
        {
            get { return new OMWSearchSearchSessionService(HttpContext.Session); }
        }

        protected IEnumerable<DCOMWSearchProfile> SearchProfiles
        {
            get { return _searchProfiles ?? (_searchProfiles = SearchProvider.GetAllSearchProfiles()); }
        }
        #endregion


        #region Private methods
        private int GetNavigationPaneIdByPaneItemId(int navigationPaneItemId)
        {
            IEnumerable<OMWPaneE> navigationPanes;
            _navigationService.GetPanes(out navigationPanes);
            var number = 0;
            foreach (var navigationPane in navigationPanes)
            {
                IEnumerable<OMWPaneItemE> paneItems;
                _navigationService.GetPaneItems(navigationPane.ID, out paneItems);
                if (paneItems.Any(t => t.SearchProfileID == navigationPaneItemId))
                    return number;
                number++;
            }
            return -1;
        }


        private int GetNavigationPaneIndexByPaneId(IList<OMWPaneE> panes, int navigationPaneId)
        {
            var number = 0;
            foreach (var navigationPane in panes)
            {
                if (navigationPane.ID == navigationPaneId)
                {
                    return number;
                }
                number++;
            }
            return 0;
        }

        private Dictionary<int, string> GetSearchProfiles()
        {
            var result = new Dictionary<int, string> { { -1, "[Select]" } };
            foreach (var omwSearchProfile in SearchProfiles)
            {
                result.Add(omwSearchProfile.ID, omwSearchProfile.Name ?? omwSearchProfile.ID.ToString());
            }
            return result;
        }

        private DCOMWSearchProfile GetSearchProfile(int searchProfileID)
        {
            var retVal = (from t in SearchProfiles where t.ID == searchProfileID select t).FirstOrDefault();
            retVal.isFWS = 1;

	        var searchParams = retVal.SearchParams != null ? retVal.SearchParams.ToList() : new List<OMWSearchParam>();

	        searchParams.Add(new OMWSearchParam
	                         {
		                         Position = 555,
		                         Label = "Test search field",
		                         Value = new OMWValueDateTime(DateTime.Now),
		                         DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_DateTime
	                         });

	        retVal.SearchParams = searchParams;

			return retVal;
        }

        private T Deserialise<T>(string json)
        {
            using (var ms = new MemoryStream(Encoding.Unicode.GetBytes(json)))
            {
                var serialiser = new DataContractJsonSerializer(typeof(T));
                return (T)serialiser.ReadObject(ms);
            }
        }
		#endregion


		#region Public methods

		[HttpPost]
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult GetDynamicComboValues(string fieldID, string value)
		{
			List<string> values;
			_documentDataAccess.GetComboFieldOptionValues(fieldID, value, out values);

			return new JsonResult { Data = values };
		}

		[HttpPost]
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult GetDynamicListValues(string storyID, string fieldID)
		{
			List<string> values;
			_documentDataAccess.GetListFieldOptionValues(storyID, fieldID, out values);

			return new JsonResult { Data = values };
		}

		[HttpPost]
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult GetListFieldSuggestions(string storyID, string fieldID, string value)
		{
			List<string> values;
			_documentDataAccess.GetListFieldSuggestions(storyID, fieldID, value, out values);

			return new JsonResult { Data = values };
		}

		[AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Index(string id, string painId, string viewID)
        {
            ViewBag.Search = true;
            if (!ControllerContext.RouteData.DataTokens.ContainsValue("Search"))
            {
                ControllerContext.RouteData.DataTokens.Add("area", "Search");
            }
            IEnumerable<OMWPaneE> navigationPanes;
            _navigationService.GetPanes(out navigationPanes);
            var model = new SearchMainPageViewModel
            {
                SearchProfiles = GetSearchProfiles(),
                NavigationPanes = navigationPanes.ToList(),
                SearchHits = new List<OMWSearchHit>(),
                RSSUrl = WebConfigurationManager.AppSettings["RSSPrefix"]
            };
            var item = new OMWSearchHit();
            item.SupportOpen = false;
            model.SearchHits.ToList().Add(item);
            if (id != null && painId != null)
            {
                ViewBag.ToolbarButtons = _toolbarManager.GetToolbarButtonsForSearchPrifile(int.Parse(id));
                ViewBag.ToolbarComboBox = _toolbarManager.GetToolbarComboBoxItemsForSearchProfile(int.Parse(id));

                var intId = int.Parse(id);
                ViewBag.SearchProfileID = intId;
                model.NavigationPaneItemId = intId;
                model.NavigationPaneId = int.Parse(painId);
                model.NavigationPaneNumber = GetNavigationPaneIndexByPaneId(model.NavigationPanes, int.Parse(painId));
                model.GridView = SearchProvider.GetGridView(intId);
            }
            else
            {
				ViewBag.ToolbarButtons = new List<ToolBarButton>();
	            ViewBag.ToolbarComboBox = new List<ViewSelectData>();
			}

            ViewBag.hasInstantPreview = true;
            ViewBag.notifyReadItems = true;
            ViewBag.ViewID = viewID;

	        ViewBag.LocalStorageEnabled = Convert.ToBoolean(ConfigurationManager.AppSettings["LocalStorageEnabled"]);

	        ViewBag.NumberOfLines = Convert.ToInt32(ConfigurationManager.AppSettings["NumberOfLines"]);
	        ViewBag.MaxFieldsPerLine = Convert.ToInt32(ConfigurationManager.AppSettings["MaxFieldsPerLine"]);
	        ViewBag.HeaderFieldsOrientation = "vertical";

			if (Request.Browser.IsMobileDevice)
            //if (true)
            {
	            ViewBag.hasInstantPreview = false;

                if (id != null && painId != null)
                {

                    //Return page with search hits
                    return View("MobileIndex", model);
                }
                //Return start page
                return View("MobileIndexFirstPage", model);
            }
            else
            {
                return View(model);
            }


        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult OpenProfile(int id, int paneId)
        {
            if (!ControllerContext.RouteData.DataTokens.ContainsValue("Search"))
            {
                ControllerContext.RouteData.DataTokens.Add("area", "Search");
            }
            IEnumerable<OMWPaneE> navigationPanes;
            _navigationService.GetPanes(out navigationPanes);

            var model = new SearchMainPageViewModel
            {
                SearchProfiles = GetSearchProfiles(),
                NavigationPanes = navigationPanes.ToList(),
                SearchHits = new List<OMWSearchHit>(),
                RSSUrl = WebConfigurationManager.AppSettings["RSSPrefix"],
                NavigationPaneNumber = GetNavigationPaneIdByPaneItemId(id),
                NavigationPaneItemId = id,
                NavigationPaneId = paneId
            };
            return View("Index", model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadSearchProfile(int id)
        {
            var model = new SearchProfileViewModel
                            {
                                SearchProfile = GetSearchProfile(id),
                            };

			return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadSearchProfileFieldItems(int id, int position)
        {
            var model = new SearchProfileViewModel
            {
                SearchProfile = GetSearchProfile(id),
            };

            OMWSearchParam item = null;
            var list = model.SearchProfile.SearchParams.ToList();
            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].Position == position)
                {
                    item = list[i];
                    break;
                }
            }

            if (item == null)
            {
                return Json(new { status = "failed", Reason = "Unknown field." }, JsonRequestBehavior.AllowGet);
            }
            
            if (DateTime.Now.Minute % 2 == 0)
            {
                List<string> selListPossibleItems = new List<string>();
                selListPossibleItems.Add("RecordIcon1.png");
                selListPossibleItems.Add("RecordIcon2.png");
                selListPossibleItems.Add("RecordIcon3.png");
                selListPossibleItems.Add("");
                List<string> selListIcons = new List<string>();

	            if (item.SelectionList == null)
	            {
		            item.SelectionList = new List<string>
		                                 {
			                                 "Opt 1 val",
			                                 "Opt 2 val",
			                                 "Opt 3 val"
		                                 };
	            }


	            for (int i = 0; i < item.SelectionList.Count(); i++)
                {
                    selListIcons.Add(selListPossibleItems[i % 4]);
                }
                return Json(new { items = item.SelectionList, icons = selListIcons }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { items = item.SelectionList }, JsonRequestBehavior.AllowGet);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult MobileLoadSearchProfile(int id)
        {
            var model = new SearchProfileViewModel
            {
                SearchProfile = GetSearchProfile(id),
            };

            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult SearchCommandPanel(int id)
        {
            var model = new CommandPanelViewModel
            {
                RSSUrl = WebConfigurationManager.AppSettings["RSSPrefix"]
            };
            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult SearchContent(int id)
        {
            return PartialView("SearchResults", new SearchResultsViewModel());
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult RecycleBin(string id, string painId, string viewID)
        {
            ViewBag.Search = true;

            if (!ControllerContext.RouteData.DataTokens.ContainsValue("Search"))
            {
                ControllerContext.RouteData.DataTokens.Add("area", "Search");
            }
            IEnumerable<OMWPaneE> navigationPanes;
            _navigationService.GetPanes(out navigationPanes);
            var model = new SearchMainPageViewModel
            {
                SearchProfiles = GetSearchProfiles(),
                NavigationPanes = navigationPanes.ToList(),
                SearchHits = new List<OMWSearchHit>(),
                RSSUrl = WebConfigurationManager.AppSettings["RSSPrefix"]
            };
            var item = new OMWSearchHit();
            item.SupportOpen = false;
            model.SearchHits.ToList().Add(item);
            if (id != null && painId != null)
            {
                ViewBag.ToolbarButtons = _toolbarManager.GetToolbarButtonsForSearchPrifile(int.Parse(id));
                ViewBag.ToolbarComboBox = _toolbarManager.GetToolbarComboBoxItemsForSearchProfile(int.Parse(id));

                var intId = int.Parse(id);
                ViewBag.SearchProfileID = intId;
                model.NavigationPaneItemId = intId;
                model.NavigationPaneId = int.Parse(painId);
                model.NavigationPaneNumber = GetNavigationPaneIndexByPaneId(model.NavigationPanes, int.Parse(painId));
                if (model.NavigationPaneNumber == 0)
                {
                    model.NavigationPaneNumber = model.NavigationPaneId;
                }
                model.GridView = SearchProvider.GetGridView(intId);
            }

            ViewBag.hasInstantPreview = true;
            ViewBag.notifyReadItems = true;
            ViewBag.ViewID = viewID;

	        ViewBag.LocalStorageEnabled = Convert.ToBoolean(ConfigurationManager.AppSettings["LocalStorageEnabled"]);

			if (Request.Browser.IsMobileDevice)
            {
	            ViewBag.hasInstantPreview = false;

                if (id != null && painId != null)
                {
                    //Return page with search hits
                    return View("MobileIndex", model);
                }
                //Return start page
                return View("MobileIndexFirstPage", model);
            }
            else
            {
                return View("Index", model);
            }
        }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult StartSearch(string model, string searchProfileName)
        {
            int searchContextID;
            var m = Deserialise<StartSearchViewModel>(model);
            var profile = GetSearchProfile(m.SearchProfileId);
	        IEnumerable<OMWSearchParam> searchParams = null;

	        try
	        {
				SearchParametersParser.GetSearchParams(profile,
					m.Values.ToDictionary(t => t.Name,
						t => t.Value));
			}
	        catch (Exception ex)
	        {
		        searchParams = new List<OMWSearchParam>();
	        }

            MobileSearchContext searchContext = new MobileSearchContext();
            searchContext.SearchProfileId = m.SearchProfileId;
            searchContext.SearchProfileName = "";
            if (!String.IsNullOrEmpty(searchProfileName))
            {
                searchContext.SearchProfileName = searchProfileName.Trim();
            }

            searchContext.SearchParams = new List<MobileSearchContextListParam>();
            //searchContext.SearchParams = new Dictionary<string, OMWSTypes.OMWValue>();
            foreach (var item in m.Values)
            {
                searchContext.SearchParams.Add(new MobileSearchContextListParam()
                {
                    Id = item.Name,
                    Value = item.Value
                });
                //searchContext.SearchParams.Add(item.Label, item.Value);
            }
            Session["searchContext"] = Newtonsoft.Json.JsonConvert.SerializeObject(searchContext);

            if (profile.isFWS <= 0)
            {
                _searchService.SearchStart(m.SearchProfileId, m.ResultsType, searchParams, out searchContextID);
            }
            else // Forward Search
            {
                var FWSSink = new FWSHubSearchNotificationSink
                {
                    OMContextID = "test_omsession"
                };
                _searchService.SearchStartWithFWSNotifications(m.SearchProfileId, m.ResultsType, FWSSink, searchParams, out searchContextID);
                FWSSink.searchContextID = searchContextID.ToString();
                FWSManager.Instance.AddNewFWSSink(FWSSink);
                FWSSink.StartTestTimer();
            }
            var totalSearchHits = _searchService.GetTotalSearchHits(searchContextID);

	        return new JsonResult
                       {
                           Data = new
                                      {
                                          TotalSearchHits = totalSearchHits,
                                          SearchContextID = searchContextID,
                                          isFWS = profile.isFWS
                                      }
                       };
        }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetSearchResults(SearchResultsViewModel model)
        {
            var cachedItems = CacheService.GetCachedSearchHits(model.SearchContextID).ToList();

            var totalSearchHits = _searchService.GetTotalSearchHits(model.SearchContextID);


            var results = new List<OMWSearchHit>();

            // Here goes the definition of the search hits count per page
            // hardcoded for now, should be changed durring next changes
            var skipCount = 0;
            if (!Int32.TryParse(Request.Params["skip"], out skipCount))
            {
                skipCount = model.PageNumber * model.PageSize ?? 10;
            }

            var takeCount = 10;
            if (!Int32.TryParse(Request.Params["take"], out takeCount))
            {
                takeCount = model.PageSize ?? 10;
            }


            if (skipCount <= totalSearchHits)
            {
                if (cachedItems.Count > skipCount + takeCount)
                {
                    //all cached
                    results = cachedItems.Skip(skipCount).Take(takeCount).ToList();
                }
                else
                {
                    //not all cached, need to fetch additional items
                    while (!(cachedItems.Count > skipCount + takeCount))
                    {
                        IEnumerable<OMWSearchHit> fetched;
                        _searchService.SearchGetNextHits(model.SearchContextID, out fetched);
                        cachedItems.AddRange(fetched);
                        CacheService.CacheSearchHits(model.SearchContextID, cachedItems);
                        cachedItems = CacheService.GetCachedSearchHits(model.SearchContextID).ToList();
                        if (cachedItems.Count >= totalSearchHits) break;
                    }
                    results = cachedItems.Skip(skipCount).Take(takeCount).ToList();
                }
            }
            model.TotalSearchHits = totalSearchHits;
            model.SearchHits = results.Select(h => h.Clone()).Cast<OMWSearchHit>().ToArray();

            // exclude fields those are not displayed by the grid view
            if (_searchService.GetSearchResultType(model.SearchContextID) == SearchResultsType.Grid)
            {
                model.GridView = SearchProvider.GetGridView(model.SearchProfileId);

                foreach (OMWSearchHit hit in model.SearchHits)
                {
                    //Style search hits blue with underline
                    var newHtml = RTFToHTML.ChangeTagStyle(hit.PreviewMain);
                    hit.PreviewMain = newHtml;

                    hit.Fields = hit.Fields.Where(t => model.GridView.columns.Exists(k => k.FieldID == t.FieldID)).ToArray();
                }
            }

	        model.SearchHits.Take(5).ToList().ForEach(x => x.HasRichText = true);

            ////Testing showing image in carousel
            //int dummyValue = 0;
            //foreach (OMWSearchHit hit in model.SearchHits)
            //{
            //    if (dummyValue++ % 2 == 0)
            //    {
            //        hit.Fields[1].FieldID = 401;
            //        hit.Fields[1].FieldValue = new OMWValueString("https://angularjs.org/img/AngularJS-large.png");
            //    }
            //}

            return new JsonResult { Data = model };
        }

	    public JsonResult GetSearchHitRichText(string objectId)
	    {
		    var random = new Random();
		    System.Threading.Thread.Sleep(random.Next(1000, 3000));
				
		    return Json(new
		                {
			                richText = "<div style='background: orange; text-decoration: underline'>RICH PREVIEW " + DateTime.Now.ToString("HH:mm:ss") + "</div>"
		                }, JsonRequestBehavior.AllowGet);
	    }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetPreviewData(PreviewViewModel model)
        {
            var cachedItem = CacheService.FindSearchHit(model.SearchContextID, model.SearchHitID);
            OMWSearchPreviewData data;
            if (cachedItem == null)
            {
                data = new OMWSearchPreviewData
                           {
                               CheckinDate = "05-03-12 5:24:24",
                               HeaderText = "Header",
                               PreviewText = "TEXT"
                           };
            }
            else
            {
                var omwValueDateTime = (from t in cachedItem.Fields where t.FieldID == 2 select t.FieldValue).FirstOrDefault() as OMWValueDateTime;
                if (omwValueDateTime == null)
                {
                    data = new OMWSearchPreviewData();
                }
                else
                {
                    data = new OMWSearchPreviewData
                               {
                                   CheckinDate = omwValueDateTime.Value.ToString(CultureInfo.InvariantCulture),
                                   HeaderText = cachedItem.PreviewHeader,
                                   PreviewText = cachedItem.PreviewMain
                               };
                }
            }
            return new JsonResult { Data = data };
        }


        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult MoveToRecycleBin(List<string> items)
        {
            //TODO add implementation
            return Json(new { status = "success" });
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public PartialViewResult Pages(int id)
        {
            var totalHits = _searchService.GetTotalSearchHits(id);
            var totalPages = totalHits / 10 + 1;
            return PartialView("SearchNavigation",
                               new SearchNavigationViewModel
                                   {
                                       PageNumber = 0,
                                       PageCount = totalPages - 1
                                   });
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        [OutputCache(Duration = 600)]
        public ActionResult GetNavigationPaneItems(int id, int painId)
        {
            IEnumerable<OMWPaneItemE> paneItems;
            if (!_navigationService.GetPaneItems(id, out paneItems))
            {
                paneItems = new List<OMWPaneItemE>();
            }
            ViewBag.SearchProfileID = painId;
            ViewBag.NavigationPane = id;


            if (Request.Browser.IsMobileDevice)
            // if (true)
            {
                ViewBag.PaneName = " ";
                return View("MobileIndexNavigationPanes", new NavigationPaneItemViewModel { PaneItems = paneItems });

            }
            else
            {
                return PartialView(new NavigationPaneItemViewModel { PaneItems = paneItems });
            }
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult ReadItem(string objectId)
        {
            return Json(new { status = "success" });
        }
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult NotificationTest(string objectId)
        {
            return Json(new { status = "success", message = "Test " + DateTime.Now });
        }
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult NotificationErrorTest(string objectId)
        {
            throw new ApplicationException("Just an error test. date:" + DateTime.Now);
        }

        public ActionResult SessionTimeout()
        {
            return View();
        }

        #endregion
    }
}
