using OMWebiSearch.Areas.Document.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Document.Controllers
{
    public class MRUListController : Controller
    {
        // GET: Document/MRUList
        public ActionResult GetData()
        {
            List<MRUList> mruList = new List<MRUList>();
            mruList.Add(new MRUList()
            {
                icon = "Content/RecordIcons/RecordIcon1.png",
                name = "Story1",
                url = "http://localhost:12459/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
            });
            mruList.Add(new MRUList()
            {
                icon = "Content/RecordIcons/RecordIcon2.png",
                name = "Story2",
                url = "http://localhost:12459/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MTAsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
            });
            mruList.Add(new MRUList()
            {
                icon = "Content/RecordIcons/RecordIcon3.png",
                name = "Story3",
                url = "http://localhost:12459/OMWebiSearch/Story/EditStory/Index/PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="
            });

            return Json(mruList, JsonRequestBehavior.AllowGet);
        }
    }
}