using System.Web.Mvc;

namespace OMWebiSearch.Areas.Search
{
    public class SearchAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Search";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Search_withpaneid",
                "Search/{controller}/{action}/{id}/{painId}",
                new { action = "Index", id = UrlParameter.Optional, painId = UrlParameter.Optional }
            );

            context.MapRoute(
                "Search_default",
                "Search/{controller}/{action}",
                new { action = "Index", controller = "SearchMain" }
            );
        }
    }
}
