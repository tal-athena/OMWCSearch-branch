using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.SessionState;

namespace OMWebiSearch.Filters
{ 
    public class RecreateSessionActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
        //    OMWebiSearch.Session.OMWebSessionHandler.Instance.ReCreateSession(HttpContext.Current);


            //Create new session, solution 1

            //SessionIDManager manager = new SessionIDManager();
            //string newSessionId = manager.CreateSessionID(HttpContext.Current);
            //bool redirected = false;
            //bool IsAdded = false;
            //manager.SaveSessionID(HttpContext.Current, newSessionId, out redirected, out IsAdded);

            base.OnActionExecuting(filterContext);
        }

        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            //SessionIDManager manager = new SessionIDManager();
            //string newSessionId = manager.CreateSessionID(HttpContext.Current);
            //bool redirected = false;
            //bool IsAdded = false;
            //manager.SaveSessionID(HttpContext.Current, newSessionId, out redirected, out IsAdded);
            //
            //base.OnActionExecuted(filterContext);
        }
    }
}