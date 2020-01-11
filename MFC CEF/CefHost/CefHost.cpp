// CefHost.cpp : Defines the initialization routines for the DLL.
//

#include "stdafx.h"
#include "CefHost.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

//
//TODO: If this DLL is dynamically linked against the MFC DLLs,
//		any functions exported from this DLL which call into
//		MFC must have the AFX_MANAGE_STATE macro added at the
//		very beginning of the function.
//
//		For example:
//
//		extern "C" BOOL PASCAL EXPORT ExportedFunction()
//		{
//			AFX_MANAGE_STATE(AfxGetStaticModuleState());
//			// normal function body here
//		}
//
//		It is very important that this macro appear in each
//		function, prior to any calls into MFC.  This means that
//		it must appear as the first statement within the 
//		function, even before any object variable declarations
//		as their constructors may generate calls into the MFC
//		DLL.
//
//		Please see MFC Technical Notes 33 and 58 for additional
//		details.
//

// CCefHostApp

BEGIN_MESSAGE_MAP(CCefHostApp, CWinApp)
END_MESSAGE_MAP()


// CCefHostApp construction

CCefHostApp::CCefHostApp()
{
	// TODO: add construction code here,
	// Place all significant initialization in InitInstance
}


// The one and only CCefHostApp object

CCefHostApp theApp;

BOOL Cef_Init()
{
	return theApp.Cef_Init();
}

void Cef_Shutdown()
{
	return theApp.Cef_Shutdown();
}

BOOL Cef_IsInitialized()
{
	return theApp.Cef_IsInitialized();
}

ClientApp* Cef_GetWrapper()
{
	return theApp.Cef_GetWrapper();
}

// CCefHostApp initialization

BOOL CCefHostApp::InitInstance()
{
	CWinApp::InitInstance();

	m_bInitialized = FALSE;

	return TRUE;
}

BOOL CCefHostApp::Cef_Init()
{
	if (m_bInitialized)
		return TRUE;

	// initialize CEF.
	m_cefApp = new ClientApp();

	// get arguments
	CefMainArgs main_args(GetModuleHandle(NULL));

	// Execute the secondary process, if any.
	int exit_code = CefExecuteProcess(main_args, m_cefApp.get(), NULL);
	if (exit_code >= 0)
		return exit_code;

	// setup settings
	CString szCEFCache;
	
	CString strCachePath;
	GetModuleFileName(NULL, strCachePath.GetBuffer(MAX_PATH), MAX_PATH);
	strCachePath.ReleaseBuffer();

	int nPos = strCachePath.ReverseFind(_T('\\'));
	if (nPos >= 0)
		strCachePath = strCachePath.Left(nPos);

	strCachePath += _T("\\cache");

	// set settings
	CefSettings settings;

	//settings.single_process = TRUE;
	settings.multi_threaded_message_loop = TRUE;
	CefString(&settings.cache_path) = strCachePath;
	CefString(&settings.browser_subprocess_path) = _T("CefSubprocess.exe");

	void* sandbox_info = NULL;
#if CEF_ENABLE_SANDBOX
	// Manage the life span of the sandbox information object. This is necessary
	// for sandbox support on Windows. See cef_sandbox_win.h for complete details.
	CefScopedSandboxInfo scoped_sandbox;
	sandbox_info = scoped_sandbox.sandbox_info();
#else
	settings.no_sandbox = TRUE;
#endif

		//CEF Initialized
	m_bInitialized = CefInitialize(main_args, settings, m_cefApp.get(), sandbox_info);

	return m_bInitialized;
}

void CCefHostApp::Cef_Shutdown()
{
	// shutdown CEF
	if (m_bInitialized) {
		// closing stop work loop
		m_bInitialized = FALSE;

		// clean up CEF loop
		//CefDoMessageLoopWork();
		// shutdown CEF
		CefShutdown();
	}
}

BOOL CCefHostApp::Cef_IsInitialized()
{
	return m_bInitialized;
}

ClientApp* CCefHostApp::Cef_GetWrapper()
{
	return m_cefApp.get();
}