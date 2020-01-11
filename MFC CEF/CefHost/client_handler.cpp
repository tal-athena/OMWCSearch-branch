// Copyright (c) 2013 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include "stdafx.h"

#include "client_handler.h"
#include <stdio.h>
#include <algorithm>
#include <set>
#include <sstream>
#include <string>
#include <vector>

#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/cef_path_util.h"
#include "include/cef_process_util.h"
#include "include/cef_trace.h"
#include "include/base/cef_bind.h"
#include "include/wrapper/cef_closure_task.h"
#include "client_switches.h"
#include "client_util.h"
#include "CefHost.h"
#include "HostIPC.h"

#define ID_CMD_RELOAD 1000
#define ID_CMD_DEVTOOLS 1001
#define ID_CMD_PROXY 1002

ClientHandler::ClientHandler()
{
	browser_ct = 0;
}

ClientHandler::~ClientHandler()
{
	m_wndDevTools.Destroy();
}

// 17.05.2018 - search for CCefTabCtrl owning the browser which sent the IPC message
bool ClientHandler::OnProcessMessageReceived(CefRefPtr<CefBrowser> browser, CefProcessId source_process, CefRefPtr<CefProcessMessage> message)
{
	CEF_REQUIRE_UI_THREAD();

	int nBrowserID = browser->GetIdentifier();

	for (int i = 0; i < m_callbackHandlers.GetCount(); i++)
	{
		IpcCallbackHandler* pCallbackHandler = (IpcCallbackHandler*)m_callbackHandlers[i];
		if (pCallbackHandler->IsBrowserOwner(nBrowserID))
		{
			pCallbackHandler->OnIpcMessage(message);
			break;
		}
	}

	return message_router->OnProcessMessageReceived(browser, source_process, message);
}

void ClientHandler::OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser, TerminationStatus status)
{
	CEF_REQUIRE_UI_THREAD();

	message_router->OnRenderProcessTerminated(browser);
}

bool ClientHandler::DoClose(CefRefPtr<CefBrowser> browser)
{
	// get browser ID
	INT nBrowserId = browser->GetIdentifier();
	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// call parent
	return CefLifeSpanHandler::DoClose(browser);
}

void ClientHandler::OnAfterCreated(CefRefPtr<CefBrowser> browser)
{
	REQUIRE_UI_THREAD();

	// get browser ID
	INT nBrowserId = browser->GetIdentifier();
	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// assign new browser
	CefBrowser* pBrowser = browser;
	::SendMessage(hWindow, WM_APP_CEF_NEW_BROWSER, (WPARAM)nBrowserId, (LPARAM)pBrowser);

	// call parent
	CefLifeSpanHandler::OnAfterCreated(browser);

	// Create the browser-side router for query handling.
	if (!message_router)
	{
		CefMessageRouterConfig config;
		message_router = CefMessageRouterBrowserSide::Create(config);

		// Register handlers with the router.
		message_handler.reset(message_handler.get());
		message_router->AddHandler(message_handler.get(), false);
	}

	browser_ct++;
}

void ClientHandler::OnBeforeClose(CefRefPtr<CefBrowser> browser)
{
	REQUIRE_UI_THREAD();

	//// get browser ID
	INT nBrowserId = browser->GetIdentifier();

	browser->GetHost()->CloseDevTools();
	m_wndDevTools.BeforeBrowserClose(nBrowserId);

	//// The frame window will be the parent of the browser window
	HWND hWindow = GetParent( browser->GetHost()->GetWindowHandle() );

	//// close browser
	//::SendMessage( hWindow, WM_APP_CEF_CLOSE_BROWSER, (WPARAM)nBrowserId, (LPARAM)NULL );

	if (--browser_ct == 0) {
		// Free the router when the last browser is closed.
		message_router->RemoveHandler(message_handler.get());
		message_handler.reset();
		message_router = NULL;
	}

	// call parent
	CefLifeSpanHandler::OnBeforeClose(browser);
}

/*#if CHROME_VERSION_BUILD == 2526 || CHROME_VERSION_BUILD == 2454
bool ClientHandler::OnBeforePopup(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name, WindowOpenDisposition target_disposition, bool user_gesture, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo, CefRefPtr<CefClient>& client, CefBrowserSettings& settings, bool* no_javascript_access)
#else
bool ClientHandler::OnBeforePopup(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo, CefRefPtr<CefClient>& client, CefBrowserSettings& settings, bool* no_javascript_access)
#endif
{
	if (browser->GetHost()->IsWindowRenderingDisabled())
	{
		// Cancel popups in off-screen rendering mode.
		return true;
	}

	// set client
	client = this;

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// send message
	LPCTSTR lpszURL(target_url.c_str());
	if (::SendMessage(hWindow, WM_APP_CEF_WINDOW_CHECK, (WPARAM)&popupFeatures, (LPARAM)lpszURL) == S_FALSE)
		return true;

	// send message
	if (::SendMessage(hWindow, WM_APP_CEF_NEW_WINDOW, (WPARAM)&popupFeatures, (LPARAM)&windowInfo) == S_FALSE)
		return true;

#if CHROME_VERSION_BUILD == 2526 || CHROME_VERSION_BUILD == 2454
	return CefLifeSpanHandler::OnBeforePopup(browser, frame, target_url, target_frame_name, target_disposition, user_gesture, popupFeatures, windowInfo, client, settings, no_javascript_access);
#else
	return CefLifeSpanHandler::OnBeforePopup(browser, frame, target_url, target_frame_name, popupFeatures, windowInfo, client, settings, no_javascript_access);
#endif
}*/

void ClientHandler::OnBeforeContextMenu(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, CefRefPtr<CefMenuModel> model)
{
	if ((params->GetTypeFlags() & (CM_TYPEFLAG_PAGE | CM_TYPEFLAG_FRAME)) != 0) {
	}

	model->RemoveAt(0);
	model->RemoveAt(0);

	model->InsertItemAt(0, ID_CMD_RELOAD, CefString(_T("Refresh")));
	model->InsertItemAt(1, ID_CMD_DEVTOOLS, CefString(_T("Show Dev Tools")));
	model->InsertItemAt(2, ID_CMD_PROXY, CefString(_T("Show Proxy Info")));

	// call parent
	CefContextMenuHandler::OnBeforeContextMenu(browser, frame, params, model);
}

bool ClientHandler::OnContextMenuCommand(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, int command_id, EventFlags event_flags)
{
	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	if (command_id == ID_CMD_RELOAD)
	{
		Reload(browser);

		return true;
	}
	else if (command_id == ID_CMD_DEVTOOLS)
	{
		ShowDevTools(browser);

		return true;
	}
	else if (command_id == ID_CMD_PROXY)
	{
		ShowProxy(browser);

		return true;
	}

	// call parent
	return CefContextMenuHandler::OnContextMenuCommand(browser, frame, params, command_id, event_flags);
}

void ClientHandler::ReloadBrowserThread(CefRefPtr<CefBrowser> browser)
{
	REQUIRE_UI_THREAD();

	browser->ReloadIgnoreCache();
}

void ClientHandler::ShowDevToolsBrowserThread(CefRefPtr<CefBrowser> browser)
{
	REQUIRE_UI_THREAD();

	CRect rc(0, 0, 1200, 900);

	m_wndDevTools.Create(browser->GetIdentifier(), rc);

	m_wndDevTools.GetClientRect(rc);

	CefWindowInfo cefWndInfo;
	cefWndInfo.SetAsChild(m_wndDevTools.GetSafeHwnd(), rc);
	CefBrowserSettings settings;

	//////////////////////////////////////////////////////////////////////////

	browser->GetHost()->CloseDevTools();
	browser->GetHost()->ShowDevTools(cefWndInfo, Cef_GetWrapper(), settings, CefPoint(0, 0));
}

void ClientHandler::ShowProxyBrowserThread(CefRefPtr<CefBrowser> browser)
{
	REQUIRE_UI_THREAD();

	browser->GetMainFrame()->LoadURL(_T("chrome://net-internals/#proxy"));

	// set focus to browser
	::SetFocus(browser->GetHost()->GetWindowHandle());
	browser->GetHost()->SetFocus(true);
}

void ClientHandler::Reload(CefRefPtr<CefBrowser> browser)
{
	CefPostTask(TID_UI, base::Bind(&ClientHandler::ReloadBrowserThread, this, browser));
}

void ClientHandler::ShowDevTools(CefRefPtr<CefBrowser> browser)
{
	CefPostTask(TID_UI, base::Bind(&ClientHandler::ShowDevToolsBrowserThread, this, browser));
}

void ClientHandler::ShowProxy(CefRefPtr<CefBrowser> browser)
{
	CefPostTask(TID_UI, base::Bind(&ClientHandler::ShowProxyBrowserThread, this, browser));
}

void ClientHandler::OnLoadingStateChange(CefRefPtr<CefBrowser> browser, bool isLoading, bool canGoBack, bool canGoForward)
{
	REQUIRE_UI_THREAD();

	INT nState = 0;
	// set state
	if (isLoading)
		nState |= CEF_BIT_IS_LOADING;
	if (canGoBack)
		nState |= CEF_BIT_CAN_GO_BACK;
	if (canGoForward)
		nState |= CEF_BIT_CAN_GO_FORWARD;

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// send message
	::SendMessage(hWindow, WM_APP_CEF_STATE_CHANGE, (WPARAM)nState, NULL);

	// call parent
	CefLoadHandler::OnLoadingStateChange(browser, isLoading, canGoBack, canGoForward);
}

void ClientHandler::OnAddressChange(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& url)
{
	REQUIRE_UI_THREAD();

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	LPCTSTR pszURL(url.c_str());
	::SendMessage(hWindow, WM_APP_CEF_ADDRESS_CHANGE, (WPARAM)pszURL, NULL);

	// call parent
	CefDisplayHandler::OnAddressChange(browser, frame, url);
}

void ClientHandler::OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title)
{
	REQUIRE_UI_THREAD();

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	LPCTSTR pszTitle(title.c_str());
	::SendMessage(hWindow, WM_APP_CEF_TITLE_CHANGE, (WPARAM)pszTitle, NULL);

	// call parent
	CefDisplayHandler::OnTitleChange(browser, title);
}

void ClientHandler::OnStatusMessage(CefRefPtr<CefBrowser> browser, const CefString& value)
{
	REQUIRE_UI_THREAD();

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	LPCTSTR pszStatus(value.c_str());
	::SendMessage(hWindow, WM_APP_CEF_STATUS_MESSAGE, (WPARAM)pszStatus, NULL);

	// call parent
	CefDisplayHandler::OnStatusMessage(browser, value);
}

bool ClientHandler::OnConsoleMessage(CefRefPtr<CefBrowser> browser, const CefString& message, const CefString& source, int line)
{
	REQUIRE_UI_THREAD();
	return TRUE;
}

void ClientHandler::OnBeforeDownload(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, const CefString& suggested_name, CefRefPtr<CefBeforeDownloadCallback> callback)
{
	REQUIRE_UI_THREAD();

	// Continue the download and show the "Save As" dialog.
	callback->Continue(GetDownloadPath(suggested_name), true);
}

void ClientHandler::OnDownloadUpdated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, CefRefPtr<CefDownloadItemCallback> callback)
{
	REQUIRE_UI_THREAD();

	CEFDownloadItemValues values;

	values.bIsValid = download_item->IsValid();
	values.bIsInProgress = download_item->IsInProgress();
	values.bIsComplete = download_item->IsComplete();
	values.bIsCanceled = download_item->IsCanceled();
	values.nProgress = download_item->GetPercentComplete();
	values.nSpeed = download_item->GetCurrentSpeed();
	values.nReceived = download_item->GetReceivedBytes();
	values.nTotal = download_item->GetTotalBytes();

	CString szDispo = download_item->GetContentDisposition().c_str();

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// send message
	::SendMessage(hWindow, WM_APP_CEF_DOWNLOAD_UPDATE, (WPARAM)&values, NULL);
}

/*void ClientHandler::OnLoadStart(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame)
{
	REQUIRE_UI_THREAD();

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// send message
	::SendMessage(hWindow, WM_APP_CEF_LOAD_START, NULL, NULL);

	// call parent
	CefLoadHandler::OnLoadStart(browser, frame);
}*/

void ClientHandler::OnLoadEnd(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int httpStatusCode)
{
	REQUIRE_UI_THREAD();

	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// send message
	::SendMessage(hWindow, WM_APP_CEF_LOAD_END, httpStatusCode, NULL);

	// call parent
	CefLoadHandler::OnLoadEnd(browser, frame, httpStatusCode);
}

void ClientHandler::OnLoadError(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, ErrorCode errorCode, const CefString& errorText, const CefString& failedUrl)
{
	REQUIRE_UI_THREAD();

	// net_error_list.h NAME_NOT_RESOLVED -105
	if (errorCode == -105)
	{
		// The frame window will be the parent of the browser window
		HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

		LPCTSTR pszSearch(failedUrl.c_str());
		::SendMessage(hWindow, WM_APP_CEF_SEARCH_URL, (WPARAM)pszSearch, NULL);
	}

	// call parent
	CefLoadHandler::OnLoadError(browser, frame, errorCode, errorText, failedUrl);
}

bool ClientHandler::GetAuthCredentials(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, bool isProxy, const CefString& host, int port, const CefString& realm, const CefString& scheme, CefRefPtr<CefAuthCallback> callback)
{
	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	CEFAuthenticationValues values;
	values.lpszHost = host.c_str();
	values.lpszRealm = realm.c_str();
	_tcscpy_s(values.szUserName, _T(""));
	_tcscpy_s(values.szUserPass, _T(""));

	// send info
	if (::SendMessage(hWindow, WM_APP_CEF_AUTHENTICATE, (WPARAM)&values, (LPARAM)NULL) == S_OK)
	{
		callback->Continue(values.szUserName, values.szUserPass);
		return TRUE;
	}
	// canceled
	return FALSE;
}

CefRefPtr<CefResourceHandler> ClientHandler::GetResourceHandler(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefRequest> request)
{
	return NULL;
}

bool ClientHandler::OnQuotaRequest(CefRefPtr<CefBrowser> browser, const CefString& origin_url, int64 new_size, CefRefPtr<CefRequestCallback> callback)
{
	static const int64 max_size = 1024 * 1024 * 20;  // 20mb.

	// Grant the quota request if the size is reasonable.
	callback->Continue(new_size <= max_size);

	// call parent
	return CefRequestHandler::OnQuotaRequest(browser, origin_url, new_size, callback);
}

bool ClientHandler::OnCertificateError(CefRefPtr<CefBrowser> browser, ErrorCode cert_error, const CefString& request_url, CefRefPtr<CefSSLInfo> ssl_info, CefRefPtr<CefRequestCallback> callback)
{
	CString szMessage;

	// no file, or empty, show the default
	if (szMessage.IsEmpty()) {
		szMessage.Format(_T("The site's security certificate is not trusted!\n\n You attempted to reach \"%s\""), request_url.c_str());

		szMessage += _T("but the server presented a certificate issued by an entity that is not trusted by your computer's operating system.");
		szMessage += _T("This may mean that the server has generated its own security credentials, ");
		szMessage += _T("which Chrome cannot rely on for identity information, or an attacker may be ");
		szMessage += _T("trying to intercept your communications.\n\n");
		szMessage += _T("You should not proceed, especially if you have never seen this warning before for this site.");
	}

	if (MessageBox(NULL, szMessage, _T("The site's security certificate is not trusted:"), MB_YESNO) == IDNO)
		return FALSE;

	// continue
	callback->Continue(true);

	return TRUE;
}

void ClientHandler::OnProtocolExecution(CefRefPtr<CefBrowser> browser, const CefString& url, bool& allow_os_execution)
{
	// do default
	CefRequestHandler::OnProtocolExecution(browser, url, allow_os_execution);
}

bool ClientHandler::OnBeforeBrowse(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefRequest> request, bool is_redirect)
{
	// The frame window will be the parent of the browser window
	HWND hWindow = GetParent(browser->GetHost()->GetWindowHandle());

	// get URL requested
	CefString newURL = request->GetURL();

	LPCTSTR pszURL(newURL.c_str());
	if (::SendMessage(hWindow, WM_APP_CEF_BEFORE_BROWSE, (WPARAM)pszURL, (LPARAM)is_redirect) == S_FALSE) {
		// cancel navigation
		return TRUE;
	}

	// call parent
	return CefRequestHandler::OnBeforeBrowse(browser, frame, request, is_redirect);
}

// CefJSDialogHandler methods
bool ClientHandler::OnBeforeUnloadDialog(CefRefPtr< CefBrowser > browser, const CefString& message_text, bool is_reload, CefRefPtr< CefJSDialogCallback > callback)
{
	// do defulat
	return FALSE;
}

void ClientHandler::OnDialogClosed(CefRefPtr< CefBrowser > browser)
{
}

/*bool ClientHandler::OnJSDialog(CefRefPtr< CefBrowser > browser, const CefString& origin_url, const CefString& accept_lang, CefJSDialogHandler::JSDialogType dialog_type, const CefString& message_text, const CefString& default_prompt_text, CefRefPtr< CefJSDialogCallback > callback, bool& suppress_message)
{
	// do default
	suppress_message = FALSE;
	return FALSE;
}*/

void ClientHandler::OnResetDialogState(CefRefPtr< CefBrowser > browser)
{
}

std::string ClientHandler::GetDownloadPath(const std::string& file_name)
{
	TCHAR szFolderPath[MAX_PATH];
	std::string path;

	// Save the file in the user's "My Documents" folder.
	if (SUCCEEDED(SHGetFolderPath(NULL, CSIDL_PERSONAL | CSIDL_FLAG_CREATE,
		NULL, 0, szFolderPath))) {
		path = CefString(szFolderPath);
		path += "\\" + file_name;
	}

	return path;
}
