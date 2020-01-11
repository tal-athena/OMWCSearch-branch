using OMWebiSearch.Areas.Document.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Document.Controllers
{
    public class ParentController : Controller
    {
        // GET: Document/Parent
        public ActionResult GetData(string name)
        {
            List<MRUList> mruList = new List<MRUList>();
            mruList.Add(new MRUList()
            {
                icon = "Content/RecordIcons/RecordIcon1.png",
                name = "B-Story11",
                url = "http://localhost:12459/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
            });
            mruList.Add(new MRUList()
            {
                icon = "Content/RecordIcons/RecordIcon2.png",
                name = "K-Story12",
                url = "http://localhost:12459/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MTAsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
            });
            mruList.Add(new MRUList()
            {
                icon = "Content/RecordIcons/RecordIcon3.png",
                name = "S-Story13",
                url = "http://localhost:12459/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
            });

            return Json(mruList, JsonRequestBehavior.AllowGet);
        }
    }
}