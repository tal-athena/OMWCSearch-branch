using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Portlet.Controllers
{
    using OMWCSearch;
    using OMWSTypes;
    using OMWebiSearch.Models;
    using OMWebiSearch.Areas.Common.ActionFilters;

    public class ContainerController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

       


        public string StoragePath
        {
            get
            {
                return System.IO.Path.Combine(
                    Server.MapPath("~/App_Data"), HttpContext.User.Identity.Name);
            }
        }
    }
}
