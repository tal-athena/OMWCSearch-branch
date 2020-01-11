using OMWCSearch.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Toolbar2.Controllers
{
    public class ToolbarController : Controller
    {
      
        [HttpPost]
        // public ActionResult Toolbar(List<ONTOmisToolCommand> ToolCommandList, List<string> IDs, int Context)
        public ActionResult Event(string ToolCommandList, List<string> IDs, int Context)
        {
            List<ONTOmisToolCommand> toolCommandList = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ONTOmisToolCommand>>(ToolCommandList);

            //Dummy returning error for every context that is grater than 3
            if (Context > 3)
            {
                return Json(new ToolBarCommandResponse() { message = "Error with result", status = "error" });
            }
            return Json(new ToolBarCommandResponse() { message = "everything is ok", status = "ok" });
        }

    }
}