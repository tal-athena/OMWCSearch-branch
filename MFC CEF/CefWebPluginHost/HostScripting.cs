using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

namespace CefWebPluginHost
{
	/// <summary>
	/// Provides external interface in JS.
	/// All public methods are exposed to javasript after registering in browser engine.
	/// 
	/// When the method is called from JS then a worker thread is used.
	/// The call in JS always returns a promise which is resolved when 
	/// </summary>
    //[ComVisible(true)]
    public class HostScripting
    {
        public delegate void NotifyInvokedEventHandler(object sender, NotifyInvokedEventArgs e);

        //[UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        //[return: MarshalAs(UnmanagedType.LPTStr)]
        //public delegate string CallbackFuncDelegate([MarshalAs(UnmanagedType.LPTStr)] string message);
        public delegate string CallbackFuncDelegate(string message);

        CallbackFuncDelegate fncOnRequest = null;
        CallbackFuncDelegate fncOnNotify = null;


		//export interface IMessage
		//{
		//	readonly module: string;
		//  readonly type: string;
		//}
		//export type NotifyMessage = Message.IMessage & { readonly json?: string }
		//export type ApiMessage = Message.IMessage & { readonly json: string }

		/// <summary>
		/// 
		/// </summary>
		/// <param name="json">IMessage (currently ApiMessage supported)</param>
		/// <returns>IMessage as json or throws exception</returns>
		public bool onRequest(string jsonParam, out string jsonResult)
        {
			MessageBox.Show("Received request in C#, invoking callback...", jsonParam);

            string rc = string.Empty;
			if (fncOnRequest != null)
			{
				try
				{
					jsonResult = fncOnRequest.Invoke(jsonParam);

					return true;
				}
				catch (Exception ex)
				{
					jsonResult = ex.Message;
				}
			}
			else
				jsonResult = "HostScripting.fncOnRequest callback is not set";

			return false;
        }

		/// <summary>
		/// Plugin doesn't expect any value to be returned.
		/// </summary>
		/// <param name="json">IMessage (NotifyMessage supported)</param>
		/// <returns>void or throws exception</returns>
		public bool onNotify(string jsonParam, out string jsonResult)
        {
			MessageBox.Show("Received notification in C#, invoking callback...", jsonParam);

			string rc = string.Empty;
			if (fncOnNotify != null)
			{
				try
				{
					jsonResult = fncOnNotify.Invoke(jsonParam);

					return true;
				}
				catch (Exception ex)
				{
					jsonResult = ex.Message;
				}
			}
			else
				jsonResult = "HostScripting.fncOnNotify callback is not set";

            return false;
        }

        public void SetCallbacks(IntPtr ptrOnRequest, IntPtr ptrOnNotify)
        {
			fncOnRequest = (CallbackFuncDelegate)Marshal.GetDelegateForFunctionPointer(ptrOnRequest, typeof(CallbackFuncDelegate));
            fncOnNotify = (CallbackFuncDelegate)Marshal.GetDelegateForFunctionPointer(ptrOnNotify, typeof(CallbackFuncDelegate));
        }
    }

	public class NotifyInvokedEventArgs : EventArgs
    {
        public string Result { get; set; }

    }
}
