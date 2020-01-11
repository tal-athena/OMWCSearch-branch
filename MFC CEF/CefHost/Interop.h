// 17.05.2018 - No longer convenient
/*#pragma once

void* HostScriptingToPtr(CefWebPluginHost::HostScripting^ pHostScriptingObj)
{
	System::Runtime::InteropServices::GCHandle handle = System::Runtime::InteropServices::GCHandle::Alloc(pHostScriptingObj);
	System::IntPtr pointer = System::Runtime::InteropServices::GCHandle::ToIntPtr(handle);

	return pointer.ToPointer();
}*/