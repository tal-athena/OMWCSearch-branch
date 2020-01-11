
// CEFMFCView.h : interface of the CCEFMFCView class
//

#pragma once
#include "CEFMFCDoc.h"
#include "../CefHost/CefTabCtrl.h"

#using <CefWebPluginHost.dll>

class CCEFMFCView : public CView
{
protected: // create from serialization only
	CCEFMFCView();
	DECLARE_DYNCREATE(CCEFMFCView)

// Attributes
public:
	CCEFMFCDoc* GetDocument() const;
	void Destroy();

// Operations
public:

// Overrides
public:
	virtual void OnDraw(CDC* pDC);  // overridden to draw this view
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
protected:

// Implementation
public:
	virtual ~CCEFMFCView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:
	// 17.05.2018 - Now view only holds an unmanaged pointer to HostScripting object.
	//				All managed pointers are moved to class CThreeWaySplitter

	CString GetTestPageURL();

// Generated message map functions
protected:
	afx_msg void OnFilePrintPreview();
	afx_msg void OnRButtonUp(UINT nFlags, CPoint point);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);

	virtual void OnInitialUpdate();
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnClose();
	afx_msg void OnDestroy();

	afx_msg void OnEditFind();
	afx_msg void OnUpdateEditCut(CCmdUI *pCmdUI);
	afx_msg void OnEditCut();
	afx_msg void OnUpdateEditCopy(CCmdUI *pCmdUI);
	afx_msg void OnEditCopy();
	afx_msg void OnUpdateEditPaste(CCmdUI *pCmdUI);
	afx_msg void OnEditPaste();

	afx_msg LRESULT OnBeforeBrowse(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnDownloadUpdate(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnLoadStart(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnLoadEnd(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnTitleChange(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnStateChange(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnAddressChange(WPARAM wParam, LPARAM lParam);	
	afx_msg LRESULT OnStatusMessage(WPARAM wParam, LPARAM lParam);	
	afx_msg LRESULT OnSearchURL(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnFindDialogMessage(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnCloseBrowser(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnNewBrowser(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnWindowCheck(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnNewWindow(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnAuthenticate(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnBadCertificate(WPARAM wParam, LPARAM lParam);

	afx_msg void OnUpdateGoStop(CCmdUI *pCmdUI);
	afx_msg void OnGoStop();
	afx_msg void OnGoRefresh();
	afx_msg void OnGoHome();
	afx_msg void OnFilePrint();
	afx_msg void OnUpdateGoBack(CCmdUI *pCmdUI);
	afx_msg void OnGoBack();
	afx_msg void OnUpdateGoForward(CCmdUI *pCmdUI);
	afx_msg void OnGoForward();
	afx_msg void OnFileNewWindow();

	// Mouse events forwarding
	afx_msg void OnMouseMove(UINT nFlags, CPoint point);
	afx_msg void OnLButtonDown(UINT nFlags, CPoint point);
	afx_msg void OnLButtonUp(UINT nFlags, CPoint point);
	afx_msg void OnLButtonDblClk(UINT nFlags, CPoint point);

	DECLARE_MESSAGE_MAP()

public:
	void GoHome();
	void Stop();
	CString GetLocationName();
	CString GetLocationURL();
	void Navigate(LPCTSTR pszURL);
	BOOL IsEdit(CWnd* pWnd);
	CString FormatTransferInfo(ULONGLONG dwBytesRead, ULONGLONG dwFileSize);
	void UpdateSize();

private:
	static const UINT m_pFindDialogMessage;
	CFindReplaceDialog *m_pFindDialog;
	bool m_bFindNext;

public:
	INT m_nBrowserState;
	CString m_szLocationName;
	CString m_szLocationURL;

	CCefTabCtrl m_cefTabCtrl;
};

#ifndef _DEBUG  // debug version in CEFMFCView.cpp
inline CCEFMFCDoc* CCEFMFCView::GetDocument() const
   { return reinterpret_cast<CCEFMFCDoc*>(m_pDocument); }
#endif
