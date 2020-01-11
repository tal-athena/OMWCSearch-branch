using System.Web.Mvc;
using System.Web.Routing;
using System.Web;
using System;
using System.Web.Security;

namespace OMWebiSearch
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());

            //filters.Add(new ContentSecurityPolicyFilterAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("{resource}.aspx/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}/{painId}", // URL with parameters
                new { controller = "SearchMain", action = "Index", area = "Search", id = UrlParameter.Optional, painId = UrlParameter.Optional } // Parameter defaults
            );

            // Register the default hubs route: ~/signalr


        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            //ValueProviderFactories.Factories.Add(new JsonValueProviderFactory());
        }

        protected void Application_EndRequest()
        {
            var context = new HttpContextWrapper(Context);
            // If we're an ajax request, and doing a 302, then we actually need to do a 401
            //if (Context.Response.StatusCode == 302 && context.Request.IsAjaxRequest())
            //{
            //    Context.Response.Clear();
            //    Context.Response.StatusCode = 401;
            //}

            if (Context.Response.StatusCode == 302)
            {
                if (context.Request.IsAjaxRequest())
                {
                    Context.Response.Clear();
                    Context.Response.StatusCode = 401;
                }
                //else
                //{
                //    Response.Redirect("/OMWebiSearch/Authentication/Account/LogOn");
                //}
            }
           
            
            

        }

        protected void Session_Start(Object sender, EventArgs e)
        {
            int x = 3;
        }

        protected void Session_End(Object sender, EventArgs e)
        {
            try
            {
                FormsAuthentication.SignOut();
                
            }
            catch (Exception ex) { }

            Session.Abandon();
        }

   
    }
}