#pragma once

#include "client_app.h"
#include "HostIPC.h"

#using <mscorlib.dll>
#using <CefWebPluginHost.dll>

typedef struct _SHORTCUT_INFO
{
	int nVirtualKeyCode;
	BOOL bAlt;
	BOOL bControl;
	BOOL bShift;
} SHORTCUT_INFO;

// CCefTabCtrl

class AFX_CLASS_EXPORT CCefTabCtrl : public CTabCtrl, IpcCallbackHandler
{
	DECLARE_DYNAMIC(CCefTabCtrl)

public:
	CCefTabCtrl();
	virtual ~CCefTabCtrl();

public:
	BOOL Cef_InitHost(CWnd* pParentWnd, ClientApp* pClientApp, LPVOID pHostScripting);
	void Cef_DestroyHost(BOOL bWaitForThreads);
	void Cef_UpdateSize();
	
	BOOL Cef_CreateTab(LPCTSTR pszTitle, LPCTSTR pszURL, UINT nIconID);
	BOOL Cef_ExecuteJavaScript(LPCTSTR pszCode, UINT nTabIndex);
	BOOL Cef_NavigateActiveTab(LPCTSTR pszURL);
	BOOL Cef_ShowDevTools(UINT nTabIndex);
	BOOL Cef_Reload(UINT nTabIndex);
	BOOL Cef_ShowProxy(UINT nTabIndex);

	void Cef_NextTab();
	void Cef_PreviousTab();

	void Cef_InvokePromiseCallback(int nBrowserID, int nRequestID, BOOL bSucceeded, CString strJSON);

	void Cef_SetNextTabShortcut(UINT nVirtualKeyCode, BOOL bAlt, BOOL bControl, BOOL bShift);
	void Cef_SetPreviousTabShortcut(UINT nVirtualKeyCode, BOOL bAlt, BOOL bControl, BOOL bShift);

protected:
	void ShowActiveTab();

	virtual void OnIpcMessage(CefRefPtr<CefProcessMessage> message) OVERRIDE;
	// 17.05.2018 - called by ClientHandler to check if CCefTabCtrl onws the browser which sent IPC message
	virtual BOOL IsBrowserOwner(int nBrowserID) OVERRIDE;
	BOOL CreateCallbackThread(BOOL bIsRequest, int nRequestID, int nBrowserID, CString strJson);

protected:
	CefRefPtr<ClientApp> m_cefApp;
	CArray<CefRefPtr<CefBrowser>> m_browsers;

	CMap<DWORD, DWORD, LPVOID, LPVOID> m_threads;

	CImageList m_images;

	// 17.05.2018 - only keep managed reference to HostScripting, main application is responsible for releasing the unmanaged pointer
	gcroot<CefWebPluginHost::HostScripting^> m_hostScripting;

	int m_nContextMenuTabIndex;

	SHORTCUT_INFO m_nextTabShortcutInfo;
	SHORTCUT_INFO m_previousTabShortcutInfo;

protected:
	// Tab control notifications
	afx_msg void OnSelchangeTab(NMHDR* pNMHDR, LRESULT* pResult);

	// CEF notifications
	afx_msg LRESULT OnNewBrowser(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnCloseBrowser(WPARAM wParam, LPARAM lParam);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);

	afx_msg LRESULT OnCefInvokeCallback(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnIpcMessageGuiThread(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnThreadCompleted(WPARAM wParam, LPARAM lParam);
	// 17.05.2018 - to ensure thread safety IsBrowserOwner method sends a Win32 message
	afx_msg LRESULT OnIsBrowserOwnerGuiThread(WPARAM wParam, LPARAM lParam);
	afx_msg void OnNmRClick(NMHDR* pNMHDR, LRESULT* pResult);
	afx_msg void OnReload();
	afx_msg void OnShowDevTools();
	afx_msg void OnProxy();

	afx_msg LRESULT OnCefPreKeyEvent(WPARAM wParam, LPARAM lParam);

protected:
	DECLARE_MESSAGE_MAP()
};
