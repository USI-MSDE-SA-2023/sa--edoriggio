"use strict";
var t = require("fs-extra"), e = require("dagrejs"), r = require("svgdom"), n = require("@svgdotjs/svg.js");

function l(t) {
    return t && "object" == typeof t && "default" in t ? t : {default: t}
}

var o = l(t), a = l(e), i = l(r), c = l(n);

function s(t, e, r, n) {
    this.message = t, this.expected = e, this.found = r, this.location = n, this.name = "SyntaxError", "function" == typeof Error.captureStackTrace && Error.captureStackTrace(this, s)
}

!function (t, e) {
    function r() {
        this.constructor = t
    }

    r.prototype = e.prototype, t.prototype = new r
}(s, Error), s.buildMessage = function (t, e) {
    var r = {
        literal: function (t) {
            return '"' + l(t.text) + '"'
        }, class: function (t) {
            var e, r = "";
            for (e = 0; e < t.parts.length; e++) r += t.parts[e] instanceof Array ? o(t.parts[e][0]) + "-" + o(t.parts[e][1]) : o(t.parts[e]);
            return "[" + (t.inverted ? "^" : "") + r + "]"
        }, any: function (t) {
            return "any character"
        }, end: function (t) {
            return "end of input"
        }, other: function (t) {
            return t.description
        }
    };

    function n(t) {
        return t.charCodeAt(0).toString(16).toUpperCase()
    }

    function l(t) {
        return t.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (function (t) {
            return "\\x0" + n(t)
        })).replace(/[\x10-\x1F\x7F-\x9F]/g, (function (t) {
            return "\\x" + n(t)
        }))
    }

    function o(t) {
        return t.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (function (t) {
            return "\\x0" + n(t)
        })).replace(/[\x10-\x1F\x7F-\x9F]/g, (function (t) {
            return "\\x" + n(t)
        }))
    }

    return "Expected " + function (t) {
        var e, n, l, o = new Array(t.length);
        for (e = 0; e < t.length; e++) o[e] = (l = t[e], r[l.type](l));
        if (o.sort(), o.length > 0) {
            for (e = 1, n = 1; e < o.length; e++) o[e - 1] !== o[e] && (o[n] = o[e], n++);
            o.length = n
        }
        switch (o.length) {
            case 1:
                return o[0];
            case 2:
                return o[0] + " or " + o[1];
            default:
                return o.slice(0, -1).join(", ") + ", or " + o[o.length - 1]
        }
    }(t) + " but " + function (t) {
        return t ? '"' + l(t) + '"' : "end of input"
    }(e) + " found."
};
var h = {
    SyntaxError: s, parse: function (t, e) {
        e = void 0 !== e ? e : {};
        var r, n, l, o, a = {}, i = {C5: I}, c = I, h = "->", u = W("->", !1), f = "<-", m = W("<-", !1), d = "<->",
            p = W("<->", !1), b = "-", g = W("-", !1), v = W("'", !1), y = W('"', !1), k = /^[^']/,
            w = D(["'"], !0, !1), x = function () {
                return t.substring(Z, R)
            }, A = /^[^"]/, z = D(['"'], !0, !1), E = /^[a-zA-Z0-9\/._ ]/,
            _ = D([["a", "z"], ["A", "Z"], ["0", "9"], "/", ".", "_", " "], !1, !1), C = /^[a-zA-Z0-9\/._]/,
            F = D([["a", "z"], ["A", "Z"], ["0", "9"], "/", ".", "_"], !1, !1), S = H("whitespace"), j = /^[ \t\n\r]/,
            q = D([" ", "\t", "\n", "\r"], !1, !1), N = H("eol"), G = /^[\n\r]/, M = D(["\n", "\r"], !1, !1), R = 0,
            Z = 0, O = [{line: 1, column: 1}], T = 0, U = [], V = 0;
        if ("startRule" in e) {
            if (!(e.startRule in i)) throw new Error("Can't start parsing from rule \"" + e.startRule + '".');
            c = i[e.startRule]
        }

        function W(t, e) {
            return {type: "literal", text: t, ignoreCase: e}
        }

        function D(t, e, r) {
            return {type: "class", parts: t, inverted: e, ignoreCase: r}
        }

        function H(t) {
            return {type: "other", description: t}
        }

        function J(e) {
            var r, n = O[e];
            if (n) return n;
            for (r = e - 1; !O[r];) r--;
            for (n = {
                line: (n = O[r]).line,
                column: n.column
            }; r < e;) 10 === t.charCodeAt(r) ? (n.line++, n.column = 1) : n.column++, r++;
            return O[e] = n, n
        }

        function L(t, e) {
            var r = J(t), n = J(e);
            return {
                start: {offset: t, line: r.line, column: r.column},
                end: {offset: e, line: n.line, column: n.column}
            }
        }

        function B(t) {
            R < T || (R > T && (T = R, U = []), U.push(t))
        }

        function I() {
            return function () {
                var t, e, r;
                t = R, e = [], r = K();
                for (; r !== a;) e.push(r), r = K();
                e !== a && (Z = t, (n = e).forEach(((t, e) => {
                    "" == t.from && (t.from = "backward" == n[e - 1].type || "both" == n[e - 1].type ? n[e - 1].from : n[e - 1].to), "" == t.to && (t.to = "backward" == n[e - 1].type || "both" == n[e - 1].type ? n[e - 1].from : n[e - 1].to)
                })), e = {edges: n});
                var n;
                return t = e
            }()
        }

        function K() {
            var e;
            return (e = function () {
                var e;
                (e = function () {
                    var e, r, n, l, o, i;
                    e = R, (r = P()) !== a && X() !== a ? (t.substr(R, 2) === f ? (n = f, R += 2) : (n = a, 0 === V && B(m)), n !== a && (l = Q()) !== a ? (t.substr(R, 2) === h ? (o = h, R += 2) : (o = a, 0 === V && B(u)), o !== a && X() !== a && (i = P()) !== a && Y() !== a ? (Z = e, c = r, s = l, e = r = {
                        from: i.trim(),
                        to: c.trim(),
                        type: "both",
                        action: s
                    }) : (R = e, e = a)) : (R = e, e = a)) : (R = e, e = a);
                    var c, s;
                    return e
                }()) === a && (e = function () {
                    var e, r, n, l, o, i;
                    e = R, (r = P()) !== a && X() !== a ? (45 === t.charCodeAt(R) ? (n = "-", R++) : (n = a, 0 === V && B(g)), n !== a && (l = Q()) !== a ? (t.substr(R, 2) === h ? (o = h, R += 2) : (o = a, 0 === V && B(u)), o !== a && X() !== a && (i = P()) !== a && Y() !== a ? (Z = e, c = l, s = i, e = r = {
                        from: r.trim(),
                        to: s.trim(),
                        type: "forward",
                        action: c
                    }) : (R = e, e = a)) : (R = e, e = a)) : (R = e, e = a);
                    var c, s;
                    return e
                }()) === a && (e = function () {
                    var e, r, n, l, o, i;
                    e = R, (r = P()) !== a && X() !== a ? (t.substr(R, 2) === f ? (n = f, R += 2) : (n = a, 0 === V && B(m)), n !== a && (l = Q()) !== a ? (45 === t.charCodeAt(R) ? (o = b, R++) : (o = a, 0 === V && B(g)), o !== a && X() !== a && (i = P()) !== a && Y() !== a ? (Z = e, c = r, s = l, e = r = {
                        from: i.trim(),
                        to: c.trim(),
                        type: "backward",
                        action: s
                    }) : (R = e, e = a)) : (R = e, e = a)) : (R = e, e = a);
                    var c, s;
                    return e
                }());
                return e
            }()) === a && (e = function () {
                var e;
                (e = function () {
                    var e, r, n, l;
                    e = R, (r = P()) !== a && X() !== a ? (t.substr(R, 3) === d ? (n = d, R += 3) : (n = a, 0 === V && B(p)), n !== a && X() !== a && (l = P()) !== a && Y() !== a ? (Z = e, o = r, e = r = {
                        from: l.trim(),
                        to: o.trim(),
                        type: "both",
                        action: ""
                    }) : (R = e, e = a)) : (R = e, e = a);
                    var o;
                    return e
                }()) === a && (e = function () {
                    var e, r, n, l;
                    e = R, (r = P()) !== a && X() !== a ? (t.substr(R, 2) === h ? (n = h, R += 2) : (n = a, 0 === V && B(u)), n !== a && X() !== a && (l = P()) !== a && Y() !== a ? (Z = e, o = l, e = r = {
                        from: r.trim(),
                        to: o.trim(),
                        type: "forward",
                        action: ""
                    }) : (R = e, e = a)) : (R = e, e = a);
                    var o;
                    return e
                }()) === a && (e = function () {
                    var e, r, n, l;
                    e = R, (r = P()) !== a && X() !== a ? (t.substr(R, 2) === f ? (n = f, R += 2) : (n = a, 0 === V && B(m)), n !== a && X() !== a && (l = P()) !== a && Y() !== a ? (Z = e, o = r, e = r = {
                        from: l.trim(),
                        to: o.trim(),
                        type: "backward",
                        action: ""
                    }) : (R = e, e = a)) : (R = e, e = a);
                    var o;
                    return e
                }());
                return e
            }()), e
        }

        function P() {
            var e, r, n, l;
            return e = R, 39 === t.charCodeAt(R) ? (r = "'", R++) : (r = a, 0 === V && B(v)), r !== a ? (n = function () {
                var e, r, n;
                e = R, r = [], k.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(w));
                for (; n !== a;) r.push(n), k.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(w));
                r !== a && (Z = e, r = x());
                return e = r
            }(), n !== a ? (39 === t.charCodeAt(R) ? (l = "'", R++) : (l = a, 0 === V && B(v)), l !== a ? (Z = e, e = r = n) : (R = e, e = a)) : (R = e, e = a)) : (R = e, e = a), e === a && (e = R, 34 === t.charCodeAt(R) ? (r = '"', R++) : (r = a, 0 === V && B(y)), r !== a ? (n = function () {
                var e, r, n;
                e = R, r = [], A.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(z));
                for (; n !== a;) r.push(n), A.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(z));
                r !== a && (Z = e, r = x());
                return e = r
            }(), n !== a ? (34 === t.charCodeAt(R) ? (l = '"', R++) : (l = a, 0 === V && B(y)), l !== a ? (Z = e, e = r = n) : (R = e, e = a)) : (R = e, e = a)) : (R = e, e = a), e === a && (e = R, r = function () {
                var e, r, n;
                e = R, r = [], E.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(_));
                for (; n !== a;) r.push(n), E.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(_));
                r !== a && (Z = e, r = x());
                return e = r
            }(), r !== a && (Z = e, r = r), (e = r) === a && (e = R, (r = Q()) !== a && (Z = e, r = r), e = r))), e
        }

        function Q() {
            var e, r, n;
            for (e = R, r = [], C.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(F)); n !== a;) r.push(n), C.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(F));
            return r !== a && (Z = e, r = x()), e = r
        }

        function X() {
            var e, r, n;
            for (V++, e = R, r = [], j.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(q)); n !== a;) r.push(n), j.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(q));
            return r !== a && (Z = e, r = void 0), V--, (e = r) === a && (r = a, 0 === V && B(S)), e
        }

        function Y() {
            var e, r, n;
            for (V++, e = R, r = [], G.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(M)); n !== a;) r.push(n), G.test(t.charAt(R)) ? (n = t.charAt(R), R++) : (n = a, 0 === V && B(M));
            return r !== a && (Z = e, r = void 0), V--, (e = r) === a && (r = a, 0 === V && B(N)), e
        }

        if ((r = c()) !== a && R === t.length) return r;
        throw r !== a && R < t.length && B({type: "end"}), n = U, l = T < t.length ? t.charAt(T) : null, o = T < t.length ? L(T, T + 1) : L(T, T), new s(s.buildMessage(n, l), n, l, o)
    }
};
const u = o.default, f = a.default, m = h, {createSVGWindow: d} = i.default, p = d(), b = p.document, {
    SVG: g,
    registerWindow: v
} = c.default;
const y = new f.graphlib.Graph;
y.setGraph({}), y.setDefaultEdgeLabel((function () {
    return {}
}));
let k = {
    files: (t, e) => t.path("m 0 0 v 20 h 20 v -2.0098 h -18.0449 v -17.9902 z m 1.9626 -2.028 h 15.8422 l -0.0552 4.212 l 4.213 -0.0302 v 15.8182 h -20 z m 15.873 0.021 l 4.126 4.104").fill("white").stroke("black").center(e.x, e.y),
    file: (t, e) => t.path("m 0 0 h 15.8422 l -0.0552 4.212 l 4.213 -0.0302 v 15.8182 h -20 z m 15.873 0.021 l 4.126 4.104").fill("white").stroke("black").center(e.x, e.y),
    db: (t, e) => t.path("m 0 0 c -0.032 -3.3343 20.0253 -2.8621 20.044 -0.1028 c -0.0761 4.4369 -20.1432 4.2433 -20.044 0.1028 z m 0.0294 0.6461 c 2.1507 3.0603 17.3947 3.3723 20 0 v 20 c -6.5332 2.6684 -13.1865 2.9358 -20 0 z").fill("white").stroke("black").center(e.x, e.y),
    web: (t, e) => t.path("m 0 0 c 5.4735 1.7589 10.947 1.755 16.4205 -0.0113 m -15.7172 -10.497 c 5.615 1.458 11.045 1.368 16.151 0.073 m -17.9251 5.3549 c 6.5771 1.7119 12.9818 1.2983 19.3139 -0.0113 m 0 0 c 0 5.5228 -4.1082 9.6311 -9.6311 9.6311 c -5.5228 0 -9.6618 -4.1082 -9.6618 -9.6311 c 0 -5.5228 4.139 -9.6003 9.6618 -9.6003 c 5.5229 0 9.6311 4.0775 9.6311 9.6003 z").fill("white").stroke("black").center(e.x, e.y),
    tuple: (t, e) => t.path("m 0 0 l 4.5266 -3.9241 m -20.021 3.9241 l 3.9352 -3.7814 l 16.0859 -0.1427 l 0.0542 16.5903 l -4.5808 3.3203 m -15.4945 -15.9864 h 15.4945 v 15.9864 h -15.4945 z").fill("white").stroke("black").center(e.x, e.y),
    ram: (t, e) => t.path("m 0 0 l -3.9351 0.0615 m 4.0274 -2.8438 l -3.9351 0.0615 m 3.9351 -2.9053 l -3.9351 0.0615 m 3.9351 -2.9052 l -3.9351 0.0615 m 3.9351 -2.9052 l -3.9351 0.0615 m 3.9351 -2.9052 l -3.9351 0.0615 m 3.9659 -2.8438 l -3.9351 0.0615 m 23.8874 16.9087 l -3.9351 0.0615 m 3.9351 -2.8745 l -3.9351 0.0615 m 3.9351 -2.9053 l -3.9351 0.0615 m 3.9351 -2.9052 l -3.9351 0.0615 m 3.9351 -2.9052 l -3.9351 0.0615 m 3.9351 -2.9052 l -3.9351 0.0615 m 3.9351 -2.8745 l -3.9351 0.0615 m 0.3997 16.4783 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9053 -3.9351 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9053 -3.9351 l 0.0615 3.9351 m 17.0317 -23.8567 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9053 -3.9351 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9052 -3.9351 l 0.0615 3.9351 m -2.9053 -3.9351 l 0.0615 3.9351 m -1.3624 -1.9489 h 20 v 20 h -20 z").fill("none").stroke("black").center(e.x, e.y),
    msg: (t, e) => t.path("m 0 0 l 9.8378 10.5449 l 9.8378 -10.8523 m -19.93 -0.008 h 20 v 20 h -20 z").center(e.x, e.y).fill("white").stroke("black"),
    bus: (t, e) => t.path("m 0 0 l 41.0532 0.048 c 2.6625 4.4517 2.8554 9.081 0 13.7732 c -13.4752 0.0145 -25.0265 -0.2369 -40.3397 -0.0385 c -6.0837 -0.003 -5.2939 -13.7927 -0.6801 -13.7519 c 4.2341 -0.0998 4.2921 13.6962 0.6777 13.7462").center(e.x, e.y).fill("white").stroke("black"),
    disruptor: (t, e) => t.path("m 0 0 c -1.1712 0.0939 -2.3376 0.1775 -3.4239 0.544 m -0.0397 -0.6622 l 2.7894 -0.1145 m -4.9707 2.4926 l 2.2736 -3.2136 l 4.9549 0.5181 m -5.7642 -1.1189 l 6.3551 1.2145 m -5.7867 -1.3894 l -2.2399 4.3629 m -8.4983 4.602 l -2.8449 0.4742 m 4.7479 2.0174 l -2.8133 1.5173 m 5.184 0.2529 l -1.3592 2.5288 m 4.3306 -2.4024 l 0.2213 2.9081 m 2.4972 -4.0777 l 1.6437 2.3391 m 0.0316 -4.4254 l 3.1926 1.6437 m -2.5604 -4.0461 l 3.73 0.5058 m -3.8564 -3.6035 l 3.3823 -0.5374 m -3.2641 2.6637 c 0 3.8344 -2.6139 6.6867 -6.128 6.6867 c -3.514 0 -6.1475 -2.8523 -6.1475 -6.6867 c 0 -3.8344 2.6335 -6.6653 6.1475 -6.6653 c 3.514 0 6.128 2.8309 6.128 6.6653 z m 3.6984 0.0269 c 0 5.5228 -4.1082 9.6311 -9.6311 9.6311 c -5.5228 0 -9.6618 -4.1082 -9.6618 -9.6311 c 0 -5.5229 4.139 -9.6003 9.6618 -9.6003 c 5.5229 0 9.6311 4.0775 9.6311 9.6003 z").center(e.x, e.y).fill("white").stroke("black"),
    blockchain: (t, e) => t.path("m 0 0 v 2.8457 h 11.4707 v -20 h -11.4707 v 1.7504 m 0 1.9239 v 2.5118 m 0 1.8705 v 2.1377 m 0 2.2179 v 2.4725 m 25.8837 -8.321 h 2.9931 c 1.5112 0 2.7278 1.2166 2.7278 2.7278 v 1.1034 c 0 1.5112 -1.2166 2.7279 -2.7278 2.7279 h -2.9931 c -1.5112 0 -2.7279 -1.2166 -2.7279 -2.7279 v -1.1034 c 0 -1.5112 1.2166 -2.7278 2.7279 -2.7278 z m -14.4694 -0.1186 h 2.9931 c 1.5112 0 2.7278 1.2166 2.7278 2.7278 v 1.1034 c 0 1.5112 -1.2166 2.7278 -2.7278 2.7278 h -2.9931 c -1.5112 0 -2.7278 -1.2166 -2.7278 -2.7278 v -1.1034 c 0 -1.5112 1.2166 -2.7278 2.7278 -2.7278 z m 2.8765 -6.5636 h 11.4724 v 20 h -11.4724 z m 14.7659 0 h 11.52 v 20 h -11.52 z").center(e.x, e.y).fill("none").stroke("black"),
    scheduler: (t, e) => t.path("M9.688 9.897v.295l.258.143 3.411 1.887.484-.875-3.153-1.744V3.189h-1v6.708Zm9.893.099c0 5.474-4.052 9.527-9.524 9.527C4.582 19.523.5 15.468.5 9.996.5 4.526 4.58.5 10.057.5c5.474 0 9.524 4.024 9.524 9.496Z").center(e.x, e.y).fill("white").stroke("black"),
    test: (t, e) => t.rect(e.width, e.height).center(e.x, e.y).fill("red").stroke("black")
};
let w = process.argv[2], x = process.argv[3], A = process.argv[4];
if (null != w && null != x || console.log("Usage: node " + process.argv[1] + " [input.c5] [output.svg] [FONT]"), x = x || "output.svg", w = w || "input.c5", A = A || "Helvetica", u.existsSync(w)) try {
    let E = u.readFileSync(w), _ = m.parse((z = "" + E, z.split("\n").map((t => t.split("///")[0])).join("\n")).trim());
    v(p, b), function (t, e) {
        let r = 0, n = {};

        function l(t) {
            return n[t] || (r++, n[t] = "n" + r), n[t]
        }

        t.edges.forEach((function (t) {
            t.from_id = l(t.from), t.to_id = l(t.to)
        })), Object.keys(n).forEach((t => {
            let r = t;
            e.setNode(n[t], {label: r, width: 10 * r.length + 30, height: 40})
        })), t.edges.forEach((function (t) {
            if ("file" == t.action) {
                let r = t.from_id + "-" + t.to_id;
                e.setNode(r, {
                    width: 20,
                    height: 20,
                    icon: "file",
                    label: ""
                }), e.setEdge(t.from_id, r, {action: t.action + " write"}), e.setEdge(r, t.to_id, {action: t.action + " read"})
            } else if ("queue" == t.action) {
                let r = t.from_id + "-" + t.to_id;
                e.setNode(r, {
                    width: 20,
                    height: 20,
                    icon: "msg",
                    label: ""
                }), e.setEdge(t.from_id, r, {action: t.action + " write"}), e.setEdge(r, t.to_id, {action: t.action + " read"})
            } else e.setEdge(t.from_id, t.to_id, {action: t.action, label: t.action, type: t.type})
        }))
    }(_, y), function (t) {
        const e = g(b.documentElement);
        t.nodes().forEach((r => {
            let n = t.node(r), l = n.label.trim().split(" ")[0];
            if (n.original_label = n.label,
                n.connector_label = n.label.trim().split(" ").slice(1).join(" "),
            "db" == l && (n.icon = "db", n.label = "", n.width = 20, n.height = 20),
            "files" == l && (n.icon = "files", n.label = "", n.width = 22, n.height = 22),
            "web" == l && (n.icon = "web", n.label = "", n.width = 20, n.height = 20),
            "tuple" == l && (n.icon = "tuple", n.label = "", n.width = 20, n.height = 20),
            "ram" == l && (n.icon = "ram", n.label = "", n.width = 20, n.height = 20),
            "bus" == l && (n.icon = "bus", n.label = "", n.width = 40, n.height = 12),
            "queue" == l && (n.icon = "msg", n.label = "", n.width = 20, n.height = 20),
            "disruptor" == l && (n.icon = "disruptor", n.label = "", n.width = 20, n.height = 20),
            "blockchain" == l && (n.icon = "blockchain", n.label = "", n.width = 40, n.height = 20),
            "scheduler" == l && (n.icon = "scheduler", n.label = "", n.width = 20, n.height = 20),
            n.label && n.label.length > 0) {

                let t = e.text(n.label).font({family: A, size: 12}).bbox();
                n.width = t.width + 20, n.height = t.height + 10
            }
        })), e.clear()
    }(y), f.layout(y);
    const C = g(b.documentElement);

    function F(t, e) {
        var r, n, l = t.x, o = t.y, a = e.x - l, i = e.y - o, c = t.width / 2, s = t.height / 2;
        return Math.abs(i) * c > Math.abs(a) * s ? (i < 0 && (s = -s), r = 0 === i ? 0 : s * a / i, n = s) : (a < 0 && (c = -c), r = c, n = 0 === a ? 0 : c * i / a), {
            x: l + r,
            y: o + n
        }
    }

    function S(t, e) {
        var r = t.edge(e), n = t.node(e.v), l = t.node(e.w), o = r.points.slice(1, r.points.length - 1);
        return o.unshift(F(n, o[0])), o.push(F(l, o[o.length - 1])), o
    }

    function j(t, e, r) {
        if ("stream" == e.action) {
            let e = t.polyline(r.map((t => [t.x, t.y]))).stroke({width: .25, color: "black"}).fill("none");
            return e.marker("end", 100, 40, (function (t) {
                t.path("m 0 0 l 20 20 l -20 20 a 10 1 90 0 0 0 -40 z m 19.96 4.4 l 15.5 15.63 l -15.43 15.23 a 10 1 90 0 0 -0.07 -30.79 z m 16.12 5.51 l 10.34 10.12 l -10.27 10.2 a 10 1 90 0 0 -0.07 -20.32 z").fill("black").stroke({
                    width: .1,
                    color: "black"
                })
            })), e
        }
        if ("call" == e.action) {
            let e = t.polyline(r.map((t => [t.x - 2, t.y]))).stroke({width: .25, color: "black"}).fill("none");
            return e.marker("end", 40, 30, (function (t) {
                t.path("m 0 0 l 20 15 l -20 15 a 7.5 1 90 0 0 0 -30 z").fill("black").stroke({
                    width: .1,
                    color: "black"
                })
            })), e = t.polyline(r.reverse().map((t => [t.x + 2, t.y]))).stroke({
                width: .25,
                color: "black"
            }).fill("none"), e.stroke({dasharray: "2"}), e.marker("end", 40, 30, (function (t) {
                t.path("m 0 0 l 20 15 l -20 15 a 7.5 1 90 0 0 0 -30 z").fill("black").stroke({
                    width: .1,
                    color: "black"
                })
            })), e
        }
        if ("both" == e.type) {
            let e = t.polyline(r.map((t => [t.x, t.y]))).stroke({width: .25, color: "black"}).fill("none");
            return e.marker("end", 40, 30, (function (t) {
                t.path("m 0 0 l 20 15 l -20 15 a 7.5 1 90 0 0 0 -30 z").fill("black").stroke({
                    width: .1,
                    color: "black"
                })
            })), e.marker("start", 40, 30, (function (t) {
                t.path("m 40 0 l -20 15 l 20 15 a 7.5 1 -90 0 1 0 -30 z").fill("black").stroke({
                    width: .1,
                    color: "black"
                })
            })), e
        }
        let n = t.polyline(r.map((t => [t.x, t.y]))).stroke({width: .25, color: "black"}).fill("none");
        return n.marker("end", 40, 30, (function (t) {
            t.path("m 0 0 l 20 15 l -20 15 a 7.5 1 90 0 0 0 -30 z").fill("black").stroke({width: .1, color: "black"})
        })), n
    }

    C.add(g("<style>text.label { fill:gray; }</style>")), y.nodes().forEach((t => {
        let e = y.node(t);
        if (k[e.icon]) {
            let t = k[e.icon](C, e).bbox();
            if (e.connector_label) {
                let r = C.text(e.connector_label).center(e.x + t.width, e.y).font({family: A, size: 11}), n = r.bbox();
                r.dmove(2 + n.width / 2, -2)
            }
        } else if (C.rect(e.width, e.height).center(e.x, e.y).fill("white").stroke("black"), e.label) {
            C.text(e.label).center(e.x + e.label.length, e.y - 2).font({family: A, size: 12}).bbox()
        }
    })), C.viewbox(C.bbox()), y.edges().forEach((t => {
        var e = y.edge(t);
        let r = C.group(), n = j(r, e, S(y, t));
        if (e.label && e.label.length > 0 && "call" != e.action && "stream" != e.action) {
            let t = n.bbox(), l = r.text(e.label).center((t.x + t.x2) / 2, (t.y + t.y2) / 2).font({
                family: A,
                size: 10
            }).addClass("label"), o = l.bbox();
            l.dmove(o.width / 2, 0), 0 == t.width && l.transform({rotate: 90})
        }
    })), "-" == x ? console.info(C.svg()) : u.writeFile(x, C.svg())
} catch (q) {
    console.error(q.message), console.error(JSON.stringify(q, null, 2)), process.exit(1)
} else console.error(w + " does not exist"), process.exit(2);
var z;
module.exports = {};
