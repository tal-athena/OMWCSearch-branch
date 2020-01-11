// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#ifndef CEF_TESTS_CEFCLIENT_CLIENT_HANDLER_H_
#define CEF_TESTS_CEFCLIENT_CLIENT_HANDLER_H_
#pragma once

#include <list>
#include <map>
#include <set>
#include <string>
#include "include/cef_client.h"
#include "include/cef_version.h"
#include "include/wrapper/cef_helpers.h"
#include "include/wrapper/cef_message_router.h"
#include "HostIPC.h"
#include "DevToolsWnd.h"

#define WM_CEF_PRE_KEY_EVENT WM_USER + 100

//////////////////////////////////////////////////////////////////////////

// ClientHandler implementation.
class ClientHandler : public CefClient,
	public CefContextMenuHandler,
	public CefDisplayHandler,
	public CefDownloadHandler,
	public CefLifeSpanHandler,
	public CefLoadHandler,
	public CefRequestHandler,
	public CefJSDialogHandler,
	public CefKeyboardHandler
{
public:

	// Interface implemented to handle off-screen rendering.
	class RenderHandler : public CefRenderHandler {
		public:
			virtual void OnBeforeClose(CefRefPtr<CefBrowser> browser) =0;
	};

	ClientHandler();
	virtual ~ClientHandler();

protected:
	CefRefPtr<CefMessageRouterBrowserSide> message_router;
	scoped_ptr<CefMessageRouterBrowserSide::Handler> message_handler;
	int browser_ct;

	void ReloadBrowserThread(CefRefPtr<CefBrowser> browser);
	void ShowDevToolsBrowserThread(CefRefPtr<CefBrowser> browser);
	void ShowProxyBrowserThread(CefRefPtr<CefBrowser> browser);
public:

	void Reload(CefRefPtr<CefBrowser> browser);
	void ShowDevTools(CefRefPtr<CefBrowser> browser);
	void ShowProxy(CefRefPtr<CefBrowser> browser);

	// 17.05.2018 - called by CCefTabCtrl to subscribe for IPC messages
	void RegisterIpcCallbackHandler(IpcCallbackHandler* pCallbackHandler)
	{
		UnregisterIpcCallbackHandler(pCallbackHandler);

		m_callbackHandlers.Add(pCallbackHandler);
	}

	// 17.05.2018 - called by CCefTabCtrl to unsubscribe for IPC messages
	void UnregisterIpcCallbackHandler(IpcCallbackHandler* pCallbackHandler)
	{
		for (int i = 0; i < m_callbackHandlers.GetCount(); i++)
		{
			IpcCallbackHandler* p = (IpcCallbackHandler*) m_callbackHandlers[i];
			if (p == pCallbackHandler)
			{
				m_callbackHandlers.RemoveAt(i);
				break;
			}
		}
	}

	virtual CefRefPtr<CefKeyboardHandler> GetKeyboardHandler() OVERRIDE
	{
		return this;
	}

	bool OnPreKeyEvent(CefRefPtr<CefBrowser> browser, const CefKeyEvent& event, CefEventHandle os_event, bool* is_keyboard_shortcut) OVERRIDE
	{
		if (os_event && (os_event->message == WM_KEYDOWN || os_event->message == WM_SYSKEYDOWN))
		{
			CefRefPtr<CefBrowserHost> host = browser->GetHost();
			HWND hTabCtrlWnd = GetParent(host->GetWindowHandle());

			LRESULT lResult = SendMessage(hTabCtrlWnd, WM_CEF_PRE_KEY_EVENT, os_event->wParam, os_event->message == WM_SYSCOMMAND ? TRUE : FALSE);
			if (lResult)
			{
				*is_keyboard_shortcut = true;
				return true;
			}
		}

		return false;
	}

protected:
	// 17.05.2018 - array to hold pointers to IpcCallbackHandler (CCefTabCtrl)
	CPtrArray m_callbackHandlers;
	CDevToolsWnd m_wndDevTools;

#if CHROME_VERSION_BUILD == 2526 || CHROME_VERSION_BUILD == 2454
	typedef cef_window_open_disposition_t WindowOpenDisposition;
	typedef cef_plugin_policy_t PluginPolicy;
#endif

	// CefClient methods
	virtual CefRefPtr<CefContextMenuHandler> GetContextMenuHandler() OVERRIDE{ return this; }
	virtual CefRefPtr<CefDisplayHandler> GetDisplayHandler() OVERRIDE{ return this; }
	virtual CefRefPtr<CefDownloadHandler> GetDownloadHandler() OVERRIDE{ return this; }
	virtual CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() OVERRIDE{ return this; }
	virtual CefRefPtr<CefLoadHandler> GetLoadHandler() OVERRIDE{ return this; }
	virtual CefRefPtr<CefRequestHandler> GetRequestHandler() OVERRIDE{ return this; }
	virtual CefRefPtr<CefJSDialogHandler> GetJSDialogHandler() OVERRIDE{ return this; }

	// CefLifeSpanHandler methods
	virtual bool DoClose(CefRefPtr<CefBrowser> browser) OVERRIDE;
	virtual void OnAfterCreated(CefRefPtr<CefBrowser> browser) OVERRIDE;
	virtual void OnBeforeClose(CefRefPtr<CefBrowser> browser) OVERRIDE;
/*#if CHROME_VERSION_BUILD == 2526 || CHROME_VERSION_BUILD == 2454
	virtual bool OnBeforePopup(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name, WindowOpenDisposition target_disposition, bool user_gesture, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo, CefRefPtr<CefClient>& client, CefBrowserSettings& settings, bool* no_javascript_access) OVERRIDE;
#else
	virtual bool OnBeforePopup(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo, CefRefPtr<CefClient>& client, CefBrowserSettings& settings, bool* no_javascript_access) OVERRIDE;
#endif*/

	// CefContextMenuHandler methods
	virtual void OnBeforeContextMenu(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, CefRefPtr<CefMenuModel> model) OVERRIDE;
	virtual bool OnContextMenuCommand(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, int command_id, EventFlags event_flags) OVERRIDE;
	
	// CefLoadHandler methods
	virtual void OnLoadingStateChange(CefRefPtr<CefBrowser> browser, bool isLoading, bool canGoBack, bool canGoForward) OVERRIDE;

	// CefDisplayHandler methods
	virtual void OnAddressChange(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& url) OVERRIDE;
	virtual void OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title) OVERRIDE;
	virtual void OnStatusMessage(CefRefPtr<CefBrowser> browser, const CefString& value) OVERRIDE;
	virtual bool OnConsoleMessage(CefRefPtr<CefBrowser> browser, const CefString& message, const CefString& source, int line) OVERRIDE;

	// CefDownloadHandler methods
	virtual void OnBeforeDownload(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, const CefString& suggested_name, CefRefPtr<CefBeforeDownloadCallback> callback) OVERRIDE;
	virtual void OnDownloadUpdated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, CefRefPtr<CefDownloadItemCallback> callback) OVERRIDE;

	// CefLoadHandler methods
	//virtual void OnLoadStart(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame) OVERRIDE;
	virtual void OnLoadEnd(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int httpStatusCode) OVERRIDE;
	virtual void OnLoadError(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, ErrorCode errorCode, const CefString& errorText, const CefString& failedUrl) OVERRIDE;

	// CefRequestHandler methods
	virtual bool GetAuthCredentials( CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, bool isProxy, const CefString& host, int port, const CefString& realm, const CefString& scheme, CefRefPtr<CefAuthCallback> callback) OVERRIDE;
	virtual CefRefPtr<CefResourceHandler> GetResourceHandler(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefRequest> request) OVERRIDE;
	virtual bool OnQuotaRequest(CefRefPtr<CefBrowser> browser, const CefString& origin_url, int64 new_size, CefRefPtr<CefRequestCallback> callback) OVERRIDE;
	virtual void OnProtocolExecution(CefRefPtr<CefBrowser> browser, const CefString& url, bool& allow_os_execution) OVERRIDE;
	virtual bool OnBeforeBrowse(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefRequest> request, bool is_redirect) OVERRIDE;
	virtual bool OnCertificateError(CefRefPtr<CefBrowser> browser, ErrorCode cert_error, const CefString& request_url, CefRefPtr<CefSSLInfo> ssl_info, CefRefPtr<CefRequestCallback> callback) OVERRIDE;

	virtual bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser, CefProcessId source_process, CefRefPtr<CefProcessMessage> message) OVERRIDE;
	virtual void OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser, TerminationStatus status) OVERRIDE;

	// CefJSDialogHandler methods
	virtual bool OnBeforeUnloadDialog(CefRefPtr< CefBrowser > browser, const CefString& message_text, bool is_reload, CefRefPtr< CefJSDialogCallback > callback) OVERRIDE;
	virtual void OnDialogClosed(CefRefPtr< CefBrowser > browser) OVERRIDE;
	//virtual bool OnJSDialog(CefRefPtr< CefBrowser > browser, const CefString& origin_url, const CefString& accept_lang, CefJSDialogHandler::JSDialogType dialog_type, const CefString& message_text, const CefString& default_prompt_text, CefRefPtr< CefJSDialogCallback > callback, bool& suppress_message) OVERRIDE;
	virtual void OnResetDialogState(CefRefPtr< CefBrowser > browser) OVERRIDE;

	// Returns the startup URL.
	std::string GetStartupURL() { return m_StartupURL; }

	bool Save(const std::string& path, const std::string& data);

protected:
	// Returns the full download path for the specified file, or an empty path to use the default temp directory.
	std::string GetDownloadPath(const std::string& file_name);

	// Support for downloading files.
	std::string m_LastDownloadFile;

	// The startup URL.
	std::string m_StartupURL;

	// Include the default reference counting implementation.
	IMPLEMENT_REFCOUNTING(ClientHandler);

	// Include the default locking implementation.
	//IMPLEMENT_LOCKING(ClientHandler);
};

#endif  // CEF_TESTS_CEFCLIENT_CLIENT_HANDLER_H_
