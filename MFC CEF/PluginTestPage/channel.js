"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebPlugin;
(function (WebPlugin) {
    var Host;
    (function (Host) {
        var ChannelInitError = 'Plugin channel cannot be initialised: ';
        var newRequestId = (function () {
            var _seqRequestId = 0;
            return function () { return ++_seqRequestId; };
        })();
        /** Return new channel or null if type not
         * @param channel
         */
        function channelFactory(channel, onNotify) {
            if (!channel) {
                throw new Error(ChannelInitError + 'Empty channel type');
            }
            switch (channel) {
                case WebPlugin.UrlParams.CefChannel:
                    return new CefChannel(onNotify);
            }
            throw new Error(ChannelInitError + ("Unknown channel type '" + channel + "'"));
        }
        Host.channelFactory = channelFactory;
        /** Base channel implementation for plugins hosted in a web app.
         * Uses postMessage as a communication channel.
         */
       
        
        
        /** Channel implementation for plugins hosted
         * in a mfc app in a cefsharp browser engine.
         * The client app registers an object which proxy instance with public methods
         * is available in JS.
         *
         * Requests are passed directly in the call to external proxy.
         * Returning promise is used pass response.
         */
        var CefChannel = /** @class */ (function () {
            function CefChannel(onNotify) {
                var _this = this;
                this.onMessage = function (e) {
                    if (e.source !== window)
                        return;
                    var msg = e.data; //JS message object is passed directly
                    if (!WebPlugin.Message.isMessage(msg))
                        return;
                    _this._onNotify && _this._onNotify(msg);
                };
                this._onNotify = onNotify;
                window.addEventListener('message', this.onMessage);
            }
            CefChannel.prototype.close = function () {
                window.removeEventListener('message', this.onMessage);
            };
            CefChannel.prototype.postMessage = function (msg) {
                external.onNotify(JSON.stringify(msg));
            };
            CefChannel.prototype.sendRequest = function (msg) {
                var p = new Promise(function (resolve, reject) {
                    external.onRequest(JSON.stringify(msg)).then(function (json) {
                        if (!json)
                            reject('Empty response from client');
                        try {
                            var msg_1 = JSON.parse(json);
                            if (typeof msg_1 === 'object' && WebPlugin.Message.isMessage(msg_1)) {
                                resolve(msg_1);
                            }
                            else
                                reject('Invalid response object from client');
                        }
                        catch (e) {
                            reject('Invalid response format from client');
                        }
                    }, function (reason) {
                        if (typeof reason === 'string') {
                            var error_1 = CefChannel.tryParseError(reason);
                            if (!!error_1) {
                                reject(error_1);
                                return;
                            }
                        }
                        var error = { message: String(reason) };
                        reject(error);
                    });
                });
                return p;
            };
            /** When external handler throws then the .net exception is serialized to a string passed as a rejection reason to the promise.
             * IError object should be encoded as a json in the message property as [[{ IError object json string }]]
             * Json begins with [[ and ends with ]].
             * Example: [[{"message":"Invalid parameter"}]]
             * @param reason exception formatted by cefsharp
             */
            CefChannel.tryParseError = function (reason) {
                var jsonStart = reason.indexOf('[[{');
                if (jsonStart < 0)
                    return null;
                var jsonEnd = reason.indexOf('}]]');
                if (jsonEnd < 0)
                    return null;
                var json = reason.substring(jsonStart + 2 /*2 squre brackets*/, jsonEnd + 1 /*curly bracket*/);
                try {
                    var error = JSON.parse(json);
                    if (WebPlugin.Message.isError(error))
                        return error;
                }
                catch (_a) { }
                return null;
            };
            return CefChannel;
        }());
    })(Host = WebPlugin.Host || (WebPlugin.Host = {}));
})(WebPlugin || (WebPlugin = {}));
//# sourceMappingURL=channel.js.map