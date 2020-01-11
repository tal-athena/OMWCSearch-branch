#pragma once

#include "stdafx.h"
#include <include/cef_app.h>
#include "client_handler.h"

class AFX_CLASS_EXPORT ClientApp: public CefApp,
	public CefBrowserProcessHandler,
	public CefClient
{
public:
	ClientApp(void);
	ClientApp(HWND hWnd);
	~ClientApp(void);

	// CefApp methods:
	virtual CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() OVERRIDE { return this; }

	virtual void OnBeforeCommandLineProcessing(const CefString& process_type, CefRefPtr<CefCommandLine> command_line) OVERRIDE;

	// CefBrowserProcessHandler methods:
	virtual void OnContextInitialized() OVERRIDE;

	BOOL CreateBrowser(HWND hWnd, CRect rect, LPCTSTR pszURL);
	void ShowDevTools(CefRefPtr<CefBrowser> browser);
	void Reload(CefRefPtr<CefBrowser> browser);

public:
	CefRefPtr<ClientHandler> m_cefHandler;
	CefRefPtr<CefV8Context> m_cefContext;

private:
	// Include the default reference counting implementation.
	IMPLEMENT_REFCOUNTING(ClientApp);
};
