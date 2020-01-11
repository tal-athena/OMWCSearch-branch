
// MainFrm.cpp : implementation of the CThreeWaySplitterFrame class
//

#include "stdafx.h"
#include "CEFMFC.h"

#include "ThreeWaySplitterFrame.h"
#include "CEFMFCDoc.h"
#include "CEFMFCView.h"

// 17.05.2018 - The function HostScriptingToPtr is no longer convenient
//				File Interop.h can be deleted
//#include "../CefHost/Interop.h"
#include "../CefHost/CefTabCtrl.h"

#include <wininet.h>

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

using namespace System;
using namespace System::Runtime::InteropServices;
using namespace CefWebPluginHost;

// CThreeWaySplitterFrame

IMPLEMENT_DYNCREATE(CThreeWaySplitterFrame, CFrameWndEx)

const int  iMaxUserToolbars = 10;
const UINT uiFirstUserToolBarId = AFX_IDW_CONTROLBAR_FIRST + 40;
const UINT uiLastUserToolBarId = uiFirstUserToolBarId + iMaxUserToolbars - 1;

BEGIN_MESSAGE_MAP(CThreeWaySplitterFrame, CFrameWndEx)
	ON_WM_SIZING()
	ON_WM_SIZE()
	ON_WM_CREATE()
	ON_WM_PAINT()
	ON_WM_ERASEBKGND()
	ON_WM_LBUTTONDOWN()
	ON_WM_LBUTTONUP()
	ON_WM_LBUTTONDBLCLK()
	ON_WM_MOUSEMOVE()
	ON_WM_DESTROY()
	ON_COMMAND(ID_VIEW_CUSTOMIZE, &CThreeWaySplitterFrame::OnViewCustomize)
	ON_REGISTERED_MESSAGE(AFX_WM_CREATETOOLBAR, &CThreeWaySplitterFrame::OnToolbarCreateNew)
	ON_COMMAND(ID_ADDRESS_BOX, &CThreeWaySplitterFrame::OnAddressEnter)
	ON_COMMAND(IDOK, &CThreeWaySplitterFrame::OnAddressEnter)
	// 17.05.2018 - Message from View to main window to obtain HostScripting pointer
	ON_MESSAGE(WM_USER + 100, &CThreeWaySplitterFrame::OnGetHostScriptingUnmanagedPtr)
END_MESSAGE_MAP()

static UINT indicators[] =
{
	ID_SEPARATOR,           // status line indicator
	ID_INDICATOR_CAPS,
	ID_INDICATOR_NUM,
	ID_INDICATOR_SCRL,
};

// CThreeWaySplitterFrame construction/destruction

CThreeWaySplitterFrame::CThreeWaySplitterFrame()
{
	//CCefHost cefHost;

	m_fSplitter1 = (float)0.23;
	m_fSplitter2 = (float)0.37;

	m_hCursorToDestroy = NULL;
	m_SeparatorTracking = SEP_NONE;
	m_rcOldTracking = CRect(0, 0, 0, 0);

	m_Separators[SEP_VERT].Orientation(SEP_VERT);
	m_Separators[SEP_VERT].SetColor(::GetSysColor(COLOR_SCROLLBAR));
	m_Separators[SEP_HORZ].Orientation(SEP_HORZ);
	m_Separators[SEP_HORZ].SetColor(::GetSysColor(COLOR_SCROLLBAR));
}

CThreeWaySplitterFrame::~CThreeWaySplitterFrame()
{
}

void CThreeWaySplitterFrame::OnSizing(UINT fwSide, LPRECT pRect)
{
	CFrameWndEx::OnSizing(fwSide, pRect);

	CRect rc;
	GetClientRect(rc);
	m_wndSize = rc.Size();

	RecalcLayout();

	CCEFMFCView* pView = (CCEFMFCView*)GetActiveView();
	if (pView)
		pView->UpdateSize();

	//RedrawWindow();
}

void CThreeWaySplitterFrame::OnSize(UINT nType, int cx, int cy)
{
	CFrameWnd::OnSize(nType, cx, cy);

	CRect rc;
	GetClientRect(rc);
	m_wndSize = rc.Size();

	RecalcLayout();

	CCEFMFCView* pView = (CCEFMFCView*)GetActiveView();
	if (pView)
		pView->UpdateSize();

	//RedrawWindow();
}

BOOL CThreeWaySplitterFrame::PreCreateWindow(CREATESTRUCT& cs)
{
	return CFrameWndEx::PreCreateWindow(cs);
}

int CThreeWaySplitterFrame::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (CFrameWndEx::OnCreate(lpCreateStruct) == -1)
		return -1;

	BOOL bNameValid;

	// disable menu
	SetMenu(NULL);

	// set the visual manager used to draw all user interface elements
	CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerWindows7));

	// prevent loading from registry for secondary windows
	GetDockingManager()->DisableRestoreDockState();

	// set sizes
	CMFCToolBar::SetSizes(CSize(40, 40), CSize(32, 32));
	CMFCToolBar::SetMenuSizes(CSize(22, 22), CSize(16, 16));

	CMFCToolBar::m_bMultiThreaded = TRUE;
	CMFCToolBar::m_bDontScaleImages = TRUE;


	if (!m_wndReBar.Create(this, RBS_BANDBORDERS, WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS | WS_CLIPCHILDREN | CBRS_TOP, AFX_IDW_REBAR)) {
		TRACE0("Failed to create rebar\n");
		return -1;      // fail to create
	}

	//if (!m_wndMenuBar.Create(this))
	//{
	//	TRACE0("Failed to create menubar\n");
	//	return -1;      // fail to create
	//}

	//m_wndMenuBar.SetPaneStyle(m_wndMenuBar.GetPaneStyle() | CBRS_SIZE_DYNAMIC | CBRS_TOOLTIPS | CBRS_FLYBY);

	// prevent the menu bar from taking the focus on activation
	//CMFCPopupMenu::SetForceMenuFocus(FALSE);


	if (!m_wndToolBar.CreateEx(this, TBSTYLE_FLAT, WS_CHILD | WS_VISIBLE | CBRS_TOP | CBRS_GRIPPER | CBRS_TOOLTIPS | CBRS_FLYBY | CBRS_SIZE_DYNAMIC) || !m_wndToolBar.LoadToolBar(IDR_MAINFRAME)) {
		TRACE0("Failed to create toolbar\n");
		return -1;      // fail to create
	}

	// rebar variables
	REBARBANDINFO rbbi;
	CSize sizeBar;
	DWORD dwStyle = 0;

	// add bar to rebar
	if (!m_wndReBar.AddBar(&m_wndToolBar, NULL, NULL, dwStyle)) {
		TRACE0("Failed to add Navbar\n");
		return -1;      // fail to create
	}

	// get sizes
	sizeBar = m_wndToolBar.CalcSize(FALSE);
	// reset rbbi
	memset(&rbbi, NULL, sizeof(REBARBANDINFO));

	// adjust rebar
	//rbbi.cbSize = sizeof(rbbi);
	rbbi.cbSize = m_wndReBar.GetReBarBandInfoSize();
	rbbi.fMask = RBBIM_CHILDSIZE | RBBIM_IDEALSIZE | RBBIM_SIZE | RBBIM_ID;
	rbbi.cxMinChild = sizeBar.cx;
	rbbi.cyMinChild = sizeBar.cy;
	rbbi.cx = rbbi.cxIdeal = sizeBar.cx + 30;
	rbbi.wID = IDR_MAINFRAME;
	m_wndReBar.GetReBarCtrl().SetBandInfo(0, &rbbi);

	CString strToolBarName;
	bNameValid = strToolBarName.LoadString(IDS_TOOLBAR_STANDARD);
	ASSERT(bNameValid);
	m_wndToolBar.SetWindowText(strToolBarName);

	CString strCustomize;
	bNameValid = strCustomize.LoadString(IDS_TOOLBAR_CUSTOMIZE);
	ASSERT(bNameValid);
	m_wndToolBar.EnableCustomizeButton(TRUE, ID_VIEW_CUSTOMIZE, strCustomize);


	// Create a combo box for the address bar:
	bNameValid = FALSE;
	CString strAddressLabel;
	bNameValid = strAddressLabel.LoadString(IDS_ADDRESS);
	ASSERT(bNameValid);
	if (!m_wndAddress.Create(CBS_DROPDOWN | WS_CHILD, CRect(0, 0, 400, 120), this, ID_ADDRESS_BOX)) {
		TRACE0("Failed to create combobox\n");
		return -1;      // fail to create
	}

	// add home page
	m_wndAddress.AddString(_T("https://www.google.com"));

	// set height
	m_wndAddress.SetHeight(20);

	// rebar style
	dwStyle = RBBS_FIXEDBMP | RBBS_BREAK | RBBS_GRIPPERALWAYS;

	// add bar to rebar
	if (!m_wndReBar.AddBar(&m_wndAddress, NULL, NULL, dwStyle)) {
		TRACE0("Failed to create rebar\n");
		return -1;      // fail to create
	}

	// adjust rebar
	CRect rectAddress;
	m_wndAddress.GetEditCtrl()->GetWindowRect(&rectAddress);

	// reset rbbi
	memset(&rbbi, NULL, sizeof(REBARBANDINFO));

	// adjust rebar
	//rbbi.cbSize = sizeof(rbbi);
	rbbi.cbSize = m_wndReBar.GetReBarBandInfoSize();
	rbbi.fMask = RBBIM_CHILDSIZE | RBBIM_IDEALSIZE | RBBIM_SIZE | RBBIM_ID;
	rbbi.cyMinChild = rectAddress.Height() + 12;
	rbbi.cxIdeal = 400;
	rbbi.cx = 400;
	rbbi.wID = ID_ADDRESS_BOX;
	m_wndReBar.GetReBarCtrl().SetBandInfo(1, &rbbi);


	/*if (!m_wndStatusBar.Create(this)) {
		TRACE0("Failed to create status bar\n");
		return -1;      // fail to create
	}
	m_wndStatusBar.SetIndicators(indicators, sizeof(indicators) / sizeof(UINT));*/

	// TODO: Delete these five lines if you don't want the toolbar and menubar to be dockable
	m_wndToolBar.EnableDocking(CBRS_ALIGN_ANY);
	EnableDocking(CBRS_ALIGN_ANY);

	DockPane(&m_wndReBar);

	// enable Visual Studio 2005 style docking window behavior
	CDockingManager::SetDockingMode(DT_SMART);
	// enable Visual Studio 2005 style docking window auto-hide behavior
	EnableAutoHidePanes(CBRS_ALIGN_ANY);

	// Enable toolbar and docking window menu replacement
	EnablePaneMenu(TRUE, ID_VIEW_CUSTOMIZE, strCustomize, ID_VIEW_TOOLBAR);

	// enable quick (Alt+drag) toolbar customization
	CMFCToolBar::EnableQuickCustomization();

	// enable menu personalization (most-recently used commands)
	// TODO: define your own basic commands, ensuring that each pulldown menu has at least one basic command.
	CList<UINT, UINT> lstBasicCommands;

	lstBasicCommands.AddTail(ID_FILE_PRINT);
	lstBasicCommands.AddTail(ID_APP_EXIT);
	lstBasicCommands.AddTail(ID_EDIT_CUT);
	lstBasicCommands.AddTail(ID_EDIT_PASTE);
	lstBasicCommands.AddTail(ID_APP_ABOUT);
	lstBasicCommands.AddTail(ID_VIEW_STATUS_BAR);
	lstBasicCommands.AddTail(ID_VIEW_TOOLBAR);

	CMFCToolBar::SetBasicCommands(lstBasicCommands);

	// 17.05.2018 - Init host object and callbacks
	InitHostScripting();

	return 0;
}

// 17.05.2018 - Moved from CCEFMFCView.cpp
System::String^ CallbackFuncDelegate(System::String^ json)
{
	CString strJson(json);

	CString strMessage = _T("HostScripting callback invoked, sleeping 2 seconds... JSON param:\n") + strJson;

	MessageBox(NULL, strMessage, _T("HostScripting"), NULL);

	Sleep(2000);

	return gcnew System::String(_T("{ \"key\": \"value\" }"));
}

// 17.05.2018 - Moved from CCEFMFCView.cpp and Interop.h
void CThreeWaySplitterFrame::InitHostScripting()
{
	// Create HostScripting object
	m_hostScripting = gcnew CefWebPluginHost::HostScripting();

	// Allocate unmanaged handle to HostScripting object
	System::Runtime::InteropServices::GCHandle handleHostScripting = System::Runtime::InteropServices::GCHandle::Alloc(m_hostScripting);
	m_handleHostScripting = handleHostScripting;

	// Save unmanaged pointer to later pass it to new CCefTabCtrl instances
	System::IntPtr pointer = System::Runtime::InteropServices::GCHandle::ToIntPtr(handleHostScripting);
	m_hostScriptingUnmanagedPtr = pointer.ToPointer();

	//////////////////////////////////////////////////////////////////////////

	// Create callback delegate
	CefWebPluginHost::HostScripting::CallbackFuncDelegate^ callback = gcnew CefWebPluginHost::HostScripting::CallbackFuncDelegate(CallbackFuncDelegate);
	
	// Allocate unmanaged handle to HostScripting object
	m_handleCallback = GCHandle::Alloc(callback);

	// Get unmanaged pointer to delegate
	IntPtr callbackPtr = Marshal::GetFunctionPointerForDelegate(callback);

	// Pass unmanaged pointer
	m_hostScripting->SetCallbacks(callbackPtr, callbackPtr);
}

// 17.05.2018 - Returns HostScripting unmanaged pointer
LRESULT CThreeWaySplitterFrame::OnGetHostScriptingUnmanagedPtr(WPARAM wParam, LPARAM lParam)
{
	return (LRESULT) m_hostScriptingUnmanagedPtr;
}

// 17.05.2018 - Copied from CCEFMFCView.cpp
CString CThreeWaySplitterFrame::GetTestPageURL()
{
	CString strPath;
	GetModuleFileName(NULL, strPath.GetBuffer(MAX_PATH), MAX_PATH);
	strPath.ReleaseBuffer();

	int nPos = strPath.ReverseFind(_T('\\'));
	if (nPos >= 0)
		strPath = strPath.Left(nPos);

	strPath += _T("\\test.htm");

	return strPath;
}

BOOL CThreeWaySplitterFrame::CreatePanes()
{
	CCEFMFCView* pView = (CCEFMFCView*)GetActiveView();

	CRect rc;
	GetClientArea(&rc);

	CRect rcPane1;
	CRect rcPane2;

	rcPane1.SetRect(rc.left, rc.top, rc.left + rc.Width() / 2, rc.bottom);
	rcPane2.SetRect(rc.left + rc.Width() / 2, rc.top, rc.right, rc.bottom);

	//////////////////////////////////////////////////////////////////////////

	// 17.05.2018 - Just pass the HostScripting pointer to CCefTabCtrl
	m_paneTop.Cef_InitHost(this, Cef_GetWrapper(), m_hostScriptingUnmanagedPtr);
	m_paneTop.Cef_CreateTab(_T("Tab 1"), GetTestPageURL(), IDR_MAINFRAME);

	m_Panes[PANE_1].CreatePane(this, PANE_1, &m_paneTop);
	m_Panes[PANE_1].InUse(TRUE);

	m_Panes[PANE_2].CreatePane(this, PANE_2, pView);
	m_Panes[PANE_2].InUse(TRUE);

	//////////////////////////////////////////////////////////////////////////

	m_Separators[SEP_HORZ].PositionRatio(m_fSplitter1);
	m_Separators[SEP_VERT].PositionRatio(m_fSplitter2);

	m_Separators[SEP_HORZ].InUse(TRUE);
	m_Separators[SEP_VERT].InUse(TRUE);

	//////////////////////////////////////////////////////////////////////////

	RecalcLayout(TRUE);

	return TRUE;
}

void CThreeWaySplitterFrame::GetClientArea(CRect* pRect)
{
	CRect rc;

	if (m_wndSize.cx == 0 && m_wndSize.cy == 0)
		GetClientRect(pRect);
	else 
		pRect->SetRect(0, 0, m_wndSize.cx, m_wndSize.cy);

	m_wndReBar.GetWindowRect(rc);
	pRect->top += rc.Height();

	//m_wndStatusBar.GetWindowRect(rc);
	//pRect->bottom -= rc.Height();
}

// CThreeWaySplitterFrame diagnostics

#ifdef _DEBUG
void CThreeWaySplitterFrame::AssertValid() const
{
	CFrameWndEx::AssertValid();
}

void CThreeWaySplitterFrame::Dump(CDumpContext& dc) const
{
	CFrameWndEx::Dump(dc);
}
#endif //_DEBUG


// CThreeWaySplitterFrame message handlers

void CThreeWaySplitterFrame::OnViewCustomize()
{
	CMFCToolBarsCustomizeDialog* pDlgCust = new CMFCToolBarsCustomizeDialog(this, TRUE /* scan menus */);
	pDlgCust->EnableUserDefinedToolbars();
	pDlgCust->Create();
}

LRESULT CThreeWaySplitterFrame::OnToolbarCreateNew(WPARAM wp, LPARAM lp)
{
	LRESULT lres = CFrameWndEx::OnToolbarCreateNew(wp, lp);
	if (lres == 0) {
		return 0;
	}

	CMFCToolBar* pUserToolbar = (CMFCToolBar*)lres;
	ASSERT_VALID(pUserToolbar);

	BOOL bNameValid;
	CString strCustomize;
	bNameValid = strCustomize.LoadString(IDS_TOOLBAR_CUSTOMIZE);
	ASSERT(bNameValid);

	pUserToolbar->EnableCustomizeButton(TRUE, ID_VIEW_CUSTOMIZE, strCustomize);
	return lres;
}

BOOL CThreeWaySplitterFrame::LoadFrame(UINT nIDResource, DWORD dwDefaultStyle, CWnd* pParentWnd, CCreateContext* pContext)
{
	// base class does the real work

	if (!CFrameWndEx::LoadFrame(nIDResource, dwDefaultStyle, pParentWnd, pContext)) {
		return FALSE;
	}

	// enable customization button for all user toolbars
	BOOL bNameValid;
	CString strCustomize;
	bNameValid = strCustomize.LoadString(IDS_TOOLBAR_CUSTOMIZE);
	ASSERT(bNameValid);

	for (int i = 0; i < iMaxUserToolbars; i++) {
		CMFCToolBar* pUserToolbar = GetUserToolBarByIndex(i);
		if (pUserToolbar != NULL) {
			pUserToolbar->EnableCustomizeButton(TRUE, ID_VIEW_CUSTOMIZE, strCustomize);
		}
	}

	return TRUE;
}


void CThreeWaySplitterFrame::OnAddressEnter()
{
	// address bar disabled
	if (!m_wndAddress)
		return;

	CString szURL;
	m_wndAddress.GetEditCtrl()->GetWindowText(szURL);

	if (szURL.IsEmpty())
		return;

	CView* pActiveView = GetActiveView();
	if (!pActiveView)
		return;

	CCEFMFCView* pView = (CCEFMFCView*)GetActiveView();
	if (pView) {
		// navigate to URL
		pView->Navigate(szURL);

		// add it
		if (m_wndAddress.FindString(szURL) == CB_ERR)
			m_wndAddress.AddString(szURL);
	}
}


void CThreeWaySplitterFrame::SetAddress(LPCTSTR lpszUrl)
{
	// address bar disabled
	if (!m_wndAddress)
		return;

	// set title
	m_wndAddress.GetEditCtrl()->SetWindowText(lpszUrl);
}


void CThreeWaySplitterFrame::SetWindowTitle(LPCTSTR lpszTitle)
{
	// set title
	SetWindowText(lpszTitle);
}


void CThreeWaySplitterFrame::SetStatusIndicator(LPCTSTR lpszStatus)
{
	// set text
	//m_wndStatusBar.SetPaneText(0, lpszStatus);
}


void CThreeWaySplitterFrame::ShowToolBar(BOOL bShow)
{
	//Show or hide tool bar
	if (m_wndReBar) {
		if (bShow)
			m_wndReBar.ShowWindow(SW_SHOWNORMAL);
		else
			m_wndReBar.ShowWindow(SW_HIDE);
	}
}


void CThreeWaySplitterFrame::ShowStatusBar(BOOL bShow)
{
	//Show or hide tool bar
	/*if (m_wndStatusBar) {
		if (bShow)
			m_wndStatusBar.ShowWindow(SW_SHOWNORMAL);
		else
			m_wndStatusBar.ShowWindow(SW_HIDE);
	}*/
}


void CThreeWaySplitterFrame::ShowAddressBar(BOOL bShow)
{
	//Show or hide address bar
	if (m_wndReBar)
		m_wndReBar.GetReBarCtrl().ShowBand(m_wndReBar.GetReBarCtrl().IDToIndex(ID_ADDRESS_BOX), bShow);
}


void CThreeWaySplitterFrame::SetFrameWidth(LONG nWidth)
{
	if (nWidth >= 0) {
		// get border sizes
		INT nOther = 0;
		nOther = 2 * GetSystemMetrics(SM_CXSIZEFRAME);
		nOther += GetSystemMetrics(SM_CXHSCROLL);

		// set window size
		CRect rectFrame;
		GetWindowRect(rectFrame);
		CSize size = rectFrame.Size();
		SetWindowPos(NULL, 0, 0, nWidth + nOther, size.cy, SWP_NOZORDER | SWP_NOMOVE | SWP_NOACTIVATE);
	}
}


void CThreeWaySplitterFrame::SetFrameHeight(LONG nHeight)
{
	if (nHeight >= 0) {
		CRect rectFrame;
		CRect rectToolBar;
		CRect rectStatusBar;
		INT nOther = 0;

		// get rebar and status bar height
		if (m_wndReBar)
			if (m_wndReBar.IsWindowVisible()) {
				m_wndReBar.GetWindowRect(rectToolBar);
				nOther += rectToolBar.Height();
			}

		/*if (m_wndStatusBar)
			if (m_wndStatusBar.IsWindowVisible()) {
				m_wndStatusBar.GetWindowRect(rectStatusBar);
				nOther += rectStatusBar.Height();
			}*/

		// get caption height
		nOther += GetSystemMetrics(SM_CYCAPTION);
		// get border sizes
		nOther += 2 * GetSystemMetrics(SM_CYSIZEFRAME);

		GetWindowRect(rectFrame);
		CSize size = rectFrame.Size();

		SetWindowPos(NULL, 0, 0, size.cx, nHeight + nOther, SWP_NOZORDER | SWP_NOMOVE | SWP_NOACTIVATE);
	}
}


void CThreeWaySplitterFrame::SetFrameTop(LONG nTop)
{
	// fix for pop-ups
	if (nTop == 9999)
		return;

	if (nTop >= 0) {
		CRect rectFrame;
		GetWindowRect(rectFrame);
		SetWindowPos(NULL, rectFrame.left, nTop, 0, 0, SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE);
	}
}


void CThreeWaySplitterFrame::SetFrameLeft(LONG nLeft)
{
	// fix for pop-ups
	if (nLeft == 9999)
		return;

	if (nLeft >= 0) {
		CRect rectFrame;
		GetWindowRect(rectFrame);
		SetWindowPos(NULL, nLeft, rectFrame.top, 0, 0, SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE);
	}
}

//////////////////////////////////////////////////////////////////////////
// From production app

/*BOOL CThreeWaySplitterFrame::OnCreateClient
(
	LPCREATESTRUCT lpcs,
	CCreateContext* pContext
)
{
	// indicates whether the client has created a pane window
	// (if the client does not need to create a window for the
	//  given pane, bDone will be FALSE)
	// indicates whether the window creation was successful; (the
	// implementor of OnCreatePaneWindow() is encouraged to use the
	// macro PANE_CREATE_SET_SUCCESS to set the success code!)
	CWnd *pWnd = NULL;
	BOOL bDone = FALSE;
	BOOL bSuccess = CFrameWndEx::OnCreateClient(lpcs, pContext);

	/*if (bSuccess && (pWnd = (CWnd*)new CCefHost())
	{
		m_Panes[PANE_1].CreatePane(this, PANE_1, pWnd);
		bDone = TRUE;
	}

	if (bSuccess && (pWnd = (CWnd*)new CCefHost()))
	{
		// The second pane has a minimum width of 120, (not any more AG 07.05.2014)
		m_Panes[PANE_2].CreatePane(this, PANE_2, pWnd);
		bDone = TRUE;
	}

	if (bSuccess && (pWnd = (CWnd*)(CWnd*)new CCefHost()))
	{
		// The third pane has a minimum width of 120, (not any more AG 07.05.2014)
		m_Panes[PANE_3].CreatePane(this, PANE_3, pWnd);
		bDone = TRUE;
	}

	ASSERT(bSuccess);

	if (bSuccess && bDone)
	{
		CRect rcClient;
		GetClientRect(&rcClient);
		m_Separators[SEP_HORZ].PositionRatio(m_fSplitter1);
		m_Separators[SEP_VERT].PositionRatio(m_fSplitter2);

		m_Panes[PANE_1].InUse();
		m_Panes[PANE_2].InUse();
		m_Panes[PANE_3].InUse();

		//SendMessage(WM_NW_INITIALISE_PANES);
		RecalcLayout(FALSE);
	}
	return (bDone && bSuccess);
}*/

/*-----------------------------------------------------------------------------

@mfunc	OnPaint.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::OnPaint()
{
	CPaintDC dc(this);

	CRect rc;
	GetClientArea(&rc);
	::FillRect(dc.GetSafeHdc(), rc, (HBRUSH) ::GetStockObject(WHITE_BRUSH));

	m_Separators[SEP_HORZ].Draw(&dc);
	m_Separators[SEP_VERT].Draw(&dc);

	Default();
}

/*-----------------------------------------------------------------------------

@mfunc	OnSize.

-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------

@mfunc	OnLButtonDown.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::OnLButtonDown
(
	UINT nFlags,
	CPoint point
)
{
	if (m_Separators[SEP_HORZ].HitTest(point))
	{
		CRect rcHorzBoundingRect = m_Separators[SEP_HORZ].BoundingRect();
		if (ValidateMode1TrackerPosition(SEP_HORZ, rcHorzBoundingRect))
		{
			m_SeparatorTracking = SEP_HORZ;
			SetCapture();
		}
	}
	else if (m_Separators[SEP_VERT].HitTest(point))
	{
		CRect rcVertBoundingRect = m_Separators[SEP_VERT].BoundingRect();
		if (ValidateMode1TrackerPosition(SEP_VERT, rcVertBoundingRect))
		{
			m_SeparatorTracking = SEP_VERT;
			SetCapture();
		}
	}
}

/*-----------------------------------------------------------------------------

@mfunc	OnLButtonUp.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::OnLButtonUp
(
	UINT nFlags,
	CPoint point
)
{
	if (m_SeparatorTracking != SEP_NONE)
	{
		ReleaseCapture();

		if (!m_rcOldTracking.IsRectNull())
		{
			OnInvertSeparator(m_rcOldTracking);
			point.y = m_rcOldTracking.top;
			point.x = m_rcOldTracking.left;

			CRect rcClient = GetTWSRect();

			if (m_SeparatorTracking == SEP_HORZ)
			{
				m_fSplitter1 = (1.0 / rcClient.Height()) * (point.y - rcClient.top);
				// let's look if someone dragged the separator to a border
				if (m_fSplitter1 == 0.0)
				{
					// in this case we just hide the top pane
					ShowPane(FALSE, PANE_1);
				}
				else
				{
					m_Separators[SEP_HORZ].PositionRatio(m_fSplitter1);
					if (!m_Panes[PANE_1].InUse())
						ShowPane(TRUE, PANE_1);
				}
				OnChangeRatio(SEP_HORZ);
			}
			else if (m_SeparatorTracking == SEP_VERT)
			{
				m_fSplitter2 = (1.0 / rcClient.Width()) * point.x;
				// let's look if someone dragged the separator to a border
				if (m_fSplitter2 == 0.0)
				{
					// in this case we just hide the pane
					ShowPane(FALSE, PANE_2);
				}
				else if (m_fSplitter2 == 1.0)
				{
					// same for the right side
					ShowPane(FALSE, PANE_3);
				}
				else
				{
					m_Separators[SEP_VERT].PositionRatio(m_fSplitter2);
					if (!m_Panes[PANE_2].InUse())
						ShowPane(TRUE, PANE_2);
					if (!m_Panes[PANE_3].InUse())
						ShowPane(TRUE, PANE_3);
				}
				OnChangeRatio(SEP_VERT);
			}
			m_SeparatorTracking = SEP_NONE;
			m_rcOldTracking = CRect(0, 0, 0, 0);

			RecalcLayout(TRUE);
			Invalidate();
		}

		m_SeparatorTracking = SEP_NONE;
	}
}

/*-----------------------------------------------------------------------------

@mfunc	OnMouseMove.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::OnMouseMove
(
	UINT nFlags,
	CPoint point
)
{
	if (m_SeparatorTracking == SEP_NONE)
	{
		HCURSOR hCur = NULL;
		if (m_Separators[SEP_HORZ].HitTest(point))
			hCur = SplitterCursor(SEP_HORZ);
		else if (m_Separators[SEP_VERT].HitTest(point))
			hCur = SplitterCursor(SEP_VERT);

		if (hCur != NULL)
		{
			if (::GetCursor() != hCur)
				::SetCursor(hCur);

			if (m_hCursorToDestroy && (hCur != m_hCursorToDestroy))
				::DestroyCursor(m_hCursorToDestroy);

			m_hCursorToDestroy = hCur;
		}
		else if (m_hCursorToDestroy != NULL)
		{
			HCURSOR hOldCursor = ::SetCursor(::LoadCursor(NULL, IDC_ARROW));
			::DestroyCursor(m_hCursorToDestroy);
			m_hCursorToDestroy = NULL;
		}
	}
	else
	{
		if (!m_rcOldTracking.IsRectNull())
			OnInvertSeparator(m_rcOldTracking);

		if (m_SeparatorTracking == SEP_HORZ)
		{
			m_rcOldTracking = m_Separators[SEP_HORZ].BoundingRect();
			m_rcOldTracking.top = point.y - SEP_BORDER / 2;
			m_rcOldTracking.bottom = m_rcOldTracking.top + SEP_BORDER;

			ValidateMode1TrackerPosition(SEP_HORZ, m_rcOldTracking);
			OnInvertSeparator(m_rcOldTracking);
			/************************
			CRect rcClient = GetTWSRect();

			if (m_SeparatorTracking == SEP_HORZ)
			m_Separators[SEP_HORZ].PositionRatio((1.0 / rcClient.Height()) * (point.y - rcClient.top));
			else if (m_SeparatorTracking == SEP_VERT)
			m_Separators[SEP_VERT].PositionRatio((1.0 / rcClient.Width()) * point.x);

			m_fSplitter1=(float)m_Separators[SEP_HORZ].PositionRatio();
			m_fSplitter2=(float)m_Separators[SEP_VERT].PositionRatio();

			RecalcLayout(FALSE);
			Invalidate();
			***************************/
		}
		else if (m_SeparatorTracking == SEP_VERT)
		{
			m_rcOldTracking = m_Separators[SEP_VERT].BoundingRect();
			m_rcOldTracking.left = point.x - SEP_BORDER / 2;
			m_rcOldTracking.right = m_rcOldTracking.left + SEP_BORDER;

			ValidateMode1TrackerPosition(SEP_VERT, m_rcOldTracking);
			OnInvertSeparator(m_rcOldTracking);

		}
	}
}

void CThreeWaySplitterFrame::OnLButtonDblClk(UINT nFlags, CPoint point)
{
	if (m_Separators[SEP_HORZ].HitTest(point))
	{
		if (m_Separators[SEP_HORZ].AllowHide() != PANE_0)
		{
			ShowPane(!m_Panes[m_Separators[SEP_HORZ].AllowHide()].InUse(), m_Separators[SEP_HORZ].AllowHide());
			OnChangeRatio(SEP_HORZ);
			RecalcLayout(TRUE);
			Invalidate();
		}
	}
	else if (m_Separators[SEP_VERT].HitTest(point))
	{
		if (m_Separators[SEP_VERT].AllowHide() != PANE_0)
		{
			ShowPane(!m_Panes[m_Separators[SEP_VERT].AllowHide()].InUse(), m_Separators[SEP_VERT].AllowHide());
			OnChangeRatio(SEP_VERT);
			RecalcLayout(TRUE);
			Invalidate();
		}
	}
	CFrameWnd::OnLButtonDblClk(nFlags, point);
}



/*-----------------------------------------------------------------------------

@mfunc	SplitterCursor.

-----------------------------------------------------------------------------*/
HCURSOR CThreeWaySplitterFrame::SplitterCursor
(
	SEPARATOR Sep
)
{
	HCURSOR hCur;
	if (Sep == SEP_HORZ)
	{
		HINSTANCE hInst = AfxFindResourceHandle(MAKEINTRESOURCE(AFX_IDC_VSPLITBAR), RT_GROUP_CURSOR);
		hCur = ::LoadCursor(hInst, MAKEINTRESOURCE(AFX_IDC_VSPLITBAR));
	}
	else
	{
		HINSTANCE hInst = AfxFindResourceHandle(MAKEINTRESOURCE(AFX_IDC_HSPLITBAR), RT_GROUP_CURSOR);
		hCur = ::LoadCursor(hInst, MAKEINTRESOURCE(AFX_IDC_HSPLITBAR));
	}

	return hCur;
}

/*-----------------------------------------------------------------------------

@mfunc	OnEraseBkgnd.

-----------------------------------------------------------------------------*/
BOOL CThreeWaySplitterFrame::OnEraseBkgnd
(
	CDC* pDC
)
{
	return TRUE;
}

/*-----------------------------------------------------------------------------

@mfunc	Recalculates the splitter layout.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::RecalcLayout
(
	BOOL bNotify
)
{
	// call the base class to reposition all control bars
	CFrameWnd::RecalcLayout(bNotify);

	// determine the sizes of the windows based on which are visible
	// and where the separator bars are.
	BOOL bPanesDisplayed = m_Panes[PANE_1].InUse() ||
		m_Panes[PANE_2].InUse() ||
		m_Panes[PANE_3].InUse();

	if (bPanesDisplayed)
	{
		HDWP hDefer = ::BeginDeferWindowPos(3);

		// Calculate the pane layout
		// NB. Only one layout configuration available at the moment
		CRect rcPane1, rcPane2, rcPane3;
		RecalcMode2Layout(rcPane1, rcPane2, rcPane3);

		// Move the views associated with each pane if they are in use
		if (m_Panes[PANE_1].InUse())
			hDefer = DeferWindowPos(hDefer, m_Panes[PANE_1].View()->m_hWnd,
				NULL, rcPane1.left, rcPane1.top,
				rcPane1.Width(), rcPane1.Height(),
				SWP_NOACTIVATE | SWP_NOZORDER | SWP_SHOWWINDOW);

		if (m_Panes[PANE_2].InUse())
			hDefer = DeferWindowPos(hDefer, m_Panes[PANE_2].View()->m_hWnd,
				NULL, rcPane2.left, rcPane2.top,
				rcPane2.Width(), rcPane2.Height(),
				SWP_NOACTIVATE | SWP_NOZORDER | SWP_SHOWWINDOW);

		if (m_Panes[PANE_3].InUse())
			hDefer = DeferWindowPos(hDefer, m_Panes[PANE_3].View()->m_hWnd,
				NULL, rcPane3.left, rcPane3.top,
				rcPane3.Width(), rcPane3.Height(),
				SWP_NOACTIVATE | SWP_NOZORDER | SWP_SHOWWINDOW);

		::EndDeferWindowPos(hDefer);
	}
}

/*-----------------------------------------------------------------------------

@mfunc	ValidateMode1TrackerPosition.

-----------------------------------------------------------------------------*/
BOOL CThreeWaySplitterFrame::ValidateMode1TrackerPosition
(
	SEPARATOR Sep,
	CRect& rcTracker
)
{
	BOOL	bValid = FALSE;

	CRect rcClient = GetTWSRect();

	if (Sep == SEP_HORZ)
	{
		// See if an increase in the height of the top pane is required
		// to enforce its minimal size
		int nMinimumTopHeight = m_Panes[PANE_1].Minimum().cy;
		int nSuggestedTopHeight = rcTracker.top - rcClient.top;
		int nAdjustMentDown = 0;
		if (nSuggestedTopHeight < nMinimumTopHeight)
			nAdjustMentDown = nMinimumTopHeight - nSuggestedTopHeight;

		// See if an increase in the height of the bottom pane is required
		// to enforce its minimal size
		int nMinimumBottomHeight = m_Panes[PANE_2].Minimum().cy;
		int nSuggestedBottomHeight = rcClient.bottom - rcTracker.bottom;
		int nAdjustMentUp = 0;
		if (nSuggestedBottomHeight < nMinimumBottomHeight)
			nAdjustMentUp = nMinimumBottomHeight - nSuggestedBottomHeight;

		// only make the sum adjustment if it does not invalidate the minimal
		// sizes of either pane
		int nSumAdjustment = nAdjustMentDown - nAdjustMentUp;
		if (((rcTracker.top + nSumAdjustment) - rcClient.top >= nMinimumTopHeight) &&
			(rcClient.bottom - (nSumAdjustment + rcTracker.bottom) >= nMinimumBottomHeight))
		{
			rcTracker.top += nSumAdjustment;
			rcTracker.bottom += nSumAdjustment;
			bValid = TRUE;
		}
	}
	else if (Sep == SEP_VERT)
	{
		// See if an increase in the width of the left panes is required
		// to enforce its minimal size
		int nMinimumLeftWidth = m_Panes[PANE_1].Minimum().cx;
		if (m_Panes[PANE_2].Minimum().cx > nMinimumLeftWidth)
			nMinimumLeftWidth = m_Panes[PANE_2].Minimum().cx;

		int nSuggestedLeftWidth = rcTracker.left - rcClient.left;
		int nAdjustMentRight = 0;
		if (nSuggestedLeftWidth < nMinimumLeftWidth)
			nAdjustMentRight = nMinimumLeftWidth - nSuggestedLeftWidth;

		// See if an increase in the width of the right pane is required
		// to enforce its minimal size
		int nMinimumRightWidth = m_Panes[PANE_3].Minimum().cx;
		int nSuggestedRightWidth = rcClient.right - rcTracker.right;
		int nAdjustmentLeft = 0;
		if (nSuggestedRightWidth < nMinimumRightWidth)
			nAdjustmentLeft = nMinimumRightWidth - nSuggestedRightWidth;

		// only make the sum adjustment if it does not invalidate the minimal
		// sizes of either pane
		int nSumAdjustment = nAdjustMentRight - nAdjustmentLeft;
		if (((rcTracker.left + nSumAdjustment) - rcClient.left >= nMinimumLeftWidth) &&
			(rcClient.right - (nSumAdjustment + rcTracker.right) >= nMinimumRightWidth))
		{
			rcTracker.left += nSumAdjustment;
			rcTracker.right += nSumAdjustment;
			bValid = TRUE;
		}
	}

	return bValid;
}

/*-----------------------------------------------------------------------------

@mfunc	RecalcMode1Layout.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::RecalcMode1Layout
(
	CRect& rcPane1,
	CRect& rcPane2,
	CRect& rcPane3
)
{
	ASSERT(FALSE);
	// initially set all panes equal to the client area, they will
	// be adjusted as the function progresses
	CRect rcClient;
	GetClientRect(rcClient);
	rcPane3 = rcPane2 = rcPane1 = rcClient;

	// initially set both separators equal to the client area, they will
	// be adjusted as the function progresses
	CRect rcHorzSep, rcVertSep;
	rcHorzSep = rcVertSep = rcClient;

	// if the horizontal separator is in use adjust the heights of pane
	// 1 and 2 and set the position of the separator based on its position
	// ratio from the top of the client area
	BOOL bHorzSepInUse = m_Panes[PANE_1].InUse() && m_Panes[PANE_2].InUse();
	m_Separators[SEP_HORZ].InUse(bHorzSepInUse);
	if (bHorzSepInUse)
	{
		double PosRatio = m_Separators[SEP_HORZ].PositionRatio();

		rcHorzSep.top = (long)(PosRatio * rcClient.Height());
		rcHorzSep.bottom = rcHorzSep.top + SEP_BORDER;

		if (rcHorzSep.bottom > rcClient.bottom)
		{
			int nOutOfScreenAdjustment = rcClient.bottom - rcHorzSep.bottom;
			rcHorzSep.top += nOutOfScreenAdjustment;
			rcHorzSep.bottom += nOutOfScreenAdjustment;
		}

		rcPane1.bottom = rcHorzSep.top;
		rcPane2.top = rcHorzSep.bottom;
	}

	// if the vertical separator is in use adjust the right extents of
	// pane 1 and 2, the left extent of pane 3 and set the position of
	// the vertical separator based on its position ratio from the left
	// of the client area
	BOOL bVertSepInUse = m_Panes[PANE_3].InUse();
	m_Separators[SEP_VERT].InUse(bVertSepInUse);
	if (m_Separators[SEP_VERT].InUse())
	{
		double PosRatio = m_Separators[SEP_VERT].PositionRatio();
		rcVertSep.left = (long)(PosRatio * rcClient.Width());
		rcVertSep.right = rcVertSep.left + SEP_BORDER;

		if (rcVertSep.right > rcClient.right)
		{
			int nOutOfScreenAdjustment = rcClient.right - rcVertSep.right;
			rcVertSep.left += nOutOfScreenAdjustment;
			rcVertSep.right += nOutOfScreenAdjustment;
		}

		rcHorzSep.right = rcVertSep.left;

		rcPane1.right = rcVertSep.left;
		rcPane2.right = rcVertSep.left;
		rcPane3.left = rcVertSep.right;
	}

	// adjust the ends of the separators so that they do not look too defined
	// where they meet each other and the sides of the frame.
	rcHorzSep.InflateRect(1, 0);
	m_Separators[SEP_HORZ].BoundingRect(rcHorzSep);

	rcVertSep.InflateRect(0, 1);
	m_Separators[SEP_VERT].BoundingRect(rcVertSep);
}

/*-----------------------------------------------------------------------------

@mfunc	RecalcMode2Layout.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::RecalcMode2Layout
(
	CRect& rcPane1,
	CRect& rcPane2,
	CRect& rcPane3
)
{
	CRect rcClient = GetTWSRect();

	// initially set all panes equal to the client area, they will
	// be adjusted as the function progresses
	rcPane3 = rcPane2 = rcPane1 = rcClient;

	// initially set both separators equal to the client area, they will
	// be adjusted as the function progresses
	CRect rcHorzSep, rcVertSep;
	rcHorzSep = rcVertSep = rcClient;

	// if the vertical separator is in use adjust the widths of pane
	// 2 and 3 and set the position of the separator based on its position
	// ratio from the left of the client area
	BOOL bVertSepInUse = m_Panes[PANE_2].InUse() && m_Panes[PANE_3].InUse();
	m_Separators[SEP_VERT].InUse(bVertSepInUse);
	if (bVertSepInUse)
	{
		double PosRatio = m_Separators[SEP_VERT].PositionRatio();
		rcVertSep.left = (long)(PosRatio * rcClient.Width());
		rcVertSep.right = rcVertSep.left + SEP_BORDER;

		if (rcVertSep.right > rcClient.right)
		{
			int nOutOfScreenAdjustment = rcClient.right - rcVertSep.right;
			rcVertSep.left += nOutOfScreenAdjustment;
			rcVertSep.right += nOutOfScreenAdjustment;
		}

		rcPane2.right = rcVertSep.left;
		rcPane3.left = rcVertSep.right;
	}
	else
	{
		if ((m_Separators[SEP_VERT].AllowHide() == PANE_2 || m_Separators[SEP_VERT].AllowHide() == PANE_3) &&
			!m_Panes[PANE_2].InUse() && m_Panes[PANE_2].View() != NULL)
		{
			m_Separators[SEP_VERT].InUse(TRUE);
			// set the separator rectangle
			rcVertSep.left = rcClient.left;
			rcVertSep.right = rcVertSep.left + SEP_BORDER;
			// and adjust the pane area
			rcPane3.left = rcVertSep.right;
		}

		if (m_Separators[SEP_VERT].AllowHide() == PANE_3 &&
			!m_Panes[PANE_3].InUse() && m_Panes[PANE_3].View() != NULL)
		{
			m_Separators[SEP_VERT].InUse(TRUE);
			// set the separator rectangle
			rcVertSep.right = rcClient.right;
			rcVertSep.left = rcVertSep.right - SEP_BORDER;
			// and adjust the pane area
			rcPane2.right = rcVertSep.left;
		}
	}

	// if the horizontal separator is in use adjust the top extents of
	// pane 2 and 3, the bottom extent of pane 1 and set the position of
	// the horizontal separator based on its position ratio from the top
	// of the client area
	BOOL bHorzSepInUse = m_Panes[PANE_1].InUse() && (m_Panes[PANE_2].InUse() || m_Panes[PANE_3].InUse());
	m_Separators[SEP_HORZ].InUse(bHorzSepInUse);
	if (bHorzSepInUse)
	{
		double PosRatio = m_Separators[SEP_HORZ].PositionRatio();
		rcHorzSep.top = (long)(PosRatio * rcClient.Height()) + rcClient.top;
		rcHorzSep.bottom = rcHorzSep.top + SEP_BORDER;

		if (rcHorzSep.bottom > rcClient.bottom)
		{
			int nOutOfScreenAdjustment = rcClient.bottom - rcHorzSep.bottom;
			rcHorzSep.top += nOutOfScreenAdjustment;
			rcHorzSep.bottom += nOutOfScreenAdjustment;
		}

		rcVertSep.top = rcHorzSep.bottom;

		rcPane1.bottom = rcHorzSep.top;
		rcPane2.top = rcHorzSep.bottom;
		rcPane3.top = rcHorzSep.bottom;
	}
	else
	{
		if (m_Separators[SEP_HORZ].AllowHide() == PANE_1 &&
			!m_Panes[PANE_1].InUse() && m_Panes[PANE_1].View() != NULL)
		{
			m_Separators[SEP_HORZ].InUse(TRUE);
			// set the separator rectangle
			rcHorzSep.top = rcClient.top;
			rcHorzSep.bottom = rcHorzSep.top + SEP_BORDER;
			// and adjust the pane area
			rcPane2.top = rcHorzSep.bottom;
			rcPane3.top = rcHorzSep.bottom;
		}
	}
	// adjust the ends of the separators so that they do not look too defined
	// where they meet each other and the sides of the frame.
	rcHorzSep.InflateRect(1, 0);
	m_Separators[SEP_HORZ].BoundingRect(rcHorzSep);

	rcVertSep.InflateRect(0, 1);
	m_Separators[SEP_VERT].BoundingRect(rcVertSep);
}

void CThreeWaySplitterFrame::ChangePaneViews
(
	CWnd* pPreviousWnd,
	CWnd* pNewWnd
)
{
	if ((pPreviousWnd == NULL)
		|| (pNewWnd == NULL)
		|| (pNewWnd == pPreviousWnd))
		return;

	if (m_Panes[PANE_1].View() == pPreviousWnd)
	{
		m_Panes[PANE_1].ChangePaneView(pNewWnd);
		RecalcLayout(FALSE);
		m_Panes[PANE_1].View()->Invalidate();
	}
	else if (m_Panes[PANE_2].View() == pPreviousWnd)
	{
		m_Panes[PANE_2].ChangePaneView(pNewWnd);

		RecalcLayout(FALSE);
		m_Panes[PANE_2].View()->Invalidate();
	}
	else if (m_Panes[PANE_3].View() == pPreviousWnd)
	{
		m_Panes[PANE_3].ChangePaneView(pNewWnd);
		RecalcLayout(FALSE);
		m_Panes[PANE_3].View()->Invalidate();
	}
}

void CThreeWaySplitterFrame::SetHorzSepRatio
(
	float fSplitter,
	BOOL bRecalc
)
{
	m_fSplitter1 = fSplitter;

	if ((fSplitter >= 0) && (fSplitter <= 1))
	{
		m_Separators[SEP_HORZ].PositionRatio(m_fSplitter1);
		if (bRecalc)
			RecalcLayout(FALSE);
	}
}

/*-----------------------------------------------------------------------------

@mfunc	GetHorzSepRatio.

-----------------------------------------------------------------------------*/
float CThreeWaySplitterFrame::GetHorzSepRatio()
{
	return (float)m_fSplitter1;
}

/*-----------------------------------------------------------------------------

@mfunc	SetVertSepRatio.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::SetVertSepRatio
(
	float fSplitter,
	BOOL bRecalc
)
{
	m_fSplitter2 = fSplitter;

	if ((fSplitter >= 0) && (fSplitter <= 1))
	{
		m_Separators[SEP_VERT].PositionRatio(m_fSplitter2);
		if (bRecalc)
			RecalcLayout(FALSE);
	}
}

/*-----------------------------------------------------------------------------

@mfunc	GetVertSepRatio.

-----------------------------------------------------------------------------*/
float CThreeWaySplitterFrame::GetVertSepRatio()
{
	return (float)m_fSplitter2;
}

void CThreeWaySplitterFrame::OnChangeRatio(SEPARATOR Sep)
{
}

/*-----------------------------------------------------------------------------

@mfunc	OnInvertSeparator.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::OnInvertSeparator
(
	const CRect& rcSeparator
)
{
	ASSERT_VALID(this);
	ASSERT(!rcSeparator.IsRectEmpty());
	ASSERT((GetStyle() & WS_CLIPCHILDREN) == 0);

	CClientDC ClientDC(this);

	// invert the brush pattern (looks just like frame window sizing)
	CBrush* pBrush = CDC::GetHalftoneBrush();
	HBRUSH hOldBrush = NULL;

	if (pBrush != NULL)
		hOldBrush = (HBRUSH)SelectObject(ClientDC.m_hDC, pBrush->m_hObject);

	ClientDC.PatBlt(rcSeparator.left, rcSeparator.top,
		rcSeparator.Width(), rcSeparator.Height(),
		PATINVERT);

	if (hOldBrush != NULL)
		SelectObject(ClientDC.m_hDC, hOldBrush);
}

/*-----------------------------------------------------------------------------

@mfunc	ShowPane.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::ShowPane
(
	BOOL bShow,
	PANE Pane,
	BOOL bRecalc
)
{
	m_Panes[Pane].InUse(bShow);
	if (bShow == FALSE)
		m_Panes[Pane].View()->ShowWindow(SW_HIDE);

	if (bRecalc)
		RecalcLayout(FALSE);
}

/*-----------------------------------------------------------------------------

@mfunc	ShowPane.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::ShowPane
(
	BOOL bShow,
	CWnd* pWnd,
	BOOL bRecalc
)
{
	if (m_Panes[PANE_1].View() == pWnd)
		m_Panes[PANE_1].InUse(bShow);
	else if (m_Panes[PANE_2].View() == pWnd)
		m_Panes[PANE_2].InUse(bShow);
	else if (m_Panes[PANE_3].View() == pWnd)
		m_Panes[PANE_3].InUse(bShow);

	// Only if a someone has created the window
	if (bShow == FALSE && pWnd)
		pWnd->ShowWindow(SW_HIDE);

	if (bRecalc)
		RecalcLayout(FALSE);
}

void CThreeWaySplitterFrame::OnDestroy()
{
	m_fSplitter1 = (float)m_Separators[SEP_HORZ].PositionRatio();
	m_fSplitter2 = (float)m_Separators[SEP_VERT].PositionRatio();

	CFrameWnd::OnDestroy();

	m_paneTop.Cef_DestroyHost(INFINITE);

	// 17.05.2018 - IMPORTANT: release unmanaged pointer to HostScripting object. Must be called after all tab controls are destroyed
	m_handleHostScripting->Free();
}

CRect CThreeWaySplitterFrame::GetTWSRect()
{
	CRect rcClient;
	GetClientArea(&rcClient);

	return rcClient;
}


//////////////////////////////////////////////////////////////////////////
// Pane

BOOL CThreeWaySplitterFrame::CPane::ChangePaneView
(
	CWnd * pWndNewView
)
{
	ASSERT(m_pView);
	ASSERT(pWndNewView);
	if (pWndNewView != NULL)
	{
		m_pView = pWndNewView;
	}
	return TRUE;
}

/*-----------------------------------------------------------------------------

@mfunc	CreatePane.

-----------------------------------------------------------------------------*/
BOOL CThreeWaySplitterFrame::CPane::CreatePane
(
	CWnd* pParent,
	PANE Pane,
	CWnd* pWnd,
	CSize &szMinimum /* = CSize(0,0) */
)
{
	BOOL bCreated = FALSE;

	ASSERT(!m_pView);
	ASSERT(pWnd);
	if (m_pView == NULL)
	{
		m_pView = pWnd;
		//m_bInUse = TRUE;
		bCreated = TRUE;
	}

	m_szMinimum = szMinimum;

	return bCreated;
}

/*-----------------------------------------------------------------------------

@mfunc	CreatePane.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::CPane::InUse
(
	BOOL bInUse
)
{
	if (m_pView == NULL)
		m_bInUse = FALSE;
	else
		m_bInUse = bInUse;
}

/*-----------------------------------------------------------------------------

@mfunc	Minimum.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::CPane::Minimum
(
	CSize szMinimum
)
{
	if (szMinimum.cx < 0)
		szMinimum.cx = 0;
	if (szMinimum.cy < 0)
		szMinimum.cy = 0;

	m_szMinimum = szMinimum;
}

//////////////////////////////////////////////////////////////////////////
// Separator

/*-----------------------------------------------------------------------------

@mfunc	CSeparator::Draw.

-----------------------------------------------------------------------------*/
void CThreeWaySplitterFrame::CSeparator::Draw
(
	CDC* pDC
)
{
	if (m_bInUse)
	{
		CRect rcBounding = m_rcBounding;

		pDC->Draw3dRect(rcBounding, ::GetSysColor(COLOR_BTNFACE), ::GetSysColor(COLOR_WINDOWFRAME));
		//rcBounding.DeflateRect(1,1);
		//pDC->Draw3dRect(rcBounding, ::GetSysColor(COLOR_BTNHIGHLIGHT),
		//							::GetSysColor(COLOR_3DSHADOW));
	}
}

/*-----------------------------------------------------------------------------

@mfunc	HitTest.

-----------------------------------------------------------------------------*/
BOOL CThreeWaySplitterFrame::CSeparator::HitTest(const CPoint& ptTest)
{
	BOOL bHit = FALSE;

	if (m_bInUse)
		bHit = m_rcBounding.PtInRect(ptTest);

	return bHit;
}
