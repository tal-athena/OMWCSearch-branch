using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch
{
    public class ContentSecurityPolicyFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var response = filterContext.HttpContext.Response;
            response.AddHeader("Content-Security-Policy", "script-src 'self' ajax.googleapis.com cdn.jtsage.com code.jquery.com");
            response.AddHeader("X-WebKit-CSP", "script-src 'self' ajax.googleapis.com cdn.jtsage.com code.jquery.com");
            response.AddHeader("X-Content-Security-Policy", "script-src 'self' ajax.googleapis.com cdn.jtsage.com code.jquery.com");
            base.OnActionExecuting(filterContext);
        }
    }
}