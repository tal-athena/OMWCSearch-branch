using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Models;

using System.Web.Mvc;

namespace OMWebiSearch.Areas.Helpers.Controllers
{
	public class TickerController : Controller
	{
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult Index()
		{
			return View("TickerView");
		}

		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult StartCurrentSession(string connectionID)
		{
			var filePath = Server.MapPath("~/App_Data/tickerSearchInfos.json");
			var searchInfo = System.IO.File.ReadAllText(filePath);

			return Content(searchInfo, "application/json");
		}
	}
}