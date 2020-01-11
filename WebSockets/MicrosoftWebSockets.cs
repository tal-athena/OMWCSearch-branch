using Microsoft.Web.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Timers;
using System.Web.SessionState;

namespace WebSockets
{
    public class MicrosoftWebSockets : WebSocketHandler, IRequiresSessionState
    {
        private static Dictionary<string, MicrosoftWebSockets> clients = new Dictionary<string, MicrosoftWebSockets>();
        private Timer timer1;

        public MicrosoftWebSockets()
        {

            InitTimer();
        }
        public override void OnOpen()
        {
            //var sessionId = System.Web.HttpContext.Current.Session.SessionID;
            //clients.Add(sessionId, this);
            //this.Send(sessionId);

            var id = Guid.NewGuid().ToString();
            clients.Add(id, this);
            this.Send(id);
        }

        public override void OnMessage(string message)
        {
            ////clients.Broadcast(string.Format("{0}", message));
            //var client = clients.FirstOrDefault().Value;
            ////var client = clients.Where(p => p.WebSocketContext.User.Identity.Name == "test").FirstOrDefault();
            //client.Send("test1");
        }

        public override void OnClose()
        {
            //var sessionId = System.Web.HttpContext.Current.Session.SessionID;
            //clients.Remove(sessionId);

            var id = clients.Where(p => p.Value == this).FirstOrDefault().Key;
            clients.Remove(id);

            //clients.Remove(this);
        }

        public void InitTimer()
        {
            timer1 = new Timer(5000);
            timer1.Elapsed += timer1_Elapsed;
            timer1.Start();
        }

        void timer1_Elapsed(object sender, ElapsedEventArgs e)
        {
            //Send some data to client
            Random r = new Random();
            int pos = r.Next(clients.Count);

            if (clients.Count > 0)
            {
                var client = clients.ElementAt(pos);
                if (client.Key != null)
                {
                    client.Value.Send("Message for client with id: " + client.Key);
                }
            }
            InitTimer();
        }

    }
}
