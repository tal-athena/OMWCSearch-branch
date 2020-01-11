#pragma once


// CAddressBox

class CAddressBox : public CComboBoxEx
{
	DECLARE_DYNAMIC(CAddressBox)

public:
	CAddressBox();
	virtual ~CAddressBox();

	INT FindString(LPCTSTR lpszFind);
	INT AddString(LPCTSTR lpszString);
	INT AddURL(LPCTSTR lpszURL);

	INT SetHeight(INT nHeight);
	BOOL SetReadOnly(BOOL bReadOnly=TRUE);

protected:
	DECLARE_MESSAGE_MAP()
};


