#include "afxwin.h"

class CDevToolsWnd : public CWnd
{
	DECLARE_DYNAMIC(CDevToolsWnd)

public:
	CDevToolsWnd();
	~CDevToolsWnd();

	BOOL Create(int nBrowserID, CRect rc);
	void Destroy();
	void BeforeBrowserClose(int nBrowserID);

protected:
	int m_nBrowserID;
	CString m_strWndClassName;

protected:
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSizing(UINT nType, int cx, int cy);

	DECLARE_MESSAGE_MAP()
};
