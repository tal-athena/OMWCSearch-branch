using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Web.WebSockets;
using System.Web.SessionState;

namespace WebSockets
{
    /// <summary>
    /// Summary description for WebSocketsServer2
    /// </summary>
    public class WebSocketsServer2 : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            if (context.IsWebSocketRequest)
            {
                context.AcceptWebSocketRequest(new MicrosoftWebSockets());
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}