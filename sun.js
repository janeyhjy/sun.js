﻿var sun = sun || {};

sun.tag = {};

/**
 * it is for alex to shortcut method
 * delete before online
 */
(function shortCut(_sun) {
    _sun.tojs = function(vmodel) {
        return ko.mapping.toJS(vmodel)
    };
    _sun.log = function (){
        console.log(arguments)
    };
    _sun.write = function(txt){
        var p = document.createElement('p');
        var hr = document.createElement('hr');

        p.innerHTML = txt;
        document.body.appendChild(hr);
        document.body.appendChild(p);
    };
})(sun)

/**
 * Providing you to load Javascript, css files then execute your code.
 *
 * [depend on : jquery.each()]
 */
sun.load = function() {
    var self = {},
        __loadedUrls = {};

    function _poll(node, callback) {
        var isLoaded = false,
            reg = /webkit/i;

        if (reg.test(navigator.userAgent)) { //webkit
            if (node['sheet']) {
                isLoaded = true;
            }
        } else if (node['sheet']) { //FF
            try 
            {
                if (node['sheet'].cssRules) {
                    isLoaded = true;
                }
            } catch (ex) {
                if (ex.code === 1000) {
                    isLoaded = true;
                }
            }
        }

        if (isLoaded) {
            setTimeout(function() {
                callback();
            }, 1);
        } else {
            setTimeout(function() {
                _poll(node, callback);
            }, 1);
        }
    };
    function _styleOnload(node, callback) {
        if (node.attachEvent) {
            node.attachEvent('onload', callback);
        } else {
            setTimeout(function() {
                _poll(node, callback);
            }, 0);
        }
    };
    function _loadcss(url, callback){
        var node = document.createElement("link");

        node.setAttribute("rel","stylesheet");
        node.setAttribute("type","text/css");
        node.setAttribute('href', url);

        document.getElementsByTagName('head')[0].appendChild(node);

        _styleOnload(node, function(){
            _registerUrl(url);
            callback();
        });
    };
    function _isUrlLoaded(url) {
        return __loadedUrls[url] === true;
    };
    function _unregisterUrl(url) {
        __loadedUrls[url] = false;
    };
    function _registerUrl(url) {
        __loadedUrls[url] = true;
    };

    /**
     * >> sun.load.css(_url, function() {
     * >>     // do something
     * >> })
     * => undefined
     * => false  // is url is loaded
     */
    self.css = function(src, callback) {
        if (!_isUrlLoaded(src)) {
            _loadcss.apply(this, arguments);
        } else {
            if (typeof callback === 'function') {
                callback();
            }
            return false;
        }
    };
    /**
     * >> sun.load.js(_url, function() {
     * >>     // do something
     * >> })
     * => undefined
     * => false  // is url is loaded
     */
    self.js = function(src, callback) {
        if (!!_isUrlLoaded(src)) {
            if (typeof callback === 'function') {
                callback();
            }
            return false;
        }

        var script = document.createElement('script'),
            loaded;

        script.setAttribute('src', src);

        if (!!callback) {
            script.onreadystatechange = script.onload = function() {
                if (!loaded) {
                    _registerUrl(src);
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    /**
     * >> sun.load.getUrlLoaded();
     * => { http://xx.xx/sun.js : true, 
     * =>   http://xx.xx/sun.css: true }
     *
     * .tg true  => loaded
     *     false => removed
     */
    self.getUrlLoaded = function() {
        var links  = document.getElementsByTagName('link');

        for (var i = 0, max = links.length; i < max; i++) {
            if (!_isUrlLoaded(links[i].href)) {
                _registerUrl(links[i].href);
            }
        };

        return __loadedUrls;
    };

    return self;
}();

sun.ajax = function() {
    var mime = {
            html: 'html',
            js: 'script',
            json: 'json',
            xml: 'xml',
            txt: 'text'
        },
        __XMLHttpRequest;

    var _stringifyData = function(sType, oData) {
        var _data = oData;

        if ((sType.toUpperCase() === 'POST') && ( !! oData)) {
            _data = JSON.stringify(oData);
        }

        return _data;
    };

    var defaults = {
        replaceURL: false,
        target: "#loadingbar-frame",
        
        /* Deafult Ajax Parameters  */
        async: true,
        type: "",
        url: "",
        data: "",
        dataType: "",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        cache: true,
        global: true,
        headers: {},
        timeout: 60000,
        statusCode: {},
        beforeSend: function(XMLHttpRequest) {
            /* loading */
            if ((!!sun.loading)&&(!!sun.loading.config.isWorking)) {
                var _type = sun.loading.config['type'];

                sun.loading[_type].start();
            }
        },
        success: function(data, textStatus, XMLHttpRequest) {},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status !== 200) return;
            // => [Object, "parsererror", SyntaxError]
            var _txt = '---------------- sun.ajax error -------------------'
                     + '\n\rstatus ---> ' + textStatus
                     + '\n\rdetail ---> ' + errorThrown.message
                     + '\n\r       ---> ' + errorThrown.stack
                     + '\n\r---------------- /sun.ajax error -------------------';

            console.error(_txt);
        },
        complete: function(XMLHttpRequest, textStatus) {
            if (textStatus !== 'success') {
                var _txt = '---------------- sun.ajax complete -------------------'
                     + '\n\rstatus ---> ' + textStatus
                     + '\n\rdetail ---> ' + XMLHttpRequest.status + '  (' + XMLHttpRequest.statusText + ')'
                     + '\n\rXMLHttpRequest ---> ' + sun.ajax.lastXMLHttpRequest()
                     + '\n\r---------------- /sun.ajax complete -------------------';

                __XMLHttpRequest = XMLHttpRequest;

                console.error(_txt);
            }
        }
    };
    var base = function(settings) {
        var _data = null;

        /* restore default config */
        __XMLHttpRequest = null;

        if (settings.url.indexOf('?') === -1){
            settings.url = settings.url + '?t=' + Math.random();
        }else {
            settings.url = settings.url + '&t=' + Math.random();
        };

        $.ajax({
            type: settings.type,
            url: settings.url,
            data: settings.data,
            async: settings.async,
            cache: settings.cache,
            contentType: settings.contentType,
            global: settings.global,
            headers: settings.headers,
            statusCode: settings.statusCode,
            dataType : settings.dataType,
            timeout: settings.timeout,
            /* Deafult Ajax Event */
            beforeSend: settings.beforeSend,
            success: settings.success,        //请求成功后调用
            error: settings.error,
            complete: settings.complete,         //请求完成后调用
        }).always(function() {
            /* loading */
            if ((!!sun.loading)&&(!!sun.loading.config.isWorking)) {
                var _type = sun.loading.config['type'];

                sun.loading[_type].end();
            }
        }).done(function(data, textStatus, XMLHttpRequest) {     //请求成功后调用(deferred对象的方法)
            if (typeof settings.done === 'function') {
                settings.done(data, textStatus, XMLHttpRequest);
            }
        });

        return _data;
    };
    var parseOptions = function(typeName, sUrl, sType, sDataType, oData, fnCallBack, isShlowLoading, isAsync) {
        var _setting = {};

        if (typeName === 'object'){
            _setting = $.extend({}, defaults, sUrl);

            if (!!sUrl['done'] && typeof sUrl.done === 'function') {
                _setting.done = sUrl.done;
            }
        } else {
            _setting.url = sUrl;
            _setting.type = sType;
            _setting.dataType = sDataType;
            _setting.data = oData;
            _setting.isShlowLoading = isShlowLoading;
            _setting.isAsync = isAsync;
            _setting.done = fnCallBack;

            _setting = $.extend({}, defaults, _setting);
        }
        
        return _setting;
    };

    return {
        // >> sun.ajax.post('url', function (json) {
        // >>     console.log(json);
        // >> });
        // => { "name" : "sun.js" }
        // ****** or this way : ******
        // >> sun.ajax.post({
        // >>   url : 'url',
        // >>   done : function (json) {
        // >>      console.log(json);
        // >>   }
        // >> });
        // => { "name" : "sun.js" }
        post: function(sPageUrl, oData, fnCallBack, isAsync) {
            if (typeof sPageUrl === 'object') {
                sPageUrl.type = 'POST';
                sPageUrl.dataType = mime.json;
                _options = parseOptions('object', sPageUrl);
            } else {
                if ((typeof oData === 'function') && (!fnCallBack)) {
                    fnCallBack = oData;
                    oData = null;
                };

                _options = parseOptions('!object', sPageUrl, 'POST', mime.json, oData, fnCallBack, false, isAsync);
            }
            
            return base(_options);
        },
        // >> sun.ajax.getJSON('url', function (json) {
        // >>     console.log(json);
        // >> });
        // => { "name" : "sun.js" }
        // ****** or this way : ******
        // >> sun.ajax.getJSON({
        // >>   url : 'url',
        // >>   done : function (json) {
        // >>      console.log(json);
        // >>   }
        // >> });
        // => { "name" : "sun.js" }
        getJSON: function(sPageUrl, oData, fnCallBack, isAsync) {
            if (typeof sPageUrl === 'object') {
                sPageUrl.type = 'get';
                sPageUrl.dataType = mime.json;
                _options = parseOptions('object', sPageUrl);
            } else {
                if ((typeof oData === 'function') && (!fnCallBack)) {
                    fnCallBack = oData;
                    oData = null;
                };

                _options = parseOptions('!object', sPageUrl, 'get', mime.json, oData, fnCallBack, false, isAsync);
            }
            
            return base(_options);
        },
        lastXMLHttpRequest: function() {
            return __XMLHttpRequest
        }
    }
}();

sun.$ = function(query) {
    return document.querySelectorAll(query);
};


sun.key = (function() {
    var self = {},
        keys = {
            'Esc' : 27,
            'Enter' : 13
        },
        keysEvent  = {

        },
        lastKey = null;

    self.__init = function() {
        document.addEventListener('keyup', function(evt) {
            lastKey = evt;

            var keyEvt = keysEvent[evt.keyCode];
            if (!!keyEvt) {
                for(var i = 0, max = keyEvt.length; i < max; i ++) {
                    if (typeof keyEvt[i] === 'function') {
                        keyEvt[i]();
                    }
                }
            }
        });
    };

    //
    self.set = function(keyCode, fnCallBack) {
        if (typeof keyCode != 'number') {
            return 'the Parameters -> keycode is number';
        }
        if (typeof fnCallBack != 'function') {
            return 'the Parameters -> fnCallBack is function';
        }

        var evt = keysEvent[keyCode];
        if (!!evt) {
            evt.push(fnCallBack);
        } else {
            evt = [];

            evt.push(fnCallBack);

            keysEvent[keyCode] = evt;
        }
    };

    self.removeEvent = function(keyCode, fnCallBack) {
        if ((keysEvent[keyCode].length > 0)&&(keysEvent[keyCode].indexOf(fnCallBack) > -1)) {
            var index = keysEvent[keyCode].indexOf(fnCallBack);

            keysEvent[keyCode][index] = null;
        }

    };

    self.removeAllEvent = function(keyCode) {
        if (keysEvent[keyCode].length > 0) {
            keysEvent[keyCode] = [];
        }
    };

    self.getLastKey = function() {
        return lastKey;
    };


    self.__init();

    return self;
})();


// var __readyFuns = [];   
// function DOMReady(){   
//     for(var i=0,l=readyFuns.length;i&lt;l;i++){   
//       readyFun();   
//     }   
//     readyFuns = null;   
//     document.removeEventListener('DOMContentLoaded',DOMReady,false);   
// };
// sun.ready = function(fn){
//     if(readyFuns.length == 0){   
//        document.addEventListener('DOMContentLoaded',DOMReady,false);   
//     }   
//     readyFuns.push(fn);   
// }  


sun.context = sun.context || {};

sun.context.getQueryStringByName = function(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

    if (result == null || result.length < 1) {
        return "";
    }

    return result[1];
};

sun.context.cookie = (function(){
    // .eg article detail http://www.cnblogs.com/Darren_code/archive/2011/11/24/Cookie.html
    var self  = {};

    self.setExpires = function (name,value,expiresValue){
        var Days = expiresValue; 
        var exp  = new Date();    //new Date("December 31, 9998");
        
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    };

    self.set = function (name,value){
        var Days = 30; //此 cookie 将被保存 30 天
        
        this.setExpires(name, value, Days);
    };

    self.get = function (name){
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));

        if(arr != null) {
            return unescape(arr[2]);
        }
        return null;
    };

    self.getAll = function() {
        return document.cookie;
    };

    self.del = function (name){
        var exp = new Date();
        var cval= this.get(name);

        exp.setTime(exp.getTime() - 1);
        if(cval!=null) {
            document.cookie= name + "="+cval+";expires="+exp.toGMTString();
        }
    };

    return self;
})();

sun.context.localStorage = (function(global) {
    
    var self = {
        _ls : global.localStorage
    };

    self.set = function(name, value) {
        this._ls.setItem(name,value.toString())
    };

    self.get = function(name) {
        return this._ls.getItem(name);
    };
    self.getAll = function() {
        return this._ls;
    };

    self.del = function(name) {
        var val = this.get(name);

        if (!!val) {
            this.__ls.removeItem("c");
        }
    };

    self.clearAll = function() {
        global.localStorage.clear()
    };

    return self;
})(window);

//-----------------------------  undealed  -----------------------------------
function ___addEvent (type, element, fun) {
    if (element.addEventListener) {
        addEvent = function (type, element, fun) {
            element.addEventListener(type, fun, false);
        }
    }
    else if(element.attachEvent){
        addEvent = function (type, element, fun) {
            element.attachEvent('on' + type, fun);
        }
    }
    else{
        addEvent = function (type, element, fun) {
            element['on' + type] = fun;
        }
    }
    return addEvent(type, element, fun);
}