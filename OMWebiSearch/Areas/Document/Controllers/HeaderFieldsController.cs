using OMWebiSearch.Areas.Document.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Document.Controllers
{
    public class HeaderFieldsController : Controller
    {
        // GET: Document/HeaderFields
        public ActionResult UndoValues(string id, string fieldId)
        {
			List<string> undoValues = new List<string>();
			undoValues.Add(".murobal tse di mina tillom tnuresed aiciffo iuq apluc ni tnus ,tnediorp non tatadipuc taceacco tnis ruetpecxE .rutairap allun taiguf ue erolod mullic esse tilev etatpulov ni tiredneherper ni rolod eruri etua siuD .tauqesnoc odommoc ae xe piuqila tu isin sirobal ocmallu noitaticrexe durtson siuq ,mainev minim da mine tU .auqila angam erolod te erobal tu tnudidicni ropmet domsuie od des ,tile gnicsipida rutetcesnoc ,tema tis rolod muspi meroL");
			undoValues.Add("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
			undoValues.Add("value 1");
            undoValues.Add("value 2");
            undoValues.Add("value 3");
            undoValues.Add("6/18/2016");
            undoValues.Add("11:49:00");
            undoValues.Add("6/18/2016 11:49:00");

	        undoValues.Add(".murobal tse di mina tillom tnuresed aiciffo iuq apluc ni tnus ,tnediorp non tatadipuc taceacco tnis ruetpecxE .rutairap allun taiguf ue erolod mullic esse tilev etatpulov ni tiredneherper ni rolod eruri etua siuD .tauqesnoc odommoc ae xe piuqila tu isin sirobal ocmallu noitaticrexe durtson siuq ,mainev minim da mine tU .auqila angam erolod te erobal tu tnudidicni ropmet domsuie od des ,tile gnicsipida rutetcesnoc ,tema tis rolod muspi meroL");
			undoValues.Add("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
			undoValues.Add(".murobal tse di mina tillom tnuresed aiciffo iuq apluc ni tnus ,tnediorp non tatadipuc taceacco tnis ruetpecxE .rutairap allun taiguf ue erolod mullic esse tilev etatpulov ni tiredneherper ni rolod eruri etua siuD .tauqesnoc odommoc ae xe piuqila tu isin sirobal ocmallu noitaticrexe durtson siuq ,mainev minim da mine tU .auqila angam erolod te erobal tu tnudidicni ropmet domsuie od des ,tile gnicsipida rutetcesnoc ,tema tis rolod muspi meroL");
			undoValues.Add("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");

			return Json(undoValues, JsonRequestBehavior.AllowGet);
        }


        public ActionResult GetVersionHistory(string id)
        {
            List<OMVersionHistoryItem> values = new List<OMVersionHistoryItem>();

            values.Add(new OMVersionHistoryItem()
            {
                Author = "Author 1",
                Date = DateTime.Now.ToString(),
                Description = "Description of item 1",
                versionID = "123"
            });
            values.Add(new OMVersionHistoryItem()
            {
                Author = "Author 2",
                Date = DateTime.Now.ToString(),
                Description = "Description of item 2",
                versionID = "1234"
            });
            values.Add(new OMVersionHistoryItem()
            {
                Author = "Author 3",
                Date = DateTime.Now.ToString(),
                Description = "Description of item 3",
                versionID = "12345"
            });
            values.Add(new OMVersionHistoryItem()
            {
                Author = "Author 4",
                Date = DateTime.Now.ToString(),
                Description = "Description of item 4",
                versionID = "123456"
            });

            return Json(values, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetVersionHistoryText(string id, string versionID)
        {
            var testStory = @"<html><head>    <title></title>    <meta content='text/html; charset=utf-8' http-equiv='Content-Type' />    <meta content='Microsoft Exchange Server' name='Generator' /><!-- converted from rtf -->    <style type='text/css'>        <!-- <!--        .EmailQuote {            margin-left: 1pt;            padding-left: 4pt;            border-left: #800000 2px solid;        }        --> -->    </style>    <style type='text/css'>        body {            font-family: 'Arial';            font-size: 22pt;        }    </style>    <style type='text/css'>        body {            font-family: 'Arial';            font-size: 22pt;        }    </style>    <style type='text/css'>        body {            font-family: 'Arial';            font-size: 12pt;        }    </style></head><body>    <p style='font-family:""arial""; font-size:12pt;'>        <span style='font-size:12pt;'>            <font face='Arial'>Some text</font>        </span>    </p>    <p style='font-family:""arial""; font-size:12pt;'>        <span style='font-size: 15.5555562973022px;'>SOme more text</span>        <span style='font-size : 15px;'>SOme more text</span>        <span style='font-size:23px'>Simpe text</span>        <span style='font-size:23px;margin-top:12px;'>SOme more text  " + versionID + "</span>    </p></body></html>";

            return Json(new { text = testStory }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RestoreVersion(string id, string versionID)
        {
            return Json(new { status = "success" }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult DeleteVersion(string id, string versionID)
        {
            return Json(new { status = "success" }, JsonRequestBehavior.AllowGet);
        }
    }
}