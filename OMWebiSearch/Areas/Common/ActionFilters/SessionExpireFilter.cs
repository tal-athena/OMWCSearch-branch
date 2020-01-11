using System;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Common.ActionFilters
{


    public static class SessionHelper
    {
        public static bool CheckSession(HttpContext ctx)
        {
            // check if session is supported
            if (ctx.Session != null)
            {
                // check if a new session id was generated
                if (ctx.Session.IsNewSession)
                {
                    // If it says it is a new session, but an existing cookie exists, then it must
                    // have timed out
                    string sessionCookie = ctx.Request.Headers["Cookie"];
                    if ((null != sessionCookie) && (sessionCookie.IndexOf("ASP.NET_SessionId") >= 0))
                    {
                        return false;
                    }
                }
            }
            return true;
        }
    }

    public class SessionExpireFilterAttribute : ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext ctx = HttpContext.Current;

            if (!SessionHelper.CheckSession(ctx))
            {
                filterContext.RequestContext.HttpContext.Response.StatusCode = 401;
                var urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
                var controllerName = filterContext.ActionDescriptor.ControllerDescriptor.ControllerName;
                var returnUrl = HttpContext.Current.Request.CurrentExecutionFilePath;
                filterContext.Result = new RedirectResult(string.Format("{0}/Authentication/Account/LogOn?returnUrl={1}", urlHelper.Content("~"), returnUrl));
            }
            base.OnActionExecuting(filterContext);
        }
    }

    [AttributeUsage(AttributeTargets.All)]
    public class SessionExpireFilterAjaxJsonAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!SessionHelper.CheckSession(HttpContext.Current))
            {
                filterContext.Result = new JsonResult { Data = new { status = "error", error = new { message = "Session Expired." } } };
            }
            base.OnActionExecuting(filterContext);
        }
    }

    


    //public class SessionExpireFilterAttribute : ActionFilterAttribute
    //{

    //    public override void OnActionExecuting(ActionExecutingContext filterContext)
    //    {
    //        HttpContext ctx = HttpContext.Current;

    //        // check if session is supported
    //        if (false && ctx.Session != null)
    //        {

    //            // check if a new session id was generated
    //            if (ctx.Session.IsNewSession)
    //            {

    //                // If it says it is a new session, but an existing cookie exists, then it must
    //                // have timed out
    //                string sessionCookie = ctx.Request.Headers["Cookie"];
    //                if ((null != sessionCookie) && (sessionCookie.IndexOf("ASP.NET_SessionId") >= 0))
    //                {
    //                    filterContext.HttpContext.Response.StatusCode = 504;
    //                    filterContext.Result = new ViewResult { ViewName = "SessionTimeout", ViewData = filterContext.Controller.ViewData };           
    //                }
    //            }
    //        }

    //        base.OnActionExecuting(filterContext);
    //    }


    //}
}