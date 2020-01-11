using System.Web.Mvc;

namespace OMWebiSearch.Areas.Toolbar2
{
    public class Toolbar2AreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Toolbar2";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Toolbar2_default",
                "Toolbar2/{action}/{id}",
                new { controller = "Toolbar", action = "Event", id = UrlParameter.Optional }
            );
        }
    }
}