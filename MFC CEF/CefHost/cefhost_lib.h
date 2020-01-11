#pragma once

#ifndef CEFHOST_LIB
	#define CEFHOST_LIB
#endif

// Set to 0 to disable sandbox support.
#define CEF_ENABLE_SANDBOX 0
#if CEF_ENABLE_SANDBOX
// The cef_sandbox.lib static library is currently built with VS2010. It may not
// link successfully with other VS versions.
#pragma comment(lib, "cef_sandbox.lib")
#endif


#define WM_APP_CEF_LOAD_START		(WM_APP + 301)
#define WM_APP_CEF_LOAD_END			(WM_APP + 302)
#define WM_APP_CEF_TITLE_CHANGE		(WM_APP + 303)
#define WM_APP_CEF_ADDRESS_CHANGE	(WM_APP + 304)
#define WM_APP_CEF_STATE_CHANGE		(WM_APP + 305)
#define WM_APP_CEF_STATUS_MESSAGE	(WM_APP + 306)
#define WM_APP_CEF_NEW_WINDOW		(WM_APP + 310)
#define WM_APP_CEF_WINDOW_CHECK		(WM_APP + 311)
#define WM_APP_CEF_CLOSE_BROWSER	(WM_APP + 312)
#define WM_APP_CEF_NEW_BROWSER		(WM_APP + 315)
#define WM_APP_CEF_SEARCH_URL		(WM_APP + 325)
#define WM_APP_CEF_BEFORE_BROWSE	(WM_APP + 350)
#define WM_APP_CEF_DOWNLOAD_UPDATE	(WM_APP + 355)

#define WM_APP_CEF_AUTHENTICATE		(WM_APP + 370)
#define WM_APP_CEF_BAD_CERTIFICATE	(WM_APP + 371)

#define CEF_MENU_ID_OPEN_LINK		(MENU_ID_USER_FIRST + 100)
#define CEF_MENU_ID_OPEN_LINK_TAB	(MENU_ID_USER_FIRST + 101)
#define CEF_MENU_ID_OPEN_LINK_NEW	(MENU_ID_USER_FIRST + 102)

#define CEF_BIT_IS_LOADING			0x001
#define CEF_BIT_CAN_GO_BACK			0x002
#define CEF_BIT_CAN_GO_FORWARD		0x004

struct CEFAuthenticationValues
{
	LPCTSTR lpszHost;
	LPCTSTR lpszRealm;
	TCHAR szUserName[1024];
	TCHAR szUserPass[1024];
};

struct CEFDownloadItemValues
{
	BOOL bIsValid;
	BOOL bIsInProgress;
	BOOL bIsComplete;
	BOOL bIsCanceled;
	INT nProgress;
	LONGLONG nSpeed;
	LONGLONG nReceived;
	LONGLONG nTotal;
};
