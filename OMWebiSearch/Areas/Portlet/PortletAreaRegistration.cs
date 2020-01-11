using System.Web.Mvc;

namespace OMWebiSearch.Areas.Portlet
{
    public class PortletAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Portlet";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Portlet_default",
                "Portlet/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
