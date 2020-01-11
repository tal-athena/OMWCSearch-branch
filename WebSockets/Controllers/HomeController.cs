using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.WebSockets;

namespace WebSockets.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            //var sessionId = System.Web.HttpContext.Current.Session.SessionID;
            return View();
        }

    }
}