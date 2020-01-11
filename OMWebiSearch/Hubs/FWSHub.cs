using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Timers;
using System.Web.Helpers;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using OMWebiSearch.Hubs;
using OMWCSearch.Interfaces;
using OMWSTypes;

namespace OMWebiSearch
{
    public class FWSManager
    {
        // Singleton instance
        private readonly static Lazy<FWSManager> _instance =
            new Lazy<FWSManager>(() => new FWSManager(GlobalHost.ConnectionManager.GetHubContext<FWSHub>().Clients));

        public static FWSManager Instance { get { return _instance.Value; } }
        public IHubConnectionContext Clients { get; set; }

        private FWSManager(IHubConnectionContext clients)
        {
            Clients = clients;
        }

        public void OnFWS(string OMContextID, string searchContextID, string data)
        {
            if (!connectionIdDict.ContainsKey(OMContextID))
                return;
            var secondLevelDict = connectionIdDict[OMContextID];
            if (!secondLevelDict.ContainsKey(searchContextID))
                return;
            string connectionId = connectionIdDict[OMContextID][searchContextID];
            var theClient = Clients.Client(connectionId);
            if (null == theClient)
                return;
            theClient.OnFWS(searchContextID, data);
        }

        private static ConcurrentDictionary<string, ConcurrentDictionary<string, string>> connectionIdDict
            = new ConcurrentDictionary<string, ConcurrentDictionary<string, string>>();

        public bool AddNewFWSSink(FWSHubSearchNotificationSink sink)
        {
            if (!sink.IsIDValid())
                return false;

            if (!connectionIdDict.ContainsKey(sink.OMContextID))
            {
                connectionIdDict[sink.OMContextID] = new ConcurrentDictionary<string,string>();
            }
            connectionIdDict[sink.OMContextID][sink.searchContextID] = null;
            return true;
        }

        public bool SetConnectionId(string OMContextID, string searchContextId, string connectionId)
        {
            if (!connectionIdDict.ContainsKey(OMContextID)) return false;
            var secondLevelDict = connectionIdDict[OMContextID];
            if (!secondLevelDict.ContainsKey(searchContextId)) return false;
            connectionIdDict[OMContextID][searchContextId] = connectionId;
            return true;
        }
    }
}

namespace OMWebiSearch.Hubs
{
    using OMWCSearch.UnitTest;
    public class FWSHub : Hub
    {
        public const string GlobalOMContext = "fwsgrp_";
        public void JoinFWSGroup(string searchContextID)
        {
            bool hasKey = false;
            // Name = "ASP.NET_SessionId"
            //var coockies = Context.Request.Cookies["ASP.NET_SessionId"];
            //var context = Context.Request.GetHttpContext();
            //var session = context.Session;
            //var keys = session.Keys;
            //if (keys != null)
            //{
            //    foreach (var key in keys)
            //    {
            //        if (key.ToString() == "OMSessionID")
            //        {
            //            hasKey = true;
            //            break;
            //        }
            //    }
            //}
            //if (!hasKey)
            //    Context.Request.GetHttpContext().Session["OMSessionID"] = "test_omsession";
            //string OMSession = Context.Request.GetHttpContext().Session["OMSessionID"].ToString();
            string OMSession = "test_omsession";
            var sink = new FWSHubSearchNotificationSink()
            {
                OMContextID = OMSession,
                searchContextID = searchContextID,
                IsTest=true
            };
            FWSManager.Instance.AddNewFWSSink(sink);
            sink.StartTestTimer();
            var success = FWSManager.Instance.SetConnectionId(OMSession, searchContextID, Context.ConnectionId); 
            //return Groups.Add(Context.ConnectionId, FWSGroupPreffix + searchContextID);
        }
    }

    public class FWSHubSearchNotificationSink : INTWSearchNotificationSink
    {
        public bool IsTest = false;
        public bool OnFWSHits(IEnumerable<OMWSearchHit> hits)
        {
            if (!IsIDValid())
                return false;
            if (IsTest)
            {
                FWSManager.Instance.OnFWS(OMContextID, searchContextID, Json.Encode(new{time="time:"+DateTime.Now.Ticks}));
            }
            else
            {
                FWSManager.Instance.OnFWS(OMContextID, searchContextID, Json.Encode(hits.ToList()));
            }
            return true;
        }

        public bool OnStatus(ONTSearchStatusNotification status)
        {
            return true;
        }

        public bool IsIDValid()
        {
            if (String.IsNullOrEmpty(OMContextID) || String.IsNullOrEmpty(searchContextID))
                return false;
            return true;
        }

        public string OMContextID { get; set; }
        public string searchContextID { get; set; }

        public void StartTestTimer()
        {
            Timer t = new Timer();
            t.Interval = 5000; //In seconds here
            t.AutoReset = false; //Stops it from repeating
            t.Elapsed += t_Elapsed;
            t.Start();
        }

        void t_Elapsed(object sender, ElapsedEventArgs e)
        {
            OnFWSHits(SearchService.GetFWSUpdates());
            StartTestTimer();
        }
    }
}