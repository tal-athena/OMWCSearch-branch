using System.Web.Mvc;

namespace OMWebiSearch.Areas.StoryH
{
    public class StoryHAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "StoryH";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "StoryH_default",
                "StoryH/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
