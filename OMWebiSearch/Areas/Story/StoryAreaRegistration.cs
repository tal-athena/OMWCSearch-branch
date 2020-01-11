using System.Web.Mvc;

namespace OMWebiSearch.Areas.Story
{
    public class StoryAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Story";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
               "LockStory",
               "Story/EditStory/Lock",
               new { action = "LockStory", controller = "EditStory" }
            );

            context.MapRoute(
              "UnLockStory",
              "Story/EditStory/Unlock",
              new { action = "UnLockStory", controller = "EditStory" }
            );

            context.MapRoute(
              "Save",
              "Story/EditStory/SaveStory",
              new { action = "SaveStory", controller = "EditStory" }
            );

            context.MapRoute(
              "Index",
              "Story/EditStory/Index/{id}",
              new { action = "Index", controller = "EditStory" }
            );

            context.MapRoute(
                "Story_default",
                "Story/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );

        }
    }
}
