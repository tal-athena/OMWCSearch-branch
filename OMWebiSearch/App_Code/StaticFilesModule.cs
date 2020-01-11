using OMWebiSearch.Areas.Common.ActionFilters;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace OMWebiSearch.App_Code
{
    public class StaticFilesModule : IHttpModule
    {
        public StaticFilesModule()
        {
        }

        public String ModuleName
        {
            get { return "StaticFilesModule"; }
        }

        public void Init(HttpApplication application)
        {
            application.AuthorizeRequest += application_AuthorizeRequest;
        }

        void application_AuthorizeRequest(object sender, EventArgs e)
        {
            if (ModuleEnabled())
            {
                if (fileInAllowAnonymous())
                {

                }
                else
                {
                    UserAuthenticated();
                    SessionExpired();
                }
            }
        }

        private bool fileInAllowAnonymous()
        {
            var currentFile = HttpContext.Current.Request.CurrentExecutionFilePath;

            StaticFilesModuleSettingsSection config = ConfigurationManager.GetSection("staticFilesModuleSettings") as StaticFilesModuleSettingsSection;
            var items = config.AllowAnonymous;
            for (int i = 0; i < items.Count; i++)
            {
                //Check if the requested file is in the allowAnonymous
                var path = ((FileElement)items[i]).Path;
                if (path == currentFile)
                {
                    return true;
                }
            }

            return false;
        }
        private void SessionExpired()
        {
            HttpContext ctx = HttpContext.Current;
            if (!SessionHelper.CheckSession(ctx))
            {
                HttpContext.Current.Response.StatusCode = 401;
                var urlHelper = new System.Web.Mvc.UrlHelper(HttpContext.Current.Request.RequestContext);
                var returnUrl = HttpContext.Current.Request.CurrentExecutionFilePath;
                HttpContext.Current.Response.Redirect(string.Format("{0}/Authentication/Account/LogOn?returnUrl={1}", urlHelper.Content("~"), returnUrl));
            }
        }

        private void UserAuthenticated()
        {
            if (HttpContext.Current.Request.Url == null) return;
            if (HttpContext.Current.User == null || (HttpContext.Current.User != null && !HttpContext.Current.User.Identity.IsAuthenticated))
            {
                HttpContext.Current.Response.StatusCode = 401;
                var urlHelper = new System.Web.Mvc.UrlHelper(HttpContext.Current.Request.RequestContext);
                var returnUrl = HttpContext.Current.Request.CurrentExecutionFilePath;
                HttpContext.Current.Response.Redirect(string.Format("{0}/Authentication/Account/LogOn?returnUrl={1}", urlHelper.Content("~"), returnUrl));
            }
        }

        public void Dispose() { }

        private static bool ModuleEnabled()
        {
            bool appSetting;
            if (!bool.TryParse(ConfigurationManager.AppSettings["UseStaticFilesModule"],
                               out appSetting))
                appSetting = false;

            return appSetting;
        }

    }
}