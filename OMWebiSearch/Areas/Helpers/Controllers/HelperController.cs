using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Helpers.Controllers
{
    public class HelperController : Controller
    {
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Index()
        {
            return View("ListFieldDialog");
        }

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    public ActionResult Single()
	    {
		    return View("ListFieldDialogSingle");
	    }

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    public ActionResult ListOfflineStoriesDialog()
	    {
		    return View("ListOfflineStoriesDialog");
	    }

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    public ActionResult OfflineStoryDialog()
	    {
		    return View("OfflineStoryDialog");
	    }
	}
}