// AddressBox.cpp : implementation file
//

#include "stdafx.h"
#include "CEFMFC.h"
#include "AddressBox.h"


// CAddressBox

IMPLEMENT_DYNAMIC(CAddressBox, CComboBoxEx)

CAddressBox::CAddressBox()
{

}

CAddressBox::~CAddressBox()
{
}


BEGIN_MESSAGE_MAP(CAddressBox, CComboBoxEx)
END_MESSAGE_MAP()



// CAddressBox message handlers
INT CAddressBox::FindString(LPCTSTR lpszFind)
{
	return GetComboBoxCtrl()->FindString( -1, lpszFind );
}


INT CAddressBox::AddString(LPCTSTR lpszString)
{
	COMBOBOXEXITEM item;

	item.mask = CBEIF_TEXT;
	item.iItem = -1;
	item.pszText = (LPTSTR)lpszString;

	return InsertItem( &item );
}


INT CAddressBox::AddURL(LPCTSTR lpszURL)
{
	INT nRetVal = CB_ERR;

	// check if not present
	if( FindString( lpszURL ) == CB_ERR )
	{
		COMBOBOXEXITEM item;

		item.mask = CBEIF_TEXT;
		item.iItem = -1;
		item.pszText = (LPTSTR)lpszURL;

		nRetVal = InsertItem( &item );

	}
	return nRetVal;
}


INT CAddressBox::SetHeight(INT nHeight)
{
	return SetItemHeight( -1, nHeight );
}

BOOL CAddressBox::SetReadOnly(BOOL bReadOnly)
{
	CEdit* pEdit = NULL;
	CWnd* pCombo = NULL;

	// get the combo box
	pCombo = GetWindow( GW_CHILD );
	VERIFY( pCombo );

	// get the edit box			
	pEdit = (CEdit*)pCombo->GetWindow( GW_CHILD );
	VERIFY( pEdit );
	
	// Always have the edit box enabled
	pEdit->EnableWindow( TRUE );
	
	// Set read only is combo box is disabled
	return pEdit->SetReadOnly( bReadOnly );
}
