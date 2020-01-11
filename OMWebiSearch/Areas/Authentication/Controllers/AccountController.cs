using System.Web.Mvc;
using System.Web.Security;
using OMWebiSearch.Models;

namespace OMWebiSearch.Areas.Authentication.Controllers
{
    public class AccountController : Controller
    {
        //
        // GET: /Account/LogOn


        //[OMWebiSearch.Filters.RecreateSessionActionFilter]
        public ActionResult LogOn()
        {

            var alternateSite = System.Configuration.ConfigurationManager.AppSettings["om_alternate_site"];
            
            ViewBag.otherUrl = alternateSite;

            if (Request.Browser.IsMobileDevice)
            //if (true)
            {
                return View("MobileLogOn");
            }
            else
            {
                return View();
            }
        }

        //
        // POST: /Account/LogOn

        [HttpPost]
        [OMWebiSearch.Filters.RecreateSessionActionFilter]
        public ActionResult LogOn(LogOnModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                //Create again the session
                OMWebiSearch.Session.OMWebSessionHandler.Instance.ReCreateSession(System.Web.HttpContext.Current, model.UserName);

                if (Membership.ValidateUser(model.UserName, model.Password))
                {
                    FormsAuthentication.SetAuthCookie(model.UserName, model.RememberMe);
                    HttpContext.Session["username"] = model.UserName;


                    //Remove session from private array that is storing sessions by UserID.
                    OMWebiSearch.Session.OMWebSessionHandler.Instance.AddSessionFromUserSessions(model.UserName, HttpContext.Session.SessionID);

                    if (Url.IsLocalUrl(returnUrl) && returnUrl.Length > 1 && returnUrl.StartsWith("/")
                        && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
                    {
                        return Redirect(returnUrl);
                    }
                    return RedirectToAction("Index", "SearchMain", new { area = "Search" });
                }
                ModelState.AddModelError("", "The user name or password provided is incorrect.");
            }

            // If we got this far, something failed, remove session
            OMWebiSearch.Session.OMWebSessionHandler.Instance.RemoveSession(HttpContext.Session.SessionID);



            if (Request.Browser.IsMobileDevice)
            {
                return View("MobileLogOn", model);
            }
            else
            {
                return View(model);
            }
        }

        //
        // GET: /Account/LogOff

        public ActionResult LogOff()
        {
            FormsAuthentication.SignOut();
            Session.Abandon();

            if (Request.Browser.IsMobileDevice)
            //if (true)
            {
                return RedirectToAction("LogOn");
            }
            else
            {
                return RedirectToAction("Index", "SearchMain", new { area = "Search" });
            }
        }

    }
}