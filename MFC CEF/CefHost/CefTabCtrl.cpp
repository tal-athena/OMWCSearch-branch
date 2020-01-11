// CefTabCtrl.cpp : implementation file
//

#include "stdafx.h"
#include "CefHost.h"
#include "CefTabCtrl.h"

#define WM_CEF_HOST_IPC_MESSAGE WM_USER + 1
#define WM_CEF_HOST_THREAD_COMPLETED WM_USER + 2
// 17.05.2018 - Win32 message to ensure thread safety when called from IPC handler
#define WM_CEF_HOST_IS_BROWSER_OWNER WM_USER + 3

#define HOST_REQUIRE_UI_THREAD() ASSERT(GetCurrentThreadId() == AfxGetApp()->m_nThreadID)

#define ID_TABCTRL 1007

#define ID_CMD_RELOAD 1000
#define ID_CMD_DEVTOOLS 1001
#define ID_CMD_PROXY 1002

typedef struct _CefCallbackThreadInfo
{
	DWORD dwThreadID;
	HANDLE hThread;
	HWND hTabCtrlWnd;

	gcroot<CefWebPluginHost::HostScripting^> pHostScripting;

	BOOL bIsRequest;
	int nRequestID;
	int nBrowserID;
	CString strJsonParam;

	BOOL bSucceeded;
	CString strJsonResult;
} CefCallbackThreadInfo;

DWORD WINAPI ThreadFunc(LPVOID lpThreadParameter)
{
	CefCallbackThreadInfo* pThreadInfo = (CefCallbackThreadInfo*)lpThreadParameter;

	//////////////////////////////////////////////////////////////////////////

	System::String^ strJsonResult;

	HWND hTabCtrlWnd = pThreadInfo->hTabCtrlWnd;

	if (pThreadInfo->bIsRequest)
	{
		pThreadInfo->bSucceeded = pThreadInfo->pHostScripting->onRequest(gcnew System::String(pThreadInfo->strJsonParam), OUT strJsonResult);
		pThreadInfo->strJsonResult = CString(strJsonResult);
	}
	else
	{
		pThreadInfo->pHostScripting->onNotify(gcnew System::String(pThreadInfo->strJsonParam), OUT strJsonResult);
	}

	::PostMessage(hTabCtrlWnd, WM_CEF_HOST_THREAD_COMPLETED, (WPARAM)pThreadInfo, NULL);

	return 0;
}

// CCefTabCtrl

IMPLEMENT_DYNAMIC(CCefTabCtrl, CTabCtrl)

CCefTabCtrl::CCefTabCtrl()
{
	m_nContextMenuTabIndex = -1;

	Cef_SetNextTabShortcut(VK_TAB, FALSE, TRUE, FALSE);
	Cef_SetPreviousTabShortcut(VK_TAB, FALSE, TRUE, TRUE);
}

CCefTabCtrl::~CCefTabCtrl()
{
	
}

BEGIN_MESSAGE_MAP(CCefTabCtrl, CTabCtrl)
	ON_WM_ERASEBKGND()
	ON_COMMAND(ID_CMD_RELOAD, &CCefTabCtrl::OnReload)
	ON_COMMAND(ID_CMD_DEVTOOLS, &CCefTabCtrl::OnShowDevTools)
	ON_COMMAND(ID_CMD_PROXY, &CCefTabCtrl::OnProxy)
	ON_NOTIFY_REFLECT(NM_RCLICK, &CCefTabCtrl::OnNmRClick)
	ON_NOTIFY_REFLECT(TCN_SELCHANGE, &CCefTabCtrl::OnSelchangeTab)
	ON_MESSAGE(WM_APP_CEF_CLOSE_BROWSER, &CCefTabCtrl::OnCloseBrowser)
	ON_MESSAGE(WM_APP_CEF_NEW_BROWSER, &CCefTabCtrl::OnNewBrowser)
	ON_MESSAGE(WM_CEF_HOST_IPC_MESSAGE, &CCefTabCtrl::OnIpcMessageGuiThread)
	ON_MESSAGE(WM_CEF_HOST_THREAD_COMPLETED, &CCefTabCtrl::OnThreadCompleted)
	ON_MESSAGE(WM_CEF_HOST_IS_BROWSER_OWNER, &CCefTabCtrl::OnIsBrowserOwnerGuiThread)
	ON_MESSAGE(WM_CEF_PRE_KEY_EVENT, &CCefTabCtrl::OnCefPreKeyEvent)
END_MESSAGE_MAP()

// CCefTabCtrl message handlers

BOOL CCefTabCtrl::Cef_InitHost(CWnd* pParentWnd, ClientApp* pClientApp, LPVOID pHostScripting)
{
	HOST_REQUIRE_UI_THREAD();

	if (GetSafeHwnd() != NULL)
		return FALSE;

	if (!pHostScripting)
		return FALSE;

	m_cefApp = pClientApp;
	m_cefApp->AddRef();

	System::IntPtr ptr = System::IntPtr(pHostScripting);
	System::Runtime::InteropServices::GCHandle handle = System::Runtime::InteropServices::GCHandle::FromIntPtr(ptr);

	m_hostScripting = (CefWebPluginHost::HostScripting^) handle.Target;

	// get rect
	CRect rect;
	pParentWnd->GetClientRect(&rect);

	BOOL bResult = Create(NULL, rect, pParentWnd, ID_TABCTRL);
	if (bResult)
	{
		ShowWindow(TRUE);

		if (m_images.Create(16, 16, ILC_COLOR24 | ILC_MASK, 0, 0))
			SetImageList(&m_images);
	}

	// 17.05.2018 - subscribe for IPC messages
	m_cefApp->m_cefHandler->RegisterIpcCallbackHandler(this);

	return bResult;
}

void CCefTabCtrl::Cef_DestroyHost(int nWaitForThreadsToExit)
{
	HOST_REQUIRE_UI_THREAD();

	if (GetSafeHwnd() == NULL)
		return;

	// 17.05.2018 - unsubscribe for IPC messages
	m_cefApp->m_cefHandler->UnregisterIpcCallbackHandler(this);

	//////////////////////////////////////////////////////////////////////////

	if (nWaitForThreadsToExit != 0 && !m_threads.IsEmpty())
	{
		HANDLE* pHandles = new HANDLE[m_threads.GetCount()];

		int i = 0;
		POSITION pos = m_threads.GetStartPosition();
		while (pos != NULL)
		{
			DWORD dwKey;
			LPVOID lpValue;

			m_threads.GetNextAssoc(pos, dwKey, lpValue);

			CefCallbackThreadInfo* pThreadInfo = (CefCallbackThreadInfo*) lpValue;

			pHandles[i] = pThreadInfo->hThread;

			i++;
		}

		WaitForMultipleObjects(m_threads.GetCount(), pHandles, TRUE, nWaitForThreadsToExit);

		delete pHandles;
	}

	//////////////////////////////////////////////////////////////////////////

	if (!m_threads.IsEmpty())
	{
		POSITION pos = m_threads.GetStartPosition();
		while (pos != NULL)
		{
			DWORD dwKey;
			LPVOID lpValue;

			m_threads.GetNextAssoc(pos, dwKey, lpValue);
			CefCallbackThreadInfo* pThreadInfo = (CefCallbackThreadInfo*)lpValue;
			delete pThreadInfo;
		}

		m_threads.RemoveAll();
	}

	//////////////////////////////////////////////////////////////////////////

	for (int i = 0; i < m_browsers.GetCount(); i++)
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[i];

		pBrowser->GetHost()->CloseBrowser(true);

		HWND hBrowser = pBrowser->GetHost()->GetWindowHandle();
		// destroy browser window
		::DestroyWindow(hBrowser);
	}

	m_browsers.RemoveAll();

	DestroyWindow();

	for (int i = m_images.GetImageCount() - 1; i >= 0; i--)
	{
		HICON hIcon = m_images.ExtractIcon(i);
		DestroyIcon(hIcon);

		m_images.Remove(i);
	}

	// 17.05.2018 - all cleanup moved to main window
}

BOOL CCefTabCtrl::Cef_CreateTab(LPCTSTR pszTitle, LPCTSTR pszURL, UINT nIconID)
{
	if (GetSafeHwnd() == NULL)
		return FALSE;

	HICON hIcon = AfxGetApp()->LoadIcon(MAKEINTRESOURCE(nIconID));
	int nImageIndex = m_images.Add(hIcon);

	TCITEM tcitem;
	ZeroMemory(&tcitem, sizeof(TCITEM));
	tcitem.mask = TCIF_TEXT | TCIF_IMAGE;
	tcitem.pszText = (LPTSTR) pszTitle;
	tcitem.iImage = nImageIndex;
	InsertItem(GetItemCount(), &tcitem);

	CRect rect;
	GetClientRect(&rect);

	rect.top += 25;
	rect.bottom -= 25;

	// set browser
	if (!m_cefApp->CreateBrowser(GetSafeHwnd(), rect, pszURL))
		return FALSE;

	return TRUE;
}

BOOL CCefTabCtrl::Cef_ExecuteJavaScript(LPCTSTR pszCode, UINT nTabIndex)
{
	if (nTabIndex >= 0 && nTabIndex < m_browsers.GetCount())
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[nTabIndex];
		CefString cefFunctionName = CefString(pszCode);
		CefString cefUrl = _T("");
		pBrowser->GetMainFrame()->ExecuteJavaScript(cefFunctionName, cefUrl, 0);
	}

	return FALSE;
}

BOOL CCefTabCtrl::Cef_NavigateActiveTab(LPCTSTR pszURL)
{
	if (GetSafeHwnd() == NULL)
		return FALSE;

	int nCurSel = GetCurSel();
	if (nCurSel >= 0 && nCurSel < m_browsers.GetCount())
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[nCurSel];
		pBrowser->GetMainFrame()->LoadURL(pszURL);

		// set focus to browser
		::SetFocus(pBrowser->GetHost()->GetWindowHandle());
		pBrowser->GetHost()->SetFocus(true);

		return TRUE;
	}

	return FALSE;
}

BOOL CCefTabCtrl::OnEraseBkgnd(CDC* pDC)
{
	CRect rc;
	GetClientRect(rc);

	CRect rcContent(rc);
	SendMessage(TCM_ADJUSTRECT, FALSE, (LPARAM)&rcContent);

	rc.top -= 5;
	rc.bottom = rcContent.top + 5;

	pDC->FillSolidRect(rc, RGB(255, 255, 255));

	return TRUE;
}

void CCefTabCtrl::Cef_UpdateSize()
{
	if (GetSafeHwnd() == NULL)
		return;

	int nCurSel = GetCurSel();
	if (nCurSel >= 0 && nCurSel < m_browsers.GetCount())
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[nCurSel];
		CefWindowHandle hwnd = pBrowser->GetHost()->GetWindowHandle();
		if (hwnd)
		{
			CRect rect;
			GetParent()->GetClientRect(&rect);

			MoveWindow(rect);

			SendMessage(TCM_ADJUSTRECT, FALSE, (LPARAM) &rect);

			HDWP hdwp = BeginDeferWindowPos(1);
			hdwp = DeferWindowPos(hdwp, hwnd, NULL, rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top, SWP_NOZORDER);
			EndDeferWindowPos(hdwp);
		}
	}
}

void CCefTabCtrl::OnSelchangeTab(NMHDR* pNMHDR, LRESULT* pResult)
{
	ShowActiveTab();
}

void CCefTabCtrl::ShowActiveTab()
{
	int nCurSel = GetCurSel();
	for (int i = 0; i < m_browsers.GetCount(); i++)
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[nCurSel];
		CefRefPtr<CefBrowserHost> host = pBrowser->GetHost();
		HWND hBrowser = host->GetWindowHandle();
		if (i == nCurSel)
		{
			// set focus to browser
			::SetFocus(hBrowser);
			pBrowser->GetHost()->SetFocus(true);

			::SetWindowPos(hBrowser, HWND_TOP, 0, 0, 0, 0, SWP_SHOWWINDOW | SWP_NOMOVE | SWP_NOSIZE);
			::RedrawWindow(hBrowser, NULL, 0, RDW_FRAME | RDW_INVALIDATE | RDW_ALLCHILDREN);
		}
		else
		{
			CRect r;
			::MoveWindow(hBrowser, 0, 0, 0, 0, TRUE);
			::GetWindowRect(hBrowser, r);
			r.bottom += 1;
		}
	}

	Cef_UpdateSize();
}

LRESULT CCefTabCtrl::OnNewBrowser(WPARAM wParam, LPARAM lParam)
{
	// get URL
	INT nBrowserID = (INT)wParam;
	CefBrowser* browser = (CefBrowser*)lParam;

	CefRefPtr<CefBrowser> pBrowser(browser);
	// set new browser
	m_browsers.Add(pBrowser);

	SetCurSel(GetItemCount() - 1);
	ShowActiveTab();

	//////////////////////////////////////////////////////////////////////////

	return S_OK;
}

LRESULT CCefTabCtrl::OnCloseBrowser(WPARAM wParam, LPARAM lParam)
{
	INT nBrowserID = (INT)wParam;

	for (int i = 0; i < m_browsers.GetCount(); i++)
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[i];
		INT nID = pBrowser->GetIdentifier();
		if (nID == nBrowserID)
		{
			m_browsers.RemoveAt(i);

			break;
		}
	}

	return S_OK;
}

LRESULT CCefTabCtrl::OnIpcMessageGuiThread(WPARAM wParam, LPARAM lParam)
{
	HOST_REQUIRE_UI_THREAD();

	CefCallbackThreadInfo* pInfo = (CefCallbackThreadInfo*) wParam;

	if (pInfo->bIsRequest)
	{
		MessageBox(_T("Received request in C++, running thread..."), MSG_INVOKE_NATIVE_NOTIFICATION, NULL);

		if (!CreateCallbackThread(TRUE, pInfo->nRequestID, pInfo->nBrowserID, pInfo->strJsonParam))
			Cef_InvokePromiseCallback(pInfo->nRequestID, pInfo->nBrowserID, FALSE, CString(_T("{ \"error\": \"Failed to create thread. Make sure HostScripting object is set\" }")));
	}
	else
	{
		MessageBox(_T("Received notification in C++, passing to C#..."), MSG_INVOKE_NATIVE_NOTIFICATION, NULL);

		CreateCallbackThread(FALSE, 0, pInfo->nBrowserID, pInfo->strJsonParam);
	}

	delete pInfo;

	return 0;
}

void CCefTabCtrl::OnIpcMessage(CefRefPtr<CefProcessMessage> message)
{
	if (CefString(MSG_INVOKE_NATIVE_NOTIFICATION).compare(message->GetName()) == 0)
	{
		CefRefPtr<CefListValue> arguments = message->GetArgumentList();
		if (arguments.get()->GetSize() >= 1)
		{
			int nBrowserID = arguments->GetInt(0);

			CefString strJson;
			if (arguments->GetSize() >= 2)
				strJson = arguments->GetString(1);

			CefCallbackThreadInfo* pInfo = new CefCallbackThreadInfo();
			pInfo->bIsRequest = FALSE;
			pInfo->nBrowserID = nBrowserID;
			pInfo->strJsonParam = strJson.c_str();

			PostMessage(WM_CEF_HOST_IPC_MESSAGE, (WPARAM)pInfo, NULL);
		}
	}
	else if (CefString(MSG_INVOKE_NATIVE_REQUEST).compare(message->GetName()) == 0)
	{
		CefRefPtr<CefListValue> arguments = message->GetArgumentList();
		if (arguments.get()->GetSize() >= 2)
		{
			int nRequestID = arguments->GetInt(0);
			int nBrowserID = arguments->GetInt(1);

			CefString strJson;
			if (arguments->GetSize() >= 3)
				strJson = arguments->GetString(2);

			CefCallbackThreadInfo* pInfo = new CefCallbackThreadInfo();
			pInfo->bIsRequest = TRUE;
			pInfo->nRequestID = nRequestID;
			pInfo->nBrowserID = nBrowserID;
			pInfo->strJsonParam = strJson.c_str();

			PostMessage(WM_CEF_HOST_IPC_MESSAGE, (WPARAM)pInfo, NULL);
		}
	}
}

// 17.05.2018
LRESULT CCefTabCtrl::OnIsBrowserOwnerGuiThread(WPARAM wParam, LPARAM lParam)
{
	HOST_REQUIRE_UI_THREAD();

	int nBrowserID = (int)wParam;

	for (int i = 0; i < m_browsers.GetCount(); i++)
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[i];
		if (pBrowser->GetIdentifier() == nBrowserID)
			return TRUE;
	}

	return FALSE;
}

// 17.05.2018
BOOL CCefTabCtrl::IsBrowserOwner(int nBrowserID)
{
	return (BOOL)SendMessage(WM_CEF_HOST_IS_BROWSER_OWNER, nBrowserID);
}

BOOL CCefTabCtrl::CreateCallbackThread(BOOL bIsRequest, int nRequestID, int nBrowserID, CString strJson)
{
	HOST_REQUIRE_UI_THREAD();

	if (m_hostScripting.operator->() != nullptr)
	{
		CefCallbackThreadInfo* pThreadInfo = new CefCallbackThreadInfo();
		pThreadInfo->pHostScripting = m_hostScripting;
		pThreadInfo->bIsRequest = bIsRequest;
		pThreadInfo->hTabCtrlWnd = GetSafeHwnd();
		pThreadInfo->nRequestID = nRequestID;
		pThreadInfo->nBrowserID = nBrowserID;
		pThreadInfo->strJsonParam = strJson;

		pThreadInfo->hThread = CreateThread(NULL, 0, ThreadFunc, pThreadInfo, CREATE_SUSPENDED, &pThreadInfo->dwThreadID);
		if (pThreadInfo->hThread)
		{
			m_threads.SetAt(pThreadInfo->dwThreadID, pThreadInfo);
			ResumeThread(pThreadInfo->hThread);

			return TRUE;
		}
	}

	return FALSE;
}

LRESULT CCefTabCtrl::OnThreadCompleted(WPARAM wParam, LPARAM lParam)
{
	HOST_REQUIRE_UI_THREAD();

	//////////////////////////////////////////////////////////////////////////

	if (wParam)
	{
		CefCallbackThreadInfo* pThreadInfo = (CefCallbackThreadInfo*)wParam;

		if (pThreadInfo->bIsRequest)
			Cef_InvokePromiseCallback(pThreadInfo->nRequestID, pThreadInfo->nBrowserID, pThreadInfo->bSucceeded, pThreadInfo->strJsonResult);

		//////////////////////////////////////////////////////////////////////////

		LPVOID pLookup;
		if (m_threads.Lookup(pThreadInfo->dwThreadID, pLookup))
		{
			m_threads.RemoveKey(pThreadInfo->dwThreadID);
			delete pThreadInfo;
		}
	}

	return 0;
}

void CCefTabCtrl::Cef_InvokePromiseCallback(int nRequestID, int nBrowserID, BOOL bSucceeded, CString strJSON)
{
	for (int i = 0; i < m_browsers.GetCount(); i++)
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[i];
		if (pBrowser->GetIdentifier() == nBrowserID)
		{
			CefRefPtr<CefProcessMessage> msg = CefProcessMessage::Create(MSG_INVOKE_PROMISE_CALLBACK);
			CefRefPtr<CefListValue> arguments = msg->GetArgumentList();
			arguments->SetInt(0, nRequestID);
			arguments->SetInt(1, nBrowserID);
			arguments->SetBool(2, bSucceeded ? true : false);
			arguments->SetString(3, CefString(strJSON));

			pBrowser->SendProcessMessage(PID_RENDERER, msg);

			break;
		}
	}
}

BOOL CCefTabCtrl::Cef_Reload(UINT nTabIndex)
{
	HOST_REQUIRE_UI_THREAD();

	if (nTabIndex >= 0 && nTabIndex < m_browsers.GetCount())
	{
		m_cefApp->Reload(m_browsers[nTabIndex]);
	}

	return FALSE;
}

BOOL CCefTabCtrl::Cef_ShowDevTools(UINT nTabIndex)
{
	HOST_REQUIRE_UI_THREAD();

	if (nTabIndex >= 0 && nTabIndex < m_browsers.GetCount())
	{
		m_cefApp->ShowDevTools(m_browsers[nTabIndex]);
	}

	return FALSE;
}

BOOL CCefTabCtrl::Cef_ShowProxy(UINT nTabIndex)
{
	HOST_REQUIRE_UI_THREAD();

	if (nTabIndex >= 0 && nTabIndex < m_browsers.GetCount())
	{
		CefRefPtr<CefBrowser> pBrowser = m_browsers[nTabIndex];
		pBrowser->GetMainFrame()->LoadURL(_T("chrome://net-internals/#proxy"));

		// set focus to browser
		::SetFocus(pBrowser->GetHost()->GetWindowHandle());
		pBrowser->GetHost()->SetFocus(true);
	}

	return FALSE;
}

void CCefTabCtrl::OnReload()
{
	Cef_Reload(m_nContextMenuTabIndex);

	m_nContextMenuTabIndex = -1;
}

void CCefTabCtrl::OnShowDevTools()
{
	Cef_ShowDevTools(m_nContextMenuTabIndex);

	m_nContextMenuTabIndex = -1;
}

void CCefTabCtrl::OnProxy()
{
	Cef_ShowProxy(m_nContextMenuTabIndex);

	m_nContextMenuTabIndex = -1;
}

void CCefTabCtrl::OnNmRClick(NMHDR* pNMHDR, LRESULT* pResult)
{
	*pResult = 0;

	m_nContextMenuTabIndex = -1;

	if (GetItemCount() == 0)
		return;

	CPoint point = GetMessagePos();
	ScreenToClient(&point);

	CRect rc;
	for (int i = 0; i < GetItemCount(); i++)
	{
		GetItemRect(i, rc);
		if (rc.PtInRect(point))
		{
			CMenu menu;
			if (menu.CreatePopupMenu())
			{
				m_nContextMenuTabIndex = i;

				menu.AppendMenu(MF_STRING, ID_CMD_RELOAD, _T("Refresh"));
				menu.AppendMenu(MF_STRING, ID_CMD_DEVTOOLS, _T("Show Dev Tools"));
				menu.AppendMenu(MF_STRING, ID_CMD_PROXY, _T("Show Proxy Info"));

				ClientToScreen(&point);
				menu.TrackPopupMenu(TPM_LEFTALIGN | TPM_RIGHTBUTTON, point.x, point.y, this);
			}

			break;
		}
		
	}
}

LRESULT CCefTabCtrl::OnCefPreKeyEvent(WPARAM wParam, LPARAM lParam)
{
	BOOL bAlt = (BOOL) lParam;
	BOOL bControl = GetKeyState(VK_CONTROL) & 0x8000 ? TRUE : FALSE;
	BOOL bShift = GetKeyState(VK_SHIFT) & 0x8000 ? TRUE : FALSE;

	if (wParam == m_nextTabShortcutInfo.nVirtualKeyCode)
	{
		if ((m_nextTabShortcutInfo.bAlt == bAlt) && (m_nextTabShortcutInfo.bControl == bControl) && (m_nextTabShortcutInfo.bShift == bShift))
		{
			Cef_NextTab();
			return 1;
		}
	}

	if (wParam == m_previousTabShortcutInfo.nVirtualKeyCode)
	{
		if ((m_previousTabShortcutInfo.bAlt == bAlt) && (m_previousTabShortcutInfo.bControl == bControl) && (m_previousTabShortcutInfo.bShift == bShift))
		{
			Cef_PreviousTab();
			return 1;
		}
	}

	return 0;
}

void CCefTabCtrl::Cef_NextTab()
{
	int nCount = GetItemCount();
	if (nCount > 1)
	{
		int nCurSel = GetCurSel();
		if (nCurSel + 1 > nCount - 1)
			nCurSel = 0;
		else
			nCurSel++;

		SetCurSel(nCurSel);

		ShowActiveTab();
	}
}

void CCefTabCtrl::Cef_PreviousTab()
{
	int nCount = GetItemCount();
	if (nCount > 1)
	{
		int nCurSel = GetCurSel();
		if (nCurSel - 1 < 0)
			nCurSel = nCount - 1;
		else
			nCurSel--;

		SetCurSel(nCurSel);

		ShowActiveTab();
	}
}

void CCefTabCtrl::Cef_SetNextTabShortcut(UINT nVirtualKeyCode, BOOL bAlt, BOOL bControl, BOOL bShift)
{
	m_nextTabShortcutInfo.nVirtualKeyCode = nVirtualKeyCode;
	m_nextTabShortcutInfo.bAlt = bAlt;
	m_nextTabShortcutInfo.bControl = bControl;
	m_nextTabShortcutInfo.bShift = bShift;
}

void CCefTabCtrl::Cef_SetPreviousTabShortcut(UINT nVirtualKeyCode, BOOL bAlt, BOOL bControl, BOOL bShift)
{
	m_previousTabShortcutInfo.nVirtualKeyCode = nVirtualKeyCode;
	m_previousTabShortcutInfo.bAlt = bAlt;
	m_previousTabShortcutInfo.bControl = bControl;
	m_previousTabShortcutInfo.bShift = bShift;
}