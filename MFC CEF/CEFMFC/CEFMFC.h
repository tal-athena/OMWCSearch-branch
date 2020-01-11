
// CEFMFC.h : main header file for the CEFMFC application
//
#pragma once

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif

#include "resource.h"       // main symbols

// CCEFMFCApp:
// See CEFMFC.cpp for the implementation of this class
//

class CCEFMFCApp : public CWinAppEx
{
public:
	CCEFMFCApp();

// Overrides
public:
	virtual BOOL PumpMessage();
	virtual BOOL InitInstance();
	virtual int ExitInstance();

// Implementation

	virtual void PreLoadState();
	virtual void LoadCustomState();
	virtual void SaveCustomState();

	afx_msg void OnAppAbout();
	DECLARE_MESSAGE_MAP()

protected:
	CString m_szHomePage;
};

extern CCEFMFCApp theApp;
