#pragma once

#ifndef LINK_CEF
#define LINK_CEF
#endif

#ifdef _DEBUG
#ifdef _CODECS
#pragma comment(lib, "../CefHost_Codecs/lib_x86_debug/libcef.lib")
#pragma comment(lib, "../CefHost_Codecs/lib_x86_debug/libcef_dll_wrapper.lib")
#else
#pragma comment(lib, "../CefHost/lib_x86_debug/libcef.lib")
#pragma comment(lib, "../CefHost/lib_x86_debug/libcef_dll_wrapper.lib")
#endif
#endif

#ifndef _DEBUG
#ifdef _CODECS
#pragma comment(lib, "../CefHost_Codecs/lib_x86_release/libcef.lib")
#pragma comment(lib, "../CefHost_Codecs/lib_x86_release/libcef_dll_wrapper.lib")
#else
#pragma comment(lib, "../CefHost/lib_x86_release/libcef.lib")
#pragma comment(lib, "../CefHost/lib_x86_release/libcef_dll_wrapper.lib")
#endif
#endif