// CefSubprocess.cpp : Defines the entry point for the application.
//

#include "stdafx.h"
#include "CefSubprocess.h"

#include <windows.h>
#include <include/cef_app.h>
#include <include/cef_client.h>
#include <include/wrapper/cef_message_router.h>
#include "../CefHost/HostIPC.h"

#ifndef LINK_CEF
#include "..\Common\link_cef.h"
#endif

using namespace std;

typedef struct _PromiseCallbackInfo
{
	int nBrowserID;
	CefRefPtr<CefV8Context> context;
	CefRefPtr<CefV8Value> callbackSuccess;
	CefRefPtr<CefV8Value> callbackFail;
} PromiseCallbackInfo;

class SubprocessV8Handler : public CefV8Handler, IpcCallbackHandler
{
public:
	SubprocessV8Handler()
	{
		m_nRequestCounter = 1;
	}

	// 17.05.2018 - Empty implementation of IsBrowserOwner
	BOOL IsBrowserOwner(int nBrowserID) OVERRIDE
	{
		return FALSE;
	}

	void OnIpcMessage(CefRefPtr<CefProcessMessage> message) OVERRIDE
	{
		if (CefString(MSG_INVOKE_PROMISE_CALLBACK).compare(message->GetName()) == 0)
		{
			InvokePromiseCallback(message->GetArgumentList());
		}
	}

protected:
	std::map<int, PromiseCallbackInfo> m_mapCallbacks;
	int m_nRequestCounter;

	bool InvokePromiseCallback(CefRefPtr<CefListValue> arguments)
	{
		if (arguments->GetSize() <= 2)
			return false;

		int nRequestID = arguments->GetInt(0);
		int nBrowserID = arguments->GetInt(1);
		bool bSucceeded = arguments->GetBool(2);

		CefString strJson;
		if (arguments->GetSize() >= 4)
			strJson = arguments->GetString(3);

		//////////////////////////////////////////////////////////////////////////

		if (m_mapCallbacks.find(nRequestID) == m_mapCallbacks.end())
			return false;

		PromiseCallbackInfo callbackInfo = m_mapCallbacks.at(nRequestID);
		if (callbackInfo.nBrowserID != nBrowserID)
			return false;

		m_mapCallbacks.erase(nRequestID);

		CefV8ValueList callbackArguments;
		callbackArguments.push_back(CefV8Value::CreateString(strJson));

		if (bSucceeded)
			callbackInfo.callbackSuccess->ExecuteFunctionWithContext(callbackInfo.context, NULL, callbackArguments);
		else if (callbackInfo.callbackFail)
			callbackInfo.callbackFail->ExecuteFunctionWithContext(callbackInfo.context, NULL, callbackArguments);

		return true;
	}

	void SafeIncrementRequestCounter()
	{
		if (m_nRequestCounter + 1 >= INT_MAX)
			m_nRequestCounter = 0;

		m_nRequestCounter++;
	}

public:
	virtual bool Execute(const CefString& name, CefRefPtr<CefV8Value> object, const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception)
		OVERRIDE
	{
		if (name == "onNotify")
		{
			CefString json;
			if (arguments.size() > 0 && arguments[0]->IsString())
				json = arguments[0]->GetStringValue();

			CefRefPtr<CefV8Context> context = CefV8Context::GetCurrentContext();

			CefRefPtr<CefProcessMessage> msg = CefProcessMessage::Create(MSG_INVOKE_NATIVE_NOTIFICATION);
			CefRefPtr<CefListValue> arguments = msg->GetArgumentList();

			int nBrowserID = context->GetBrowser()->GetIdentifier();

			arguments->SetInt(0, nBrowserID);
			arguments->SetString(1, json);

			context->GetBrowser()->SendProcessMessage(PID_BROWSER, msg);
		}
		else if (name == "onRequest")
		{
			CefString json;
			if (arguments.size() > 0 && arguments[0]->IsString())
				json = arguments[0]->GetStringValue();

			CefRefPtr<CefV8Context> context = CefV8Context::GetCurrentContext();

			CefRefPtr<CefV8Value> global = context->GetGlobal();

			CefRefPtr<CefV8Value> funcCreatePromise = global->GetValue(CefString(_T("cef_CreatePromise")));
			if (funcCreatePromise.get())
			{
				CefRefPtr<CefV8Value> result = funcCreatePromise->ExecuteFunctionWithContext(context, NULL, CefV8ValueList());
				if (result.get())
				{
					PromiseCallbackInfo callbackInfo;
					retval = result->GetValue(CefString(_T("p")));

					//////////////////////////////////////////////////////////////////////////

					callbackInfo.context = context;
					callbackInfo.callbackSuccess = result->GetValue(CefString("res"));
					callbackInfo.callbackFail = result->GetValue(CefString("rej"));
					callbackInfo.nBrowserID = context->GetBrowser()->GetIdentifier();

					int nRequestID = m_nRequestCounter;
					pair<int, PromiseCallbackInfo> newRequest(nRequestID, callbackInfo);
					m_mapCallbacks.insert(newRequest);

					SafeIncrementRequestCounter();

					//////////////////////////////////////////////////////////////////////////

					CefRefPtr<CefProcessMessage> msg = CefProcessMessage::Create(MSG_INVOKE_NATIVE_REQUEST);
					CefRefPtr<CefListValue> arguments = msg->GetArgumentList();

					arguments->SetInt(0, nRequestID);
					arguments->SetInt(1, callbackInfo.nBrowserID);
					arguments->SetString(2, json);

					context->GetBrowser()->SendProcessMessage(PID_BROWSER, msg);
				}
			}

			return true;
		}

		// Function does not exist.
		return false;
	}

	void OnContextReleased(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context)
	{
		// Remove any JavaScript callbacks registered for the context that has been released.
		if (!m_mapCallbacks.empty())
		{
			std::map<int, PromiseCallbackInfo>::iterator it = m_mapCallbacks.begin();
			while (it != m_mapCallbacks.end())
			{
				if (it->second.context->IsSame(context))
					m_mapCallbacks.erase(it++);
				else
					++it;
			}
		}
	}

	// Provide the reference counting implementation for this class.
	IMPLEMENT_REFCOUNTING(SubprocessV8Handler);
};

class ClientApp : public CefApp,
	public CefBrowserProcessHandler,
	public CefRenderProcessHandler,
	public CefClient
{
public:
	ClientApp(void)
	{

	}
	ClientApp(HWND hWnd)
	{

	}
	~ClientApp(void)
	{

	}

protected:
	CefRefPtr<SubprocessV8Handler> m_cefPromiseHandler;
	CefRefPtr<CefMessageRouterRendererSide> m_cefMessageRouter;

	// CefApp methods:
	virtual CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() OVERRIDE
	{
		return this;
	}

	// CefBrowserProcessHandler methods:
	virtual void OnContextInitialized() OVERRIDE
	{

	}

	virtual CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() OVERRIDE
	{
		return this;
	}

	bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser, CefProcessId source_process, CefRefPtr<CefProcessMessage> message)
	{
		m_cefPromiseHandler->OnIpcMessage(message);

		return m_cefMessageRouter->OnProcessMessageReceived(browser, source_process, message);
	}

	//Context
	virtual void OnContextCreated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context) OVERRIDE
	{
		m_cefContext = context;

		//////////////////////////////////////////////////////////////////////////

		CefRefPtr<CefV8Value> objExternal = CefV8Value::CreateObject(NULL, NULL);

		//////////////////////////////////////////////////////////////////////////

		CefString strRequestFuncName(_T("onRequest"));
		CefRefPtr<CefV8Value> funcOnRequest = CefV8Value::CreateFunction(strRequestFuncName, m_cefPromiseHandler);
		objExternal->SetValue(strRequestFuncName, funcOnRequest, V8_PROPERTY_ATTRIBUTE_NONE);

		CefString strNotifyFuncName(_T("onNotify"));
		CefRefPtr<CefV8Value> funcOnNotify = CefV8Value::CreateFunction(strNotifyFuncName, m_cefPromiseHandler);
		objExternal->SetValue(strNotifyFuncName, funcOnNotify, V8_PROPERTY_ATTRIBUTE_NONE);

		//////////////////////////////////////////////////////////////////////////

		CefRefPtr<CefV8Value> objGlobal = context->GetGlobal();
		objGlobal->SetValue(CefString(_T("external")), objExternal, V8_PROPERTY_ATTRIBUTE_NONE);
	}

	virtual void OnWebKitInitialized() OVERRIDE
	{
		m_cefPromiseHandler = new SubprocessV8Handler();

		CefString strFunctionName(_T("cef_CreatePromise"));
		CefString strFunctionCode(_T("function cef_CreatePromise() {"
			"   var result = {};"
			"   var promise = new Promise(function(resolve, reject) {"
			"       result.res = resolve; result.rej = reject;"
			"   });"
			"   result.p = promise;"
			"   return result;"
			"}"));

		if (!CefRegisterExtension(strFunctionName, strFunctionCode, m_cefPromiseHandler))
		{
			// Handle error
		}

		//////////////////////////////////////////////////////////////////////////

		CefMessageRouterConfig config;
		m_cefMessageRouter = CefMessageRouterRendererSide::Create(config);
	}

protected:
	CefRefPtr<CefV8Context> m_cefContext;

private:
	// Include the default reference counting implementation.
	IMPLEMENT_REFCOUNTING(ClientApp);
};

int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
	_In_opt_ HINSTANCE hPrevInstance,
	_In_ LPWSTR    lpCmdLine,
	_In_ int       nCmdShow)
{
	UNREFERENCED_PARAMETER(hPrevInstance);
	UNREFERENCED_PARAMETER(lpCmdLine);

	CefRefPtr<ClientApp> app = new ClientApp();

	CefMainArgs cefArgs(GetModuleHandle(NULL));

	int nResult = CefExecuteProcess(cefArgs, app, nullptr);

	return nResult;
}
