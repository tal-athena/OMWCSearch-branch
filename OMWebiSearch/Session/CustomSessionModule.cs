using System;
using System.Web;
using System.Web.SessionState;
using System.Collections;
using System.Threading;
using System.Web.Configuration;
using System.Configuration;

namespace OMWebiSearch.Session
{

    public class CustomSessionModule : IHttpModule, IDisposable
    {


        /// <summary>
        /// Event for Session_OnStart event in the Global.asax file. 
        /// </summary>
        public event EventHandler Start;

        public void Dispose()
        {
            OMWebSessionHandler.Instance.Dispose();
        }

        public void FireSessionStartEvent()
        {
            if (Start != null)
            {
                Start(this, EventArgs.Empty);
            }
        }


        public void Init(HttpApplication context)
        {
            context.AcquireRequestState += context_AcquireRequestState;
            context.ReleaseRequestState += context_ReleaseRequestState;

            OMWebSessionHandler.Instance.Init(this);
        }

        void context_AcquireRequestState(object source, EventArgs e)
        {
            OMWebSessionHandler.Instance.OnAcquireRequestState((HttpApplication)source);
        }

        void context_ReleaseRequestState(object source, EventArgs e)
        {
            OMWebSessionHandler.Instance.OnReleaseRequestState((HttpApplication)source);
        }

    }
}