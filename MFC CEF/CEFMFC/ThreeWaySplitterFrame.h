
// ThreeWaySplitterFrame.h : interface of the CThreeWaySplitterFrame class
//

#pragma once
#include "AddressBox.h"

#include "../CefHost/CefHost.h"

// 17.05.2018 - Main window has a separate CCefTabCtrl
#include "../CefHost/CefTabCtrl.h"

// 17.05.2018 - Main window is responsible for HostScripting object management
#using <CefWebPluginHost.dll>

class CThreeWaySplitterFrame : public CFrameWndEx
{
protected: // create from serialization only
	CThreeWaySplitterFrame();
	DECLARE_DYNCREATE(CThreeWaySplitterFrame)

protected:
	enum { SEP_BORDER = 6 };
	enum SEPARATOR { SEP_NONE = -1, SEP_VERT, SEP_HORZ, SEP_COUNT };
	enum PANE { PANE_0 = -1, PANE_1, PANE_2, PANE_3, PANE_COUNT };

private:
	class CPane
	{
	public:
		CPane() { m_pView = NULL; m_bInUse = FALSE; m_szMinimum = CSize(0, 0); }
		BOOL InUse() { return m_bInUse; }
		void InUse(BOOL bInUse);
		BOOL CreatePane(CWnd* pParent, PANE Pane, CWnd* pWnd, CSize &szMinimum = CSize(0, 0));
		CWnd* View() { return m_pView; }
		CSize Minimum() { return m_szMinimum; }
		void Minimum(CSize szMinimum);
		BOOL ChangePaneView(CWnd * pWndNewView);

	private:
		CWnd*			m_pView;
		CSize			m_szMinimum;
		BOOL			m_bInUse;
	};

	// CSeparator helper class keeps track of where a separator
	// bar should be drawn
	class CSeparator
	{
	public:
		CSeparator() { m_bInUse = FALSE; m_Orientation = SEP_NONE; m_AllowHide = PANE_0; m_Color = RGB(192, 192, 192); }
		void Draw(CDC* pDC);
		BOOL HitTest(const CPoint& ptTest);
		void Orientation(SEPARATOR Orientation) { m_Orientation = Orientation; }
		void SetColor(COLORREF Color) { m_Color = Color; }
		PANE AllowHide() { return m_AllowHide; }
		void AllowHide(PANE AllowHide) { m_AllowHide = AllowHide; }
		CRect BoundingRect() { return m_rcBounding; }
		void BoundingRect(const CRect& rcBounding) { m_rcBounding = rcBounding; }
		BOOL InUse() { return m_bInUse; }
		void InUse(BOOL bInUse) { m_bInUse = bInUse; }
		double PositionRatio() { return m_fRatio; }
		void PositionRatio(double fRatio) { m_fRatio = fRatio; m_bInUse = TRUE; }

	private:
		BOOL		m_bInUse;
		CRect		m_rcBounding;
		double		m_fRatio;
		SEPARATOR	m_Orientation;
		PANE		m_AllowHide;
		COLORREF	m_Color;
	};

	friend CSeparator;

	// Attributes
public:

	// Operations from production app
public:
	//virtual BOOL OnCreateClient(LPCREATESTRUCT lpcs, CCreateContext* pContext);
	virtual void RecalcLayout(BOOL bNotify = TRUE);
	void ShowPane(BOOL bShow, CWnd* pWnd, BOOL bRecalc = TRUE);
	void ShowPane(BOOL bShow, PANE Pane, BOOL bRecalc = TRUE);

	void SetHorzSepRatio(float fSplitter, BOOL bRecalc = TRUE);
	float GetHorzSepRatio();
	void SetVertSepRatio(float fSplitter, BOOL bRecalc = TRUE);
	float GetVertSepRatio();

protected:
	void ChangePaneViews(CWnd* pPreviousWnd, CWnd* pNewWnd);
	void InitHostScripting();

	// 17.05.2018 - All managed and unmanaged pointers are being hold in the main window object
	CString GetTestPageURL();

	gcroot<CefWebPluginHost::HostScripting^> m_hostScripting;
	gcroot<System::Runtime::InteropServices::GCHandle^> m_handleHostScripting;
	LPVOID m_hostScriptingUnmanagedPtr;
	
	gcroot<System::Runtime::InteropServices::GCHandle^> m_handleCallback;

	// Overrides
public:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
	virtual BOOL LoadFrame(UINT nIDResource, DWORD dwDefaultStyle = WS_OVERLAPPEDWINDOW | FWS_ADDTOTITLE, CWnd* pParentWnd = NULL, CCreateContext* pContext = NULL);
	
public:
	BOOL CreatePanes();
	void GetClientArea(CRect* pRect);

	// Implementation
public:
	virtual ~CThreeWaySplitterFrame();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

	// From production app
protected:
	void RecalcMode1Layout(CRect& rcPane1, CRect& rcPane2, CRect& rcPane3);
	void RecalcMode2Layout(CRect& rcPane1, CRect& rcPane2, CRect& rcPane3);
	BOOL ValidateMode1TrackerPosition(SEPARATOR Sep, CRect& rcTracker);
	CRect GetTWSRect();

	HCURSOR SplitterCursor(SEPARATOR Sep);
	virtual void OnInvertSeparator(const CRect& rcSeparator);
	virtual void OnChangeRatio(SEPARATOR Sep);

protected:  // control bar embedded members
	CMFCReBar m_wndReBar;
	CMFCToolBar m_wndToolBar;
	CMFCStatusBar m_wndStatusBar;
	CAddressBox m_wndAddress;

protected: // Sample panes
	CSize m_wndSize;
	CCefTabCtrl m_paneTop;

	// From production app
protected:
	CPane m_Panes[PANE_COUNT];
	HCURSOR m_hCursorToDestroy;
	CSeparator m_Separators[SEP_COUNT];
	SEPARATOR m_SeparatorTracking;
	CRect m_rcOldTracking;
	float m_fSplitter1, m_fSplitter2;

	// Generated message map functions
protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnViewCustomize();
	afx_msg LRESULT OnToolbarCreateNew(WPARAM wp, LPARAM lp);
	afx_msg void OnAddressEnter();

	// 17.05.2018 - View sends a message WM_USER + 100 to obtain the unmanaged pointer from parent
	//				In production app should be better way to pass the pointer to child views
	afx_msg LRESULT OnGetHostScriptingUnmanagedPtr(WPARAM wParam, LPARAM lParam);

	// From production app
	afx_msg void OnPaint();
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSizing(UINT fwSide, LPRECT pRect);
	afx_msg void OnMouseMove(UINT nFlags, CPoint point);
	afx_msg void OnLButtonDown(UINT nFlags, CPoint point);
	afx_msg void OnLButtonUp(UINT nFlags, CPoint point);
	afx_msg void OnLButtonDblClk(UINT nFlags, CPoint point);
	afx_msg void OnDestroy();

	DECLARE_MESSAGE_MAP()

public:
	void SetAddress(LPCTSTR lpszUrl);
	void SetWindowTitle(LPCTSTR lpszTitle);
	void SetStatusIndicator(LPCTSTR lpszStatus);
	void ShowToolBar(BOOL bShow);
	void ShowStatusBar(BOOL bShow);
	void ShowAddressBar(BOOL bShow);
	void SetFrameWidth(LONG nWidth);
	void SetFrameHeight(LONG nHeight);
	void SetFrameTop(LONG nTop);
	void SetFrameLeft(LONG nLeft);
};
