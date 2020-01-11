using Microsoft.Owin;
using OMWebiSearch.Hubs;
using Owin;

[assembly: OwinStartup("main",typeof(Startup))]
namespace OMWebiSearch.Hubs
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
           app.MapSignalR();
        }
    }
}