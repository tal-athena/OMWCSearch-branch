using OMWebiSearch.Areas.Document.Models;

using System.Collections.Generic;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Document.Controllers
{
	public class CopyAsController : Controller
	{
		public ActionResult CopyAsDialog(string type)
		{
			ViewBag.Title = "Select an object: " + type;

			return View();
		}

		// GET: Document/CopyAsController
		public ActionResult GetCopyAsListForObject(string ID)
		{
			List<CopyAsGridItem> gridItems = new List<CopyAsGridItem>();

			gridItems.Add(new CopyAsGridItem()
			              {
				              data = new CopyAsData()
				                     {
					                     directoryID = "111",
					                     objectID = "111",
					                     templateID = 1
				                     },
				              DirectoryPath = "/dist",
				              iconID = "icon1",
				              Template = "1"
			              });
			gridItems.Add(new CopyAsGridItem()
			              {
				              data = new CopyAsData()
				                     {
					                     directoryID = "222",
					                     objectID = "222",
					                     templateID = 2
				                     },
				              DirectoryPath = "/dist",
				              iconID = "icon2",
				              Template = "2"
			              });
			gridItems.Add(new CopyAsGridItem()
			              {
				              data = new CopyAsData()
				                     {
					                     directoryID = "333",
					                     objectID = "333",
					                     templateID = 3
				                     },
				              DirectoryPath = "/dist",
				              iconID = "icon3",
				              Template = "3"
			              });

			return Json(gridItems, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		public ActionResult CopyAsCmd(CopyAsData param)
		{
			var data = new { url = "http://localhost:55888/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MDIsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" };
			return Json(data, JsonRequestBehavior.AllowGet);
		}
	}
}