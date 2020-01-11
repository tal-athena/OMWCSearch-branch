using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using OMWSTypes;

namespace OMWebiSearch.Hubs
{
    public class TickerHub : Hub
    {
	    private static Timer _timer = new Timer(TimerCallback, null, 5000, 10000);
	    private static int _contentIndex = 1;

		private static void TimerCallback(object state)
	    {
		    try
		    {
			    var docId = new OMWDocumentID(1, 2);

				var data = new List<OMWSearchHit>
			               {
				               new OMWSearchHit
				               {
					               ID = docId,
								   PreviewHeader = "Ticker content " + (_contentIndex++),
					               PreviewMain = "Content " + _contentIndex
							   },
				               new OMWSearchHit
				               {
								   ID = docId,
								   PreviewHeader = "Ticker content " + (_contentIndex++),
					               PreviewMain = "Content " + _contentIndex
							   },
			               };

				var context = GlobalHost.ConnectionManager.GetHubContext<TickerHub>();
			    context.Clients.All.onTickerDataPush(11, "6290b86c-3cdd-4d52-8340-df3b9bf2aa15", data);
		    }
		    catch (Exception ex)
		    {
			    
		    }
	    }

	    public override Task OnConnected()
	    {
		    var connectionID = this.Context.ConnectionId;

			Clients.Client(this.Context.ConnectionId).initalize(connectionID);

			return base.OnConnected();
	    }
    }
}