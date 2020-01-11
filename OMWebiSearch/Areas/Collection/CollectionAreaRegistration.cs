using System.Web.Mvc;

namespace OMWebiSearch.Areas.Collection
{
    public class CollectionAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Collection";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {

            context.MapRoute(
                "LockCollection",
                "Collection/Editor/Lock",
                new { action = "LockField", controller = "Editor" }
            );

            context.MapRoute(
              "UnLockCollection",
              "Collection/Editor/Unlock",
              new { action = "UnlockField", controller = "Editor" }
            );

            context.MapRoute(
              "SaveCollection",
              "Collection/Editor/SaveCollection",
              new { action = "UpdateField", controller = "Editor" }
            );


            context.MapRoute(
                "Collection_default",
                "Collection/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
