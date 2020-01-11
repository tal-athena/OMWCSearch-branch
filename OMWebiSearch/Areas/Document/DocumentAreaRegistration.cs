using System.Web.Mvc;

namespace OMWebiSearch.Areas.Document
{
    public class DocumentAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Document";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Document_default",
                "Document/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
