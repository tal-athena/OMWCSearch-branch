// CefHost.h : main header file for the CefHost DLL
//

#pragma once

#include "client_app.h"
#include "cefhost_lib.h"

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif

#include "resource.h"		// main symbols

// CCefHostApp
// See CefHost.cpp for the implementation of this class
//

AFX_API_EXPORT BOOL Cef_Init();
AFX_API_EXPORT void Cef_Shutdown();
AFX_API_EXPORT BOOL Cef_IsInitialized();
AFX_API_EXPORT ClientApp* Cef_GetWrapper();

class CCefHostApp : public CWinApp
{
public:
	CCefHostApp();

// Overrides
public:
	virtual BOOL InitInstance();

public:
	BOOL Cef_Init();
	void Cef_Shutdown();
	BOOL Cef_IsInitialized();
	ClientApp* Cef_GetWrapper();

protected:
	CefRefPtr<ClientApp> m_cefApp;
	BOOL m_bInitialized;

	DECLARE_MESSAGE_MAP()
};
