using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using OMWCSearch;
using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Areas.ViewModels;
using OMWebiSearch.Models;

namespace OMWebiSearch.Areas.External.Controllers
{
    public class ExternalSearchController : Controller
    {
        #region Properties and fields
        private readonly INavigation _navigationService = new OMSNavigation();

        #endregion

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Index(string id)
        {
            IEnumerable<OMWPaneE> navigationPanes;
            _navigationService.GetPanes(out navigationPanes);
            var model = new ExternalSearchViewModel
            {
                CollectionId = id,
                NavigationPanes = navigationPanes.ToList()
            };

            return View(model);
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        [HttpPost]
        public JsonResult GetContent(string id)
        {
            var html = @"<h1>Hello, World!</h1><p>You can modify the text
in the box to the left any way you like,
and then click the Show Page button below the box to display the
result here. Go ahead and do this as often and as long as you like.</p>

<p>You can also use this page to test your Javascript functions and local
style declarations. Everything you do will be handled entirely by your own
browser; nothing you type into the text box will be sent back to the
server.</p>

<p>When you are satisfied with your page, you can select all text in the
textarea and copy it to a new text file, with an extension of
either <b>.htm</b> or <b>.html</b>, depending on your Operating System.
This file can then be moved to your Web server.</p>";

            return Json(html);
        }

    }
}
