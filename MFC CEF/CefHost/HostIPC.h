#pragma once

#define MSG_INVOKE_NATIVE_NOTIFICATION _T("InvokeNativeNotification")
#define MSG_INVOKE_NATIVE_REQUEST _T("InvokeNativeRequest")
#define MSG_INVOKE_PROMISE_CALLBACK _T("InvokePromiseCallback")

class IpcCallbackHandler
{
public:
	virtual BOOL IsBrowserOwner(int nBrowserID) = NULL;
	virtual void OnIpcMessage(CefRefPtr<CefProcessMessage> message) = NULL;
};