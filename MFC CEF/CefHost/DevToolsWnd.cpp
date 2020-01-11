#include "stdafx.h"
#include "DevToolsWnd.h"

IMPLEMENT_DYNAMIC(CDevToolsWnd, CWnd)

BEGIN_MESSAGE_MAP(CDevToolsWnd, CWnd)
	ON_WM_SIZE()
END_MESSAGE_MAP()

CDevToolsWnd::CDevToolsWnd()
{
	m_nBrowserID = -1;
}

CDevToolsWnd::~CDevToolsWnd()
{
}

void CDevToolsWnd::BeforeBrowserClose(int nBrowserID)
{
	if (nBrowserID == m_nBrowserID)
	{
		Destroy();
		m_nBrowserID = -1;
	}
}

BOOL CDevToolsWnd::Create(int nBrowserID, CRect rc)
{
	Destroy();

	if (m_strWndClassName.IsEmpty())
		m_strWndClassName = AfxRegisterWndClass(CS_VREDRAW | CS_HREDRAW, ::LoadCursor(NULL, IDC_ARROW), (HBRUSH) ::GetStockObject(WHITE_BRUSH), ::LoadIcon(NULL, IDI_APPLICATION));

	if (CreateEx(0, m_strWndClassName, _T("Chromium Dev Tools"), WS_POPUPWINDOW | WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS, rc.left, rc.top, rc.Width(), rc.Height(), NULL, NULL))
	{
		m_nBrowserID = nBrowserID;

		CenterWindow();
		ShowWindow(SW_SHOW);
		SetActiveWindow();

		return TRUE;
	}

	return FALSE;
}

void CDevToolsWnd::Destroy()
{
	m_nBrowserID = -1;

	if (GetSafeHwnd())
		CWnd::DestroyWindow();
}

void CDevToolsWnd::OnSize(UINT nType, int cx, int cy)
{
	CWnd* pChild = GetWindow(GW_CHILD);
	if (pChild)
		pChild->MoveWindow(0, 0, cx, cy);

	CWnd::OnSize(nType, cx, cy);
}

void CDevToolsWnd::OnSizing(UINT nType, int cx, int cy)
{
	CWnd* pChild = GetWindow(GW_CHILD);
	if (pChild)
		pChild->MoveWindow(0, 0, cx, cy);

	CWnd::OnSize(nType, cx, cy);
}
