using OMWCSearch;
using OMWCSearch.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Document.Controllers
{
    public class SelectionListsController : Controller
    {
        public readonly ISelectionLists _selectionLists = new ISelectionListsDummyImpl();

        public ActionResult ShowList(string id)
        {
            var list = _selectionLists.GetNewItemList(id);
            return View(list);
        }

        public JsonResult GetList(string id)
        {
            var list = _selectionLists.GetNewItemList(id);
            return Json(list);
        }

        public string AddDocument(string documentTypeId, string parentId)
        {
            if (!String.IsNullOrEmpty(documentTypeId))
            {
                if (!String.IsNullOrEmpty(parentId))
                {
                    return _selectionLists.CreateNewDocument(documentTypeId, parentId);
                }
                else
                {
                    return _selectionLists.CreateNewDocument(documentTypeId, String.Empty);
                }
            }
            else
                return null;
        }

        public JsonResult GetParents(string id)
        {
            var list = _selectionLists.GetNewParentListForDocType(id);

            list.ToList().ForEach(item => item.IconURL = Url.Content(item.IconURL));

            return new JsonResult() { Data = list, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }
    }
}
