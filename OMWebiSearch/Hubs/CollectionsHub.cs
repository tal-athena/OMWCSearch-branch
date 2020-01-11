using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using OMWebiSearch.Hubs;

namespace OMWCSearch
{
    /// <summary>
    /// OMWCollection helper class for SignalR
    /// </summary>
    public class CollectionManager
    {
        private readonly static Lazy<CollectionManager> _instance = new Lazy<CollectionManager>(() => new CollectionManager(GlobalHost.ConnectionManager.GetHubContext<CollectionsHub>().Clients));
        
        public static CollectionManager Instance { get { return _instance.Value; } }
        public IHubConnectionContext Clients { get; set; }

        private CollectionManager(IHubConnectionContext clients)
        {
            Clients = clients;
        }

        public void OnCollectionChange(string collectionId, JsonResult data)
        {
            Clients.Group(CollectionsHub.CollectionsGroupPreffix + collectionId).updateCollection(collectionId, data);
        }
    }

}


namespace OMWebiSearch.Hubs
{
    public class CollectionsHub : Hub
    {
        public const string CollectionsGroupPreffix = "cgrp";
        public Task JoinCollectionGroup(string collectionId)
        {
            return Groups.Add(Context.ConnectionId, CollectionsGroupPreffix + collectionId);
        }
    }
}