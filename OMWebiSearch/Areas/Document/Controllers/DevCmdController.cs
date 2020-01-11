using OMWCSearch;
using OMWCSearch.UnitTest;
using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Areas.ViewModels;
using OMWebiSearch.Models;
using OMWSTypes;
using System.Collections.Generic;
using System.Web.Mvc;
using static OMWebiSearch.Areas.Story.Controllers.EditStoryController;

namespace OMWebiSearch.Areas.Document.Controllers
{
    public class DevCmdController : Controller
    {
        // GET: Document/ImagePopUp
        private readonly IDocumentsAccess _documentDataAccess = new FakeDataAccess();

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Fields(string id)
        {
            var model = new StoryPageViewModel
            {
                Story = GetStory(id)
            };

            return View("Fields", model);
        }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult UpdateFields(string id, string HeaderFields)
        {
            List<HeaderField> headerFields = Newtonsoft.Json.JsonConvert.DeserializeObject<List<HeaderField>>(HeaderFields);

            return new JsonResult { Data = new { status = "OK" } };
        }

        private OMWAStory GetStory(string storyId)
        {
            OMWAStory story = null;
            _documentDataAccess.GetStory(OMWDocumentID.FromString(storyId), out story);
            return story;
        }
    }
}