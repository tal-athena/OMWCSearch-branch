using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.WebSockets;

namespace WebSockets.Controllers
{
    public class WebSocketController : ApiController
    {
        List<WebSocket> _sockets = new List<WebSocket>();

        public HttpResponseMessage Get()
        {
            if (HttpContext.Current.IsWebSocketRequest)
            {
                HttpContext.Current.AcceptWebSocketRequest(ProcessWS);
            }
            return new HttpResponseMessage(HttpStatusCode.SwitchingProtocols);
        }

        //Sends message to the client
        private async Task SendMessageAsync(string message, WebSocket socket)
        {
            await SendMessageAsync(Encoding.UTF8.GetBytes(message), socket);
        }

        //Sends the message to the client
        private async Task SendMessageAsync(byte[] message, WebSocket socket)
        {
            await socket.SendAsync(
                new ArraySegment<byte>(message),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None);
        }

        private async Task ProcessWS(AspNetWebSocketContext context)
        {
            WebSocket socket = context.WebSocket;
            _sockets.Add(socket);
            while (true)
            {
                ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024]);
                WebSocketReceiveResult result = await socket.ReceiveAsync(
                    buffer, CancellationToken.None);
                if (socket.State == WebSocketState.Open)
                {
                    string userMessage = Encoding.UTF8.GetString(
                        buffer.Array, 0, result.Count);
                    userMessage = "You sent: " + userMessage + " at " +
                        DateTime.Now.ToLongTimeString();
                    buffer = new ArraySegment<byte>(
                        Encoding.UTF8.GetBytes(userMessage));
                    await socket.SendAsync(
                        buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                else
                {
                    break;
                }
            }
        }
    }
}
