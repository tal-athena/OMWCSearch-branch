#pragma once


// CDlgAuthenticate dialog

class CDlgAuthenticate : public CDialog
{
	DECLARE_DYNAMIC(CDlgAuthenticate)

public:
	CDlgAuthenticate(CWnd* pParent = NULL);   // standard constructor
	virtual ~CDlgAuthenticate();

// Dialog Data
	enum { IDD = IDD_DIALOG_AUTHENTICATE };

protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support

	DECLARE_MESSAGE_MAP()
public:
	CString m_szUserName;
	CString m_szPassword;
	CString m_szMessage;
};
