/**
 * ice - Template Engine
 * https://github.com/lovesueee/ice
 * Released under the MIT, BSD, and GPL Licenses
 * Email : lovesueee@gmail.com
 */


(function (win) {

    // 模板引擎路由函数
    var ice = function (id, content) {
        return ice[
            typeof content === 'object' ? 'render' : 'compile'
        ].apply(ice, arguments);
    };


    ice.version = '1.0.0';

    // 模板配置
    var iConfig = {
        openTag  : '<%',
        closeTag : '%>'
    };


    var isNewEngine = !!String.prototype.trim;

    // 模板缓存
    var iCache = ice.cache = {};

    // 辅助函数
    var iHelper = {
        include : function (id, data) {
            return iRender(id, data);
        },
        print : function (str) {
            return str;
        }
    };

    // 原型继承
    var iExtend = Object.create || function (object) {
        function Fn () {};
        Fn.prototype = object;
        return new Fn;
    };

    // 模板编译
    var iCompile = ice.compile = function (id, tpl, options) {

        var cache = null;

        id && (cache = iCache[id]);

        if (cache) {
            return cache;
        }

        // [id | tpl]
        if (typeof tpl !== 'string') {

            var elem = document.getElementById(id);

            options = tpl;

            if (elem) {
                // [id, options]
                options = tpl;
                tpl = elem.value || elem.innerHTML;

            } else {
                //[tpl, options]
                tpl = id;
                id = null;
            }
        }

        options = options || {};
        var render  = iParse(tpl, options);

        id && (iCache[id] = render);

        return render;
    };


    // 模板渲染
    var iRender = ice.render = function (id, data, options) {

        return iCompile(id, options)(data);
    };


    var iForEach = Array.prototype.forEach ?
        function(arr, fn) {
            arr.forEach(fn)
        } :
        function(arr, fn) {
            for (var i = 0; i < arr.length; i++) {
                fn(arr[i], i, arr)
            }
        };


    // 模板解析
    var iParse = function (tpl, options) {

        var html = [];

        var js = [];

        var openTag = options.openTag || iConfig['openTag'];

        var closeTag = options.closeTag || iConfig['closeTag'];

        // 根据浏览器采取不同的拼接字符串策略
        var replaces = isNewEngine
            ?["var out='',line=1;", "out+=", ";", "out+=html[", "];", "this.result=out;"]
            : ["var out=[],line=1;",  "out.push(", ");", "out.push(html[", "]);", "this.result=out.join('');"];

        // 函数体
        var body = replaces[0];

        iForEach(tpl.split(openTag), function(val, i) {

            if (!val) {
                return;
            }

            var parts = val.split(closeTag);

            var head = parts[0];

            var foot = parts[1];

            var len = parts.length;
            // html
            if (len === 1) {
                body += replaces[3] + html.length + replaces[4];
                html.push(head);

            } else {

                if (head ) {
                    // code
                    // 去除空格
                    head = head
                        .replace(/^\s+|\s+$/g, '')
                        .replace(/[\n\r]+\s*/, '')


                    // 输出语句
                    if (head.indexOf('=') === 0) {
                        head = head.substring(1).replace(/^[\s]+|[\s;]+$/g, '');
            
                        body += replaces[1] + head + replaces[2];
                    } else {
                        body += head;
                    }

                    body += 'line+=1;';
                    js.push(head);
                }
                // html
                if (foot) {
                    _foot = foot.replace(/^[\n\r]+\s*/g, '');
                    if (!_foot) {
                        return;
                    }
                    body += replaces[3] + html.length + replaces[4];
                    html.push(foot);
                }
            }
        });

        body = "var Render=function(data){ice.mix(this, data);try{"
            + body
            + replaces[5]
            + "}catch(e){ice.log('rend error : ', line, 'line');ice.log('invalid statement : ', js[line-1]);throw e;}};"
            + "var proto=Render.prototype=iExtend(iHelper);"
            + "ice.mix(proto, options);"
            + "return function(data){return new Render(data).result;};";

        var render = new Function('html', 'js', 'iExtend', 'iHelper', 'options', body);

        return render(html, js, iExtend, iHelper, options);
    };

    ice.log = function () {
        if (typeof console === 'undefined') {
            return;
        }

        var args = Array.prototype.slice.call(arguments);

        console.log.apply && console.log.apply(console, args);

    };

    // 合并对象
    ice.mix = function (target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    };

    // 注册函数
    ice.on = function (name, fn) {
        iHelper[name] = fn;
    };

    // 清除缓存
    ice.clearCache = function () {
        iCache = {};
    };

    // 更改配置
    ice.set = function (name, value) {
        iConfig[name] = value;
    };

    // 暴露接口
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = template;
    } else {
        win.ice = ice;
    }

})(window);