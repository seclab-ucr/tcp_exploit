(function () {
    if (!google.nocsixjs && google.timers && google.timers.load.t) google.timers.load.t.xjses = (new Date).getTime();
})();
(function () {
    var g = true,
        i = false;
    google.browser = {};
    google.browser.engine = {
        IE: i,
        GECKO: i,
        WEBKIT: i,
        OPERA: i
    };
    google.browser.product = {
        IE: i,
        FIREFOX: i,
        SAFARI: i,
        CHROME: i,
        OPERA: i
    };
    google.browser.engine.version = "";
    google.browser.product.version = "";
    google.browser.init = function (a) {
        var b = null,
            c = null;
        if (window.opera) {
            google.browser.engine.OPERA = g;
            google.browser.product.OPERA = g;
            b = c = /Opera\/(\S+)/
        } else if (a.indexOf("MSIE") != -1) {
            google.browser.engine.IE = g;
            google.browser.product.IE = g;
            b = c = /MSIE\s+([^\);]+)(\)|;)/
        } else if (a.indexOf("WebKit") != -1) {
            google.browser.engine.WEBKIT = g;
            if (a.indexOf("Chrome") != -1) {
                google.browser.product.CHROME = g;
                c = /Chrome\/(\S+)/
            } else if (a.indexOf("Safari") != -1) {
                google.browser.product.SAFARI = g;
                c = /Version\/(\S+)/
            }
            b = /WebKit\/(\S+)/
        } else if (a.indexOf("Gecko") != -1) {
            google.browser.engine.GECKO = g;
            if (a.indexOf("Firefox") != -1) {
                google.browser.product.FIREFOX = g;
                c = /Firefox\/(\S+)/
            }
            b = /rv\:([^\);]+)(\)|;)/
        }
        if (b) {
            b = b.exec(a);
            google.browser.engine.version = b ? b[1] : ""
        }
        if (c) {
            b = c.exec(a);
            google.browser.product.version = b ? b[1] : ""
        }
    };
    google.browser.init(window.navigator.userAgent);
    google.browser.compareVersions = function (a, b) {
        function c(p, q) {
            if (p < q) return -1;
            else if (p > q) return 1;
            return 0
        }
        for (var d = 0, e = a.replace(/^\s+|\s+$/g, "").split("."), f = b.replace(/^\s+|\s+$/g, "").split("."), h = Math.max(e.length, f.length), j = 0; d == 0 && j < h; j++) {
            var t = e[j] || "",
                u = f[j] || "",
                v = new RegExp("(\\d*)(\\D*)", "g"),
                w = new RegExp("(\\d*)(\\D*)", "g");
            do {
                var l = v.exec(t) || ["", "", ""],
                    m = w.exec(u) || ["", "", ""];
                if (l[0].length == 0 && m[0].length == 0) break;
                d = l[1].length == 0 ? 0 : parseInt(l[1], 10);
                var x = m[1].length == 0 ? 0 : parseInt(m[1], 10);
                d = c(d, x) || c(l[2].length == 0, m[2].length == 0) || c(l[2], m[2])
            } while (d == 0)
        }
        return d
    };
    google.browser.isEngineVersion = function (a) {
        return google.browser.compareVersions(google.browser.engine.version, a) >= 0
    };
    google.browser.isProductVersion = function (a) {
        return google.browser.compareVersions(google.browser.product.version, a) >= 0
    };
    google.isOpera = i;
    google.isIE = i;
    google.isSafari = i;
    google.xhr = function () {
        var a = null;
        try {
            a = new XMLHttpRequest
        } catch (b) {}
        return a
    };
    google.style = {};
    google.getComputedStyle = function (a, b, c) {
        return google.style.getComputedStyle(a, b, c)
    };
    google.style.getComputedStyle = function (a, b, c) {
        var d = c ? "" : 0;
        var e = document.defaultView && document.defaultView.getComputedStyle(a, "");
        try {
            d = e.getPropertyValue(b);
            d = c ? d : parseInt(d, 10)
        } catch (f) {}
        return d
    };
    google.getHeight = function (a) {
        return google.style.getHeight(a)
    };
    google.style.getHeight = function (a) {
        var b = google.style.getComputedStyle(a, "height");
        return b
    };
    google.getWidth = function (a) {
        return google.style.getWidth(a)
    };
    google.style.getWidth = function (a) {
        var b = google.style.getComputedStyle(a, "width");
        return b
    };
    google.getPageOffsetTop = function (a) {
        return google.style.getPageOffsetTop(a)
    };
    google.style.getPageOffsetTop = function (a) {
        return a.offsetTop + (a.offsetParent ? google.style.getPageOffsetTop(a.offsetParent) : 0)
    };
    google.getPageOffsetLeft = function (a) {
        return google.style.getPageOffsetLeft(a)
    };
    google.style.getPageOffsetLeft = function (a) {
        return a.offsetLeft + (a.offsetParent ? google.style.getPageOffsetLeft(a.offsetParent) : 0)
    };
    google.getPageOffsetStart = function (a) {
        return google.style.getPageOffsetStart(a)
    };
    google.style.getPageOffsetStart = function (a) {
        return google.style.getPageOffsetLeft(a)
    };
    google.hasClass = function (a, b) {
        return google.style.hasClass(a, b)
    };
    google.style.hasClass = function (a, b) {
        if (!a) return i;
        return (new RegExp("(^|\\s)" + b + "($|\\s)")).test(a.className)
    };
    google.getColor = function (a) {
        return google.style.getColor(a)
    };
    google.style.getColor = function (a) {
        return google.style.getComputedStyle(a, "color", g)
    };
    google.dom = {};
    var k = /^(\w+)?(?:\.(.+))?$/;
    google.append = function (a) {
        return google.dom.append(a)
    };
    google.dom.append = function (a) {
        return (document.getElementById("xjsc") || document.body).appendChild(a)
    };
    google.dom.create = function (a, b) {
        var c = a.match(k),
            d = document.createElement(c[1]);
        if (c[2]) d.className = c[2];
        if (b) d.innerHTML = b;
        return d
    };
    google.dom.get = function (a, b, c) {
        var d = a.match(k);
        a = d[2] && new RegExp("\\b" + d[2]);
        b = (b || document).getElementsByTagName(d[1] || "*");
        if (a) {
            d = 0;
            var e = b;
            b = [];
            for (var f; f = e[d++];) a.test(f.className) && b.push(f)
        }
        return b.length > 1 || c ? b : b[0]
    };
    google.dom.insert = function (a, b, c) {
        return b.parentNode.insertBefore(a, c ? b.nextSibling : b)
    };
    google.dom.remove = function (a) {
        return a && a.parentNode && a.parentNode.removeChild(a)
    };
    google.dom.set = function (a) {
        for (var b = 1; b < arguments.length; b += 2) {
            var c = arguments[b],
                d = arguments[b + 1],
                e = a.style;
            if (e && c in e) e[c] = d;
            else if (c in a) a[c] = d;
        }
        return a
    };
    google.rhs = function () {};
    var n, o = location,
        r = location.protocol + "//" + location.host;
    google.nav = function (a, b) {
        try {
            if ((new RegExp("^(" + r + ")?/url\\?.*&rct=j(&|$)")).test(a)) if (b) {
                google.r = 1;
                b.location.replace(a)
            } else {
                if (!n) {
                    n = document.createElement("iframe");
                    n.style.display = "none";
                    google.dom.append(n)
                }
                google.r = 1;
                n.src = a
            } else o.href = a
        } catch (c) {
            o.href = a
        }
    };
    google.getURIPath = function () {
        return window.location.pathname + window.location.search
    };
    google.eventTarget = function (a) {
        return a.target;
    };
    google.srp = {};

    function s(a, b, c) {
        var d = new RegExp("([?&])" + b + "=.*?(&|$)");
        a = a.replace(/^(.*)(#|$)/, function (e, f) {
            return f
        });
        if (!a.match(d) && c != "") return a + "&" + b + "=" + c;
        return a.replace(d, function (e, f, h) {
            return c ? f + b + "=" + c + h : h ? f : ""
        })
    }
    google.srp.isSerpLink = function (a) {
        return /(search|images)/.test(a.href)
    };
    google.srp.isSerpForm = function (a) {
        return /\/search$/.test(a.action)
    };
    google.srp.updateLinksWithParam = function (a, b, c, d) {
        var e = document.getElementsByTagName("A");
        google.base_href = s(google.base_href, a, b);
        for (var f = 0, h; h = e[f++];) if (c(h)) {
            h.href = s(h.href, a, b);
        }
        for (f = 0; c = document.forms[f++];) if (d(c)) {
            for (h = e = 0; j = c.elements[h++];) if (j.name == a) {
                e = 1;
                if (b != "") j.value = b;
                else j.parentNode.removeChild(j)
            }
            if (!e && b != "") {
                e = document.createElement("input");
                e.type = "hidden";
                e.value = b;
                e.name = a;
                c.appendChild(e)
            }
        }
    };
    google.srp.qs = function (a) {
        if (a = google.eventTarget(a)) {
            for (; !google.style.hasClass(a, "qs");) {
                a = a.parentNode;
                if (!a || a == document.body) return
            }
            var b = document.getElementsByName("q"),
                c = b && b[0];
            b = document.getElementById("tsf-oq");
            if (c && b && window.encodeURIComponent) {
                c = c.value;
                var d;
                d = b.innerText;
                if (c && c != d) {
                    d = s(a.href, "q", encodeURIComponent(c));
                    a.href = s(d, "prmd", "")
                }
            }
        }
    };
    google.util = {};
    var y = ["&", "&amp;", "<", "&lt;", ">", "&gt;", '"', "&quot;", "'", "&#39;", "{", "&#123;"];
    google.util.escape = function (a) {
        for (var b = 0; b < y.length; b += 2) a = a.replace(new RegExp(y[b], "g"), y[b + 1]);
        return a
    };
    google.util.unescape = function (a) {
        for (var b = 0; b < y.length; b += 2) a = a.replace(new RegExp(y[b + 1], "g"), y[b]);
        return a
    };
    google.bind = function (a, b, c) {
        google.listen(a, b, c)
    };
    google.listen = function (a, b, c) {
        a.addEventListener ? a.addEventListener(b, c, i) : a.attachEvent("on" + b, c)
    };
    google.unbind = function (a, b, c) {
        google.unlisten(a, b, c)
    };
    google.unlisten = function (a, b, c) {
        a.removeEventListener ? a.removeEventListener(b, c, i) : a.detachEvent("on" + b, c)
    };
})();
(function () {
    var c = window,
        f = Object,
        h = google,
        i = "push",
        j = "length",
        k = "propertyIsEnumerable",
        l = "prototype",
        m = "call";

    function n(a) {
        var b = typeof a;
        if (b == "object") if (a) {
            if (a instanceof Array || !(a instanceof f) && f[l].toString[m](a) == "[object Array]" || typeof a[j] == "number" && typeof a.splice != "undefined" && typeof a[k] != "undefined" && !a[k]("splice")) return "array";
            if (!(a instanceof f) && (f[l].toString[m](a) == "[object Function]" || typeof a[m] != "undefined" && typeof a[k] != "undefined" && !a[k]("call"))) return "function"
        } else return "null";
        else if (b == "function" && typeof a[m] == "undefined") return "object";
        return b
    }

    function o(a) {
        return (new p).serialize(a)
    }
    function p() {}
    p[l].serialize = function (a) {
        var b = [];
        this.a(a, b);
        return b.join("")
    };
    p[l].a = function (a, b) {
        switch (typeof a) {
        case "string":
            this.b(a, b);
            break;
        case "number":
            this.d(a, b);
            break;
        case "boolean":
            b[i](a);
            break;
        case "undefined":
            b[i]("null");
            break;
        case "object":
            if (a == null) {
                b[i]("null");
                break
            }
            if (n(a) == "array") {
                this.c(a, b);
                break
            }
            this.e(a, b);
            break;
        case "function":
            break;
        default:
            throw Error("Unknown type: " + typeof a);
        }
    };
    var q = {
        '"': '\\"',
        "\\": "\\\\",
        "/": "\\/",
        "\u0008": "\\b",
        "\u000c": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
        "\u000b": "\\u000b"
    },
        r = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
    p[l].b = function (a, b) {
        b[i]('"', a.replace(r, function (g) {
            if (g in q) return q[g];
            var d = g.charCodeAt(0),
                e = "\\u";
            if (d < 16) e += "000";
            else if (d < 256) e += "00";
            else if (d < 4096) e += "0";
            return q[g] = e + d.toString(16)
        }), '"')
    };
    p[l].d = function (a, b) {
        b[i](isFinite(a) && !isNaN(a) ? a : "null")
    };
    p[l].c = function (a, b) {
        var g = a[j];
        b[i]("[");
        for (var d = "", e = 0; e < g; e++) {
            b[i](d);
            this.a(a[e], b);
            d = ","
        }
        b[i]("]")
    };
    p[l].e = function (a, b) {
        b[i]("{");
        var g = "";
        for (var d in a) if (a.hasOwnProperty(d)) {
            var e = a[d];
            if (typeof e != "function") {
                b[i](g);
                this.b(d, b);
                b[i](":");
                this.a(e, b);
                g = ","
            }
        }
        b[i]("}")
    };
    c.google.stringify = o;
    if (c.JSON && c.JSON.stringify && navigator.userAgent.indexOf("Chrome") == -1) c.google.stringify = c.JSON.stringify;
    h.History = {};
    var s = [],
        t = "/";
    h.History.client = function (a) {
        s[i](a);
        return s[j] - 1
    };
    var u, v;

    function w() {
        var a = u.value;
        v = a ? eval("(" + a + ")") : {}
    }
    function x(a, b) {
        w();
        v[t] || (v[t] = {});
        v[t][a] = b;
        u.value = h.stringify(v)
    }
    var y = [];

    function z() {
        for (var a = 0, b; b = y[a++];) b();
        y = []
    }
    h.History.addPostInitCallback = function (a) {
        y[i](a)
    };
    h.History.save = function (a, b) {
        u && x(a, b)
    };
    h.History.initialize = function (a) {
        t = a;
        v = null;
        if (u = document.getElementById("hcache")) {
            w();
            for (a = 0; a < s[j]; ++a) v && v[t] && v[t][a] && s[a][m](null, v[t][a]);
            z()
        }
    };
})();
(function () {
    var a, b;
    google.rhs = function () {
        if (!google.drhs) if (document.getElementById("mbEnd") && (a || b)) {
            var d = google.getHeight(document.getElementById("rhsline")),
                c = a ? google.getHeight(a) : 0;
            if (b) c += google.getHeight(b) + 18;
            document.getElementById("rhspad").style.height = c > d ? Math.min(9999, c - d) + "px" : google.isIE ? "" : 0
        }
    };

    function e() {
        a = document.getElementById("tads");
        b = document.getElementById("3po");
        google.rhs()
    }
    e();
    google.bind(window, "resize", google.rhs);
    google.rein.push(e);
})();
(function () {
    var f = 0,
        g = [];
    google.fx = {};
    google.fx.linear = function (a) {
        return a
    };
    google.fx.easeOut = function (a) {
        return 1 - Math.pow(1 - a, 3)
    };
    google.fx.easeInAndOut = function (a) {
        return (3 - 2 * a) * a * a
    };
    google.fx.animate = function (a, d, e) {
        for (var c = 0, b; b = d[c++];) {
            b[5] = b[5] == null ? "px" : b[5];
            b[4] = b[4] || google.fx.linear;
            h(b[0], b[1], b[2] + b[5])
        }
        g.push({
            b: a,
            a: e,
            d: google.time(),
            c: d
        });
        f = f || window.setInterval(i, 15)
    };

    function i() {
        for (var a = 0, d; d = g[a++];) j(d) || g.splice(--a, 1);
        if (!g.length) {
            window.clearInterval(f);
            f = 0
        }
    }

    function j(a) {
        var d = google.time() - a.d;
        if (d >= a.b) {
            for (var e = 0, c; c = a.c[e++];) h(c[0], c[1], c[3] + c[5]);
            a.a && a.a();
            return 0
        } else {
            for (e = 0; c = a.c[e++];) {
                var b = c[2] + (c[3] - c[2]) * c[4](d / a.b);
                if (c[5] == "px") b = Math.round(b);
                h(c[0], c[1], b + c[5])
            }
            return 1
        }
    }

    function h(a) {
        for (var d = 1; d < arguments.length; d += 2) {
            var e = arguments[d],
                c = arguments[d + 1],
                b = a.style;
            if (b && e in b) b[e] = c;
            else if (e in a) a[e] = c;
        }
        return a
    }
    google.fx.wrap = function (a) {
        var d = document.createElement("div");
        a.parentNode.replaceChild(d, a);
        d.appendChild(a);
        return d
    };
    google.fx.unwrap = function (a) {
        a.parentNode.parentNode.replaceChild(a, a.parentNode)
    };
    google.dstr.push(function () {
        window.clearInterval(f);
        f = 0;
        g = []
    });
})();
(function () {
    google.event = google.event || {};
    google.event.back = {};
    var d = [],
        f = [],
        g = {
            persisted: false
        };
    google.event.back.saveHistory = function () {
        google.History.save(i, g)
    };
    var j = google.event.back.saveHistory;

    function k() {
        for (var b = [], c = 0, a = d.length; c < a; c++) {
            var e = d[c](g[f[c]]);
            if (e) {
                b.length > 0 && b.push(",");
                b.push(e)
            }
        }
        b.push("&ei=", google.kEI);
        window.google.log("backbutton", b.join(""))
    }

    function l(b, c) {
        return function (a) {
            a = a || window.event;
            for (a = a.target || a.srcElement; a.parentNode && a.tagName != "A";) a = a.parentNode;
            b(a, c ? g[c] : null);
            c && j()
        }
    }
    function m(b, c, a) {
        for (var e = document.getElementsByTagName("a"), o = 0, h; h = e[o++];) b(h) && google.bind(h, "click", l(c, a))
    }
    function n() {
        if (!g.persisted) {
            g.persisted = true;
            j();
            if (window.addEventListener) {
                window.addEventListener("pageshow", p, false);
                q = false
            }
        }
    }
    var r = google.j && google.j.en,
        q;

    function p(b) {
        if ((b.persisted || q) && !r) k();
        q = true
    }
    var i = google.History.client(function (b) {
        g = b;
        g.persisted && k()
    });
    google.event.back.register = function (b, c, a, e) {
        if (e) g[e] = {};
        m(b, c, e);
        d.push(a);
        f.push(e)
    };
    google.event.back.init = function () {
        g = {
            persisted: false
        };
        google.History.addPostInitCallback(n)
    };

    function s() {
        d.length = 0;
        f.length = 0
    }
    google.dstr && google.dstr.push(s);
})();
(function () {
    var f = true,
        i = null,
        j = false,
        l = window.google.ac = {},
        aa = j,
        m, ba, ca, da, ea, fa, ga, ha, ia, n, o, p, ja, q = "",
        ka = i,
        r = i,
        s = i,
        u = -1,
        v, w, x, z, A, la, C, D, E, ma, na, pa, H, qa, ra = {},
        sa, I = 0,
        K = 0,
        ta = j,
        L = i,
        M = 0,
        ua, va;
    var N;
    var S;

    function za(a) {
        return (a = a && a.match(/\D+$/)) ? a[0] : i
    }
    var Aa = "hp",
        Ba = "serp",
        Ca = "img",
        Da = {
            0: Aa,
            1: Ba,
            2: Ca
        },
        T;

    function Ea(a) {
        return (document.getElementById("main") || document.getElementById("xjsc") || document.body).appendChild(a)
    }

    function Fa() {
        Ga();
        U();
        if (v) {
            E.value = ma.value = na.value = H.value = pa.value = "";
            window.clearTimeout(ka);
            q = va = sa = "";
            ka = r = s = i;
            u = -1;
            T = I = K = M = 0;
            ra = {};
            N = 0;
        }
    }
    function Ha(a, b) {
        T = 0;
        if (a == "i") T = 2;
        else if (b && b != "") T = 1
    }

    function Ia(a, b, c, d, e, h) {
        Ha(c, d);
        Ja();
        h && Ka(h);
        La();
        v = a;
        w = b;
        p = ja = o = w.value;
        if (!b.init) {
            ua = document.getElementsByTagName("head")[0];
            google.bind(v, "submit", Ma);
            w.setAttribute("autocomplete", "off");
            google.bind(w, "blur", U);
            google.bind(w, "keypress", Na);
            google.bind(w, "keyup", Oa);
            E = V("aq", "f");
            ma = V("aqi", "");
            na = V("aql", "");
            H = V("oq", p);
            pa = V("gs_rfai", "");
            C = A = document.createElement("table");
            A.cellSpacing = A.cellPadding = "0";
            D = la = A.style;
            A.className = "gac_m";
            if (n) {
                C = x = document.createElement("div");
                x.className = "gac_od";
                D = x.style;
                Ea(x);
                if (T == 1) {
                    a = document.createElement("div");
                    a.className = "gac_wd";
                    x.appendChild(a)
                }
                z = document.createElement("div");
                z.cellSpacing =
                x.cellPadding = "0";
                z.className = "gac_id";
                x.appendChild(z);
                z.appendChild(A)
            } else v.appendChild(A)
        }
        b.init = f;
        U();
        Pa();
        if (!aa) {
            Qa();
            aa = f
        }
        b = Da[T];
        b = "&client=" + b;
        c = c ? "&ds=" + c : "";
        a = e ? "&tok=" + encodeURIComponent(e) : "";
        d = ["?hl=", google.kHL, b, Ra(), c, (d ? "&pq=" + encodeURIComponent(d) : ""), a].join("");
        sa = "/complete/search" + d;
        va = "/complete/deleteitems" + d;
        N = Sa(w);
        Ua();
        e = ha || e && e.length || "https:" == document.location.protocol;
        ia = ["http", e ? "s" : "", "://"].join("");
        //(new Image).src = ia + "clients1.google.com/generate_204";
    }

    function Qa() {
        function a(d, e) {
            b.push(d, "{", e, "}")
        }
        var b = [];
        if (n) {
            var c = "background:white;margin:0;z-index:99;";
            a(".gac_od", c + "border-top:0;border-left:0;border-right:1px solid #e7e7e7;border-bottom:1px solid #e7e7e7;padding:0!important;position:absolute");
            a(".gac_id", c + "border-top:1px solid #a2bff0;border-left:1px solid #a2bff0;border-right:1px solid #558be3;border-bottom:1px solid #558be3;display:block;position:relative");
            a(".gac_m", c + "border:0;cursor:default;display:block;font-size:17px;line-height:117%;padding:0;position:relative");
            if (!document.body.dir || document.body.dir == "ltr") a(".gac_wd", "background:#999;height:1px;position:absolute;right:-1px;top:0;width:1px;z-index:100")
        } else a(".gac_m", "background:white;border:1px solid #666;cursor:default;font-size:17px;line-height:117%;margin:0;position:absolute;z-index:99");
        a(".gac_m td", "line-height:22px");
        a(".gac_n", "padding-top:1px;padding-bottom:1px");
        a(".gac_b td.gac_c", "background:#d5e2ff");
        a(".gac_b", "background:#d5e2ff");
        a(".gac_a td.gac_f", "background:#fff8dd");
        a(".gac_p", "padding:1px 4px 2px 3px");
        a(".gac_u", "padding:0 0 1px 0;line-height:117%;text-align:left");
        a(".gac_t", "width:100%;text-align:left;font-size:17px");
        a(".gac_za", "position:absolute;bottom:0;right:0;text-align:right;font-size:12px;padding-right:5px");
        a(".gac_bt", "width:" + (w.offsetWidth - 2) + "px;text-align:center;padding:8px 0 7px;position:relative");
        a(".gac_sb", "font-size:15px;height:28px;margin:0.2em");
        a(".gac_z", "white-space:nowrap;color:#c00");
        a(".gac_s", "height:3px;font-size:1px");
        c = n ? 7 : 3;
        c = "white-space:nowrap;overflow:hidden;text-align:left;padding-left:" + c + "px;padding-right:3px";
        a(".gac_c", c);
        a(".gac_e", "text-align:right;padding:0 3px");
        a(".gac_d", "font-size:11px");
        a(".gac_h", "color:green");
        a(".gac_j", "display:block");
        a(".gac_l", "line-height:18px");
        a(".gac_x", "display:block;line-height:16px");
        a(".gac_y", "font-size:13px");
        a(".gac_i", "color:#666");
        a(".gac_w img", "width:40px;height:40px");
        a(".gac_w", "width:1px");
        a(".gac_r", "color:red");
        a(".gac_v", "padding-bottom:5px");
        c = document.createElement("style");
        c.setAttribute("type", "text/css");
        ua.appendChild(c);
        b = b.join("");
        c.appendChild(document.createTextNode(b));
    }

    function Pa() {
        if (C) {
            var a = Va(w);
            D.left = a.B + "px";
            a = a.D + w.offsetHeight - 1;
            n && T == 1 && a++;
            D.top = a + "px";
            a = w.offsetWidth;
            if (n) D.minWidth = a + "px";
            else D.width = a + "px";
            if (r) {
                var b = W(0);
                if (b && a - 12 >= 0) b.firstChild.style.width = a - 12 + "px"
            }
        }
    }
    function Va(a) {
        for (var b = 0, c = 0; a;) {
            b += a.offsetTop;
            c += a.offsetLeft;
            a = a.offsetParent
        }
        return {
            D: b,
            B: c
        }
    }

    function V(a, b) {
        var c = document.createElement("input");
        c.type = "hidden";
        c.name = a;
        c.value = b;
        return v.appendChild(c)
    }
    function Na(a) {
        var b = a.keyCode;
        if (b == 27 && Wa()) {
            U();
            X(p);
            a.cancelBubble = f;
            return a.returnValue = j
        }
        if (b == 13) {
            Xa(j);
            a.cancelBubble = f;
            return a.returnValue = j
        }
        if (b == 38 || b == 40) {
            K++;
            K % 3 == 1 && Ta(b);
            return j
        }
    }

    function Xa(a) {
        if (!a && qa) {
            v.removeChild(qa);
            qa = i
        }
        if (s && u != -1 && ta && !(a && s.A)) s.onclick(i);
        else if (w.value == "") U();
        else {
            if (a) qa = V("btnI", "1");
            Ya()
        }
    }
    function Ya() {
        Ma();
        v.onsubmit && v.onsubmit() == j || v.submit()
    }
    function Oa(a) {
        a = a.keyCode;
        if (!K) Ta(a);
        K = 0;
    }

    function Ta(a) {
        if (w.value != o) {
            p = w.value;
            N = Sa(w);
            H.value = p
        }
        if (a == 40 || a == 38) {
            Za(a == 40);
            ta = Wa()
        }
        Pa();
        if (q != p && !L) L = window.setTimeout(U, 500);
        o = w.value
    }

    function $a() {
        ta = j;
        if (!M) {
            if (s) s.className = "gac_a";
            s = this;
            for (var a = 0, b; b = W(a); a++) b == s && (u = a);
            s.className = "gac_b"
        }
    }
    function ab(a, b) {
        return function (c) {
            bb(cb(a), b);
            db(c);
            return j
        }
    }
    function cb(a) {
        return [a, "&aq=", s.m, "&oq=", H.value, Z("aqi", ma), Z("aql", na), Z("gs_rfai", pa)].join("")
    }

    function Z(a, b) {
        if (b && b.value.length && a.length) return ["&", a, "=", b.value].join("");
        return ""
    }
    function bb(a, b) {
        var c = window.frames.wgjf;
        if (c && !b) {
            google.r = 1;
            c.location.replace(a)
        } else window.location = a
    }

    function eb() {
        X(this.j);
        Ya();
    }

    function Za(a) {
        if (!(p != q || !r || !r.length)) if (Wa()) {
            if (s) s.className = "gac_a";
            for (var b = r.length, c = (u + 1 + (a ? 1 : b)) % (b + 1) - 1; c != -1 && W(c).t;) c = (c + 1 + (a ? 1 : b)) % (b + 1) - 1;
            u = c;
            if (u == -1) fb();
            else {
                s = W(c);
                s.className = "gac_b";
                X(s.j);
                E.value = s.m
            }
        } else gb()
    }
    function fb() {
        w.focus();
        X(p);
        s = i;
        E.value = "f"
    }
    function U() {
        if (L) {
            window.clearTimeout(L);
            L = i
        }
        D && (D.visibility = "hidden");
    }

    function gb() {
        D && (D.visibility = "visible");
        Pa();
        M = 1
    }
    function Wa() {
        return !!D && D.visibility == "visible"
    }
    function Ga() {
        if (A) {
            A.innerHTML = "";
        }
    }

    function hb(a, b, c) {
        a.onclick = b ? ab(b, c) : eb;
        a.A = !b;
        a.onmousedown = ib;
        a.onmouseover = $a;
        a.onmousemove = function () {
            if (M) {
                M = 0;
                $a.call(this)
            }
        }
    }
    function jb(a, b) {
        db(a);
        a = 0;
        for (var c; c = W(a++);) if (c.m == b) {
            kb(va, "delq", c.j, lb);
            break
        }
        return j
    }
    function lb(a) {
        for (var b = 0, c; c = W(b++);) if (za(c.m) == "p" && c.j == a[0]) {
            c.t = 1;
            c.onclick = c.onmouseover = i;
            if (c == s) {
                c.className = "gac_a";
                u = -1;
                fb()
            }
            c.v.className = "gac_c gac_i fl";
            c.v.innerHTML = "This search was removed from your \x3ca href\x3d\x22/history\x22\x3eWeb History\x3c/a\x3e"
        }
    }

    function mb(a) {
        function b(oa, Y) {
            Y = Y ? za(Y[2]) : i;
            oa = oa + (Y ? "-" + Y : "");
            if (oa != e) {
                if (h) d += e + h;
                h = 0;
                e = oa
            }
            h++
        }
        var c = a[0];
        I > 0 && I--;
        if (!(!A || c != p)) {
            if (L) {
                window.clearTimeout(L);
                L = i
            }
            q = a[0];
            Ga();
            var d = "",
                e, h = 0;
            c = a[1];
            for (var g = c.length - 1, k = 0, t, F, G, y, J, B; k <= g; k++) if (B = c[k]) if (y = ra[B[1]]) {
                y.w && y.w(k, g) && nb();
                t = B[2];
                F = B[3];
                G = y.k ? y.k(B, F) : i;
                J = A.insertRow(-1);
                hb(J, G, y.z);
                J.m = t;
                J.className = "gac_a";
                G = J.v = document.createElement("td");
                G.className = "gac_c";
                y.e(G, t, B, F);
                t = y.q;
                J.j = t ? t(B, F, q) : B[0];
                J.appendChild(G);
                b(y.b, B);
                k < g && y.C && nb()
            }
            na.value = a[3] || "";
            pa.value = a[4] || "";
            if ((r = A.rows) && r.length > 0) {
                if (T == 0) pb();
                else if (T == 1 && ga) {
                    a = nb();
                    c = a.style;
                    c.textAlign = "right";
                    c.fontSize = "12px";
                    c.paddingRight = "5px";
                    a.innerHTML = qb()
                }
                gb()
            } else U();
            b("");
            ma.value = d;
            u = -1
        }
    }
    function W(a) {
        b = r.item(a);
        return b
    }

    function rb(a) {
        var b = a ? "I\x26#39;m Feeling Lucky" : "Google Search",
            c = "gac_sb",
            d = "",
            e = "";
        if (n) {
            c = "lsb";
            d = "<span class=ds><span class=lsbb>";
            e = "</span></span>"
        }
        return [d, '<input type=button value="', b, '" class=', c, ' onclick="google.ac.rd(', a, ')">', e].join("")
    }

    function pb() {
        var a = A.insertRow(-1);
        a.t = 1;
        a.onmousedown = ib;
        var b = "";
        if (ga) b = "<div class=gac_za>" + qb() + "</div>";
        a = a.insertCell(0);
        a.innerHTML = ['<div style="position:relative"><div class=gac_bt>', rb(j), rb(f), "</div>", b, "</div>"].join("")
    }
    function qb() {
        return '<a href="http://www.google.com/support/websearch/bin/answer.py?hl=fr&answer=106230">En savoir plus</a>'
    }

    function $(a, b) {
        return ['href="', a, '" onmousedown="google.ac.r(event, this, \'', b, '\')" onclick="return google.ac.c(event)"'].join("")
    }
    function sb(a, b, c) {
        m = j;
        if (a.which) m = a.which == 2;
        else if (a.button) m = a.button == 4;
        b.href = cb(c)
    }
    function tb(a) {
        if (m) {
            db(a);
            return f
        }
        return j
    }

    function db(a) {
        if (a) {
            a.cancelBubble = a.cancel = a.returnValue = f
        }
    }

    function nb() {
        var a = A.insertRow(-1);
        a.t = 1;
        a.onmousedown = ib;
        a = a.insertCell(0);
        a.className = "gac_s";
        return a
    }
    function Ma() {
        U();
        if (r && W(u) && H.value != w.value) E.value = W(u).m;
        else {
            H.value = "";
            E.value = "f";
            if (I >= 10) E.value = "o"
        }
    }
    function Ua() {
        if (p && ja != p) {
            I++;
            kb(sa, "q", p, mb);
            w.focus()
        }
        ja = p;
        for (var a = 100, b = 1; b <= (I - 2) / 2; b++) a *= 2;
        a += 50;
        ka = window.setTimeout(Ua, a)
    }

    function kb(a, b, c, d) {
        S && ua.removeChild(S);
        S = document.createElement("script");
        S.src = [ia, "clients1.google.com", a, "&", b, "=", encodeURIComponent(c), "&cp=" + N].join("");
        ua.appendChild(S);
    }
    function X(a) {
        if (w) w.value = o = a
    }
    function ob(a, b) {
        a.appendChild(document.createTextNode(b))
    }

    function ib(a) {
        return j
    }

    function Sa(a) {
        var b = 0,
            c = 0;
        if (xb(a)) {
            b = a.selectionStart;
            c = a.selectionEnd
        }
        return b && c && b == c ? b : 0
    }
    function xb(a) {
        try {
            return typeof a.selectionStart == "number"
        } catch (b) {
            return j
        }
    }

    function Ja() {
        ba = f;
        ca = j;
        da = f;
        ea = j;
        fa = f;
        n = ga = ha = j
    }
    function Ka(a) {
        if ("a" in a) ba = a.a;
        if ("f" in a) ga = a.f;
        if ("l" in a) ca = a.l;
        if ("n" in a) da = a.n;
        if ("o" in a) ea = a.o;
        if (T == 2) fa = j;
        else if ("p" in a) fa = a.p;
        if ("s" in a) ha = a.s;
        if ("sw" in a) n = a.sw
    }
    function La() {
        var a = [yb];
        ba && a.push(zb);
        ca && a.push(Ab);
        da && a.push(Bb);
        ea && a.push(Cb, Db, Eb, Fb, Gb, Hb, Ib, Jb, Kb, Lb);
        Mb(a)
    }
    function Mb(a) {
        for (var b = 0, c; c = a[b++];) ra[c.g] = c
    }
    var zb = {
        g: 8,
        b: "a",
        C: f,
        q: function (a, b, c) {
            return c
        },
        k: function (a, b) {
            return b[1] + Ra()
        },
        w: function (a, b) {
            return a == b
        },
        e: function (a, b, c, d) {
            b = d[0];
            var e = d[1] + Ra();
            c = d[2];
            var h = d[3];
            d = d[4];
            a.className = "gac_f gac_p";
            var g = b.replace(/<\/?[b|em]>/gi, "");
            e = $("http://" + g, e);
            a.innerHTML = ['<table cellpadding=0 cellspacing=0 border=0 class=gac_t><tr><td><table cellpadding=0 cellspacing=0 border=0 class=gac_t><tr><td style="line-height:117%;vertical-align:bottom"><a class=q ', e, ">", c, '</a><td class="gac_e gac_d gac_i">Sponsored Link</table><tr><td class="gac_u gac_x gac_y" style="line-height:16px;padding-bottom:8px"><span class=gac_h', ">", b, "</span>&nbsp; &nbsp;", h, d ? " " + d : "", "</table>"].join("")
        }
    },
        Hb = {
            g: 11,
            b: "b",
            z: f,
            k: function (a, b) {
                return b[0]
            },
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                var e = d[2],
                    h = d[3],
                    g = d[4],
                    k = d[5],
                    t = d[6];
                d = d[7];
                var F = b.match(/^([^&]*)/)[1];
                a.innerHTML = ['<span class="gac_j gac_l"><a class=q ', $(F, b), "><b>", c, "</b> - ", e, " (", h, ")</a><br><b>", g, "</b> <span class=gac_y><span class=gac_", k >= 0 ? "h" : "r", ">", k, " (", t, "%)</span> ", d, ' - </span><a href=/help/stock_disclaimer.html class="gac_d fl" onclick="google.ac.p(event);return true">Disclaimer</a></span>'].join("")
            }
        },
        Ib = {
            g: 12,
            b: "c",
            k: function (a, b) {
                return b[0]
            },
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                d = d[2];
                for (var e = "", h = d.length - 1, g = 0, k; g < h; g++) {
                    k = d[g];
                    e += [k[0], '<div class="gac_v">', k[1], "</div>"].join("")
                }
                k = d[h];
                e += [k[0], "<br>", k[1]].join("");
                Nb(1, a, c, b, "www.flightstats.com", e)
            }
        },
        Jb = {
            g: 15,
            b: "d",
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                var e = d[2];
                d = d[3];
                a.innerHTML = ["<b>", b, "</b> ", e, " (", c, ") in <b>", d, "</b>"].join("")
            }
        },
        Kb = {
            g: 13,
            b: "e",
            k: function (a, b) {
                return b[0]
            },
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                d = d[2];
                Nb(1, a, c, b, d)
            }
        },
        Db = {
            g: 14,
            b: "f",
            k: function (a, b) {
                return b[0]
            },
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                var e = d[2];
                d = d[3];
                Nb(1, a, c, b, d, e)
            }
        },
        yb = {
            g: 0,
            b: "g",
            q: function (a) {
                return a.j
            },
            e: function (a, b, c) {
                var d = c[0];
                a.innerHTML = d;
                c.j = Ob(a);
                if (fa && za(b) == "p") {
                    a.className = "";
                    a.innerHTML = ["<table cellpadding=0 cellspacing=0 border=0 class=gac_t><tr><td class=gac_c>", d, '<td class="gac_d gac_e fl"><a href=# onclick="return google.ac.dc(event,\'', b, "')\">Remove</a></table>"].join("");
                }
            }
        },
        Eb = {
            g: 19,
            b: "h",
            e: function (a, b, c, d) {
                b = d[0];
                d = d[1];
                a.innerHTML = ["<b>", b, " = ", d, "</b>"].join("")
            }
        },
        Cb = {
            g: 17,
            b: "i",
            k: function (a, b) {
                return b[3]
            },
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                var e = d[2];
                d = d[3];
                var h = d.match(/url=([^&]*)/)[1];
                a.innerHTML = ['<span class="gac_j gac_l"><a ', $(h, d), ">", b, " &#151; ", c, ": ", e, '</a><span class=gac_y style="line-height:16px"><br>According to <span class=gac_h>', h, "</span></span></span>"].join("")
            }
        },
        Lb = {
            g: 10,
            b: "j",
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                var e = d[4];
                d = d[5];
                var h = function (g) {
                    var k = g[0],
                        t = g[1],
                        F = g[2],
                        G = g[3];
                    g = g[4];
                    return ['<td class=gac_w><img src="', k, '" alt="', t, '" title="', t, '"><td class="gac_c" style="line-height:112%;vertical-align:top">', g, "<br>", F, "&deg; | ", G, "&deg;"].join("")
                };
                a.innerHTML = ["<b>Weather:</b> ", e, "&deg;", c, " in ", b, "<br><table class=gac_t><tr>", h(d[0]), h(d[1]), h(d[2]), h(d[3]), "</table>"].join("")
            }
        },
        Fb = {
            g: 20,
            b: "k",
            e: function (a, b, c, d) {
                b = d[0];
                d = d[1];
                a.innerHTML = ["<b>", b, " = ", d, '</b> - <a href=/intl/en/help/currency_disclaimer.html class="gac_d fl" onclick="google.ac.p(event);return true">Disclaimer</a>'].join("")
            }
        },
        Gb = {
            g: 16,
            b: "l",
            q: function (a, b) {
                return "define: " + b[0]
            },
            e: function (a, b, c, d) {
                b = d[0];
                c = d[1];
                d = d[2];
                Nb(1, a, "Web definitions for <b>" + b + "</b>", "/search?q=define:" + b.replace(" ", "+"), "www.google.com", [c, " - <span class=gac_i>", d, "</span>"].join(""))
            }
        },
        Ab = {
            g: 30,
            b: "m",
            q: function (a) {
                return a.j
            },
            e: function (a, b, c) {
                b = c[0];
                var d = document.createElement("div");
                d.innerHTML = b;
                c.j = Ob(d);
                a.innerHTML = ["<span class=gac_z>Did you mean: </span>", b].join("")
            }
        };

    function Ob(a) {
        var b;
        b = a.textContent;
        return b
    }
    var Bb = {
        g: 5,
        b: "n",
        q: function (a, b, c) {
            return c
        },
        k: function (a, b) {
            return b[0]
        },
        e: function (a, b, c, d) {
            b = d[0];
            d = d[1];
            a.className = "gac_c gac_n";
            a.style.lineHeight = "117%";
            var e = c[0];
            c = e.replace(/HTTPS?:\/\//gi, "");
            e = e.replace(/<\/?[b|em]>/gi, "");
            /^HTTPS?:\/\//i.test(e) || (e = (b.indexOf("/url?url=https:") > 0 ? "https" : "http") + "://" + e);
            b = $(e, b);
            a.innerHTML = ["<span class=gac_x><a ", b, ">", d, '</a><br><span class="gac_h gac_y"', ">", c, "</span></span>"].join("");
        }
    };

    function Nb(a, b, c, d, e, h, g) {
        var k = d.indexOf("/url") ? d : d.match(/url=([^&]*)/)[1];
        b.style.lineHeight = "112%";
        b.innerHTML = ["<a class=q ", $(k, d), ">", c, '</a><span class="gac_y' + (a ? " gac_x" : "") + '">', h ? h + "<br>" : "", g ? g + "<br>" : "", e ? "<span class=gac_h>" + e + "</span></span>" : ""].join("")
    }
    function Ra() {
        if (google.kEXPI) return "&expIds=" + google.kEXPI;
        return ""
    }
    l.c = tb;
    l.d = lb;
    l.dc = jb;
    l.h = mb;
    l.i = Ia;
    l.p = db;
    l.r = sb;
    l.rd = Xa;
    l.u = X;
    google.bind(window, "resize", Pa);
    google.dstr && google.dstr.push && google.dstr.push(Fa);
})();
(function () {
    window.ManyBox = {};
    var d, g, i = 1,
        l = google.History.client(j);

    function m(a) {
        for (var b in d) if (d[b].c && a(d[b])) return
    }
    function n(a, b, c, e, f) {
        this.c = a;
        this.j = b;
        this.B = e;
        this.o = f;
        this.q = "/mbd?" + (b ? "docid=" + b : "") + "&resnum=" + a.replace(/[^0-9]/, "") + "&mbtype=" + e + "&usg=" + c + "&hl=" + (google.kHL || "");
        this.e = {};
        this.m = "";
        g[a] = {
            r: 0,
            D: this.e,
            j: this.j,
            i: 0
        };
        this.n = 0
    }
    n.prototype.append = function (a) {
        this.m += "&" + a.join("&")
    };

    function o(a, b) {
        a.g.style.paddingTop = b + "px";
        a.g.style.display = a.g.innerHTML ? "" : "none";
        if (b > a.n) a.n = b;
        a.h.style.fontSize = b + "px";
        a.h.style.fontSize = null
    }

    function q(a) {
        if (!a.A) {
            a.A = 1;
            a.d = document.getElementById("mbb" + a.c);
            a.k = 0;
            a.a = document.getElementById("mbl" + a.c);
            a.h = a.a.getElementsByTagName("DIV")[0];
            a.p = a.a.getElementsByTagName("A")[0];
            a.z = a.p.innerHTML;
            a.o = a.o || a.z;
            a.h.title = "Click for more information";
            a.a.F = function (b, c) {
                var e = google.getPageOffsetStart(a.a),
                    f = google.getPageOffsetTop(a.a);
                return b > e - 5 && b < e + google.getWidth(a.a) + 5 && c > f - 5 && c < f + google.getHeight(a.a) + 5
            };
            a.g = document.getElementById("mbf" + a.c);
            o(a, 0);
            a.a.onmousedown = r(a);
            a.a.onclick = s(a);
            a.a.go =

            function () {
                a.a.onmousedown();
                a.a.onclick()
            }
        }
    }
    function t(a) {
        google.log("manybox", [a.k ? "close" : "open", "&id=", a.c, "&docid=", a.j, "&mbtype=", a.B, a.m].join(""))
    }

    function r(a) {
        return function () {
            if (g[a.c].i) a.I++ < 3 && t(a);
            else {
                if (a.e.l) t(a);
                else {
                    var b = google.xhr();
                    if (b) {
                        b.open("GET", a.q + a.m + "&zx=" + google.time());
                        a.t = 0;
                        b.onreadystatechange = function () {
                            if (b.readyState == 4) {
                                var c = 0;
                                if (b.status == 200) try {
                                    eval(b.responseText);
                                    c = 1
                                } catch (e) {}
                                if (!c && !a.C) {
                                    g[a.c].i = 0;
                                    a.C = 1;
                                    a.q += "&cad=retry";
                                    a.a.onmousedown()
                                } else {
                                    a.u && u(a);
                                    a.t = 0
                                }
                            }
                        };
                        a.t = 1;
                        b.send(null)
                    }
                }
                g[a.c].i = a.I = 1
            }
        }
    }
    function s(a) {
        return function () {
            g[a.c].i || a.a.onmousedown();
            (a.u = a.t) || u(a)
        }
    }

    function v(a) {
        if (!a.e.l) {
            a.e.l = "\x3cfont color\x3dred\x3eError:\x3c/font\x3e The server could not complete your request.  Try again in 30 seconds.";
            a.G = a.a.onclick;
            a.a.onclick = function () {
                i = 0;
                u(a);
                i = 1;
                a.b.parentNode.removeChild(a.b);
                g[a.c].i = a.e.l = a.v = 0;
                a.a.onclick = a.G
            }
        }
        if (!a.v) {
            a.v = 1;
            var b = document.getElementById("res");
            a.H = b && google.getPageOffsetStart(a.d) > google.getPageOffsetStart(b) + google.getWidth(b);
            a.b = document.createElement("div");
            o(a, 0);
            a.b.style.position = "absolute";
            a.b.style.paddingTop = a.b.style.paddingBottom = "6px";
            a.b.style.display = "none";
            a.b.className = "med";
            b = document.createElement("div");
            a.b.appendChild(b);
            b.className = "std";
            b.innerHTML = a.e.l;
            a.g.parentNode.insertBefore(a.b, a.g)
        }
    }
    function j(a) {
        i = 0;
        ManyBox.init();
        m(function (b) {
            if (b.j == a[b.c].j) {
                b.e = a[b.c].D;
                a[b.c].r != b.k && u(b)
            } else a[b.c].i = 0
        });
        g = a;
        i = 1;
        google.History.save(l, g)
    }
    ManyBox.create = function (a, b, c, e, f) {
        return new n(a, b, c, e, f)
    };
    ManyBox.register = function (a, b, c, e, f) {
        return d[a] = ManyBox.create(a, b, c, e, f)
    };
    google.bind(document, "click", function (a) {
        a = a || window.event;
        for (var b = a.target || a.srcElement; b.parentNode;) {
            if (b.tagName == "A" || b.onclick) return;
            b = b.parentNode
        }
        m(function (c) {
            if (c.a.F(a.clientX, a.clientY)) {
                c.a.go();
                return 1
            }
        })
    });

    function w() {
        d = {};
        g = {};
        history.navigationMode = history.navigationMode && "fast"
    }
    w();
    ManyBox.init = function () {
        m(q)
    };

    function x(a, b) {
        a.b.style.clip = "rect(0px," + (a.d.width || "34em") + "," + (b || 1) + "px,0px)"
    }
    n.prototype.insert = function (a) {
        this.e.l = a
    };

    function y(a) {
        a.f = document.getElementById("mbcb" + a.c);
        var b = a.f && a.f.getAttribute("mbopen");
        if (b) {
            eval(b);
            a.onopen(a.f)
        }
    }
    function z(a) {
        a.b.style.display = "none";
        a.h.style.backgroundPosition = "-153px -70px";
        a.p.innerHTML = a.z;
        a.k = g[a.c].r = 0;
        google.History.save(l, g)
    }

    function A(a, b, c, e, f) {
        var k = c > 0 ? 150 : 75,
            h = google.time() - f;
        k = h < k && i ? h / k * c : e > 1 ? c - 10 : c;
        h = Math.max(a.s, b + k);
        var p = h - a.s;
        x(a, p);
        a.d.style.height = h < 0 ? 0 : p ? h + "px" : "";
        o(a, Math.max(0, p - 5));
        google.rhs();
        Math.abs(k) < Math.abs(c) ? window.setTimeout(function () {
            A(a, b, c, e - 1, f)
        }, 30) : window.setTimeout(function () {
            c < 0 ? z(a) : y(a);
            if (!google.isIE && a.H) a.b.style.width = "100px";
            a.b.style.position = a.d.style.height = "";
            o(a, 0);
            google.rhs();
            a.d.w = 0
        }, 0)
    }

    function u(a) {
        a.u = 0;
        if (!a.d.w) {
            a.d.w = 1;
            var b;
            if (a.k) {
                if (b = a.f && a.f.getAttribute("mbclose")) {
                    eval(b);
                    a.onclose(a.f)
                }
                b = a.s - google.getHeight(a.d);
                a.g.style.display = "none";
                o(a, a.n);
                a.b.style.position = "absolute"
            } else {
                a.s = google.getHeight(a.d);
                v(a);
                o(a, 0);
                a.n = 0;
                m(function (c) {
                    c.h.title = ""
                });
                a.h.style.backgroundPosition = "-153px -84px";
                a.p.innerHTML = a.o;
                x(a, 1);
                a.b.style.position = "absolute";
                a.b.style.display = "";
                a.k = g[a.c].r = 1;
                google.History.save(l, g);
                b = a.b.offsetHeight
            }
            A(a, google.getHeight(a.d), b, google.isSafari ? 2 : 1, google.time())
        }
    }
    google.dstr && google.dstr.push(w);
})();
(function () {
    var j, k;

    function o() {
        j = document.createElement("style");
        document.getElementsByTagName("head")[0].appendChild(j);
        k = j.sheet;
    }
    google.addCSSRule = function (a, b) {
        j || o();
        c = a + "{" + b + "}";
        k.insertRule(c, k.cssRules.length);
    };
    google.acrs = function (a) {
        a = a.split(/{|}/);
        for (var b = 1; b < a.length; b += 2) google.addCSSRule(a[b - 1], a[b])
    };
    google.Toolbelt.ascrs = function () {};
    var p, q;

    function r() {
        google.nav(document.getElementById("tbpi").href)
    }
    function t(a) {
        google.srp.updateLinksWithParam("tbo", a ? "1" : "", google.srp.isSerpLink, google.srp.isSerpForm)
    }

    function u() {
        mbtb1.insert = function (b) {
            try {
                v(eval(b))
            } catch (c) {
                r()
            }
        };
        var a = google.xhr();
        if (a) {
            a.open("GET", [google.base_href.indexOf("/images?") == 0 ? google.base_href.replace(/^\/images\?/, "/mbd?") : google.base_href.replace(/^\/search\?/, "/mbd?"), "&mbtype=29&resnum=1&tbo=1", mbtb1.tbs ? "&tbs=" + mbtb1.tbs : "", "&docid=", mbtb1.docid, "&usg=", mbtb1.usg, "&zx=", google.time()].join(""), true);
            a.onreadystatechange = function () {
                if (a.readyState == 4) if (a.status == 200) try {
                    eval(a.responseText)
                } catch (b) {
                    r()
                } else r()
            };
            a.send(null)
        }
    }

    function v(a) {
        for (var b = 0, c = 0, d, e;
        (d = a[b]) && (e = q[c]); b++, c++) if (google.Toolbelt.pti[c]) e.id != d[0] && b--;
        else {
            if (d[2]) {
                e.className = "tbos";
                google.listen(e, "click", google.Toolbelt.tbosClk)
            } else e.className = "tbou";
            e.id = d[0];
            e.innerHTML = d[1]
        }
    }
    function x(a) {
        for (var b = 0, c; c = google.Toolbelt.pbt[b++];) if (c[0] == a) return true;
        return false
    }
    google.Toolbelt.initializeToolElements = function () {
        p = [];
        q = [];
        var a = document.getElementById("tbd");
        if (a) {
            for (var b = a.getElementsByTagName("ul"), c = 0, d; d = b[c++];) {
                p.push(d);
                d = d.getElementsByTagName("li");
                for (var e = 0, f; f = d[e++];) q.push(f)
            }
        }
    };

    function y() {
        var a = document.getElementById("tbd");
        if (!a.getAttribute("data-loaded")) {
            a.setAttribute("data-loaded", 1);
            var b = [],
                c = 0;
            var d = '<li style="opacity:0">';
            for (var e = 0, f = google.Toolbelt.atg.length; e < f; ++e) {
                var h = google.Toolbelt.atg[e],
                    g = google.style.hasClass(p[e], "tbpd");
                b.push('<li><ul class="tbt' + (g ? " tbpd" : "") + '">');
                for (var n;
                (n =
                google.Toolbelt.pbt[c]) && n[0] == e; c++) {
                    for (g = 0; g++ < n[1];) b.push(d);
                    b.push('<li class="' + q[c].className + '" id=' + q[c].id + ">" + q[c].innerHTML)
                }
                for (g = 0; g++ < h;) b.push(d);
                b.push("</ul>")
            }
            a.innerHTML = b.join("");
            google.Toolbelt.initializeToolElements();
            u()
        }
    }

    function z(a) {
        for (var b = [], c = [], d = a ? 0 : 1, e = a ? 1 : 0, f = null, h = 0, g; g = p[h]; h++) {
            google.style.hasClass(g, "tbpd") || b.push([g, "marginBottom", d * 8, e * 8]);
            if (x(h)) f = g;
        }
        google.style.hasClass(f, "tbpd") && b.push([f, "marginBottom", d * 8, e * 8]);
        for (h = 0; f = q[h]; h++) if (!google.Toolbelt.pti[h]) {
            b.push([f, "height", d * 1.2, e * 1.2, 0, "em"]);
            b.push([f, "paddingBottom", d * 3, e * 3]);
            c.push([f, "opacity", d, e, 0, ""]);
            f.style.overflow = "hidden";
        }
        d = a ? b : c;
        var C = a ? c : b;
        google.fx.animate(300, d, function () {
            document.body.className =
            document.body.className.replace(/\btbo\b/, "") + (a ? " tbo" : "");
            google.fx.animate(200, C, function () {
                var s = a ? "" : "none";
                for (m = 0; i = q[m]; m++) {
                    if (a) {
                        i.style.height = "";
                        i.style.overflow = "visible";
                        i.style.opacity = "";
                    }
                }
            })
        })
    }
    google.Toolbelt.togglePromotedTools = function () {
        var a = !google.style.hasClass(document.body, "tbo");
        a && y();
        t(a);
        z(a);
        google.log("toolbelt", (a ? "0" : "1") + "&ei=" + google.kEI);
        return false
    };
    google.rein.push(google.Toolbelt.initializeToolElements);

    function A(a) {
        for (; a && !google.hasClass(a, "tbt");) a = a.parentNode;
        return a
    }
    google.Toolbelt.ctlClk = function (a, b, c) {
        a = a || "cdr_opt";
        if (a == "cdr_opt") {
            c && c.stopPropagation();
        }
        google.Toolbelt.maybeLoadCal && google.Toolbelt.maybeLoadCal();
        b = b || "cdr_min";
        if (a = document.getElementById(a)) {
            a.className = "tbots";
            if (a = A(a)) {
                c = 0;
                for (var d; d = a.childNodes[c++];) if (d.className == "tbos") d.className = "tbotu";
                (b = document.getElementById(b)) && b.focus()
            }
        }
        return false
    };
    google.Toolbelt.cdrClk = google.Toolbelt.ctlClk;

    function B(a) {
        return a.replace(/_/g, "_1").replace(/,/g, "_2").replace(/:/g, "_3")
    }
    google.Toolbelt.cdrSbt = function () {
        return D("ctbs", {
            cdr_min: "cd_min",
            cdr_max: "cd_max"
        })
    };
    google.Toolbelt.clSbt = function () {
        return D("ltbs", {
            l_in: "cl_loc"
        })
    };
    google.Toolbelt.prcSbt = function () {
        D("prcbs", {
            prc_min: "pr_min",
            prc_max: "pr_max"
        });
        var a = document.getElementById("prc_frm");
        if (a) {
            var b = document.getElementById("tsf");
            if (b) a.elements.q.value = b.elements.q.value
        }
    };

    function D(a, b) {
        var c = document.getElementById(a);
        if (c) for (var d in b) {
            var e = B(document.getElementById(d).value),
                f = new RegExp("(" + b[d] + ":)([^,]*)");
            c.value = c.value.replace(f, "$1" + e)
        }
        return true
    }
    google.Toolbelt.tbosClk = function (a) {
        a = a || window.event;
        if ((a = a.target || a.srcElement) && a.className == "tbotu") {
            a.className = "tbos";
            if (a = A(a)) for (var b = 0, c; c = a.childNodes[b++];) if (c.className == "tbots") c.className = "tbou"
        }
    };
})();
(function () {
    var g = null,
        i = false,
        k, l = encodeURIComponent,
        aa = /^(\w+)?(?:\.(.+))?$/;

    function m(a) {
        for (var b = 1; b < arguments.length; b += 2) {
            var c = arguments[b],
                d = arguments[b + 1],
                e = a.style;
            if (c in a) a[c] = d;
            else if (e && c in e) e[c] = d;
        }
        return a
    }

    function n(a, b) {
        var c = a.match(aa),
            d = document.createElement(c[1]);
        if (c[2]) d.className = c[2];
        if (b) d.innerHTML = b;
        return d
    }
    function o(a) {
        var b = Array.prototype.slice.call(arguments, 1);
        return function () {
            return a.apply(g, b.concat(Array.prototype.slice.call(arguments)))
        }
    }
    function p(a, b) {
        for (var c in b) a = a.replace(new RegExp("\\{" + c + "\\}", "g"), b[c]);
        return a
    }
    var q = ["&", "&amp;", "<", "&lt;", ">", "&gt;", '"', "&quot;", "'", "&#39;", "{", "&#123;"];

    function r(a, b) {
        for (var c = b ? 1 : 0, d = b ? 0 : 1; c < q.length; c += 2, d += 2) a = a.replace(new RegExp(q[c], "g"), q[d]);
        return a
    }
    function s(a) {
        return document.getElementById(a)
    }
    function u(a, b, c) {
        var d = a.match(aa);
        a = d[2] && new RegExp("\\b" + d[2]);
        b = (b || document).getElementsByTagName(d[1] || "*");
        if (a) {
            d = 0;
            var e = b;
            b = [];
            for (var f; f = e[d++];) a.test(f.className) && b.push(f)
        }
        return b.length > 1 || c ? b : b[0]
    }
    function v(a, b, c) {
        b.parentNode.insertBefore(a, c ? b.nextSibling : b)
    }

    function w(a) {
        return a && a.parentNode && a.parentNode.removeChild(a)
    }
    function x(a, b, c, d) {
        try {
            var e = google.xhr();
            e.onreadystatechange = function () {
                if (e.readyState == 4 && e.status == 200) {
                    c && c(d ? eval("(" + e.responseText + ")") : e.responseText);
                    e = g
                }
            };
            if (a == 0) {
                e.open("GET", b, true);
                e.send(g)
            } else {
                b = b.split("?");
                e.open("POST", b[0], true);
                e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                e.send(b[1] || "")
            }
        } catch (f) {}
    }

    function y(a) {
        a = u("button.wpb", a);
        if (a.style.backgroundPosition) {
            a.style.cssText = "";
            return true
        } else {
            a.style.backgroundPosition = /nav_logo4.png/.test(u("img", s("logo"), 1)[0].src) ? "-126px -78px" : "-153px -84px";
            return i
        }
    }
    var z, A = [];

    function C(a, b, c) {
        var d = {
            applicationId: 19
        },
            e = "/reviews/json/";
        if (z) {
            var f;
            f = b.c ? {
                url: b.c
            } : {
                swUrl: b.A,
                groups: ["W"],
                encrypted: b.u == g ? k.qt : k.at[b.l]
            };
            if (a == "write") {
                var h = {},
                    j = b.l;
                f = {
                    entity: f,
                    attributes: h
                };
                if (j && j.length > 256) j = j.substr(0, 256);
                if (k.ex) h.exp = k.ex;
                if (b.u != g) {
                    h.rquery = j;
                    if (b.B != g) h.pa = b.B;
                    f.starRating = b.u
                } else if (b.C) {
                    h.rquery = j;
                    f.bookmarked = true
                } else {
                    f.labels = [b.l];
                    f.comment = b.e
                }
                if (b.p) f.title = b.p;
                f.language = google.kHL;
                f.country = "";
                d.annotations = [f]
            } else if (a == "delete") d.entities = [f];
            e += a + "?req=" + l(google.stringify(d));
            if (a == "write" || a == "delete") e += "&token=" + z;
            D(e, c)
        } else if (A.push([a, b, c]) == 1) {
            d.queries = [k.q];
            D(e + "sw?req=" + l(google.stringify(d)))
        }
    }

    function F(a, b, c) {
        c = c || {};
        c.l = a.l || k.q;
        if (b == 0) {
            c.c = a.c;
            c.C = true;
            c.p = a.p
        } else {
            c.A = a.c;
            if (b == 2 || b == 1) {
                c.u = b == 2 ? 1 : 0;
                if (b == 1) c.B = i
            }
        }
        C("write", c)
    }
    function D(a, b, c) {
        x(1, a, function (d) {
            if (d.channelHeader.token) {
                z = d.channelHeader.token;
                if (d.swToken) {
                    k.qt = d.swToken;
                    k.at = {};
                    for (var e = 0, f; f = d.queryTokens[e++];) k.at[f.query] = f.token
                }
                for (; A.length;) C.apply(g, A.shift())
            }
            e = d.channelHeader.errorCode;
            f = c || 1;
            if (e == 7 && f < 3) D(a, b, f + 1);
            else {
                e && google.log("error", "&sa=X&oi=sw_s&cd=" + e);
                b && b(d)
            }
        }, 1)
    }
    var ca = google.History.client(ba),
        G, H, I = 0,
        J = {},
        K = 0;

    function ba(a) {
        if (a && H) {
            H = 0;
            if (K == a[0]) {
                G = a[1];
                I = 1;
                a = 0;
                for (var b; b = G[a++];) J[b[0]] && J[b[0]].call(g, b[1], b[2]);
                I = 0
            }
        }
    }
    function L(a, b, c) {
        G.push([a, b, c]);
        da()
    }
    function M(a, b, c) {
        for (var d = 0, e; e = G[d++];) if (e[0] == a && e[1] == b) {
            e[2] = c;
            da();
            return
        }
        L(a, b, c)
    }
    function da() {
        google.History.save(ca, [K, G])
    }
    J[2] = function (a, b) {
        N(E[a]);
        E[a].m.value = b;
        O(E[a])
    };

    function fa(a) {
        if (!a.s && !a.e) {
            m(a.m, "value", "", "color", "#000");
            a.o.disabled = 0;
            a.s = 1
        }
    }

    function N(a) {
        if (!a.d) {
            a.d = u(".wce", a.a);
            m(a.d, "display", "none", "margin", "4px 0", "width", "38em", "innerHTML", '<textarea rows=8 style="width:100%;margin-bottom:4px;font-family:arial,sans-serif;font-size:small"></textarea><br><table border=0 cellpadding=0 style="border-collapse:collapse;width:100%"><tr><td><input type=button value="Make a public comment" disabled> <input type=button value="Cancel"><td style=text-align:right><a href=# class=fl>Delete comment</a></table>');
            var b = u("input", a.d);
            (a.o = b[0]).onclick = o(ga, o(O, a));
            (a.v = u("a", a.d)).onclick = o(ha, a);
            b[1].onclick = o(P, a);
            (a.m = u("textarea", a.d)).onclick = o(fa, a)
        }
        if (!a.f) {
            a.f = n("div.wcd", p('<span style=color:#666>Comment by {name}, <span class=wcu></span></span>&nbsp;- "<span class=wct></span>" <a href=# class="wcl fl">Edit</a>', {
                name: k.nn
            }));
            a.f.style.display = "none";
            v(a.f, a.d, 1);
            u(".wcl", a.f).onclick = o(N, a)
        }
        I || (a.d.style.display == "block" ? P(a) : window.setTimeout(function () {
            a.s = 0;
            if (a.e) {
                m(a.m, "value", a.e, "color", "#000");
                a.o.disabled = 0;
                a.v.style.display = ""
            } else {
                m(a.m, "value", "Type your comment here", "color", "#666");
                a.o.disabled = 1;
                a.v.style.display = "none"
            }
            a.f.style.display = "none";
            a.d.style.display = "block"
        }, 0));
        return i
    }

    function O(a) {
        var b = a.m.value.replace(/^\s+|\s+$/g, "");
        if (b) {
            a.z = "";
            w(a.r)
        }
        if (b != a.e) {
            u(".wct", a.a).innerHTML = r(b).replace(/(\S{25}[^&\s]{5})(\S{10})/g, "$1<wbr>$2");
            u(".wcu", a.a).innerHTML = "Today";
            if (!I) {
                b ? F(a, -1, {
                    e: b
                }) : C("delete", {
                    A: a.c
                });
                M(2, a.g, b)
            }
            a.e = b
        }
        P(a)
    }
    function ia(a) {
        a.m.value = a.z;
        w(a.r);
        O(a);
        return i
    }

    function ha(a) {
        a.z = a.e;
        a.r = n("div.wcd", "<span style=color:#666>Comment deleted </span> - <a href=# class=fl>Undo</a>");
        a.m.value = "";
        O(a);
        u("a", a.r).onclick = o(ia, a);
        v(a.r, a.d, 1);
        return i
    }
    function P(a) {
        a.d.style.display = "none";
        a.f.style.display = a.e ? "" : "none"
    }
    var Q, R = 0,
        S, T;
    J[3] = function (a, b) {
        T = b ? 1 : 2;
        b && U()
    };
    J[4] = function (a, b) {
        var c = n("li.g", b);
        V(ja(c, 4));
        s("wrg").appendChild(c);
        Q = 2
    };
    var ma = function (a) {
        function b() {
            if (!R && !I) {
                var c = n("li.g", "Results you remove can be viewed at the bottom of the page.");
                v(c, a.a);
                window.setTimeout(function () {
                    google.fx.animate(500, [
                        [W(c), "paddingTop", c.offsetHeight + ka(c), 0]
                    ]);
                    c.style.display = "none"
                }, 5E3)
            }
            R = 1;
            s("wrg").appendChild(a.a);
            m(a.a, "marginLeft", "", "visibility", "visible", "display", "");
            s("wrz").style.display = "block";
            V(a);
            if (!a.k) for (var d = a.g + 1, e;
            (e = E[d++]) && e.k;) if (e.b == 0) e.a.style["marginLeft"] = "";
        }
        if (I) b();
        else {
            la(a, b);
            F(a, 2);
            L(0, a.g, 4)
        }
    },
        U = function () {
            if (Q == 2) {
                var a = y(S);
                s("wrg").style.display = a ? "none" : "block";
                u("span", S).innerHTML = a ? "Show them" : "Hide them";
                T++;
                if (!I) {
                    M(3, "", !a);
                    T < 3 && google.log("plus", "&sa=X&oi=sw_r&cd=" + !a)
                }
            } else if (Q == 0) {
                Q = 1;
                s("wrm").style.display = "block";
                var b = k.ru.length;
                a = 0;
                for (var c; c = k.ru[a++];) na(c, function (d) {
                    V(ja(d, 4));
                    s("wrg").appendChild(d);
                    L(4, "", d.innerHTML);
                    if (--b == 0) {
                        Q = 2;
                        s("wrm").style.display = "none";
                        U()
                    }
                })
            }
        };
    var Y, pa = /<!--m--\>\s*(.*?)\s*<!--n--\>/,
        Z;
    J[0] = function (a, b) {
        qa(E[a], b)
    };
    J[1] = function (a, b) {
        var c = E[a];
        if (c && c.j && c.j.className != (b ? "wsa" : "ws")) ra(c)
    };
    var ra = function (a) {
        var b = a.j.className == "ws",
            c = b ? "wsa" : "ws";
        a.j.className = c;
        for (var d = 0, e; e = E[d]; ++d) if (d != a.g && e.c == a.c && e.j) e.j.className = c;
        if (!I) {
            b ? F(a, 0) : C("delete", {
                c: a.c
            });
            M(1, a.g, b)
        }
    },
        sa = function () {
            var a = this,
                b = y(a);
            a.parentNode.nextSibling.style.display = b ? "none" : "";
            u("a", a).innerHTML = b ? "Show more starred results" : "Hide more starred results";
            google.log(b ? 0 : 1, "&sa=X&oi=sw_top&cd=0")
        },
        ta = function (a, b) {
            if (b == 0 && a.b != 4) qa(a, 4);
            else b == 1 && qa(a, 0)
        },
        qa = function (a, b) {
            a.t = a.b;
            a.b = b;
            b == 4 ? ma(a) : ua(a)
        },
        V = function (a) {
            if (a.i) {
                a.i.style.cssText = "";
                a.i.style.display = a.b == 4 ? "none" : "inline";
                if (!u("button.wci", a.a)) {
                    var b = a.i.previousSibling || a.i.parentNode.previousSibling;
                    if (b) {
                        b = b.lastChild || b;
                        b.nodeValue = b.nodeValue.replace(/( - )?$/, a.b == 4 ? "" : " - ")
                    }
                }
            }
            if (!a.n && a.b != 0) {
                b = n("span", "<button class=wxs></button>&nbsp;-&nbsp;");
                b.style.display = "none";
                b.appendChild(a.n =
                m(n("span.link", "Restore"), "color", "#77c", "fontSize", "small"));
                v(b, a.j, 1);
                a.n.onclick = o(ta, a, 1)
            }
            if (a.n) a.n.parentNode.style.display = a.b == 4 ? "inline" : "none"
        },
        ua = function (a, b) {
            var c = a.a,
                d = a.D;
            va(a, d, function () {
                var e = "";
                if (a.k) for (var f = a.g - 1, h; h = E[f--];) if (!h.k) {
                    if (h.b == 0) e = a.k;
                    break
                }
                m(c, "margin", "", "marginLeft", e);
                if (!s("wrg").lastChild) s("wrz").style.display = "none";
                if (!a.k) for (f = a.g + 1;
                (h = E[f++]) && h.k;) if (h.b == 0) h.a.style["marginLeft"] = h.k
            });
            if (!I && !b) {
                F(a, 1);
                L(0, a.g, a.b)
            }
        },
        va = function (a, b, c) {
            function d() {
                v(e, b, b != Y && a.t != 0);
                window.setTimeout(function () {
                    if (j) {
                        h.style.paddingTop = "";
                        e.style.opacity = 1;
                        m(e, "position", "", "width", "", "height", "")
                    }
                    c(j)
                }, 0)
            }
            V(a);
            var e = a.a;
            if (I) d();
            else {
                var f = W(e, b),
                    h = W(b, e);
                if (f == b || h == e) d();
                else {
                    var j = wa(e),
                        t = wa(h),
                        B = ka(e),
                        ea = t.y - (j.y > t.y ? 0 : j.h + Math.max(B, ka(h)));
                    t = j.h + B - (j.y < t.y && a.E ? a.E.offsetHeight : 0);
                    xa(e, j);
                    e.style.opacity = 0.5;
                    e.style.margin = 0;
                    google.fx.animate(500, [
                        [f, "paddingTop", j.h + B, 0],
                        [h, "paddingTop", 0, t],
                        [e, "top", j.y, ea, google.fx.easeInAndOut]
                    ], d)
                }
            }
        },
        la = function (a, b) {
            var c = a.a,
                d = wa(c);
            c.style.visibility = "hidden";
            var e = new Image,
                f = Math.min(1, d.h / 65);
            h = m(n("div"), "zIndex", 100, "verticalAlign", "middle");
            xa(h, d);
            document.body.appendChild(h);
            m(e, "width", Math.round(120 * f), "height", Math.round(65 * f), "src", "/images/swxa.gif");
            h.appendChild(m(n("div.s"), "textAlign", "center")).appendChild(e);
            window.setTimeout(function () {
                w(h);
                c.style.display = "none";
                b()
            }, 750);
        },
        ya = function (a) {
            if (k.ls2 && !I) {
                x(0, "/sw204?cd=2&usg=" + k.ls2);
                delete k.ls2
            }
            a()
        },
        ga = function (a) {
            if (k.lb && !I) {
                Z || (Z = m(n("div", p('<div style="background-color:#fff;border:2px solid #73a6ff;padding:15px;width:40em"><h3><b>Please remember comments are public.</b></h3><br>Comments will be visible to others and identified by your Google Account nickname.<br><br><input id=wlac type=button value="Yes, continue."><input id=wlrg type=button value="Cancel"></div>', {
                    lang: google.kHL
                })), "position", "absolute"));
                Z.style.top = "-900px";
                var b = document.body,
                    c = document.documentElement;
                b.appendChild(Z);
                m(Z, "top", Math.round(c.clientHeight / 2 + (b.scrollTop || c.scrollTop) - Z.offsetHeight / 2) + "px", "left", Math.round(c.clientWidth / 2 + (b.scrollLeft || c.scrollLeft) - Z.offsetWidth / 2) + "px");
                s("wlac").onclick = function () {
                    w(Z);
                    delete k.lb;
                    x(0, "/sw204?cd=1&usg=" + k.ls);
                    a()
                };
                s("wlrg").onclick = o(w, Z);
                google.log("sw", "&sa=X&oi=sw_l")
            } else a()
        },
        na = function (a, b) {
            x(0, "/search?q=info:" + l(a + " " + k.q) + "&swm=5&hl=" + google.kHL, function (c) {
                if ((c = c && c.match(pa)) && /class=ws/.test(c[1])) b(n("div", c[1]).firstChild);
                else {
                    /^[a-zA-Z]+:\/\//.test(a) || (a = "http://" + a);
                    b(n("li.g", p('<h3 class=r><a class=l href="{url}">{url}</a></h3><button class=ws></button><div class=s><cite>{site}</cite></div><div class=wce></div>', {
                        url: r(a),
                        site: r(a.replace("http://", ""))
                    })))
                }
            })
        },
        wa = function (a) {
            var b = 0,
                c = 0,
                d = a.offsetWidth,
                e = a.offsetHeight;
            do {
                b += a.offsetTop;
                c += a.offsetLeft
            } while (a = a.offsetParent);
            return {
                x: c,
                y: b,
                w: d,
                h: e
            }
        },
        xa = function (a, b) {
            m(a, "position", "absolute", "top", b.y + "px", "left", b.x + "px", "width", b.w + "px", "height", b.h + "px")
        },
        ka = function (a) {
            b = parseInt(window.getComputedStyle(a, g).getPropertyValue("margin-bottom"), 10);
            return b
        },
        W = function (a, b) {
            for (var c = a; c = c.nextSibling;) if (c.nodeType == 1 && (c.innerHTML && c.offsetHeight > 0 || c == b)) return (!/\bg\b/.test(c.className)) && u(".g\\b", c, 1).pop() || c;
            return a.parentNode ? W(a.parentNode, b) : g
        };
    var E, $ = {
        wxi: [119, 57],
        wci: [119, 72]
    };

    function za() {
        E = [];
        G = [];
        H = 1;
        z = "";
        Y = n("div");
        Aa();
        for (var a = K = 0, b; b = E[a++];) K = K << 5 ^ K >> 27 ^ b.c.length ^ b.b << 8;
        E.length && v(Y, E[E.length - 1].a, 1);
        if (a = s("wrz")) {
            (S = u("span", a, 1)[0]).onclick = U;
            T = 0;
            if (k.ru) {
                Q = 0;
                R = 1
            } else {
                Q = 2;
                y(S)
            }
        }
        if (a = s("wsz")) a.onclick = sa;
        (new Image).src = "/images/swxa.gif";
    }
    function Aa() {
        var a = u("li.w\\d", document, 1);
        a = a.concat(u("td.w\\d", document, 1));
        for (var b = 0, c; c = a[b++];) ja(c, parseInt(c.className.match(/\bw(\d)/)[1], 10))
    }

    function ja(a, b) {
        if (!a) return {};
        for (var c = 0, d; d = E[c++];) if (a == d.a) return d;
        c = u("a.l\\b", a) || u("a", a, 1)[0];
        d = c.href;
        var e = d.match(/[\/.]google\.[.\w:]+\/url\?(.+)/);
        if (e) {
            var f = e[1];
            if ((e = f.match(/(^|&)url=(.*?)(&|$)/)) || (e = f.match(/(^|&)q=(.*?)(&|$)/))) d = decodeURIComponent(e[2])
        }
        d = {
            c: d,
            g: E.length,
            a: a,
            b: b,
            p: c.innerHTML.replace(/<\/?(b|em)>/gi, "")
        };
        d.k = a.style["marginLeft"];
        d.D = Y;
        d.F = c;
        d.t = 0;
        d.j =
        u("button.ws", a);
        if (d.j) d.j.onclick = o(ra, d);
        d.i = u("button.wxi", a);
        if (d.i) {
            d.i.onclick = o(ya, o(ta, d, 0));
            d.i.onmouseover = d.i.onmouseout = Ba
        }
        if (c = u("button.wci", a)) {
            c.onclick = o(N, d);
            c.onmouseover = c.onmouseout = Ba
        }
        d.s = d.G = 0;
        d.f = u(".wcd", a);
        if (d.f) {
            d.e = r(u(".wct", a).innerHTML.replace(/<wbr>/g, ""), 1);
            u(".wcl", d.f).onclick = o(N, d)
        }
        E.push(d);
        return d
    }
    function Ba(a) {
        if (this.className in $) {
            this.style.backgroundPosition = a.type == "mouseout" ? "" : -$[this.className][0] + "px " + -$[this.className][1] + "px";
        }
    }
    google.sw = function (a) {
        k = a;
        za()
    };
    google.sw.find = Aa;
})();
if (!window.gbar || !gbar.close) {;
};
(function () {
    var f = true,
        g = false;
    window.google.rt = {};
    var h, i, j, k, m, n, o, p, q, r, s, t, u, v, w, aa, x;

    function ba() {
        h = 30;
        i = [];
        k = j = g;
        m = "";
        o = 0;
        p = g;
        q = (new Date).getTime();
        r = 100;
        s = 0;
        t = g;
        x = []
    }
    google.rt.init = function (a, c, b) {
        ba();
        if (n = document.getElementById(a)) {
            if (b) if (b.maxResults) r = b.maxResults;
            document.onmousemove = function () {
                p = f
            };
            document.onkeydown = function () {
                p = f
            };
            c && ca(c);
            s += n.getElementsByTagName("li").length;
            i.length == 0 && window.setTimeout(y, 3E3);
            da(n, x);
            z(y, h);
            if (ea("sbu", "sbd", "sbb", a)) {
                A.push(function () {
                    k = f
                });
                B.push(function () {
                    k = g
                });
                C(0, f)
            }
            fa(ga, 3E3, 6E3)
        }
    };
    google.rt.pause = function () {
        ha();
        D();
        var a = document.getElementById("rth");
        a = a.getElementsByTagName("span");
        E(a[0]);
        F(a[1]);
        aa = (new Date).getTime()
    };
    google.rt.resume = function () {
        var a = ((new Date).getTime() - aa) / 1E3;
        if (a > 10) i = [];
        y();
        z(y, h);
        fa(ga, 2E3, 6E3);
        a = document.getElementById("rth");
        a = a.getElementsByTagName("span");
        E(a[1]);
        F(a[0])
    };

    function E(a) {
        a.style.display = "none"
    }
    function F(a) {
        a.style.display = ""
    }

    function z(a, c) {
        var b = c;
        if (o) {
            b = Math.pow(2, o) * 5;
            b = (Math.random() + 0.5) * b;
            b = Math.min(7200, b)
        }
        w = window.setTimeout(function () {
            a();
            z(a, c)
        }, b * 1E3)
    }
    function ha() {
        window.clearTimeout(w)
    }
    function fa(a, c, b) {
        u = window.setTimeout(function () {
            a();
            v = window.setInterval(a, b)
        }, c)
    }
    function D() {
        window.clearTimeout(u);
        window.clearInterval(v)
    }

    function ga() {
        if (!i.length || k) {
            if (t) {
                D();
                var a = document.getElementById("rth");
                a = a.getElementsByTagName("span");
                if (a.length > 2) {
                    E(a[0]);
                    E(a[1]);
                    F(a[2])
                }
            }
        } else {
            var c = i.shift();
            a = c.e;
            var b = a.getElementsByTagName("li")[0];
            n.insertBefore(a, n.firstChild);
            c.updateDate();
            google.History.save(ia, {
                r: n.innerHTML,
                u: m,
                n: s,
                s: x,
                t: G()
            });
            var d = -google.getComputedStyle(b, "height") - google.getComputedStyle(b, "margin-bottom");
            c = n.scrollTop;
            if (c < 20) {
                C(c);
                a = [
                    [a, "marginTop", d, 0, google.fx.easeInAndOut]
                ];
                google.fx.animate(1200, a)
            } else C(c - d)
        }
    }
    function ca(a) {
        if (a.results) {
            var c = a.results.length;
            s += c;
            c = c;
            for (var b; b = a.results[--c];) i.push(ja(b))
        }
        if (a.nextRequest) m = a.nextRequest;
        if (a.pollSeconds) h = a.pollSeconds
    }
    window.mbrt0 = window.mb0rt = {
        insert: function (a) {
            a = eval("(" + a + ")");
            ca(a)
        }
    };

    function y() {
        if (p) {
            p = g;
            q = (new Date).getTime()
        } else if ((new Date).getTime() - q > 24E4) return;
        t = s + 5 > r;
        if (!(j || t || !m)) {
            var a = google.xhr();
            a.open("GET", m);
            a.onreadystatechange = function () {
                if (a.readyState == 4) {
                    if (a.status == 200) {
                        eval(a.responseText);
                        o = 0
                    } else o++;
                    j = g
                }
            };
            j = f;
            a.send(null)
        }
    }
    function ja(a) {
        var c = document.createElement("div");
        c.innerHTML = a.html;
        return {
            e: c,
            updateDate: ka(c, x)
        }
    }
    var ia = google.History.client(function (a) {
        n.innerHTML = a.r;
        m = a.u;
        s = a.n;
        x = a.s;
        H(n, x, a.t);
        C(0, f);
        i = [];
        y()
    });
    google.dstr.push(function () {
        D();
        ha()
    });
    var I, J, K, M, N, O, P, A, B, Q, R, S = g;

    function T(a) {
        var c = google.getComputedStyle(a, "height");
        return c
    }
    function U(a) {
        a = a.offsetTop;
        a -= M.offsetTop;
        return a
    }

    function V(a) {
        if (a) for (var c = 0, b; b = A[c++];) b();
        else if (P) for (c = 0; b = B[c++];) b();
        P = a
    }
    function W(a) {
        var c = la(a);
        if (c) {
            var b = U(c);
            a || (b += T(c) - R);
            ma(b, f, 300, function () {
                na(a)
            })
        }
    }
    function ma(a, c, b, d) {
        var e = M.scrollHeight - R;
        e = e == 0 ? 0 : oa(a * (Q - Math.max(R / M.scrollHeight * Q, 20)) / e);
        e = [
            [K, "marginTop", google.getComputedStyle(K, "margin-top"), e, google.fx.easeInAndOut]
        ];
        if (c) e.push([M, "scrollTop", M.scrollTop, a, google.fx.easeInAndOut, ""]);
        else M.scrollTop = a;
        google.fx.animate(b, e, d)
    }

    function na(a) {
        setTimeout(function () {
            P && W(a)
        }, 200)
    }
    function la(a) {
        var c = M.childNodes;
        if (a) for (a = c.length - 1; a >= 0; --a) {
            var b = c[a],
                d = U(b);
            if (b.nodeType == 1 && d < M.scrollTop) return b
        } else for (a = 0; b = c[a++];) {
            d = U(b);
            if (b.nodeType == 1 && d + T(b) > M.scrollTop + R) return b
        }
    }
    function X(a) {
        var c = a.clientY - N;
        c = oa(google.getComputedStyle(K, "margin-top") + c);
        K.style.marginTop = c + "px";
        M.scrollTop = c * (M.scrollHeight - R) / (Q - T(K));
        N = a.clientY
    }
    function oa(a) {
        return Math.max(0, Math.min(Q - T(K), a))
    }

    function C(a, c) {
        if (S) {
            var b = T(K),
                d = Math.max(R / M.scrollHeight * Q, 20),
                e = document.getElementById("sbbb");
            b = [
                [K, "height", b, d],
                [e, "marginTop", b - 7, d - 7]
            ];
            if (!O) {
                e = d = 0;
                for (var l; l = M.childNodes[e++];) if (l.nodeType == 1) d += T(l);
                if (d > R) {
                    b.push([document.getElementById("sb"), "opacity", 0, 1, google.fx.linear, ""]);
                    O = f
                }
            }
            d = c ? 0 : 1200;
            ma(a, g, d);
            google.fx.animate(d, b, function () {
                if (O) K.style.position = "absolute"
            })
        }
    }

    function Y(a, c) {
        if (a.parentNode == K) a = K;
        var b = 70 * (c ? 1 : -1);
        pa(a, b);
        for (var d = 0, e; e = a.childNodes[d++];) e.nodeType == 1 && pa(e, b)
    }
    function pa(a, c) {
        var b = a.style.backgroundPosition.match(/^-?\d+/),
            d = a.style.backgroundPosition.match(/\s+.*$/);
        a.style.backgroundPosition = parseInt(b, 10) + c + "px " + (d ? d : "")
    }

    function ea(a, c, b, d) {
        I = document.getElementById(a);
        J = document.getElementById(c);
        K = document.getElementById(b);
        M = document.getElementById(d);
        if (!(I && J && K && M)) return S = g;
        P = O = g;
        A = [];
        B = [];
        Q = google.getComputedStyle(document.getElementById("sbc"), "height") - 1;
        R = google.getComputedStyle(M, "height");
        a = [I, J, K];
        for (c = 0; b = a[c++];) {
            google.bind(b, "mouseover", function (e) {
                Y(e.target)
            });
            google.bind(b, "mouseout", function (e) {
                Y(e.target, f)
            });
            b.onmousedown = function () {
                return g
            };
        }
        google.bind(I, "mousedown", function () {
            V(f);
            W(f)
        });
        google.bind(J, "mousedown", function () {
            V(f);
            W()
        });
        google.bind(K, "mousedown", function (e) {
            V(f);
            N = e.clientY;
            google.bind(document, "mousemove", X)
        });
        return S = f
    }
    google.bind(document, "mouseup", function () {
        document.removeEventListener("mousemove", X, g);
        V(g)
    });
    google.dstr.push(function () {
        A = B = [];
        S = g
    });
    var qa = -1,
        Z, ra = {
            Hour: "%I %p",
            HourMinute: "%I:%M%p",
            FullMonth: "%B",
            ShortMonth: "%b",
            MonthDay: "%d %b",
            FullDate: "%d %b %Y %I:%M:%S %p"
        },
        sa = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        ta = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function ua(a, c) {
        for (var b = a.getElementsByTagName("div"), d = 0, e; e = b[d++];) if (e.className == "rtdelta") {
            b = parseInt(e.innerHTML, 10);
            return c - b
        }
        return g
    }
    function G() {
        return Math.round((new Date).getTime() / 1E3)
    }
    function va(a, c, b) {
        return b ?
        function (d) {
            return google.rt.formatTime(d, "FullDate")
        } : wa
    }

    function wa(a, c) {
        var b = c - a;
        if (b < 86400) if (b < 45) return "seconds ago";
        else if (b < 105) return "1 minute ago";
        else if (b < 3345) {
            b = Math.floor(b / 60) + (b % 60 >= 45 ? 1 : 0);
            return "1 minutes ago".replace("1", b + "")
        } else if (b < 6600) return "1 hour ago";
        else {
            b = Math.floor(b / 3600) + (b % 3600 >= 3E3 ? 1 : 0);
            return "1 hours ago".replace("1", b + "")
        }
        return g
    }
    function xa(a, c, b, d) {
        if (c) if (c = d(c, b)) a.innerHTML = c
    }

    function $(a) {
        var c = [];
        a = a.getElementsByTagName("span");
        for (var b = 0, d; d = a[b++];) d.className.match("rtd") && c.push(d);
        return c
    }
    function ya(a) {
        a = $(a);
        if (a.length > 0) return a[0];
        return g
    }
    function H(a, c, b) {
        a = $(a);
        b = b || G();
        for (var d = 0, e; e = a[d]; d++) xa(e, c[d], b, Z)
    }
    function ka(a, c, b) {
        var d = b || G();
        return function () {
            var e = ya(a);
            if (e) {
                var l = ua(e, d);
                if (l) {
                    xa(e, l, G(), Z);
                    c.unshift(l)
                }
            }
        }
    }

    function da(a, c, b, d) {
        var e = $(a);
        b = b || G();
        for (var l = 0, L; L = e[l++];)(L = ua(L, b)) && c.push(L);
        Z = va(c[c.length - 1], c[0], d);
        if (d) H(a, c);
        else qa = window.setInterval(function () {
            H(a, c)
        }, 6E4)
    }
    google.dstr.push(function () {
        window.clearInterval(qa)
    });
    if (!window.google.rt) window.google.rt = {};
    google.rt.formatTimeString = function (a, c) {
        var b = new Date(a * 1E3),
            d = c;
        d = d.replace("%Y", b.getFullYear() + "");
        var e = b.getMonth();
        d = d.replace("%b", sa[e]);
        d = d.replace("%B", ta[e]);
        d = d.replace("%m", (1 + e < 10 ? "0" : "") + (1 + e));
        e = b.getDate();
        d = d.replace("%d", (e < 10 ? "0" : "") + e);
        d = d.replace("%H", b.getHours() + "");
        e = (e = b.getHours() % 12) ? e + "" : "12";
        d = d.replace("%I", e);
        d = d.replace("%p", b.getHours() / 12 < 1 ? "am" : "pm");
        e = b.getMinutes();
        d = d.replace("%M", (e < 10 ? "0" : "") + e);
        b = b.getSeconds();
        return d = d.replace("%S", (b < 10 ? "0" : "") + b)
    };
    google.rt.formatTime = function (a, c) {
        var b = ra[c];
        return google.rt.formatTimeString(a, b)
    };
    google.rt.replayinit = function (a) {
        n = document.getElementById(a);
        x = [];
        if (n) {
            da(n, x, null, f);
            google.History.save(ia, {
                r: n.innerHTML,
                s: x,
                t: G()
            })
        }
    };
})();
(function () {
    var e = false;

    function h(a) {
        google.srp.updateLinksWithParam("prmdo", a ? "1" : "", google.srp.isSerpLink, google.srp.isSerpForm)
    }
    function i(a, c, b) {
        return [[c, "height", a ? b : 0, a ? 0 : b], [c, "opacity", a ? 1 : 0, a ? 0 : 1, null, ""]]
    }
    function j(a) {
        if (!a) return null;
        var c = a.offsetHeight,
            b = google.style.getComputedStyle(a, "overflow", 1);
        a.style.overflow = "hidden";
        return {
            height: c,
            overflow: b
        }
    }

    function l(a, c, b) {
        if (c) a.style.height = b.height + "px";
        else a.style.removeAttribute && a.style.removeAttribute("filter");
        a.style.overflow = b.overflow
    }
    google.srp.toggleModes = function () {
        if (!e) {
            e = true;
            var a = document.getElementById("ms"),
                c = document.getElementById("hidden_modes"),
                b = document.getElementById("hmp"),
                d = google.style.hasClass(a, "open");
            a.className = "open";
            var k = j(c),
                f = j(b),
                g = i(d, c, k.height);
            if (f) g = g.concat(i(d, b, f.height));
            h(!d);
            google.fx.animate(227, g, function () {
                if (d) a.className = "";
                l(c, d, k);
                b && l(b, d, f);
                e = false
            })
        }
    };
})();
(function () {
    google.Tbpr = {};
    var d = {},
        g = /\bl\b/;

    function h(a) {
        return g.test(a.className)
    }
    function i() {
        for (var a = document.getElementsByTagName("h3"), b = 0, c; c = a[b++];) if (c.className == "tbpr") {
            var e = Number(c.id.substr(5));
            d[e] = c;
            j(c, e)
        }
    }
    function j(a, b) {
        for (; a && a.nodeName != "LI";) a = a.parentNode;
        if (a) for (var c = a.getElementsByTagName("a"), e = 0, f; f = c[e++];) if (h(f)) {
            f.result_index = b;
            return
        }
    }
    function k() {
        for (var a in d) d[a].style.display = "none"
    }
    function l(a) {
        if (d[a]) d[a].style.display = "block"
    }

    function m(a) {
        var b = "";
        k();
        if (a.lastClicked >= 0) {
            l(a.lastClicked);
            b = "tbpr:idx=" + a.lastClicked
        }
        return b
    }
    function n(a, b) {
        b.lastClicked = a.result_index || -1
    }
    google.Tbpr.init = function () {
        i();
        google.event.back.init();
        google.event.back.register(h, n, m, "tbpr")
    };
})();
if (google.y.first) {
    for (var a = 0, b; b = google.y.first[a]; ++a) b();
    delete google.y.first
}
for (a in google.y) google.y[a][1] ? google.y[a][1].apply(google.y[a][0]) : google.y[a][0].go();
google.y.x = google.x;
google.x = function (d, c) {
    c && c.apply(d);
    return false
};
google.y.first = [];
(function () {
    if (window.google) {
        window.google.a = {};
        window.google.c = 1;
        var k = function (a, b, d) {
            b = a.t[b];
            a = a.t.start;
            if (b && (a || d)) {
                if (d != undefined) a = d;
                return b > a ? b - a : a - b
            }
        };
        window.google.report = function (a, b, d) {
            return a
        }
    };
    if (google.timers && google.timers.load.t) {
        if (!google.nocsixjs) google.timers.load.t.xjsee = google.time();
        window.setTimeout(function () {
            if (google.timers.load.t) {
                google.timers.load.t.xjs = google.time();
                google.timers.load.t.ol && google.report(google.timers.load, google.kCSI)
            }
        }, 0)
    };
})();