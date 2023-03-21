/* prism.min.js */
var _self = "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {}
    , Prism = function () {
        var e = /\blang(?:uage)?-(\w+)\b/i
            , t = 0
            , a = _self.Prism = {
                util: {
                    encode: function (e) {
                        return e instanceof n ? new n(e.type, a.util.encode(e.content), e.alias) : "Array" === a.util.type(e) ? e.map(a.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ")
                    },
                    type: function (e) {
                        return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]
                    },
                    objId: function (e) {
                        return e.__id || Object.defineProperty(e, "__id", {
                            value: ++t
                        }),
                            e.__id
                    },
                    clone: function (e) {
                        var t = a.util.type(e);
                        switch (t) {
                            case "Object":
                                var n = {};
                                for (var r in e)
                                    e.hasOwnProperty(r) && (n[r] = a.util.clone(e[r]));
                                return n;
                            case "Array":
                                return e.map && e.map(function (e) {
                                    return a.util.clone(e)
                                })
                        }
                        return e
                    }
                },
                languages: {
                    extend: function (e, t) {
                        var n = a.util.clone(a.languages[e]);
                        for (var r in t)
                            n[r] = t[r];
                        return n
                    },
                    insertBefore: function (e, t, n, r) {
                        r = r || a.languages;
                        var i = r[e];
                        if (2 == arguments.length) {
                            n = arguments[1];
                            for (var s in n)
                                n.hasOwnProperty(s) && (i[s] = n[s]);
                            return i
                        }
                        var l = {};
                        for (var o in i)
                            if (i.hasOwnProperty(o)) {
                                if (o == t)
                                    for (var s in n)
                                        n.hasOwnProperty(s) && (l[s] = n[s]);
                                l[o] = i[o]
                            }
                        return a.languages.DFS(a.languages, function (t, a) {
                            a === r[e] && t != e && (this[t] = l)
                        }),
                            r[e] = l
                    },
                    DFS: function (e, t, n, r) {
                        r = r || {};
                        for (var i in e)
                            e.hasOwnProperty(i) && (t.call(e, i, e[i], n || i),
                                "Object" !== a.util.type(e[i]) || r[a.util.objId(e[i])] ? "Array" !== a.util.type(e[i]) || r[a.util.objId(e[i])] || (r[a.util.objId(e[i])] = !0,
                                    a.languages.DFS(e[i], t, i, r)) : (r[a.util.objId(e[i])] = !0,
                                        a.languages.DFS(e[i], t, null, r)))
                    }
                },
                plugins: {},
                highlightAll: function (e, t) {
                    var n = {
                        callback: t,
                        selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
                    };
                    a.hooks.run("before-highlightall", n);
                    for (var r, i = n.elements || document.querySelectorAll(n.selector), s = 0; r = i[s++];)
                        a.highlightElement(r, e === !0, n.callback)
                },
                highlightElement: function (t, n, r) {
                    for (var i, s, l = t; l && !e.test(l.className);)
                        l = l.parentNode;
                    l && (i = (l.className.match(e) || [, ""])[1].toLowerCase(),
                        s = a.languages[i]),
                        t.className = t.className.replace(e, "").replace(/\s+/g, " ") + " language-" + i,
                        l = t.parentNode,
                        /pre/i.test(l.nodeName) && (l.className = l.className.replace(e, "").replace(/\s+/g, " ") + " language-" + i);
                    var o = t.textContent
                        , u = {
                            element: t,
                            language: i,
                            grammar: s,
                            code: o
                        };
                    if (a.hooks.run("before-sanity-check", u),
                        !u.code || !u.grammar)
                        return u.code && (u.element.textContent = u.code),
                            void a.hooks.run("complete", u);
                    if (a.hooks.run("before-highlight", u),
                        n && _self.Worker) {
                        var g = new Worker(a.filename);
                        g.onmessage = function (e) {
                            u.highlightedCode = e.data,
                                a.hooks.run("before-insert", u),
                                u.element.innerHTML = u.highlightedCode,
                                r && r.call(u.element),
                                a.hooks.run("after-highlight", u),
                                a.hooks.run("complete", u)
                        }
                            ,
                            g.postMessage(JSON.stringify({
                                language: u.language,
                                code: u.code,
                                immediateClose: !0
                            }))
                    } else
                        u.highlightedCode = a.highlight(u.code, u.grammar, u.language),
                            a.hooks.run("before-insert", u),
                            u.element.innerHTML = u.highlightedCode,
                            r && r.call(t),
                            a.hooks.run("after-highlight", u),
                            a.hooks.run("complete", u)
                },
                highlight: function (e, t, r) {
                    var i = a.tokenize(e, t);
                    return n.stringify(a.util.encode(i), r)
                },
                tokenize: function (e, t, n) {
                    var r = a.Token
                        , i = [e]
                        , s = t.rest;
                    if (s) {
                        for (var l in s)
                            t[l] = s[l];
                        delete t.rest
                    }
                    e: for (var l in t)
                        if (t.hasOwnProperty(l) && t[l]) {
                            var o = t[l];
                            o = "Array" === a.util.type(o) ? o : [o];
                            for (var u = 0; u < o.length; ++u) {
                                var g = o[u]
                                    , c = g.inside
                                    , p = !!g.lookbehind
                                    , d = !!g.greedy
                                    , m = 0
                                    , h = g.alias;
                                if (d && !g.pattern.global) {
                                    var f = g.pattern.toString().match(/[imuy]*$/)[0];
                                    g.pattern = RegExp(g.pattern.source, f + "g")
                                }
                                g = g.pattern || g;
                                for (var y = 0, b = 0; y < i.length; b += i[y].length,
                                    ++y) {
                                    var v = i[y];
                                    if (i.length > e.length)
                                        break e;
                                    if (!(v instanceof r)) {
                                        g.lastIndex = 0;
                                        var w = g.exec(v)
                                            , k = 1;
                                        if (!w && d && y != i.length - 1) {
                                            if (g.lastIndex = b,
                                                w = g.exec(e),
                                                !w)
                                                break;
                                            for (var P = w.index + (p ? w[1].length : 0), x = w.index + w[0].length, A = y, j = b, _ = i.length; A < _ && j < x; ++A)
                                                j += i[A].length,
                                                    P >= j && (++y,
                                                        b = j);
                                            if (i[y] instanceof r || i[A - 1].greedy)
                                                continue;
                                            k = A - y,
                                                v = e.slice(b, j),
                                                w.index -= b
                                        }
                                        if (w) {
                                            p && (m = w[1].length);
                                            var P = w.index + m
                                                , w = w[0].slice(m)
                                                , x = P + w.length
                                                , C = v.slice(0, P)
                                                , E = v.slice(x)
                                                , N = [y, k];
                                            C && N.push(C);
                                            var S = new r(l, c ? a.tokenize(w, c) : w, h, w, d);
                                            N.push(S),
                                                E && N.push(E),
                                                Array.prototype.splice.apply(i, N)
                                        }
                                    }
                                }
                            }
                        }
                    return i
                },
                hooks: {
                    all: {},
                    add: function (e, t) {
                        var n = a.hooks.all;
                        n[e] = n[e] || [],
                            n[e].push(t)
                    },
                    run: function (e, t) {
                        var n = a.hooks.all[e];
                        if (n && n.length)
                            for (var r, i = 0; r = n[i++];)
                                r(t)
                    }
                }
            }
            , n = a.Token = function (e, t, a, n, r) {
                this.type = e,
                    this.content = t,
                    this.alias = a,
                    this.length = 0 | (n || "").length,
                    this.greedy = !!r
            }
            ;
        if (n.stringify = function (e, t, r) {
            if ("string" == typeof e)
                return e;
            if ("Array" === a.util.type(e))
                return e.map(function (a) {
                    return n.stringify(a, t, e)
                }).join("");
            var i = {
                type: e.type,
                content: n.stringify(e.content, t, r),
                tag: "span",
                classes: ["token", e.type],
                attributes: {},
                language: t,
                parent: r
            };
            if ("comment" == i.type && (i.attributes.spellcheck = "true"),
                e.alias) {
                var s = "Array" === a.util.type(e.alias) ? e.alias : [e.alias];
                Array.prototype.push.apply(i.classes, s)
            }
            a.hooks.run("wrap", i);
            var l = Object.keys(i.attributes).map(function (e) {
                return e + '="' + (i.attributes[e] || "").replace(/"/g, "&quot;") + '"'
            }).join(" ");
            return "<" + i.tag + ' class="' + i.classes.join(" ") + '"' + (l ? " " + l : "") + ">" + i.content + "</" + i.tag + ">"
        }
            ,
            !_self.document)
            return _self.addEventListener ? (_self.addEventListener("message", function (e) {
                var t = JSON.parse(e.data)
                    , n = t.language
                    , r = t.code
                    , i = t.immediateClose;
                _self.postMessage(a.highlight(r, a.languages[n], n)),
                    i && _self.close()
            }, !1),
                _self.Prism) : _self.Prism;
        var r = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();
        return r && (a.filename = r.src,
            document.addEventListener && !r.hasAttribute("data-manual") && ("loading" !== document.readyState ? window.requestAnimationFrame ? window.requestAnimationFrame(a.highlightAll) : window.setTimeout(a.highlightAll, 16) : document.addEventListener("DOMContentLoaded", a.highlightAll))),
            _self.Prism
    }();
"undefined" != typeof module && module.exports && (module.exports = Prism),
    "undefined" != typeof global && (global.Prism = Prism),
    Prism.languages.markup = {
        comment: /<!--[\w\W]*?-->/,
        prolog: /<\?[\w\W]+?\?>/,
        doctype: /<!DOCTYPE[\w\W]+?>/i,
        cdata: /<!\[CDATA\[[\w\W]*?]]>/i,
        tag: {
            pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
            inside: {
                tag: {
                    pattern: /^<\/?[^\s>\/]+/i,
                    inside: {
                        punctuation: /^<\/?/,
                        namespace: /^[^\s>\/:]+:/
                    }
                },
                "attr-value": {
                    pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
                    inside: {
                        punctuation: /[=>"']/
                    }
                },
                punctuation: /\/?>/,
                "attr-name": {
                    pattern: /[^\s>\/]+/,
                    inside: {
                        namespace: /^[^\s>\/:]+:/
                    }
                }
            }
        },
        entity: /&#?[\da-z]{1,8};/i
    },
    Prism.hooks.add("wrap", function (e) {
        "entity" === e.type && (e.attributes.title = e.content.replace(/&amp;/, "&"))
    }),
    Prism.languages.xml = Prism.languages.markup,
    Prism.languages.html = Prism.languages.markup,
    Prism.languages.mathml = Prism.languages.markup,
    Prism.languages.svg = Prism.languages.markup,
    Prism.languages.css = {
        comment: /\/\*[\w\W]*?\*\//,
        atrule: {
            pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
            inside: {
                rule: /@[\w-]+/
            }
        },
        url: /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
        selector: /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
        string: {
            pattern: /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
            greedy: !0
        },
        property: /(\b|\B)[\w-]+(?=\s*:)/i,
        important: /\B!important\b/i,
        function: /[-a-z0-9]+(?=\()/i,
        punctuation: /[(){};:]/
    },
    Prism.languages.css.atrule.inside.rest = Prism.util.clone(Prism.languages.css),
    Prism.languages.markup && (Prism.languages.insertBefore("markup", "tag", {
        style: {
            pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
            lookbehind: !0,
            inside: Prism.languages.css,
            alias: "language-css"
        }
    }),
        Prism.languages.insertBefore("inside", "attr-value", {
            "style-attr": {
                pattern: /\s*style=("|').*?\1/i,
                inside: {
                    "attr-name": {
                        pattern: /^\s*style/i,
                        inside: Prism.languages.markup.tag.inside
                    },
                    punctuation: /^\s*=\s*['"]|['"]\s*$/,
                    "attr-value": {
                        pattern: /.+/i,
                        inside: Prism.languages.css
                    }
                },
                alias: "language-css"
            }
        }, Prism.languages.markup.tag)),
    Prism.languages.clike = {
        comment: [{
            pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
            lookbehind: !0
        }, {
            pattern: /(^|[^\\:])\/\/.*/,
            lookbehind: !0
        }],
        string: {
            pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
            greedy: !0
        },
        "class-name": {
            pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
            lookbehind: !0,
            inside: {
                punctuation: /(\.|\\)/
            }
        },
        keyword: /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
        boolean: /\b(true|false)\b/,
        function: /[a-z0-9_]+(?=\()/i,
        number: /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
        operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
        punctuation: /[{}[\];(),.:]/
    },
    Prism.languages.javascript = Prism.languages.extend("clike", {
        keyword: /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
        number: /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
        function: /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i,
        operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*\*?|\/|~|\^|%|\.{3}/
    }),
    Prism.languages.insertBefore("javascript", "keyword", {
        regex: {
            pattern: /(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
            lookbehind: !0,
            greedy: !0
        }
    }),
    Prism.languages.insertBefore("javascript", "string", {
        "template-string": {
            pattern: /`(?:\\\\|\\?[^\\])*?`/,
            greedy: !0,
            inside: {
                interpolation: {
                    pattern: /\$\{[^}]+\}/,
                    inside: {
                        "interpolation-punctuation": {
                            pattern: /^\$\{|\}$/,
                            alias: "punctuation"
                        },
                        rest: Prism.languages.javascript
                    }
                },
                string: /[\s\S]+/
            }
        }
    }),
    Prism.languages.markup && Prism.languages.insertBefore("markup", "tag", {
        script: {
            pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
            lookbehind: !0,
            inside: Prism.languages.javascript,
            alias: "language-javascript"
        }
    }),
    Prism.languages.js = Prism.languages.javascript,
    function () {
        "undefined" != typeof self && self.Prism && self.document && document.querySelector && (self.Prism.fileHighlight = function () {
            var e = {
                js: "javascript",
                py: "python",
                rb: "ruby",
                ps1: "powershell",
                psm1: "powershell",
                sh: "bash",
                bat: "batch",
                h: "c",
                tex: "latex"
            };
            Array.prototype.forEach && Array.prototype.slice.call(document.querySelectorAll("pre[data-src]")).forEach(function (t) {
                for (var a, n = t.getAttribute("data-src"), r = t, i = /\blang(?:uage)?-(?!\*)(\w+)\b/i; r && !i.test(r.className);)
                    r = r.parentNode;
                if (r && (a = (t.className.match(i) || [, ""])[1]),
                    !a) {
                    var s = (n.match(/\.(\w+)$/) || [, ""])[1];
                    a = e[s] || s
                }
                var l = document.createElement("code");
                l.className = "language-" + a,
                    t.textContent = "",
                    l.textContent = "Loading…",
                    t.appendChild(l);
                var o = new XMLHttpRequest;
                o.open("GET", n, !0),
                    o.onreadystatechange = function () {
                        4 == o.readyState && (o.status < 400 && o.responseText ? (l.textContent = o.responseText,
                            Prism.highlightElement(l)) : o.status >= 400 ? l.textContent = "✖ Error " + o.status + " while fetching file: " + o.statusText : l.textContent = "✖ Error: File does not exist or is empty")
                    }
                    ,
                    o.send(null)
            })
        }
            ,
            document.addEventListener("DOMContentLoaded", self.Prism.fileHighlight))
    }();

/*! clipboard.js v2.0.0 | https://zenorocha.github.io/clipboard.js | Licensed MIT © Zeno Rocha */
!function (t, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.ClipboardJS = e() : t.ClipboardJS = e()
}(this, function () {
    return function (t) {
        function e(o) {
            if (n[o])
                return n[o].exports;
            var r = n[o] = {
                i: o,
                l: !1,
                exports: {}
            };
            return t[o].call(r.exports, r, r.exports, e),
                r.l = !0,
                r.exports
        }
        var n = {};
        return e.m = t,
            e.c = n,
            e.i = function (t) {
                return t
            }
            ,
            e.d = function (t, n, o) {
                e.o(t, n) || Object.defineProperty(t, n, {
                    configurable: !1,
                    enumerable: !0,
                    get: o
                })
            }
            ,
            e.n = function (t) {
                var n = t && t.__esModule ? function () {
                    return t.default
                }
                    : function () {
                        return t
                    }
                    ;
                return e.d(n, "a", n),
                    n
            }
            ,
            e.o = function (t, e) {
                return Object.prototype.hasOwnProperty.call(t, e)
            }
            ,
            e.p = "",
            e(e.s = 3)
    }([function (t, e, n) {
        var o, r, i;
        !function (a, c) {
            r = [t, n(7)],
                o = c,
                void 0 !== (i = "function" == typeof o ? o.apply(e, r) : o) && (t.exports = i)
        }(0, function (t, e) {
            "use strict";
            function n(t, e) {
                if (!(t instanceof e))
                    throw new TypeError("Cannot call a class as a function")
            }
            var o = function (t) {
                return t && t.__esModule ? t : {
                    default: t
                }
            }(e)
                , r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
                    return typeof t
                }
                    : function (t) {
                        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
                    }
                , i = function () {
                    function t(t, e) {
                        for (var n = 0; n < e.length; n++) {
                            var o = e[n];
                            o.enumerable = o.enumerable || !1,
                                o.configurable = !0,
                                "value" in o && (o.writable = !0),
                                Object.defineProperty(t, o.key, o)
                        }
                    }
                    return function (e, n, o) {
                        return n && t(e.prototype, n),
                            o && t(e, o),
                            e
                    }
                }()
                , a = function () {
                    function t(e) {
                        n(this, t),
                            this.resolveOptions(e),
                            this.initSelection()
                    }
                    return i(t, [{
                        key: "resolveOptions",
                        value: function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                            this.action = t.action,
                                this.container = t.container,
                                this.emitter = t.emitter,
                                this.target = t.target,
                                this.text = t.text,
                                this.trigger = t.trigger,
                                this.selectedText = ""
                        }
                    }, {
                        key: "initSelection",
                        value: function () {
                            this.text ? this.selectFake() : this.target && this.selectTarget()
                        }
                    }, {
                        key: "selectFake",
                        value: function () {
                            var t = this
                                , e = "rtl" == document.documentElement.getAttribute("dir");
                            this.removeFake(),
                                this.fakeHandlerCallback = function () {
                                    return t.removeFake()
                                }
                                ,
                                this.fakeHandler = this.container.addEventListener("click", this.fakeHandlerCallback) || !0,
                                this.fakeElem = document.createElement("textarea"),
                                this.fakeElem.style.fontSize = "12pt",
                                this.fakeElem.style.border = "0",
                                this.fakeElem.style.padding = "0",
                                this.fakeElem.style.margin = "0",
                                this.fakeElem.style.position = "absolute",
                                this.fakeElem.style[e ? "right" : "left"] = "-9999px";
                            var n = window.pageYOffset || document.documentElement.scrollTop;
                            this.fakeElem.style.top = n + "px",
                                this.fakeElem.setAttribute("readonly", ""),
                                this.fakeElem.value = this.text,
                                this.container.appendChild(this.fakeElem),
                                this.selectedText = (0,
                                    o.default)(this.fakeElem),
                                this.copyText()
                        }
                    }, {
                        key: "removeFake",
                        value: function () {
                            this.fakeHandler && (this.container.removeEventListener("click", this.fakeHandlerCallback),
                                this.fakeHandler = null,
                                this.fakeHandlerCallback = null),
                                this.fakeElem && (this.container.removeChild(this.fakeElem),
                                    this.fakeElem = null)
                        }
                    }, {
                        key: "selectTarget",
                        value: function () {
                            this.selectedText = (0,
                                o.default)(this.target),
                                this.copyText()
                        }
                    }, {
                        key: "copyText",
                        value: function () {
                            var t = void 0;
                            try {
                                t = document.execCommand(this.action)
                            } catch (e) {
                                t = !1
                            }
                            this.handleResult(t)
                        }
                    }, {
                        key: "handleResult",
                        value: function (t) {
                            this.emitter.emit(t ? "success" : "error", {
                                action: this.action,
                                text: this.selectedText,
                                trigger: this.trigger,
                                clearSelection: this.clearSelection.bind(this)
                            })
                        }
                    }, {
                        key: "clearSelection",
                        value: function () {
                            this.trigger && this.trigger.focus(),
                                window.getSelection().removeAllRanges()
                        }
                    }, {
                        key: "destroy",
                        value: function () {
                            this.removeFake()
                        }
                    }, {
                        key: "action",
                        set: function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "copy";
                            if (this._action = t,
                                "copy" !== this._action && "cut" !== this._action)
                                throw new Error('Invalid "action" value, use either "copy" or "cut"')
                        },
                        get: function () {
                            return this._action
                        }
                    }, {
                        key: "target",
                        set: function (t) {
                            if (void 0 !== t) {
                                if (!t || "object" !== (void 0 === t ? "undefined" : r(t)) || 1 !== t.nodeType)
                                    throw new Error('Invalid "target" value, use a valid Element');
                                if ("copy" === this.action && t.hasAttribute("disabled"))
                                    throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                                if ("cut" === this.action && (t.hasAttribute("readonly") || t.hasAttribute("disabled")))
                                    throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                                this._target = t
                            }
                        },
                        get: function () {
                            return this._target
                        }
                    }]),
                        t
                }();
            t.exports = a
        })
    }
        , function (t, e, n) {
            function o(t, e, n) {
                if (!t && !e && !n)
                    throw new Error("Missing required arguments");
                if (!c.string(e))
                    throw new TypeError("Second argument must be a String");
                if (!c.fn(n))
                    throw new TypeError("Third argument must be a Function");
                if (c.node(t))
                    return r(t, e, n);
                if (c.nodeList(t))
                    return i(t, e, n);
                if (c.string(t))
                    return a(t, e, n);
                throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")
            }
            function r(t, e, n) {
                return t.addEventListener(e, n),
                {
                    destroy: function () {
                        t.removeEventListener(e, n)
                    }
                }
            }
            function i(t, e, n) {
                return Array.prototype.forEach.call(t, function (t) {
                    t.addEventListener(e, n)
                }),
                {
                    destroy: function () {
                        Array.prototype.forEach.call(t, function (t) {
                            t.removeEventListener(e, n)
                        })
                    }
                }
            }
            function a(t, e, n) {
                return u(document.body, t, e, n)
            }
            var c = n(6)
                , u = n(5);
            t.exports = o
        }
        , function (t, e) {
            function n() { }
            n.prototype = {
                on: function (t, e, n) {
                    var o = this.e || (this.e = {});
                    return (o[t] || (o[t] = [])).push({
                        fn: e,
                        ctx: n
                    }),
                        this
                },
                once: function (t, e, n) {
                    function o() {
                        r.off(t, o),
                            e.apply(n, arguments)
                    }
                    var r = this;
                    return o._ = e,
                        this.on(t, o, n)
                },
                emit: function (t) {
                    var e = [].slice.call(arguments, 1)
                        , n = ((this.e || (this.e = {}))[t] || []).slice()
                        , o = 0
                        , r = n.length;
                    for (o; o < r; o++)
                        n[o].fn.apply(n[o].ctx, e);
                    return this
                },
                off: function (t, e) {
                    var n = this.e || (this.e = {})
                        , o = n[t]
                        , r = [];
                    if (o && e)
                        for (var i = 0, a = o.length; i < a; i++)
                            o[i].fn !== e && o[i].fn._ !== e && r.push(o[i]);
                    return r.length ? n[t] = r : delete n[t],
                        this
                }
            },
                t.exports = n
        }
        , function (t, e, n) {
            var o, r, i;
            !function (a, c) {
                r = [t, n(0), n(2), n(1)],
                    o = c,
                    void 0 !== (i = "function" == typeof o ? o.apply(e, r) : o) && (t.exports = i)
            }(0, function (t, e, n, o) {
                "use strict";
                function r(t) {
                    return t && t.__esModule ? t : {
                        default: t
                    }
                }
                function i(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }
                function a(t, e) {
                    if (!t)
                        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    return !e || "object" != typeof e && "function" != typeof e ? t : e
                }
                function c(t, e) {
                    if ("function" != typeof e && null !== e)
                        throw new TypeError("Super expression must either be null or a function, not " + typeof e);
                    t.prototype = Object.create(e && e.prototype, {
                        constructor: {
                            value: t,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    }),
                        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
                }
                function u(t, e) {
                    var n = "data-clipboard-" + t;
                    if (e.hasAttribute(n))
                        return e.getAttribute(n)
                }
                var l = r(e)
                    , s = r(n)
                    , f = r(o)
                    , d = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
                        return typeof t
                    }
                        : function (t) {
                            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
                        }
                    , h = function () {
                        function t(t, e) {
                            for (var n = 0; n < e.length; n++) {
                                var o = e[n];
                                o.enumerable = o.enumerable || !1,
                                    o.configurable = !0,
                                    "value" in o && (o.writable = !0),
                                    Object.defineProperty(t, o.key, o)
                            }
                        }
                        return function (e, n, o) {
                            return n && t(e.prototype, n),
                                o && t(e, o),
                                e
                        }
                    }()
                    , p = function (t) {
                        function e(t, n) {
                            i(this, e);
                            var o = a(this, (e.__proto__ || Object.getPrototypeOf(e)).call(this));
                            return o.resolveOptions(n),
                                o.listenClick(t),
                                o
                        }
                        return c(e, t),
                            h(e, [{
                                key: "resolveOptions",
                                value: function () {
                                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                                    this.action = "function" == typeof t.action ? t.action : this.defaultAction,
                                        this.target = "function" == typeof t.target ? t.target : this.defaultTarget,
                                        this.text = "function" == typeof t.text ? t.text : this.defaultText,
                                        this.container = "object" === d(t.container) ? t.container : document.body
                                }
                            }, {
                                key: "listenClick",
                                value: function (t) {
                                    var e = this;
                                    this.listener = (0,
                                        f.default)(t, "click", function (t) {
                                            return e.onClick(t)
                                        })
                                }
                            }, {
                                key: "onClick",
                                value: function (t) {
                                    var e = t.delegateTarget || t.currentTarget;
                                    this.clipboardAction && (this.clipboardAction = null),
                                        this.clipboardAction = new l.default({
                                            action: this.action(e),
                                            target: this.target(e),
                                            text: this.text(e),
                                            container: this.container,
                                            trigger: e,
                                            emitter: this
                                        })
                                }
                            }, {
                                key: "defaultAction",
                                value: function (t) {
                                    return u("action", t)
                                }
                            }, {
                                key: "defaultTarget",
                                value: function (t) {
                                    var e = u("target", t);
                                    if (e)
                                        return document.querySelector(e)
                                }
                            }, {
                                key: "defaultText",
                                value: function (t) {
                                    return u("text", t)
                                }
                            }, {
                                key: "destroy",
                                value: function () {
                                    this.listener.destroy(),
                                        this.clipboardAction && (this.clipboardAction.destroy(),
                                            this.clipboardAction = null)
                                }
                            }], [{
                                key: "isSupported",
                                value: function () {
                                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ["copy", "cut"]
                                        , e = "string" == typeof t ? [t] : t
                                        , n = !!document.queryCommandSupported;
                                    return e.forEach(function (t) {
                                        n = n && !!document.queryCommandSupported(t)
                                    }),
                                        n
                                }
                            }]),
                            e
                    }(s.default);
                t.exports = p
            })
        }
        , function (t, e) {
            function n(t, e) {
                for (; t && t.nodeType !== o;) {
                    if ("function" == typeof t.matches && t.matches(e))
                        return t;
                    t = t.parentNode
                }
            }
            var o = 9;
            if ("undefined" != typeof Element && !Element.prototype.matches) {
                var r = Element.prototype;
                r.matches = r.matchesSelector || r.mozMatchesSelector || r.msMatchesSelector || r.oMatchesSelector || r.webkitMatchesSelector
            }
            t.exports = n
        }
        , function (t, e, n) {
            function o(t, e, n, o, r) {
                var a = i.apply(this, arguments);
                return t.addEventListener(n, a, r),
                {
                    destroy: function () {
                        t.removeEventListener(n, a, r)
                    }
                }
            }
            function r(t, e, n, r, i) {
                return "function" == typeof t.addEventListener ? o.apply(null, arguments) : "function" == typeof n ? o.bind(null, document).apply(null, arguments) : ("string" == typeof t && (t = document.querySelectorAll(t)),
                    Array.prototype.map.call(t, function (t) {
                        return o(t, e, n, r, i)
                    }))
            }
            function i(t, e, n, o) {
                return function (n) {
                    n.delegateTarget = a(n.target, e),
                        n.delegateTarget && o.call(t, n)
                }
            }
            var a = n(4);
            t.exports = r
        }
        , function (t, e) {
            e.node = function (t) {
                return void 0 !== t && t instanceof HTMLElement && 1 === t.nodeType
            }
                ,
                e.nodeList = function (t) {
                    var n = Object.prototype.toString.call(t);
                    return void 0 !== t && ("[object NodeList]" === n || "[object HTMLCollection]" === n) && "length" in t && (0 === t.length || e.node(t[0]))
                }
                ,
                e.string = function (t) {
                    return "string" == typeof t || t instanceof String
                }
                ,
                e.fn = function (t) {
                    return "[object Function]" === Object.prototype.toString.call(t)
                }
        }
        , function (t, e) {
            function n(t) {
                var e;
                if ("SELECT" === t.nodeName)
                    t.focus(),
                        e = t.value;
                else if ("INPUT" === t.nodeName || "TEXTAREA" === t.nodeName) {
                    var n = t.hasAttribute("readonly");
                    n || t.setAttribute("readonly", ""),
                        t.select(),
                        t.setSelectionRange(0, t.value.length),
                        n || t.removeAttribute("readonly"),
                        e = t.value
                } else {
                    t.hasAttribute("contenteditable") && t.focus();
                    var o = window.getSelection()
                        , r = document.createRange();
                    r.selectNodeContents(t),
                        o.removeAllRanges(),
                        o.addRange(r),
                        e = o.toString()
                }
                return e
            }
            t.exports = n
        }
    ])
});

/* clipboard Custom js */
var customcard = {
    init: function () {
        $(document).ready(function () {
            var clipboard = new ClipboardJS('.btn-clipboard');
            clipboard.on('success', function (e) {// e.querySelector();
                // e.clearSelection();
            });
            clipboard.on('error', function (e) { });
        });
    }
};
(function ($) {
    "use strict";
    customcard.init()
}
)(jQuery);
