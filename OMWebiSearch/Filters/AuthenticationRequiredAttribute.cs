using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Models
{
    /// <summary>
    /// Must be applied for actions that requires autentication
    /// </summary>
    public class AuthenticationRequiredAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            //redirect if not authenticated
            if (filterContext.HttpContext.Request.Url == null) return;
            if (!filterContext.HttpContext.User.Identity.IsAuthenticated)
            {

                ////Change session ID - Solution 2
                //HttpContext.Current.Session.Abandon();
                //HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));


                filterContext.RequestContext.HttpContext.Response.StatusCode = 401;
                var urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
                filterContext.Result = new RedirectResult(string.Format("{0}/Authentication/Account/LogOn", urlHelper.Content("~")));
            }
        }
    }
}