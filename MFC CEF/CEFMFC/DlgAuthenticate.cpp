// DlgAuthenticate.cpp : implementation file
//

#include "stdafx.h"
#include "CEFMFC.h"
#include "DlgAuthenticate.h"
#include "afxdialogex.h"


// CDlgAuthenticate dialog

IMPLEMENT_DYNAMIC(CDlgAuthenticate, CDialog)

CDlgAuthenticate::CDlgAuthenticate(CWnd* pParent /*=NULL*/)
	: CDialog(CDlgAuthenticate::IDD, pParent)
	, m_szUserName(_T(""))
	, m_szPassword(_T(""))
	, m_szMessage(_T(""))
{

}

CDlgAuthenticate::~CDlgAuthenticate()
{
}

void CDlgAuthenticate::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	DDX_Text(pDX, IDC_EDIT_USERNAME, m_szUserName);
	DDX_Text(pDX, IDC_EDIT_PASSWORD, m_szPassword);
	DDX_Text(pDX, IDC_STATIC_MESSAGE, m_szMessage);
}


BEGIN_MESSAGE_MAP(CDlgAuthenticate, CDialog)
END_MESSAGE_MAP()


// CDlgAuthenticate message handlers
