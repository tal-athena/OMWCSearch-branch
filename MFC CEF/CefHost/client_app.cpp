#include "StdAfx.h"
#include "client_app.h"

#include "client_util.h"

#include <Windows.h>
#include <winhttp.h>

ClientApp::ClientApp(void)
{
}

ClientApp::ClientApp(HWND hWnd)
{

}

ClientApp::~ClientApp(void)
{
}

void ClientApp::OnContextInitialized()
{
	REQUIRE_UI_THREAD()

		m_cefHandler = new ClientHandler();
}

BOOL ClientApp::CreateBrowser(HWND hWnd, CRect rect, LPCTSTR pszURL)
{
	// settings
	CefBrowserSettings settings;
	CefWindowInfo info;

	// set browser as child
	info.SetAsChild(hWnd, rect);

	// create browser window
	return CefBrowserHost::CreateBrowser(info, m_cefHandler.get(), pszURL, settings, NULL);
}

void ClientApp::ShowDevTools(CefRefPtr<CefBrowser> browser)
{
	m_cefHandler->ShowDevTools(browser);
}

void ClientApp::Reload(CefRefPtr<CefBrowser> browser)
{
	m_cefHandler->Reload(browser);
}

void ClientApp::OnBeforeCommandLineProcessing(const CefString& process_type, CefRefPtr<CefCommandLine> command_line)
{
	BOOL bAutoDetectProxy = TRUE;

	// force specific PAC file
	//command_line->AppendSwitchWithValue(CefString(_T("proxy-pac-url")), CefString(_T("file://d:/example.pac")));

	WINHTTP_CURRENT_USER_IE_PROXY_CONFIG config;
	ZeroMemory(&config, sizeof(WINHTTP_CURRENT_USER_IE_PROXY_CONFIG));
	if (WinHttpGetIEProxyConfigForCurrentUser(&config))
	{
		bool hasProxyScript = config.lpszAutoConfigUrl && _tcsclen(config.lpszAutoConfigUrl) > 0;
		bool hasProxy = config.lpszProxy && _tcsclen(config.lpszProxy) > 0;

		if (hasProxyScript)
		{
			command_line->AppendSwitchWithValue(CefString(_T("proxy-pac-url")), CefString(config.lpszAutoConfigUrl));
			bAutoDetectProxy = FALSE;
		}
		else if (hasProxy)
		{
			command_line->AppendSwitchWithValue(CefString(_T("proxy-server")), CefString(config.lpszProxy));
			bAutoDetectProxy = FALSE;
		}

		// Ask user
		/*CString strMessage;
		if (hasProxyScript)
			strMessage.Format(_T("Following proxy script specified by default:\n%s\n\nDo you wish to use it?\n\nClick 'No' to bypass the proxy"), config.lpszAutoConfigUrl);
		else if (hasProxy)
			strMessage.Format(_T("Following proxy is specified by default:\n%s\n\nDo you wish to use it?\n\nClick 'No' to bypass the proxy"), config.lpszProxy);

		if (!strMessage.IsEmpty())
		{
			int nResult = MessageBox(NULL, strMessage, _T("CEF"), MB_YESNO);
			if (nResult == IDYES)
			{
				if (hasProxyScript)
				{
					command_line->AppendSwitchWithValue(CefString(_T("proxy-pac-url")), CefString(config.lpszAutoConfigUrl));
					bAutoDetectProxy = FALSE;
				}
				else if (hasProxy)
				{
					command_line->AppendSwitchWithValue(CefString(_T("proxy-server")), CefString(config.lpszProxy));
					bAutoDetectProxy = FALSE;
				}
			}
		}*/
	}

	//no-proxy-server

	if (bAutoDetectProxy)
		command_line->AppendSwitch(CefString(_T("proxy-auto-detect")));
}