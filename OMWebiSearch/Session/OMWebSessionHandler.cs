using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Configuration;
using System.Web.SessionState;
using System.Collections.Concurrent;

namespace OMWebiSearch.Session
{


    /// <summary>
    /// Thread-safe singlenton implementation of OMWebSessionHandler class.
    /// https://msdn.microsoft.com/en-us/library/ff650316.aspx
    /// </summary>
    public sealed class OMWebSessionHandler
    {
        private static volatile OMWebSessionHandler instance;
        private static object syncRoot = new Object();

        private OMWebSessionHandler() { }

        public static OMWebSessionHandler Instance
        {
            get
            {
                if (instance == null)
                {
                    lock (syncRoot)
                    {
                        if (instance == null)
                            instance = new OMWebSessionHandler();
                    }
                }

                return instance;
            }
        }

        private class SessionItem
        {
            internal SessionStateItemCollection Items;
            internal HttpStaticObjectsCollection StaticObjects;
            internal DateTime Expires;
            internal string UserId;
        }

        private class GuidSessionIDManager : SessionIDManager
        {
            public override string CreateSessionID(HttpContext context)
            {
                return Guid.NewGuid().ToString();
            }

            public override bool Validate(string id)
            {
                try
                {
                    Guid testGuid = new Guid(id);

                    if (id == testGuid.ToString())
                        return true;
                }
                catch { }

                return false;
            }
        }

        private CustomSessionModule _customSessionModule;
        private Timer pTimer;
        private int pTimerSeconds = 10;
        private int pTimeout;
        private int maxUserSessions = 8;
        private bool pInitialized = false;
        private HttpCookieMode pCookieMode = HttpCookieMode.UseCookies;
        private GuidSessionIDManager pSessionIDManager;
        private SessionStateSection pConfig;
        private ConcurrentDictionary<string, SessionItem> pSessionItems = new ConcurrentDictionary<string, SessionItem>();
        private ConcurrentDictionary<string, SynchronizedCollection<string>> _userSessions = new ConcurrentDictionary<string, SynchronizedCollection<string>>();

        /// <summary>
        /// Initialization event of CustomSessionModule. 
        /// Creating of all needed objects.
        /// Reading data from configuration.
        /// </summary>
        internal void Init(CustomSessionModule customSessionModule)
        {
            _customSessionModule = customSessionModule;

            // Create a SessionIDManager.
            pSessionIDManager = new GuidSessionIDManager();
            pSessionIDManager.Initialize();

            // If not already initialized, initialize timer and configuration. 
            if (!pInitialized)
            {
                lock (typeof(CustomSessionModule))
                {
                    if (!pInitialized)
                    {
                        // Create a Timer to invoke the ExpireCallback method based on 
                        // the pTimerSeconds value (every 10 seconds).
                        if (pTimer == null)
                        {
                            pTimer = new Timer(new TimerCallback(this.ExpireCallback),
                                          null,
                                          0,
                                          pTimerSeconds * 1000);
                        }


                        // Get the configuration section and set timeout and CookieMode values.
                        Configuration cfg =
                          WebConfigurationManager.OpenWebConfiguration(System.Web.Hosting.HostingEnvironment.ApplicationVirtualPath);
                        pConfig = (SessionStateSection)cfg.GetSection("system.web/sessionState");

                        pTimeout = (int)pConfig.Timeout.TotalMinutes;
                        pCookieMode = pConfig.Cookieless;

                        pInitialized = true;
                    }
                }
            }
        }

        /// <summary>
        /// Event for removing expired sessions.
        /// </summary>
        /// <param name="state"></param>
        void ExpireCallback(object state)
        {
            this.RemoveExpiredSessionData();
        }


        /// <summary>
        /// Recursivly remove expired session data from session collection. 
        /// </summary>
        private void RemoveExpiredSessionData()
        {
            string sessionID;

            //Every 10 seconds we try to remove sessions that expired from pSessionItems.
            foreach (var entry in pSessionItems)
            {
                SessionItem item = (SessionItem)entry.Value;

                //Check if the session is expired.
                if (DateTime.Compare(item.Expires, DateTime.Now) <= 0)
                {
                    SessionItem entryValue = (SessionItem)entry.Value;
                    sessionID = entry.Key.ToString();
                    var removed = pSessionItems.TryRemove(entry.Key, out entryValue);

                    if (entryValue != null)
                    {
                        //Remove session from private array that is storing sessions by usersId.
                        RemoveSessionFromUserSessions(entryValue.UserId, entry.Key);
                    }

                    //If session is removed from Dictionary raise session end event.
                    if (removed)
                    {
                        HttpSessionStateContainer stateProvider =
                            new HttpSessionStateContainer(sessionID,
                                                          item.Items,
                                                          item.StaticObjects,
                                                          pTimeout,
                                                          false,
                                                          pCookieMode,
                                                          SessionStateMode.Custom,
                                                          false);

                        SessionStateUtility.RaiseSessionEnd(stateProvider, this, EventArgs.Empty);

                        this.RemoveExpiredSessionData();
                        break;
                    }
                }
            }

        }


        internal void Dispose()
        {
        }


        /// <summary>
        /// Event for HttpApplication.AcquireRequestState.
        /// </summary>
        /// <param name="app">Current HttpApplication.</param>
        public void OnAcquireRequestState(HttpApplication app)
        {
            HttpContext context = app.Context;
            bool isNew = false;
            string sessionID;
            SessionItem sessionData = null;
            bool supportSessionIDReissue = true;

            pSessionIDManager.InitializeRequest(context, false, out supportSessionIDReissue);
            sessionID = pSessionIDManager.GetSessionID(context);


            if (sessionID != null)
            {
                pSessionItems.TryGetValue(sessionID, out sessionData);

                if (sessionData != null)
                    sessionData.Expires = DateTime.Now.AddMinutes(pTimeout);
            }
            else
            {
                bool redirected, cookieAdded;

                sessionID = pSessionIDManager.CreateSessionID(context);


                pSessionIDManager.SaveSessionID(context, sessionID, out redirected, out cookieAdded);

            }

            if (sessionData == null)
            {
                // Identify the session as a new session state instance. Create a new SessionItem.
                // and add it to the local Hashtable.

                isNew = true;

                sessionData = new SessionItem();

                sessionData.Items = new SessionStateItemCollection();
                sessionData.StaticObjects = SessionStateUtility.GetSessionStaticObjects(context);
                sessionData.Expires = DateTime.Now.AddMinutes(pTimeout);
                sessionData.UserId = "";

                pSessionItems[sessionID] = sessionData;

            }

            // Add the session data to the current HttpContext.
            SessionStateUtility.AddHttpSessionStateToContext(context,
                             new HttpSessionStateContainer(sessionID,
                                                          sessionData.Items,
                                                          sessionData.StaticObjects,
                                                          pTimeout,
                                                          isNew,
                                                          pCookieMode,
                                                          SessionStateMode.Custom,
                                                          false));


        }



        /// <summary>
        /// Event handler for HttpApplication.ReleaseRequestState.
        /// </summary>
        /// <param name="app">Current HttpApplication.</param>
        internal void OnReleaseRequestState(HttpApplication app)
        {
            HttpContext context = app.Context;
            string sessionID;

            // Read the session state from the context.
            HttpSessionStateContainer stateProvider =
              (HttpSessionStateContainer)(SessionStateUtility.GetHttpSessionStateFromContext(context));

            // If Session.Abandon() was called, remove the session data from the local Hashtable 
            // and execute the Session_OnEnd event from the Global.asax file. 
            if (stateProvider.IsAbandoned)
            {
                sessionID = pSessionIDManager.GetSessionID(context);
                var sessionItem = new SessionItem();
                pSessionItems.TryRemove(sessionID, out sessionItem);


                SessionStateUtility.RaiseSessionEnd(stateProvider, this, EventArgs.Empty);
            }//If the session is not Abandoned check if it is new session.
            else if (HttpContext.Current.Session["new_session"] != null && (bool)HttpContext.Current.Session["new_session"] == true)
            {
                HttpContext.Current.Session["new_session"] = false;
            }

            SessionStateUtility.RemoveHttpSessionStateFromContext(app.Context);
        }


        /// <summary>
        /// Method used to remove current session and create a new one with new SessionID.
        /// </summary>
        /// <param name="context">Current HttpApplication context.</param>
        /// <param name="userId">UserID of the user trying to login.</param>
        internal void ReCreateSession(HttpContext context, string userId)
        {
            string sessionID;
            SessionItem sessionData;
            bool supportSessionIDReissue = true;

            pSessionIDManager.InitializeRequest(context, false, out supportSessionIDReissue);
            sessionID = pSessionIDManager.GetSessionID(context);

            //Try to get previous data.
            if (sessionID != null)
            {
                pSessionItems.TryGetValue(sessionID, out sessionData);

                if (sessionData != null)
                {
                    //Make current session invalid.
                    sessionData.Expires = DateTime.Now.AddYears(-1);
                }
            }


            //Create new session data.
            sessionData = new SessionItem();
            sessionData.Items = new SessionStateItemCollection();
            sessionData.StaticObjects = SessionStateUtility.GetSessionStaticObjects(context);
            sessionData.Expires = DateTime.Now.AddMinutes(pTimeout);
            sessionData.UserId = userId;


            //Remove previous session.
            RemoveSession(sessionID);


            //Remove current session data from current HttpContext.
            SessionStateUtility.RemoveHttpSessionStateFromContext(context);


            //Create new sessionID.
            sessionID = pSessionIDManager.CreateSessionID(context);

            //Add new session in Dictionary.
            pSessionItems[sessionID] = sessionData;

            //Add session data to the current HttpContext.
            SessionStateUtility.AddHttpSessionStateToContext(context,
                             new HttpSessionStateContainer(sessionID,
                                                          sessionData.Items,
                                                          sessionData.StaticObjects,
                                                          pTimeout,
                                                          true,
                                                          pCookieMode,
                                                          SessionStateMode.Custom,
                                                          false));
            //Set cookie.
            if (HttpContext.Current.Response.Cookies != null)
            {
                HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", sessionID));
            }

            //Set variable that shows that session is new.
            if (HttpContext.Current.Session != null)
            {
                HttpContext.Current.Session.Add("new_session", true);
            }

            //Fire SessionStart event
            _customSessionModule.FireSessionStartEvent();

        }


        /// <summary>
        /// Method that is removing session from pSessionItems dictionary.
        /// </summary>
        /// <param name="sessionID">SessionID of the session that should be removed.</param>
        internal void RemoveSession(string sessionID)
        {
            SessionItem item;
            var removed = pSessionItems.TryRemove(sessionID, out item);

            if (removed && item != null)
            {
                HttpSessionStateContainer stateProvider =
                    new HttpSessionStateContainer(sessionID,
                                                  item.Items,
                                                  item.StaticObjects,
                                                  pTimeout,
                                                  false,
                                                  pCookieMode,
                                                  SessionStateMode.Custom,
                                                  false);

                //Delete the cookie.
                if (HttpContext.Current.Session.SessionID == sessionID && HttpContext.Current.Response.Cookies != null)
                {
                    HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));
                }


                //Fire Session_End event.
                SessionStateUtility.RaiseSessionEnd(stateProvider, this, EventArgs.Empty);
            }
        }

        /// <summary>
        /// Adding session data to the _userSessions using userId as a key. 
        /// Method checks how many live sessions user has, and removes the oldest if the number of session is higher than max.
        /// New session is added.
        /// </summary>
        /// <param name="userId">User id of the loged in user.</param>
        /// <param name="sessionID">Session id that should be added to the array of the UserId.</param>
        public void AddSessionFromUserSessions(string userId, string sessionID)
        {
            SynchronizedCollection<string> collection;
            _userSessions.TryGetValue(userId, out collection);
            if (collection != null)
            {
                if (collection.Count >= maxUserSessions)
                {
                    List<KeyValuePair<string, DateTime>> sessions = new List<KeyValuePair<string, DateTime>>();
                    foreach (var item in collection)
                    {
                        //Get all sessions from pSessionItems
                        sessions.Add(new KeyValuePair<string, DateTime>(item, pSessionItems[item].Expires));
                    }
                    //Sort sessions by date
                    sessions.Sort((x, y) => x.Value.CompareTo(y.Value));

                    //Delete sessions
                    int i = 0;
                    while (collection.Count >= maxUserSessions)
                    {
                        collection.Remove(sessions[i].Key);
                        RemoveSession(sessions[i].Key);
                        i++;
                    }
                }
                //Add item to queue
                collection.Add(sessionID);
            }
            else
            {
                //This is first value, create queue and add
                collection = new SynchronizedCollection<string>();
                collection.Add(sessionID);
                _userSessions.TryAdd(userId, collection);
            }
        }

        /// <summary>
        /// Removing session from _userSessions.
        /// </summary>
        /// <param name="userId">User id of the loged in user.</param>
        /// <param name="sessionId">Session id that should be removed from array of the UserId.</param>
        private void RemoveSessionFromUserSessions(string userId, string sessionId)
        {
            if (sessionId != null && userId != null)
            {
                //Remove this specific session
                SynchronizedCollection<string> collection;
                _userSessions.TryGetValue(userId, out collection);
                if (collection != null)
                {
                    collection.Remove(sessionId);
                    RemoveSession(sessionId);

                    //Remove userId if collection is empty
                    if (collection.Count == 0)
                    {
                        _userSessions.TryRemove(userId, out collection);
                    }
                }
            }
            //else
            //{
            //    //Remove oldest session
            //    SynchronizedCollection<string> collection;
            //    _userSessions.TryGetValue(userId, out collection);
            //    if (collection != null)
            //    {
            //        List<KeyValuePair<string, DateTime>> sessions = new List<KeyValuePair<string, DateTime>>();

            //        foreach (var item in collection)
            //        {
            //            //Get all sessions from pSessionItems
            //            sessions.Add(new KeyValuePair<string, DateTime>(item, pSessionItems[item].Expires));
            //        }
            //        //Sort sessions by date
            //        sessions.Sort((x, y) => x.Value.CompareTo(y.Value));

            //        //Remove the oldest
            //        sessions.RemoveAt(0);
            //    }
            //}
        }

    }
}