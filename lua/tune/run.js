var $roles, path, tune, makeContext, envmd, TuneError, text2run, assert, util, plen, fs, row, filename, buf, split, ctx;

function _once(cond, body) {
  return new Promise((function(resolve, reject) {
    function handler() {
      var _ref;
      try {
        _ref = cond() ? resolve(body()) : setTimeout(handler, 10);
      } catch (err) {
        _ref = reject(err);
      }
      return _ref;
    }
    setTimeout(handler, 10);
    return "";
  }));
}
_once;

function extend() {
  var _i;
  var objects = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
  return (function(result) {
    var object, key, value, _i0, _ref, _len, _ref0, _len0;
    _ref = objects;
    for (_i0 = 0, _len = _ref.length; _i0 < _len; ++_i0) {
      object = _ref[_i0];
      _ref0 = object;
      for (key in _ref0) {
        value = _ref0[key];
        if ((typeof value !== 'undefined')) result[key] = JSON.parse(JSON.stringify(value));
      }
    }
    return result;
  })({});
}
extend;

function TuneError(message, filename, row, col, stack, originalError) {
  var lastItem;
  var stack;
  stack = stack || [];
  var lastItem;
  lastItem = stack["slice"](-1)[0];
  if ((!filename || ((((typeof lastItem !== "undefined") && (lastItem !== null) && !Number.isNaN(lastItem) && (typeof lastItem.filename !== "undefined") && (lastItem.filename !== null) && !Number.isNaN(lastItem.filename)) ? lastItem.filename : undefined) !== filename))) stack.push({
    filename: filename || "",
    row: row,
    col: col
  });
  this.name = "TuneError";
  this.message = message;
  this.row = row;
  this.col = col;
  this.stack = stack;
  this.error = originalError;
  return this;
}
TuneError;
TuneError.prototype = Object.create(Error.prototype);
TuneError.prototype.constructor = TuneError;
TuneError.wrap = (function(err, filename, row, col) {
  return ((err.name === "TuneError") ? new TuneError(err.message, filename, row, col, err.stack, err.error) : new TuneError("Internal Error", filename, row, col, undefined, err));
});
TuneError.ctx2stack = (function(ctx) {
  return ctx.stack.map((function(item) {
    return {
      filename: item.filename,
      row: item.row,
      col: item.col
    }
  }));
});
TuneError.prototype.toString = (function() {
  return (this.message + "\n" + (this.stack || [])
    .map((function() {
      return ("    at " + arguments[0].filename + (((typeof arguments !== 'undefined') && (typeof arguments[0] !== 'undefined') && (typeof arguments[0].row !== 'undefined')) ? (":" + arguments[0].row) : "") + (((typeof arguments !== 'undefined') && (typeof arguments[0] !== 'undefined') && (typeof arguments[0].col !== 'undefined')) ? (":" + arguments[0].col) : ""));
    }))
    .join("\n") + (this.error ? (this.error.stack ? ("\n" + this.error.stack) : this.error.message) : ""));
});
var dJSON = (() => {
  var de = Object.create;
  var N = Object.defineProperty;
  var ye = Object.getOwnPropertyDescriptor;
  var xe = Object.getOwnPropertyNames;
  var Ee = Object.getPrototypeOf,
    ge = Object.prototype.hasOwnProperty;
  var c = (e, r) => () => (r || e((r = {
      exports: {}
    }).exports, r), r.exports),
    be = (e, r) => {
      for (var u in r) N(e, u, {
        get: r[u],
        enumerable: !0
      })
    },
    j = (e, r, u, t) => {
      if (r && typeof r == "object" || typeof r == "function")
        for (let i of xe(r)) !ge.call(e, i) && i !== u && N(e, i, {
          get: () => r[i],
          enumerable: !(t = ye(r, i)) || t.enumerable
        });
      return e
    },
    U = (e, r, u) => (j(e, r, "default"), u && j(u, r, "default")),
    H = (e, r, u) => (u = e != null ? de(Ee(e)) : {}, j(r || !e || !e.__esModule ? N(u, "default", {
      value: e,
      enumerable: !0
    }) : u, e)),
    Fe = e => j(N({}, "__esModule", {
      value: !0
    }), e);
  var P = c((We, D) => {
    typeof D == "object" && typeof D.exports == "object" && (D.exports = Y);
    Y.defunct = function(e) {
      throw new Error("Unexpected character at index " + (this.index - 1) + ": " + e)
    };

    function Y(e) {
      typeof e != "function" && (e = Y.defunct);
      var r = [],
        u = [],
        t = 0;
      this.state = 0, this.index = 0, this.input = "", this.addRule = function(n, v, x) {
        var y = n.global;
        if (!y) {
          var E = "g";
          n.multiline && (E += "m"), n.ignoreCase && (E += "i"), n = new RegExp(n.source, E)
        }
        return Object.prototype.toString.call(x) !== "[object Array]" && (x = [0]), u.push({
          pattern: n,
          global: y,
          action: v,
          start: x
        }), this
      }, this.setInput = function(n) {
        return t = 0, this.state = 0, this.index = 0, r.length = 0, this.input = n, this
      }, this.lex = function() {
        if (r.length) return r.shift();
        for (this.reject = !0; this.index <= this.input.length;) {
          for (var n = i.call(this).splice(t), v = this.index; n.length && this.reject;) {
            var x = n.shift(),
              y = x.result,
              E = x.length;
            this.index += E, this.reject = !1, t++;
            var f = x.action.apply(this, y);
            if (this.reject) this.index = y.index;
            else if (typeof f < "u") switch (Object.prototype.toString.call(f)) {
              case "[object Array]":
                r = f.slice(1), f = f[0];
              default:
                return E && (t = 0), f
            }
          }
          var F = this.input;
          if (v < F.length)
            if (this.reject) {
              t = 0;
              var f = e.call(this, F.charAt(this.index++));
              if (typeof f < "u") return Object.prototype.toString.call(f) === "[object Array]" ? (r = f.slice(1), f[0]) : f
            } else this.index !== v && (t = 0), this.reject = !0;
          else if (n.length) this.reject = !0;
          else break
        }
      };

      function i() {
        for (var n = [], v = 0, x = this.state, y = this.index, E = this.input, f = 0, F = u.length; f < F; f++) {
          var h = u[f],
            T = h.start,
            p = T.length;
          if (!p || T.indexOf(x) >= 0 || x % 2 && p === 1 && !T[0]) {
            var o = h.pattern;
            o.lastIndex = y;
            var s = o.exec(E);
            if (s && s.index === y) {
              var d = n.push({
                result: s,
                action: h.action,
                length: s[0].length
              });
              for (h.global && (v = d); --d > v;) {
                var a = d - 1;
                if (n[d].length > n[a].length) {
                  var _ = n[d];
                  n[d] = n[a], n[a] = _
                }
              }
            }
          }
        }
        return n
      }
    }
  });
  var k = c(() => {
    String.fromCodePoint || function() {
      var e = function() {
          try {
            var i = {},
              n = Object.defineProperty,
              v = n(i, i, i) && n
          } catch {}
          return v
        }(),
        r = String.fromCharCode,
        u = Math.floor,
        t = function(i) {
          var n = 16384,
            v = [],
            x, y, E = -1,
            f = arguments.length;
          if (!f) return "";
          for (var F = ""; ++E < f;) {
            var h = Number(arguments[E]);
            if (!isFinite(h) || h < 0 || h > 1114111 || u(h) != h) throw RangeError("Invalid code point: " + h);
            h <= 65535 ? v.push(h) : (h -= 65536, x = (h >> 10) + 55296, y = h % 1024 + 56320, v.push(x, y)), (E + 1 == f || v.length > n) && (F += r.apply(null, v), v.length = 0)
          }
          return F
        };
      e ? e(String, "fromCodePoint", {
        value: t,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = t
    }()
  });
  var re = c((V, ee) => {
    "use strict";
    Object.defineProperty(V, "__esModule", {
      value: !0
    });
    V.default = void 0;
    k();
    var Le = /\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g,
      Re = {
        0: "\0",
        b: "\b",
        f: "\f",
        n: `
`,
        r: "\r",
        t: "	",
        v: "\v",
        "'": "'",
        '"': '"',
        "\\": "\\"
      },
      K = function(r) {
        return String.fromCodePoint(parseInt(r, 16))
      },
      we = function(r) {
        return String.fromCodePoint(parseInt(r, 8))
      },
      _e = function(r) {
        return r.replace(Le, function(u, t, i, n, v, x, y, E) {
          return i !== void 0 ? K(i) : n !== void 0 ? K(n) : v !== void 0 ? K(v) : x !== void 0 ? we(x) : E !== void 0 ? K(E) : Re[y]
        })
      };
    V.default = _e;
    ee.exports = V.default
  });
  var ue = c(J => {
    (function(e) {
      var r = String.fromCharCode;

      function u(p) {
        for (var o = [], s = 0, d = p.length, a, _; s < d;) a = p.charCodeAt(s++), a >= 55296 && a <= 56319 && s < d ? (_ = p.charCodeAt(s++), (_ & 64512) == 56320 ? o.push(((a & 1023) << 10) + (_ & 1023) + 65536) : (o.push(a), s--)) : o.push(a);
        return o
      }

      function t(p) {
        for (var o = p.length, s = -1, d, a = ""; ++s < o;) d = p[s], d > 65535 && (d -= 65536, a += r(d >>> 10 & 1023 | 55296), d = 56320 | d & 1023), a += r(d);
        return a
      }

      function i(p) {
        if (p >= 55296 && p <= 57343) throw Error("Lone surrogate U+" + p.toString(16).toUpperCase() + " is not a scalar value")
      }

      function n(p, o) {
        return r(p >> o & 63 | 128)
      }

      function v(p) {
        if (!(p & 4294967168)) return r(p);
        var o = "";
        return p & 4294965248 ? p & 4294901760 ? p & 4292870144 || (o = r(p >> 18 & 7 | 240), o += n(p, 12), o += n(p, 6)) : (i(p), o = r(p >> 12 & 15 | 224), o += n(p, 6)) : o = r(p >> 6 & 31 | 192), o += r(p & 63 | 128), o
      }

      function x(p) {
        for (var o = u(p), s = o.length, d = -1, a, _ = ""; ++d < s;) a = o[d], _ += v(a);
        return _
      }

      function y() {
        if (h >= F) throw Error("Invalid byte index");
        var p = f[h] & 255;
        if (h++, (p & 192) == 128) return p & 63;
        throw Error("Invalid continuation byte")
      }

      function E() {
        var p, o, s, d, a;
        if (h > F) throw Error("Invalid byte index");
        if (h == F) return !1;
        if (p = f[h] & 255, h++, !(p & 128)) return p;
        if ((p & 224) == 192) {
          if (o = y(), a = (p & 31) << 6 | o, a >= 128) return a;
          throw Error("Invalid continuation byte")
        }
        if ((p & 240) == 224) {
          if (o = y(), s = y(), a = (p & 15) << 12 | o << 6 | s, a >= 2048) return i(a), a;
          throw Error("Invalid continuation byte")
        }
        if ((p & 248) == 240 && (o = y(), s = y(), d = y(), a = (p & 7) << 18 | o << 12 | s << 6 | d, a >= 65536 && a <= 1114111)) return a;
        throw Error("Invalid UTF-8 detected")
      }
      var f, F, h;

      function T(p) {
        f = u(p), F = f.length, h = 0;
        for (var o = [], s;
          (s = E()) !== !1;) o.push(s);
        return t(o)
      }
      e.version = "3.0.0", e.encode = x, e.decode = T
    })(typeof J > "u" ? J.utf8 = {} : J)
  });
  var pe = c((Pe, G) => {
    "use strict";
    var Ce = P(),
      Se = re(),
      He = ue(),
      te = 6,
      ce = 7,
      le = 11,
      Xe = 12,
      Oe = 13,
      me = 14,
      Ae = -1,
      Ie = -2,
      Te = -3,
      Ve = -4,
      Be = -5,
      je = [
        [/\s*:\s*/, Ae],
        [/\s*,\s*/, Ie],
        [/\s*{\s*/, Te],
        [/\s*}\s*/, Oe],
        [/\s*\[\s*/, Ve],
        [/\s*\]\s*/, Xe],
        [/\s*\.\s*/, Be]
      ];

    function ne(e) {
      return e = e.replace(/\\\//, "/"), Se(e)
    }

    function Ne(e) {
      let r = new Ce,
        u = 0,
        t = 0;
      return r.addRule(/"((?:\\.|[^"])*?)($|")/, (i, n) => (u += i.length, {
        type: le,
        value: ne(n),
        row: t,
        col: u,
        single: !1
      })), r.addRule(/'((?:\\.|[^'])*?)($|'|(",?[ \t]*\n))/, (i, n) => (u += i.length, {
        type: le,
        value: ne(n),
        row: t,
        col: u,
        single: !0
      })), r.addRule(/[\-0-9]*\.[0-9]*([eE][\+\-]?)?[0-9]*(?:\s*)/, i => (u += i.length, {
        type: te,
        value: parseFloat(i),
        row: t,
        col: u
      })), r.addRule(/\-?[0-9]+([eE][\+\-]?)[0-9]*(?:\s*)/, i => (u += i.length, {
        type: te,
        value: parseFloat(i),
        row: t,
        col: u
      })), r.addRule(/\-?[0-9]+(?:\s*)/, i => (u += i.length, {
        type: ce,
        value: parseInt(i),
        row: t,
        col: u
      })), je.forEach(i => {
        r.addRule(i[0], n => (u += n.length, {
          type: i[1],
          value: n,
          row: t,
          col: u
        }))
      }), r.addRule(/\s/, i => {
        i == `
` ? (u = 0, t++) : u += i.length
      }), r.addRule(/\S[ \t]*/, i => (u += i.length, {
        type: me,
        value: i,
        row: t,
        col: u
      })), r.setInput(e), r
    }
    G.exports.lexString = ie;

    function ie(e, r) {
      let u = Ne(e),
        t = "";
      for (; t = u.lex();) r(t)
    }
    G.exports.getAllTokens = Ue;

    function Ue(e) {
      let r = [];
      return ie(e, function(t) {
        r.push(t)
      }), r
    }
  });
  var he = c((ke, fe) => {
    "use strict";
    var De = pe(),
      W = 0,
      X = 1,
      C = 2,
      Z = 3,
      M = 4,
      q = 5,
      Ke = 6,
      oe = 7,
      b = 8,
      R = 9,
      S = 10,
      Je = 11,
      A = 12,
      I = 13,
      Me = 14,
      g = 15,
      m = -1,
      L = -2,
      $ = -3,
      O = -4;

    function ae(e) {
      e.peek == null && Object.defineProperty(e, "peek", {
        enumerable: !1,
        value: function() {
          return this[this.length - 1]
        }
      }), e.last == null && Object.defineProperty(e, "last", {
        enumerable: !1,
        value: function(r) {
          return this[this.length - (1 + r)]
        }
      })
    }

    function l(e, r) {
      return e && e.hasOwnProperty("type") && e.type == r
    }
    fe.exports.parse = qe;

    function qe(e, r) {
      let u = [],
        t = [];
      ae(u), ae(t);
      let i = function(n) {
        t.push(n)
      };
      De.lexString(e, i), t[0].type == O && t.last(0).type != A && t.push({
        type: A,
        value: "]",
        row: -1,
        col: -1
      }), t[0].type == $ && t.last(0).type != I && t.push({
        type: I,
        value: "}",
        row: -1,
        col: -1
      });
      for (let n = 0; n < t.length; n++)
        for ("" + t[n].type, u.push(t[n]); w(u););
      return u.length == 1 && u[0].type == X && (u = [{
        type: S,
        value: u[0].value
      }]), Q(u[0], r)
    }

    function w(e) {
      let r = e.pop();
      switch (r.type) {
        case b:
          if (r.value.trim() == "true") return e.push({
            type: Z,
            value: "true"
          }), !0;
          if (r.value.trim() == "false") return e.push({
            type: Z,
            value: "false"
          }), !0;
          if (r.value.trim() == "null") return e.push({
            type: g,
            value: null
          }), !0;
          break;
        case Me:
          return l(e.peek(), b) ? (e.peek().value += r.value, !0) : (e.push({
            type: b,
            value: r.value
          }), !0);
        case oe:
          return l(r, oe) && l(e.peek(), b) ? (e.peek().value += r.value, !0) : (r.type = g, e.push(r), !0);
        case Je:
          return r.type = g, r.value = r.value, e.push(r), !0;
        case Z:
          return r.type = g, r.value == "true" ? r.value = !0 : r.value = !1, e.push(r), !0;
        case Ke:
          return r.type = g, e.push(r), !0;
        case g:
          if (l(e.peek(), L)) return r.type = q, e.pop(), e.push(r), !0;
          if (l(e.peek(), m)) return r.type = M, e.pop(), e.push(r), !0;
          if (l(e.peek(), b) && l(e.last(1), g)) {
            let u = e.pop();
            return e.peek().value += '"' + u.value + '"', e.peek().value += r.value, !0
          }
          if (l(e.peek(), b) && l(e.last(1), C)) {
            let u = e.pop(),
              t = e.peek().value.pop();
            return t += '"' + u.value + '"', t += r.value, e.peek().value.push(t), !0
          }
          if (l(e.peek(), b) && l(e.last(1), X)) {
            let u = e.pop(),
              t = e.peek().value.pop(),
              i = r.single ? "'" : '"';
            return t.value += i + u.value + i, t.value += r.value, e.peek().value.push(t), !0
          }
          if (l(e.peek(), b)) {
            let u = e.pop().value;
            return r.value = u + r.value, e.push(r), !0
          }
          break;
        case R:
          if (l(r, R) && l(e.peek(), L)) return r.type = q, e.pop(), e.push(r), !0;
          if (l(e.peek(), m)) return r.type = M, e.pop(), e.push(r), !0;
          break;
        case S:
          if (l(e.peek(), L)) {
            let u = {
              type: q,
              value: r
            };
            return e.pop(), e.push(u), !0
          }
          if (l(e.peek(), m)) {
            let u = {
              type: M,
              value: r
            };
            return e.pop(), e.push(u), !0
          }
          if (l(e.peek(), b)) {
            let u = e.pop();
            return e.push({
              type: W,
              key: u.value.trim(),
              value: r
            }), !0
          }
          break;
        case q:
          return l(e.peek(), C) ? (e.peek().value.push(r.value), !0) : (e.push({
            type: C,
            value: [r.value]
          }), !0);
        case C:
          if (l(e.peek(), g)) return r.value.unshift(e.peek().value), e.pop(), e.push(r), !0;
          if (l(e.peek(), R)) return r.value.unshift(e.peek().value), e.pop(), e.push(r), !0;
          if (l(e.peek(), S)) return r.value.unshift(e.peek()), e.pop(), e.push(r), !0;
          if (l(e.peek(), b) && (e.last(1), L)) {
            let u = e.pop();
            for (e.push({
                type: g,
                value: u.value
              }), "" + u.value; w(e););
            return e.push(r), !0
          }
          if (l(e.peek(), C)) return e.peek().value.push(r.value[0]), !0;
          break;
        case M:
          if (l(e.peek(), b) || l(e.peek(), g) || l(e.peek(), C)) {
            let u = e.pop();
            return e.push({
              type: W,
              key: u.value,
              value: r.value
            }), !0
          }
          throw new Error("Got a :value that can't be handled at line " + r.row + ":" + r.col);
        case W:
          return l(e.last(0), L) && l(e.last(1), X) ? (e.last(1).value.push(r), e.pop(), !0) : (e.push({
            type: X,
            value: [r]
          }), !0);
        case X:
          if (l(e.peek(), X)) return r.value.forEach(function(u) {
            e.peek().value.push(u)
          }), !0;
          break;
        case A:
          if (l(e.peek(), C) && l(e.last(1), O)) {
            let u = e.pop();
            return e.pop(), e.push({
              type: R,
              value: u.value
            }), !0
          }
          if (l(e.peek(), R) && l(e.last(1), O)) {
            let u = e.pop();
            return e.pop(), e.push({
              type: R,
              value: [u.value]
            }), !0
          }
          if (l(e.peek(), O)) return e.pop(), e.push({
            type: R,
            value: []
          }), !0;
          if (l(e.peek(), g) && l(e.last(1), O)) {
            let u = e.pop().value;
            return e.pop(), e.push({
              type: R,
              value: [u]
            }), !0
          }
          if (l(e.peek(), S) && l(e.last(1), O)) {
            let u = e.pop();
            return e.pop(), e.push({
              type: R,
              value: [u]
            }), !0
          }
          if (l(e.peek(), b) && l(e.last(1), L)) {
            let u = e.pop();
            for (e.push({
                type: g,
                value: u.value
              }), "" + u.value; w(e););
            return e.push({
              type: A
            }), !0
          }
          if (l(e.peek(), L) && (l(e.last(1), b) || l(e.last(1), S) || l(e.last(1), g))) {
            for (e.pop(), e.push({
                type: A,
                value: "]"
              }), "" + JSON.stringify(e); w(e););
            return !0
          }
          if (l(e.peek(), b) && l(e.last(1), O)) {
            let u = e.pop();
            return e.pop(), e.push({
              type: R,
              value: [u.value]
            }), !0
          }
          if (l(e.peek(), L) && l(e.last(1), C)) {
            for (e.pop(), e.push({
                type: A
              }), "" + JSON.stringify(e); w(e););
            return !0
          }
          break;
        case I:
          if (l(e.peek(), X) && l(e.last(1), $)) {
            let u = e.pop();
            return e.pop(), e.push({
              type: S,
              value: u.value
            }), !0
          }
          if (l(e.peek(), $)) return e.pop(), e.push({
            type: S,
            value: null
          }), !0;
          if (l(e.peek(), b) && l(e.last(1), m)) {
            let u = e.pop();
            for (e.push({
                type: g,
                value: u.value
              }), "" + u.value; w(e););
            return e.push({
              type: I
            }), !0
          }
          if (l(e.peek(), m)) {
            for (e.push({
                type: g,
                value: null
              }); w(e););
            return e.push({
              type: I
            }), !0
          }
          if (l(e.peek(), L)) return e.pop(), e.push({
            type: I
          }), !0;
          throw new Error("Found } that I can't handle at line " + r.row + ":" + r.col);
        case L:
          if (l(e.peek(), L)) return !0;
          if (l(e.peek(), b)) {
            let u = e.pop();
            for (e.push({
                type: g,
                value: u.value
              }); w(e););
            return e.push(r), !0
          }
          if (l(e.peek(), m)) {
            for (e.push({
                type: g,
                value: null
              }); w(e););
            return e.push(r), !0
          }
      }
      return e.push(r), !1
    }

    function Q(e, r) {
      if (["boolean", "number", "string"].indexOf(typeof e) != -1) return e;
      if (e === null) return null;
      if (Array.isArray(e)) {
        let t = [];
        for (; e.length > 0;) t.unshift(Q(e.pop()));
        return t
      }
      if (l(e, S)) {
        let t = {};
        return e.value === null ? {} : (e.value.forEach(function(i) {
          let n = i.key,
            v = Q(i.value);
          r && n in t ? t[n] = {
            value: t[n],
            next: v
          } : t[n] = v
        }), t)
      }
      return l(e, R) ? Q(e.value) : e.value
    }
  });
  var z = c((er, ve) => {
    "use strict";
    var Qe = he();
    ve.exports.parse = Ye;

    function Ye(e, r) {
      let u = !0,
        t = !1;
      r && ("fallback" in r && r[u] === !1 && (u = !1), t = "duplicateKeys" in r && r.duplicateKeys === !0);
      try {
        return Qe.parse(e, t)
      } catch (i) {
        if (u === !1) throw i;
        try {
          let n = JSON.parse(e);
          return console.warn("dirty-json got valid JSON that failed with the custom parser. We're returning the valid JSON, but please file a bug report here: https://github.com/RyanMarcus/dirty-json/issues  -- the JSON that caused the failure was: " + e), n
        } catch {
          throw i
        }
      }
    }
  });
  var B = {};
  be(B, {
    default: () => se.default
  });
  U(B, H(z()));
  var se = H(z());
  return Fe(B);
})();
/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */
/*! https://mths.be/utf8js v3.0.0 by @mathias */
;

function Context() {
  var _i;
  var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
  this.ms = args.filter((function(item) {
    return (item.name !== "write");
  }));
  this.ws = args.filter((function(item) {
    return (item.name === "write");
  }));
  this.stack = [];
  return this;
}
Context;
Context.prototype.clone = (function() {
  var res;
  var res;
  res = new Context();
  res.ms = this.ms.concat([]);
  res.ws = this.ws.concat([]);
  res.stack = (this.stack || [])
    .concat([]);
  return res;
});
Context.prototype.use = (function(middleware) {
  return ((middleware.name === "write") ? this.ws.push(middleware) : this.ms.push(middleware));
});
Context.prototype.resolve = (async function(name, args, ms) {
  ms = ms || this.ms;
  if (!ms.length) return;
  return ms[0](name, this, args, this.resolve.bind(this, name, args, ms.slice(1)));
});
Context.prototype.read = (async function(name, args) {
  var resolved, _ref;
  var resolved;
  resolved = await this.resolve(name);
  if ((resolved && resolved.read)) {
    return _ref = await resolved.read(args);
  } else {
    _ref = undefined;
  }
  return _ref;
});
Context.prototype.exec = (async function(name, args) {
  var resolved, _ref;
  var resolved;
  resolved = await this.resolve(name);
  if ((resolved && resolved.exec)) {
    return _ref = await resolved.exec(args);
  } else {
    _ref = undefined;
  }
  return _ref;
});
Context.prototype.write = (async function(name, args, ws) {
  ws = ws || this.ws;
  if (!ws.length) return;
  return ws[0](name, args, this, this.write.bind(this, name, args, ws.slice(1)));
});

function envmd(md) {
  var lmd;
  var lmd;
  lmd = {};
  Object.keys(md)
    .forEach((function(name) {
      var _ref;
      if ((typeof md[name] === "string" || typeof md[name] === "number" || typeof md[name] === "boolean")) {
        _ref = (lmd[name] = {
          type: "text",
          read: (function() {
            return md[name];
          })
        });
      } else if (typeof md[name] === "object") {
        _ref = (lmd[name] = md[name]);
      } else {
        _ref = undefined;
        throw new TuneError(("unsupported type of value '" + name + "': " + util.inspect(md)));
      }
      return _ref;
    }));
  return (async function(name, ctx, args, next) {
    var llmd, key, val, firstKey, _ref, _len, _ref0;
    var llmd;
    llmd = {};
    _ref = lmd;
    for (key in _ref) {
      val = _ref[key];
      if ((args && (args === val.type))) {
        llmd[key] = val;
      } else if (!args) {
        llmd[key] = val;
      }
    }
    var firstKey;
    firstKey = Object.keys(llmd)[0];
    if ((firstKey && (name === "*"))) {
      _ref0 = llmd[firstKey];
    } else if (llmd.hasOwnProperty(name)) {
      _ref0 = llmd[name];
    } else {
      _ref0 = next();
    }
    return _ref0;
  });
}
envmd;

function makeContext() {
  var ctx, _i;
  var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
  if ((args[0] instanceof Context)) return args[0];
  var ctx;
  ctx = new Context();
  if (!args[0]) return ctx;
  args.forEach((function(md) {
    var _ref;
    if ((typeof md === "function")) {
      _ref = ctx.use(md);
    } else if (typeof md === "object") {
      _ref = ctx.use(envmd(md));
    } else {
      _ref = undefined;
      throw new TuneError("context middlewares might be either function or an object");
    }
    return _ref;
  }));
  return ctx;
}
makeContext;

function getPos(offset, str) {
  return (function(it) {
    it = it.split("\n");
    it = Array(it.length - 1, it["slice"](-1)[0].length);
    return it;
  })(str.substr(0, offset));
}
getPos;
$roles = {
  short2long: {
    "s": "system",
    "u": "user",
    "a": "assistant",
    "au": "audio",
    "tc": "tool_call",
    "err": "error",
    "c": "comment",
    "tr": "tool_result",
    "tool": "tool_result"
  },
  long2short: {
    "system": "s",
    "user": "u",
    "audio": "au",
    "assistant": "a",
    "tool_call": "tc",
    "error": "err",
    "comment": "c",
    "tool_result": "tr",
    "tool": "tr"
  }
};

function text2roles(text, lineNum) {
  return (function(it) {
    it = it.split(/(^(?:s|system|u|user|a|assistant|tc|tool_call|tr|tool_result|c|comment|au|audio|err|error)\s*:)/gm);
    it = it.reduce((function(memo, item, index, arr) {
      memo.row = memo.row || 0;
      (function(it) {
        var res, _ref;
        if (it) {
          var res;
          res = {
            role: $roles.short2long[it[1]] || it[1],
            content: arr[index + 1]
              .replace(/\n$/, ""),
            row: memo.row,
            col: 0
          };
          memo.push(res);
          _ref = (memo.row += res.content.split("\n").length);
        } else {
          _ref = undefined;
        }
        return _ref;
      })(item.match(/^(s|system|u|user|a|assistant|tc|tool_call|tr|tool_result|c|comment|au|audio|err|error)\s*:/));
      return memo;
    }), []);
    it = it.map((function() {
      return (lineNum ? arguments[0] : pick(arguments[0], "role", "content"));
    }));
    return it;
  })(text);
}
text2roles;

function roles2text(msgs) {
  return msgs
    .map((function(msg) {
      return (function(it) {
        return (it ? (it + ":" + msg.content) : undefined);
      })($roles.long2short[msg.role]);
    }))
    .join("\n");
}
roles2text;

function text2html(text, mimetype) {
  var _ref;
  if ((mimetype === "text/chat")) {
    _ref = text2roles(text)
      .map((function(item, index, arr) {
        var _ref;
        switch (item.role) {
          case "system":
            _ref = "bullet-s";
            break;
          case "variable":
            _ref = "bullet-s";
            break;
          case "assistant":
            _ref = "bullet-a";
            break;
          case "tool_call":
            _ref = "bullet-a";
            break;
          case "tool":
            _ref = "bullet-s";
            break;
          case "user":
            _ref = "bullet-u";
            break;
          case "error":
            _ref = "bullet-s";
            break;
          case "comment":
            _ref = "bullet-c";
            break;
          default:
            _ref = undefined;
        }
        return span({
          class: "mb-10px relative " + _ref
        }, span({
          title: item.role
        }, $roles.long2short[item.role], ":", vars2html(item.content), ((index !== (arr.length - 1)) ? "\n" : "")));
      }));
  } else if (0 === mimetype.indexOf("text/")) {
    _ref = vars2html(text);
  } else {
    _ref = undefined;
  }
  return _ref;
}
text2html;

function vars2html(str) {
  return str
    .split(/({\w+})/g)
    .map((function(item, index, arr) {
      return (function(it) {
        return (it ? twwc(b("{", it[1], "}"), "t-black dark:t-white") : document.createTextNode(String(item)));
      })(item.match(/^{(\w+)}$/));
    }));
}
vars2html;

function text2var(text) {
  return (function(it) {
    var _ref;
    if (it) {
      _ref = (function(res) {
        res[it[1]] = it[2];
        return res;
      })({});
    } else {
      _ref = undefined;
      throw new Error(("var syntax: " + text));
    }
    return _ref;
  })(text.match(/^\s*(\w+)\s*=?\s*([\s\S]*)$/m));
}
text2var;

function text2call(text) {
  var lines, m, txt, name, args, _ref;
  var lines;
  var m;
  var txt;
  lines = text.split(/\r?\n/g);
  m = lines[0].match(/^\s*([\@\w\-]+)\s*({.*})?\s*$/);
  txt = lines
    .slice(1)
    .join("\n")
    .trim();
  if (!m) throw new Error(("can not parse tool call: " + lines[0]));
  var name;
  var args;
  name = m[1];
  try {
    _ref = dJSON.parse(m[2] || "{}");
  } catch (e) {
    throw new Error(("Can not parse arguments :" + m[2] + " " + (((typeof e !== "undefined") && (e !== null) && !Number.isNaN(e) && (typeof e.message !== "undefined") && (e.message !== null) && !Number.isNaN(e.message)) ? e.message : (((typeof e !== "undefined") && (e !== null) && !Number.isNaN(e)) ? e : undefined))));
  }
  args = _ref;
  if (txt) args.text = txt;
  return {
    name: name,
    arguments: JSON.stringify(args)
  }
}
text2call;
async function text2payload(text, ctx) {
  var ast;
  ast = await text2ast(text, ctx);
  return await ast2payload(ast);
}
text2payload;
async function text2ast(text, ctx) {
  var lastChar, lastRole;
  var lastChar;
  lastChar = '';
  var lastRole;
  lastRole = '';
  async function parse(text, recursive, ctx) {
    var nodeStack, re, nodes, index, m, match, role, roleName, name, prefix, args, proc, row, col, filename, resolved, pargs, pname, p, err, schema, lctx, _ref, _i, _i0, _ref0, _len;
    ctx = makeContext(ctx);
    nodeStack = nodeStack || [];
    var re;
    re = /(?<prefix1>@{1,2})\{(?<name1>[^\}]+)\}|(?<prefix>@{1,2})(?<name>[\S]+)|(?<role>^(?:s|system|u|user|a|assistant|tc|tool_call|tr|tool_result|c|comment|au|audio|err|error))\s*(?<roleName>\([^\)]+\))?\s*:/gm;
    var nodes;
    nodes = [];
    var index;
    index = 0;
    while (m = re.exec(text)) {
      if (((lastRole === "a" || lastRole === "tc" || lastRole === "err" || lastRole === "assistant" || lastRole === "tool_call" || lastRole === "error") && !m.groups.role)) continue;
      if (((m.index > 0) && (text.charAt(m.index - 1) === String.fromCharCode(92)))) continue;
      if ((m.index - index)) {
        nodes.push({
          type: "text",
          start: index,
          end: m.index,
          value: text.slice(index, m.index)
        });
        lastChar = text.charAt(m.index - 1);
      }
      var match;
      match = m[0];
      var role;
      var roleName;
      role = m.groups.role;
      roleName = m.groups.roleName;
      if (role) {
        nodes.push({
          type: ((lastChar === '' || lastChar === "\n") ? "role" : "text"),
          start: index,
          end: m.index,
          role: role,
          roleName: (roleName ? roleName.slice(1, -1) : undefined),
          value: match
        });
        index = m.index + match.length;
        lastChar = text.charAt(index - 1);
        lastRole = match.slice(0, -1);
        continue;
      }
      var name;
      var prefix;
      var args;
      var proc;
      name = m.groups.name || m.groups.name1;
      prefix = m.groups.prefix || m.groups.prefix1;
      args = undefined;
      proc = undefined;
      (function(it) {
        it = it.split("|");
        it = it.map((function(it) {
          return it.trim();
        }));
        it = it.map((function(item, index) {
          var idx;
          if ((index === 0)) return item;
          var idx;
          idx = item.indexOf(" ");
          if ((idx === -1)) return Array(item, "");
          return Array(item.slice(0, idx), item.slice(idx));
        }));
        name = it[0];
        it = (proc = ((it.length > 1) ? it.slice(1) : undefined));
        return it;
      })(name);
      _ref = getPos(m.index, text);
      row = _ref[0];
      col = _ref[1];
      var filename;
      filename = (function(it) {
        it = it["slice"](-1)[0];
        it = (it ? (it.fullname || it.name) : "");
        return it;
      })(ctx.stack || []);
      var resolved;
      resolved = await ctx.resolve(name);
      if (proc) {
        while (pargs = proc.shift()) {
          var pname;
          pname = pargs.shift();
          var p;
          p = await ctx.resolve(pname);
          if (!p) throw new TuneError(("'" + pname + "' processor not found"), filename, row, col);
          if ((typeof p.exec !== "function")) throw new TuneError(("'" + pname + "' does not have exec function"), filename, row, col);
          try {
            resolved = await p.exec(resolved, pargs[0], ctx);
          } catch (e) {
            var err;
            err = new TuneError(e.message, (p.fullname || p.name), undefined, undefined, [], e);
            err.stack.push({
              filename: filename,
              row: row,
              col: col
            });
            throw err;
          }
        }
      }
      _ref0 = (Array.isArray(resolved) ? resolved : [resolved]);
      for (_i0 = 0, _len = _ref0.length; _i0 < _len; ++_i0) {
        resolved = _ref0[_i0];
        if (!resolved) throw new TuneError(("'" + name + "' not found"), filename, row, col);
        resolved.start = m.index;
        resolved.end = m.index + match.length;
        resolved.stack = TuneError.ctx2stack(ctx);
        resolved.prefix = prefix;
        resolved.name = resolved.name || name;
        resolved.stack.push({
          col: col,
          row: row,
          filename: filename
        });
        if ((resolved.type === "text" || resolved.type === "image" || resolved.type === "audio")) resolved.value = await resolved.read();
        if ((resolved.type === "tool")) {
          var schema;
          schema = resolved.schema;
          if (!schema) throw new TuneError(("schema has to be set" + " for '" + resolved.name + "'"), filename, row, col);
          schema.name = resolved.name;
          if (!schema.description) throw new TuneError(("no description set" + " for '" + resolved.name + "'"), filename, row, col);
          if (!schema.parameters) throw new TuneError(("no parameters set" + " for '" + resolved.name + "'"), filename, row, col);
          if (!schema.parameters.type) throw new TuneError(("no parameters.type set" + " for '" + resolved.name + "'"), filename, row, col);
          if (!schema.parameters.properties) throw new TuneError(("no parameters.properties set" + " for '" + resolved.name + "'"), filename, row, col);
        }
        index = m.index + match.length;
        if ((recursive && (resolved.prefix.length === 2) && (resolved.type === "text"))) {
          var lctx;
          lctx = ctx.clone();
          lctx.stack.push(resolved);
          try {
            resolved.nodes = await parse(await resolved.read(), true, lctx);
          } catch (e) {
            throw TuneError.wrap(e, filename, row, col);
          }
        }
        nodes.push(resolved);
      }
    }
    if ((text.length - index)) nodes.push({
      type: "text",
      start: index,
      end: text.length,
      value: text.slice(index, text.length)
    });
    return nodes;
  }
  parse;
  return await parse(text, true, ctx);
}
text2ast;

function ast2payload(ast) {
  var payload, toolId, tools, llms, messages, roles, lastRole, lastChar;
  var payload;
  var toolId;
  var tools;
  var llms;
  var messages;
  var roles;
  var lastRole;
  var lastChar;
  payload = {};
  toolId = 0;
  tools = [];
  llms = [];
  messages = [];
  roles = [];
  lastRole = undefined;
  lastChar = '';

  function visit(ast) {
    var node, _i, _res, _ref, _len, _ref0;
    _res = [];
    _ref = ast;
    for (_i = 0, _len = _ref.length; _i < _len; ++_i) {
      node = _ref[_i];
      if ((node.type === "role")) {
        if (lastRole) roles.push(lastRole);
        _ref0 = (lastRole = node);
      } else if (lastRole) {
        lastRole.nodes = lastRole.nodes || [];
        _ref0 = (node.nodes ? visit(node.nodes) : lastRole.nodes.push(node));
      } else if (!!node.nodes) {
        _ref0 = visit(node.nodes);
      } else {
        _ref0 = undefined;
      }
      if (typeof _ref0 !== 'undefined') _res.push(_ref0);
    }
    return _res;
  }
  visit;
  visit(ast);
  roles.push(lastRole);

  function transformRoles(memo, item, index, arr) {
    var tcItem, lines, toolIndex, tc;
    if ((item.role === "user" || item.role === "system" || item.role === "tool_call")) item.content = (Array.isArray(item.content) ? item.content.map((function(item) {
      if (item.text) item.text = unescape(item.text);
      return item;
    })) : unescape(item.content));

    function findToolCalls() {
      var item1, _i, _ref, _len;
      var tools;
      tools = [];
      _ref = memo
        .slice()
        .reverse();
      for (_i = 0, _len = _ref.length; _i < _len; ++_i) {
        item1 = _ref[_i];
        if ((item1.role === "tool")) tools.push(item1);
        if ((!!item1.tool_calls && !!tools.length && (tools.length === item1.tool_calls.length))) return;
        if (item1.tool_calls) return item1;
        if ((item1.role === "user" || item1.role === "assistant")) return;
      }
      return null;
    }
    findToolCalls;
    if ((item.role === "tool_call")) {
      tcItem = findToolCalls();
      if (!tcItem) {
        tcItem = {
          role: "assistant",
          content: null,
          tool_calls: Array()
        };
        memo.push(tcItem);
      }
      tcItem.tool_calls.push({
        id: String(toolId++),
        type: "function",
        "function": text2call(item.content)
      });
    } else if (item.role === "audio") {
      var lines;
      lines = item.content.split("\n");
      memo.push({
        role: "assistant",
        content: null,
        audio: {
          id: item.id,
          data: item.data,
          expires_at: (function(it) {
            it = it.trim();
            it = parseInt(it);
            return it;
          })(lines[0]),
          transcript: lines.slice(1)
            .join("\n")
        }
      });
    } else if (item.role === "tool") {
      tcItem = findToolCalls();
      if (!tcItem) throw "No tool_calls found for item.role 'tool'";
      toolIndex = memo.slice(memo.indexOf(tcItem))
        .reverse()
        .reduce((function(memo, item) {
          return ((item.role === "tool") ? (memo + 1) : memo);
        }), 0);
      tc = tcItem.tool_calls[toolIndex];
      item.tool_call_id = tc.id;
      item.name = tc.function.name;
      memo.push(item);
    } else {
      memo.push(item);
    }
    return memo;
  }
  payload.messages = roles
    .map((function(item) {
      var res, _ref;
      var res;
      switch (item.role) {
        case "s":
          _ref = "system";
          break;
        case "u":
          _ref = "user";
          break;
        case "a":
          _ref = "assistant";
          break;
        case "au":
          _ref = "audio";
          break;
        case "tc":
          _ref = "tool_call";
          break;
        case "err":
          _ref = "error";
          break;
        case "c":
          _ref = "comment";
          break;
        case "tr":
          _ref = "tool";
          break;
        case "tool":
          _ref = "tool";
          break;
        case "tool_result":
          _ref = "tool";
          break;
        default:
          _ref = item.role;
      }
      res = {
        role: _ref,
        nodes: item.nodes
      };
      if (item.roleName) res.name = item.roleName;
      return res;
    }))
    .map((function(item) {
      item.nodes = item.nodes.reduce((function(memo, node) {
        if ((node.type === "llm")) {
          llms.push(node);
        } else if (node.type === "tool") {
          tools.push(node);
        } else {
          memo.push(node);
        }
        return memo;
      }), []);
      return item;
    }))
    .map((function(item) {
      item.content = item.nodes.reduce((function(memo, node) {
        var lastNode, _ref;
        if ((node.type === "image")) {
          if ((typeof memo === "string")) memo = Array({
            type: "text",
            text: memo
          });
          memo.push({
            type: "image_url",
            image_url: {
              url: "data:" + node.mimetype + ";base64," + node.value.toString("base64")
            }
          });
        } else if ((item.role === "user") && (node.type === "audio")) {
          if ((typeof memo === "string")) memo = Array({
            type: "text",
            text: memo
          });
          switch (node.mimetype) {
            case "audio/mpeg":
              _ref = "mp3";
              break;
            case "audio/wav":
              _ref = "wav";
              break;
            default:
              _ref = undefined;
          }
          memo.push({
            type: "input_audio",
            input_audio: {
              data: node.value.toString("base64"),
              format: _ref
            }
          });
        } else if ((item.role === "audio") && (node.type === "audio")) {
          item.id = node.name;
          item.data = node.value.toString("base64");
        } else if (node.type === "var" || node.type === "text") {
          if ((typeof memo === "string")) {
            memo += node.value;
          } else {
            var lastNode;
            lastNode = memo["slice"](-1)[0];
            (lastNode.type === "text") ? lastNode.text += node.value: memo.push({
              type: "text",
              text: node.value
            });
          }
        }
        return memo;
      }), "");
      delete item.nodes;
      item.content = ((typeof item.content === "string") ? item.content.trim() : item.content.map((function(content) {
        if ((content.type === "text")) content.text = content.text.trim();
        return content;
      })));
      return item;
    }))
    .reduce(transformRoles, Array());
  if (tools.length) payload.tools = tools;
  if (llms.length) payload.llm = llms["slice"](-1)[0];
  return payload;
}
ast2payload;
async function payload2http(payload, ctx) {
  var llm, stack, lastStack, body, _ref;
  ctx = makeContext(ctx);
  var llm;
  llm = payload.llm;
  delete payload.llm;
  if (!llm) llm = await ctx.resolve("*", "llm");
  if (!llm) {
    var stack;
    stack = TuneError.ctx2stack(ctx);
    var lastStack;
    lastStack = stack.pop();
    throw new TuneError("llm file not found", (((typeof lastStack !== "undefined") && (lastStack !== null) && !Number.isNaN(lastStack) && (typeof lastStack.filename !== "undefined") && (lastStack.filename !== null) && !Number.isNaN(lastStack.filename)) ? lastStack.filename : undefined), (((typeof lastStack !== "undefined") && (lastStack !== null) && !Number.isNaN(lastStack) && (typeof lastStack.row !== "undefined") && (lastStack.row !== null) && !Number.isNaN(lastStack.row)) ? lastStack.row : undefined), (((typeof lastStack !== "undefined") && (lastStack !== null) && !Number.isNaN(lastStack) && (typeof lastStack.col !== "undefined") && (lastStack.col !== null) && !Number.isNaN(lastStack.col)) ? lastStack.col : undefined), stack);
  }
  var body;
  body = Object.assign({}, payload);
  if (body.tools) body.tools = body.tools.map((function(tool) {
    return {
      type: "function",
      function: Object.assign({}, tool.schema)
    }
  }));
  try {
    _ref = await llm.exec(body, ctx);
  } catch (e) {
    throw new TuneError(e.message, (llm.filename || llm.fullname || llm.name), llm.row, llm.col, llm.stack, e);
  }
  return _ref;
}
payload2http;
async function toolCall(payload, ctx) {
  var lastMsg, tools;
  var lastMsg;
  lastMsg = payload.messages["slice"](-1)[0];
  if (((((typeof lastMsg !== "undefined") && (lastMsg !== null) && !Number.isNaN(lastMsg) && (typeof lastMsg.tool_calls !== "undefined") && (lastMsg.tool_calls !== null) && !Number.isNaN(lastMsg.tool_calls) && (typeof lastMsg.tool_calls.length !== "undefined") && (lastMsg.tool_calls.length !== null) && !Number.isNaN(lastMsg.tool_calls.length)) ? lastMsg.tool_calls.length : (((typeof 0 !== "undefined") && (0 !== null) && !Number.isNaN(0)) ? 0 : undefined)) === 0)) return [];
  ctx = makeContext(ctx);
  var tools;
  tools = (payload.tools || [])
    .reduce((function(memo, tool) {
      memo[tool.name] = tool;
      return memo;
    }), {});
  return Promise.all(lastMsg.tool_calls.map((async function(item) {
    var res, tc, tool;
    var res;
    res;
    var tc;
    tc = item.function;
    var tool;
    tool = tools[tc.name];
    if (!tool) throw new TuneError(("tool '" + tc.name + "' not defined"), "", undefined, undefined, TuneError.ctx2stack(ctx));
    try {
      res = await tools[tc.name].exec(JSON.parse(tc.arguments), ctx);
    } catch (e) {
      throw new TuneError(e.message, (tool.filename || tool.fullname || tool.name), tool.row, tool.col, tool.stack, e);
    }

    function transformRes(res) {
      var _ref;
      if (((typeof res === "string" || typeof res === "number" || typeof res === "boolean" || typeof res === "undefined") || (res instanceof String) || (res === null))) {
        _ref = String(res);
      } else if (Array.isArray(res)) {
        _ref = res
          .map(transformRes)
          .join("\n");
      } else if (typeof util !== 'undefined') {
        _ref = util.inspect(res);
      } else if (((typeof res !== "undefined") && (res !== null) && !Number.isNaN(res) && (typeof res.toString !== "undefined") && (res.toString !== null) && !Number.isNaN(res.toString)) ? res.toString : undefined) {
        _ref = res.toString();
      } else {
        _ref = String(res);
      }
      return _ref;
    }
    transformRes;
    return {
      role: "tool",
      id: item.id,
      content: transformRes(res)
    }
  })));
}
toolCall;

function TunePromise(executor, iterator) {
  this.promise = new Promise(executor);
  if (iterator) {
    this.next = iterator;
    this[Symbol.asyncIterator] = this;
  }
  return this;
}
TunePromise;
TunePromise.prototype.then = (function(onFulfilled, onRejected) {
  return this.promise.then(onFulfilled, onRejected);
});
TunePromise.prototype.catch = (function(onRejected) {
  return this.promise.catch(onRejected);
});
TunePromise.prototype.finally = (function(onFinally) {
  return this.promise.finally(onFinally);
});

function text2run(text, ctx, opts) {
  var msgs, stopVal, stream, ires, ierr, ifinish, resolve, reject, p;
  if (!ctx) throw Error("context not set");
  ctx = makeContext(ctx);
  var msgs;
  var stopVal;
  var stream;
  var ires;
  var ierr;
  var ifinish;
  var resolve;
  var reject;
  msgs = [];
  stopVal = (((typeof opts !== "undefined") && (opts !== null) && !Number.isNaN(opts) && (typeof opts.stop !== "undefined") && (opts.stop !== null) && !Number.isNaN(opts.stop)) ? opts.stop : (((typeof "step" !== "undefined") && ("step" !== null) && !Number.isNaN("step")) ? "step" : undefined));
  stream = (((typeof opts !== "undefined") && (opts !== null) && !Number.isNaN(opts) && (typeof opts.stream !== "undefined") && (opts.stream !== null) && !Number.isNaN(opts.stream)) ? opts.stream : (((typeof false !== "undefined") && (false !== null) && !Number.isNaN(false)) ? false : undefined));
  ires = undefined;
  ierr = undefined;
  ifinish = false;
  resolve = undefined;
  reject = undefined;
  var p;
  p = new Promise((function(res, rej) {
    resolve = res;
    return (reject = rej);
  }));
  if (stream) p = new TunePromise((function(res, rej) {
    resolve = res;
    return (reject = rej);
  }), (async function() {
    var val;
    await _once((function() {
      return (!!ires || !!ierr || !!ifinish);
    }), (function() {
      return undefined;
    }));
    if (ierr) throw ierr;
    if (ires) {
      var val;
      val = ires;
      ires = undefined;
      return val;
    }
    return ifinish;
  }));

  function stop() {
    var lastMsg, _ref;
    var lastMsg;
    lastMsg = msgs["slice"](-1)[0];
    if ((stopVal === "step")) {
      _ref = !!lastMsg;
    } else if (stopVal === "assistant") {
      _ref = (!!lastMsg && (lastMsg.role === "assistant") && !!lastMsg.content && !lastMsg.tool_calls);
    } else if (typeof stopVal === "function") {
      _ref = stopVal(msgs);
    } else {
      _ref = undefined;
    }
    return _ref;
  }
  stop;
  async function doit() {
    var ast, payload, res, ctype, err, reader, data, reData, reComment;
    while (!stop(msgs)) {
      var ast;
      ast = await text2ast(text + "\n" + msg2text(msgs), ctx);
      var payload;
      payload = await ast2payload(ast, ctx);
      if (stream) payload.stream = stream;
      var res;
      res = await toolCall(payload, ctx);
      if (res.length) {
        msgs = msgs.concat(res);
        ires = {
          value: msgs
        };
        continue;
      }
      payload = await payload2http(payload, ctx);
      res = await fetch(payload.url, payload);
      var ctype;
      ctype = res.headers.get("content-type");
      if ((!stream || ctype.includes("application/json"))) {
        res = await res.json();
        if (((((typeof res !== "undefined") && (res !== null) && !Number.isNaN(res) && (typeof res.error !== "undefined") && (res.error !== null) && !Number.isNaN(res.error)) ? res.error : undefined) || (res.object === "error"))) {
          var err;
          err = new TuneError(tpl("{type: }{message}", (((typeof res !== "undefined") && (res !== null) && !Number.isNaN(res) && (typeof res.error !== "undefined") && (res.error !== null) && !Number.isNaN(res.error)) ? res.error : (((typeof res !== "undefined") && (res !== null) && !Number.isNaN(res)) ? res : undefined))));
          err.stack = TuneError.ctx2stack(ctx);
          throw err;
        }
        msgs.push((((typeof res !== "undefined") && (res !== null) && !Number.isNaN(res) && (typeof res.message !== "undefined") && (res.message !== null) && !Number.isNaN(res.message)) ? res.message : (((typeof res !== "undefined") && (res !== null) && !Number.isNaN(res) && (typeof res.choices !== "undefined") && (res.choices !== null) && !Number.isNaN(res.choices) && (typeof res.choices[0] !== "undefined") && (res.choices[0] !== null) && !Number.isNaN(res.choices[0]) && (typeof res.choices[0].message !== "undefined") && (res.choices[0].message !== null) && !Number.isNaN(res.choices[0].message)) ? res.choices[0].message : undefined)));
        continue;
      }
      var reader;
      var data;
      var reData;
      var reComment;
      reader = res.body
        .pipeThrough(new TextDecoderStream("utf8"))
        .getReader();
      data = "";
      reData = new RegExp("^data: (.*)");
      reComment = new RegExp("^:.*");
      if (ctype.includes("text/event-stream")) {
        while (res = await reader.read()) {
          if (res.done) break;
          (function(it) {
            it = it.split(/\n/);
            it = it.map((function(item) {
              return item.trim();
            }));
            it = it.filter((function(item) {
              return !item.match(reComment);
            }));
            it = it.map((function(item, index) {
              var m;
              var m;
              m = item.match(reData);
              return ((m && ('' === it[(index + 1)])) ? m[1] : undefined);
            }));
            it = it.filter((function(item) {
              return item;
            }));
            it = it.map((function(item) {
              return ((item === '[DONE]') ? item : JSON.parse(item));
            }));
            it = it.reduce((function(msg, chunk) {
              var delta, tc;
              if ((chunk === "[DONE]")) return msg;
              var delta;
              delta = (((typeof chunk !== "undefined") && (chunk !== null) && !Number.isNaN(chunk) && (typeof chunk.choices !== "undefined") && (chunk.choices !== null) && !Number.isNaN(chunk.choices) && (typeof chunk.choices[0] !== "undefined") && (chunk.choices[0] !== null) && !Number.isNaN(chunk.choices[0]) && (typeof chunk.choices[0].delta !== "undefined") && (chunk.choices[0].delta !== null) && !Number.isNaN(chunk.choices[0].delta)) ? chunk.choices[0].delta : (((typeof {} !== "undefined") && ({} !== null) && !Number.isNaN({})) ? {} : undefined));
              if ((((typeof chunk !== "undefined") && (chunk !== null) && !Number.isNaN(chunk) && (typeof chunk.error !== "undefined") && (chunk.error !== null) && !Number.isNaN(chunk.error)) ? chunk.error : undefined)) {
                var err;
                err = new TuneError(JSON.stringify((((typeof chunk !== "undefined") && (chunk !== null) && !Number.isNaN(chunk) && (typeof chunk.error !== "undefined") && (chunk.error !== null) && !Number.isNaN(chunk.error)) ? chunk.error : undefined), null, "  "));
                err.stack = TuneError.ctx2stack(ctx);
                throw err;
              }
              if (delta.content) {
                msg.content = msg.content || "";
                msg.content += delta.content;
              } else if (delta.tool_calls) {
                msg.tool_calls = msg.tool_calls || [];
                tc = delta.tool_calls[0];
                msg.tool_calls[tc.index] = msg.tool_calls[tc.index] || tc;
                msg.tool_calls[tc.index].function.arguments += tc.function.arguments;
              }
              return msg;
            }), {
              role: "assistant",
              content: null
            });
            it = (ires = {
              value: msgs.concat(Array(it))
            });
            return it;
          })(data += res.value);
        }
      }
      if (ires) msgs = ires.value;
    }
    ires = {
      value: msgs,
      done: false
    };
    ifinish = {
      done: true
    };
    return resolve(msgs);
  }
  doit;
  doit()
    .catch((function(e) {
      var err;
      if ((e.name === "TuneError")) return reject(e);
      var err;
      err = new TuneError(e.message);
      err.stack = TuneError.ctx2stack(ctx);
      err.error = e;
      return reject(err);
    }));
  return p;
}
text2run;

function msg2text(msg, long) {
  var _ref, _ref0, _ref1;

  function mkline(role, content) {
    return (long ? tpl("{role}:{new_line}{content}", {
      role: role,
      content: content,
      new_line: ((role === "system" || role === "user" || role === "assistant" || role === "tool_result") ? "\n" : " ")
    }) : tpl("{role}: {content}", {
      role: $roles.long2short[role],
      content: content
    }));
  }
  mkline;
  if (Array.isArray(msg)) {
    _ref1 = msg
      .map((function(item) {
        return msg2text(item, long);
      }))
      .join("\n");
  } else {
    switch (msg.role) {
      case "user":
        if (((typeof msg.content === "string") || (msg.content instanceof String))) {
          _ref0 = (msg.name ? tpl("{role}({name}): {content}", {
            name: msg.name,
            content: msg.content,
            role: (long ? "user" : "u")
          }) : mkline("user", msg.content));
        } else if (Array.isArray(msg.content)) {
          _ref0 = msg.content
            .map((function(item) {
              var _ref1;
              switch (item.type) {
                case "text":
                  _ref1 = mkline("user", item.text);
                  break;
                case "tool_result":
                  _ref1 = mkline("tool_result", item.content);
                  break;
                default:
                  _ref1 = undefined;
                  throw new Error(("unsupported user content type: " + item.type));
              }
              return _ref1;
            }))
            .join("\n");
        } else {
          _ref0 = undefined;
        }
        _ref = _ref0;
        break;
      case "assistant":
        _ref = (function(res) {
          if ((msg.content && ((typeof msg.content === "string") || (msg.content instanceof String)))) {
            res.push(mkline("assistant", msg.content));
          } else if (Array.isArray(msg.content)) {
            res.push(msg.content
              .map((function(item) {
                var _ref1;
                switch (item.type) {
                  case "text":
                    _ref1 = mkline("assistant", item.text);
                    break;
                  case "tool_use":
                    _ref1 = tpl("{role}: {name} {args}", {
                      role: (long ? "tool_call" : "tc"),
                      name: item.name,
                      args: (function(it) {
                        it = ((it.text && (1 === Object.keys(it).length)) ? it.text : JSON.stringify(it));
                        return it;
                      })(item.input)
                    });
                    break;
                  default:
                    _ref1 = undefined;
                    throw new Error(("unsupported user content type: " + item.type));
                }
                return _ref1;
              }))
              .join("\n"));
          }
          if (msg.audio) res.push(tpl("{role}: @{id} {expires_at}\n{transcript}", extend(msg.audio, {
            role: (long ? "audio" : "au")
          })));
          if (msg.tool_calls) res.push(msg.tool_calls
            .map((function(tc) {
              var args, text;
              var args;
              var text;
              args = dJSON.parse(tc.function.arguments || "{}");
              text = args.text;
              delete args.text;
              args = (Object.keys(args).length ? JSON.stringify(args) : undefined);
              return tpl("{role}: {name}{ args}{\ntext}", {
                name: tc.function.name,
                args: args,
                text: text,
                role: (long ? "tool_call" : "tc")
              });
            }))
            .join("\n"));
          return res.join("\n");
        })([]);
        break;
      case "tool":
        _ref = mkline("tool_result", msg.content);
        break;
      case "system":
        _ref = mkline("system", msg.content);
        break;
      case "comment":
        _ref = mkline("comment", msg.content);
        break;
      case "error":
        _ref = mkline("error ", msg.content);
        break;
      default:
        _ref = undefined;
    }
    _ref1 = _ref;
  }
  return _ref1;
}
msg2text;

function msg2role(msg) {
  return (((msg.role === "assistant") && msg.tool_calls) ? msg.tool_calls
    .map((function(tc) {
      return {
        role: "tool_call",
        content: " " + tc.function.name + " " + tc.function.arguments
      }
    })) : Array({
      role: msg.role,
      content: " " + msg.content
    }));
}
msg2role;

function escape(text) {
  return String((((typeof text !== "undefined") && (text !== null) && !Number.isNaN(text)) ? text : (((typeof "" !== "undefined") && ("" !== null) && !Number.isNaN("")) ? "" : undefined)))
    .replace(/{(\s*\w+\s*)}/g, "{!$1}")
    .replace(/^(s|u|a|c|tr|tc|err):/gm, "\\$1:");
}
escape;

function unescape(text) {
  return String((((typeof text !== "undefined") && (text !== null) && !Number.isNaN(text)) ? text : (((typeof "" !== "undefined") && ("" !== null) && !Number.isNaN("")) ? "" : undefined)))
    .replace(/\\(?<item>@{1,2}\{\s*[~\.\-\w/]+\s*)(?<proc>(?:\s*\|\s*\w+(?:\s+\w+)*)*\})/g, "$<item>$<proc>")
    .replace(/\\(?<item>@{1,2}[~\.\-\w/]+)/g, "$<item>")
    .replace(/^\\(s|system|u|user|a|assistant|c|comment|tr|tool_result|tc|tool_call|err|error):/gm, "$1:");
}
unescape;

function text2cut(text, cursor) {
  return (function(line) {
    return (function(it) {
      it = it.map((function(item) {
        item.start = line;
        line = line + item.content.split("\n").length;
        item.end = line;
        if (((item.role === "comment") && item.content.match(/^\s*\-{3,}\s*$/))) item.delim = true;
        return item;
      }));
      it = it.reduce((function(memo, item, index) {
        if (item.delim) {
          if (((cursor < item.end) && (cursor >= item.start))) {
            memo = {
              start: item.start,
              mid: item.start,
              end: item.start
            };
          } else if (item.end <= cursor) {
            memo.start = item.end;
          } else if ((cursor < item.start) && (item.end < memo.end)) {
            memo.end = item.start;
          }
        } else if ((item.start <= cursor) && (item.end >= cursor)) {
          memo.mid = item.end;
        }
        return memo;
      }), {
        start: it[0].start,
        mid: cursor,
        end: it["slice"](-1)[0].end
      });
      return it;
    })(text2roles(text));
  })(0);
}
text2cut;

function extend() {
  var _i;
  var objects = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
  return (function(result) {
    var object, key, value, _i0, _ref, _len, _ref0, _len0;
    _ref = objects;
    for (_i0 = 0, _len = _ref.length; _i0 < _len; ++_i0) {
      object = _ref[_i0];
      _ref0 = object;
      for (key in _ref0) {
        value = _ref0[key];
        if ((typeof value !== 'undefined')) result[key] = JSON.parse(JSON.stringify(value));
      }
    }
    return result;
  })({});
}
extend;
let msgpack = (function() {
  "use strict";

  // Serializes a value to a MessagePack byte array.
  //
  // data: The value to serialize. This can be a scalar, array or object.
  // options: An object that defines additional options.
  // - multiple: (boolean) Indicates whether multiple values in data are concatenated to multiple MessagePack arrays. Default: false.
  // - invalidTypeReplacement:
  //   (any) The value that is used to replace values of unsupported types.
  //   (function) A function that returns such a value, given the original value as parameter.
  function serialize(data, options) {
    if (options && options.multiple && !Array.isArray(data)) {
      throw new Error("Invalid argument type: Expected an Array to serialize multiple values.");
    }
    const pow32 = 0x100000000; // 2^32
    let floatBuffer, floatView;
    let array = new Uint8Array(128);
    let length = 0;
    if (options && options.multiple) {
      for (let i = 0; i < data.length; i++) {
        append(data[i]);
      }
    } else {
      append(data);
    }
    return array.subarray(0, length);

    function append(data, isReplacement) {
      switch (typeof data) {
        case "undefined":
          appendNull(data);
          break;
        case "boolean":
          appendBoolean(data);
          break;
        case "number":
          appendNumber(data);
          break;
        case "string":
          appendString(data);
          break;
        case "object":
          if (data === null)
            appendNull(data);
          else if (data instanceof Date)
            appendDate(data);
          else if (Array.isArray(data))
            appendArray(data);
          else if (data instanceof Uint8Array || data instanceof Uint8ClampedArray)
            appendBinArray(data);
          else if (data instanceof Int8Array || data instanceof Int16Array || data instanceof Uint16Array ||
            data instanceof Int32Array || data instanceof Uint32Array ||
            data instanceof Float32Array || data instanceof Float64Array)
            appendArray(data);
          else
            appendObject(data);
          break;
        default:
          if (!isReplacement && options && options.invalidTypeReplacement) {
            if (typeof options.invalidTypeReplacement === "function")
              append(options.invalidTypeReplacement(data), true);
            else
              append(options.invalidTypeReplacement, true);
          } else {
            throw new Error("Invalid argument type: The type '" + (typeof data) + "' cannot be serialized.");
          }
      }
    }

    function appendNull(data) {
      appendByte(0xc0);
    }

    function appendBoolean(data) {
      appendByte(data ? 0xc3 : 0xc2);
    }

    function appendNumber(data) {
      if (isFinite(data) && Number.isSafeInteger(data)) {
        // Integer
        if (data >= 0 && data <= 0x7f) {
          appendByte(data);
        } else if (data < 0 && data >= -0x20) {
          appendByte(data);
        } else if (data > 0 && data <= 0xff) { // uint8
          appendBytes([0xcc, data]);
        } else if (data >= -0x80 && data <= 0x7f) { // int8
          appendBytes([0xd0, data]);
        } else if (data > 0 && data <= 0xffff) { // uint16
          appendBytes([0xcd, data >>> 8, data]);
        } else if (data >= -0x8000 && data <= 0x7fff) { // int16
          appendBytes([0xd1, data >>> 8, data]);
        } else if (data > 0 && data <= 0xffffffff) { // uint32
          appendBytes([0xce, data >>> 24, data >>> 16, data >>> 8, data]);
        } else if (data >= -0x80000000 && data <= 0x7fffffff) { // int32
          appendBytes([0xd2, data >>> 24, data >>> 16, data >>> 8, data]);
        } else if (data > 0 && data <= 0xffffffffffffffff) { // uint64
          appendByte(0xcf);
          appendInt64(data);
        } else if (data >= -0x8000000000000000 && data <= 0x7fffffffffffffff) { // int64
          appendByte(0xd3);
          appendInt64(data);
        } else if (data < 0) { // below int64
          appendBytes([0xd3, 0x80, 0, 0, 0, 0, 0, 0, 0]);
        } else { // above uint64
          appendBytes([0xcf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        }
      } else {
        // Float
        if (!floatView) {
          floatBuffer = new ArrayBuffer(8);
          floatView = new DataView(floatBuffer);
        }
        floatView.setFloat64(0, data);
        appendByte(0xcb);
        appendBytes(new Uint8Array(floatBuffer));
      }
    }

    function appendString(data) {
      let bytes = encodeUtf8(data);
      let length = bytes.length;

      if (length <= 0x1f)
        appendByte(0xa0 + length);
      else if (length <= 0xff)
        appendBytes([0xd9, length]);
      else if (length <= 0xffff)
        appendBytes([0xda, length >>> 8, length]);
      else
        appendBytes([0xdb, length >>> 24, length >>> 16, length >>> 8, length]);

      appendBytes(bytes);
    }

    function appendArray(data) {
      let length = data.length;

      if (length <= 0xf)
        appendByte(0x90 + length);
      else if (length <= 0xffff)
        appendBytes([0xdc, length >>> 8, length]);
      else
        appendBytes([0xdd, length >>> 24, length >>> 16, length >>> 8, length]);

      for (let index = 0; index < length; index++) {
        append(data[index]);
      }
    }

    function appendBinArray(data) {
      let length = data.length;

      if (length <= 0xff)
        appendBytes([0xc4, length]);
      else if (length <= 0xffff)
        appendBytes([0xc5, length >>> 8, length]);
      else
        appendBytes([0xc6, length >>> 24, length >>> 16, length >>> 8, length]);

      appendBytes(data);
    }

    function appendObject(data) {
      let length = 0;
      for (let key in data) {
        if (data[key] !== undefined) {
          length++;
        }
      }

      if (length <= 0xf)
        appendByte(0x80 + length);
      else if (length <= 0xffff)
        appendBytes([0xde, length >>> 8, length]);
      else
        appendBytes([0xdf, length >>> 24, length >>> 16, length >>> 8, length]);

      for (let key in data) {
        let value = data[key];
        if (value !== undefined) {
          append(key);
          append(value);
        }
      }
    }

    function appendDate(data) {
      let sec = data.getTime() / 1000;
      if (data.getMilliseconds() === 0 && sec >= 0 && sec < 0x100000000) { // 32 bit seconds
        appendBytes([0xd6, 0xff, sec >>> 24, sec >>> 16, sec >>> 8, sec]);
      } else if (sec >= 0 && sec < 0x400000000) { // 30 bit nanoseconds, 34 bit seconds
        let ns = data.getMilliseconds() * 1000000;
        appendBytes([0xd7, 0xff, ns >>> 22, ns >>> 14, ns >>> 6, ((ns << 2) >>> 0) | (sec / pow32), sec >>> 24, sec >>> 16, sec >>> 8, sec]);
      } else { // 32 bit nanoseconds, 64 bit seconds, negative values allowed
        let ns = data.getMilliseconds() * 1000000;
        appendBytes([0xc7, 12, 0xff, ns >>> 24, ns >>> 16, ns >>> 8, ns]);
        appendInt64(sec);
      }
    }

    function appendByte(byte) {
      if (array.length < length + 1) {
        let newLength = array.length * 2;
        while (newLength < length + 1)
          newLength *= 2;
        let newArray = new Uint8Array(newLength);
        newArray.set(array);
        array = newArray;
      }
      array[length] = byte;
      length++;
    }

    function appendBytes(bytes) {
      if (array.length < length + bytes.length) {
        let newLength = array.length * 2;
        while (newLength < length + bytes.length)
          newLength *= 2;
        let newArray = new Uint8Array(newLength);
        newArray.set(array);
        array = newArray;
      }
      array.set(bytes, length);
      length += bytes.length;
    }

    function appendInt64(value) {
      // Split 64 bit number into two 32 bit numbers because JavaScript only regards 32 bits for
      // bitwise operations.
      let hi, lo;
      if (value >= 0) {
        // Same as uint64
        hi = value / pow32;
        lo = value % pow32;
      } else {
        // Split absolute value to high and low, then NOT and ADD(1) to restore negativity
        value++;
        hi = Math.abs(value) / pow32;
        lo = Math.abs(value) % pow32;
        hi = ~hi;
        lo = ~lo;
      }
      appendBytes([hi >>> 24, hi >>> 16, hi >>> 8, hi, lo >>> 24, lo >>> 16, lo >>> 8, lo]);
    }
  }

  // Deserializes a MessagePack byte array to a value.
  //
  // array: The MessagePack byte array to deserialize. This must be an Array or Uint8Array containing bytes, not a string.
  // options: An object that defines additional options.
  // - multiple: (boolean) Indicates whether multiple concatenated MessagePack arrays are returned as an array. Default: false.
  function deserialize(array, options) {
    const pow32 = 0x100000000; // 2^32
    let pos = 0;
    if (array instanceof ArrayBuffer) {
      array = new Uint8Array(array);
    }
    if (typeof array !== "object" || typeof array.length === "undefined") {
      throw new Error("Invalid argument type: Expected a byte array (Array or Uint8Array) to deserialize.");
    }
    if (!array.length) {
      throw new Error("Invalid argument: The byte array to deserialize is empty.");
    }
    if (!(array instanceof Uint8Array)) {
      array = new Uint8Array(array);
    }
    let data;
    if (options && options.multiple) {
      // Read as many messages as are available
      data = [];
      while (pos < array.length) {
        data.push(read());
      }
    } else {
      // Read only one message and ignore additional data
      data = read();
    }
    return data;

    function read() {
      const byte = array[pos++];
      if (byte >= 0x00 && byte <= 0x7f) return byte; // positive fixint
      if (byte >= 0x80 && byte <= 0x8f) return readMap(byte - 0x80); // fixmap
      if (byte >= 0x90 && byte <= 0x9f) return readArray(byte - 0x90); // fixarray
      if (byte >= 0xa0 && byte <= 0xbf) return readStr(byte - 0xa0); // fixstr
      if (byte === 0xc0) return null; // nil
      if (byte === 0xc1) throw new Error("Invalid byte code 0xc1 found."); // never used
      if (byte === 0xc2) return false; // false
      if (byte === 0xc3) return true; // true
      if (byte === 0xc4) return readBin(-1, 1); // bin 8
      if (byte === 0xc5) return readBin(-1, 2); // bin 16
      if (byte === 0xc6) return readBin(-1, 4); // bin 32
      if (byte === 0xc7) return readExt(-1, 1); // ext 8
      if (byte === 0xc8) return readExt(-1, 2); // ext 16
      if (byte === 0xc9) return readExt(-1, 4); // ext 32
      if (byte === 0xca) return readFloat(4); // float 32
      if (byte === 0xcb) return readFloat(8); // float 64
      if (byte === 0xcc) return readUInt(1); // uint 8
      if (byte === 0xcd) return readUInt(2); // uint 16
      if (byte === 0xce) return readUInt(4); // uint 32
      if (byte === 0xcf) return readUInt(8); // uint 64
      if (byte === 0xd0) return readInt(1); // int 8
      if (byte === 0xd1) return readInt(2); // int 16
      if (byte === 0xd2) return readInt(4); // int 32
      if (byte === 0xd3) return readInt(8); // int 64
      if (byte === 0xd4) return readExt(1); // fixext 1
      if (byte === 0xd5) return readExt(2); // fixext 2
      if (byte === 0xd6) return readExt(4); // fixext 4
      if (byte === 0xd7) return readExt(8); // fixext 8
      if (byte === 0xd8) return readExt(16); // fixext 16
      if (byte === 0xd9) return readStr(-1, 1); // str 8
      if (byte === 0xda) return readStr(-1, 2); // str 16
      if (byte === 0xdb) return readStr(-1, 4); // str 32
      if (byte === 0xdc) return readArray(-1, 2); // array 16
      if (byte === 0xdd) return readArray(-1, 4); // array 32
      if (byte === 0xde) return readMap(-1, 2); // map 16
      if (byte === 0xdf) return readMap(-1, 4); // map 32
      if (byte >= 0xe0 && byte <= 0xff) return byte - 256; // negative fixint
      console.debug("msgpack array:", array);
      throw new Error("Invalid byte value '" + byte + "' at index " + (pos - 1) + " in the MessagePack binary data (length " + array.length + "): Expecting a range of 0 to 255. This is not a byte array.");
    }

    function readInt(size) {
      let value = 0;
      let first = true;
      while (size-- > 0) {
        if (first) {
          let byte = array[pos++];
          value += byte & 0x7f;
          if (byte & 0x80) {
            value -= 0x80; // Treat most-significant bit as -2^i instead of 2^i
          }
          first = false;
        } else {
          value *= 256;
          value += array[pos++];
        }
      }
      return value;
    }

    function readUInt(size) {
      let value = 0;
      while (size-- > 0) {
        value *= 256;
        value += array[pos++];
      }
      return value;
    }

    function readFloat(size) {
      let view = new DataView(array.buffer, pos + array.byteOffset, size);
      pos += size;
      if (size === 4)
        return view.getFloat32(0, false);
      if (size === 8)
        return view.getFloat64(0, false);
    }

    function readBin(size, lengthSize) {
      if (size < 0) size = readUInt(lengthSize);
      let data = array.subarray(pos, pos + size);
      pos += size;
      return data;
    }

    function readMap(size, lengthSize) {
      if (size < 0) size = readUInt(lengthSize);
      let data = {};
      while (size-- > 0) {
        let key = read();
        data[key] = read();
      }
      return data;
    }

    function readArray(size, lengthSize) {
      if (size < 0) size = readUInt(lengthSize);
      let data = [];
      while (size-- > 0) {
        data.push(read());
      }
      return data;
    }

    function readStr(size, lengthSize) {
      if (size < 0) size = readUInt(lengthSize);
      let start = pos;
      pos += size;
      return decodeUtf8(array, start, size);
    }

    function readExt(size, lengthSize) {
      if (size < 0) size = readUInt(lengthSize);
      let type = readUInt(1);
      let data = readBin(size);
      switch (type) {
        case 255:
          return readExtDate(data);
      }
      return {
        type: type,
        data: data
      };
    }

    function readExtDate(data) {
      if (data.length === 4) {
        let sec = ((data[0] << 24) >>> 0) +
          ((data[1] << 16) >>> 0) +
          ((data[2] << 8) >>> 0) +
          data[3];
        return new Date(sec * 1000);
      }
      if (data.length === 8) {
        let ns = ((data[0] << 22) >>> 0) +
          ((data[1] << 14) >>> 0) +
          ((data[2] << 6) >>> 0) +
          (data[3] >>> 2);
        let sec = ((data[3] & 0x3) * pow32) +
          ((data[4] << 24) >>> 0) +
          ((data[5] << 16) >>> 0) +
          ((data[6] << 8) >>> 0) +
          data[7];
        return new Date(sec * 1000 + ns / 1000000);
      }
      if (data.length === 12) {
        let ns = ((data[0] << 24) >>> 0) +
          ((data[1] << 16) >>> 0) +
          ((data[2] << 8) >>> 0) +
          data[3];
        pos -= 8;
        let sec = readInt(8);
        return new Date(sec * 1000 + ns / 1000000);
      }
      throw new Error("Invalid data length for a date value.");
    }
  }

  // Encodes a string to UTF-8 bytes.
  function encodeUtf8(str) {
    // Prevent excessive array allocation and slicing for all 7-bit characters
    let ascii = true,
      length = str.length;
    for (let x = 0; x < length; x++) {
      if (str.charCodeAt(x) > 127) {
        ascii = false;
        break;
      }
    }

    // Based on: https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330
    let i = 0,
      bytes = new Uint8Array(str.length * (ascii ? 1 : 4));
    for (let ci = 0; ci !== length; ci++) {
      let c = str.charCodeAt(ci);
      if (c < 128) {
        bytes[i++] = c;
        continue;
      }
      if (c < 2048) {
        bytes[i++] = c >> 6 | 192;
      } else {
        if (c > 0xd7ff && c < 0xdc00) {
          if (++ci >= length)
            throw new Error("UTF-8 encode: incomplete surrogate pair");
          let c2 = str.charCodeAt(ci);
          if (c2 < 0xdc00 || c2 > 0xdfff)
            throw new Error("UTF-8 encode: second surrogate character 0x" + c2.toString(16) + " at index " + ci + " out of range");
          c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
          bytes[i++] = c >> 18 | 240;
          bytes[i++] = c >> 12 & 63 | 128;
        } else bytes[i++] = c >> 12 | 224;
        bytes[i++] = c >> 6 & 63 | 128;
      }
      bytes[i++] = c & 63 | 128;
    }
    return ascii ? bytes : bytes.subarray(0, i);
  }

  // Decodes a string from UTF-8 bytes.
  function decodeUtf8(bytes, start, length) {
    // Based on: https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330
    let i = start,
      str = "";
    length += start;
    while (i < length) {
      let c = bytes[i++];
      if (c > 127) {
        if (c > 191 && c < 224) {
          if (i >= length)
            throw new Error("UTF-8 decode: incomplete 2-byte sequence");
          c = (c & 31) << 6 | bytes[i++] & 63;
        } else if (c > 223 && c < 240) {
          if (i + 1 >= length)
            throw new Error("UTF-8 decode: incomplete 3-byte sequence");
          c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
        } else if (c > 239 && c < 248) {
          if (i + 2 >= length)
            throw new Error("UTF-8 decode: incomplete 4-byte sequence");
          c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
        } else throw new Error("UTF-8 decode: unknown multibyte start 0x" + c.toString(16) + " at index " + (i - 1));
      }
      if (c <= 0xffff) str += String.fromCharCode(c);
      else if (c <= 0x10ffff) {
        c -= 0x10000;
        str += String.fromCharCode(c >> 10 | 0xd800)
        str += String.fromCharCode(c & 0x3FF | 0xdc00)
      } else throw new Error("UTF-8 decode: code point 0x" + c.toString(16) + " exceeds UTF-16 reach");
    }
    return str;
  }

  // The exported functions
  return {
    serialize: serialize,
    deserialize: deserialize,

    // Compatibility with other libraries
    encode: serialize,
    decode: deserialize
  };


})();

if (typeof window !== "undefined") {
  window.msgpack = msgpack;
}
path = require("path");
tune = require("./tune");
makeContext = tune.makeContext;
envmd = tune.envmd;
TuneError = tune.TuneError;
text2run = tune.text2run;

function env2vars(text) {
  return text
    .split(/^(\w+\s*=)/gm)
    .reduce((function(memo, item, index, arr) {
      (function(it) {
        return (it ? memo.push({
          name: it[1],
          content: arr[index + 1]
            .replace(/\n$/, "")
        }) : undefined);
      })(item.match(/^(\w+)\s*=/));
      return memo;
    }), [])
    .reduce((function(memo, item) {
      memo[item.name] = item
        .content.replace(new RegExp("^\\s*'(.*)'\\s*$"), "$1")
        .replace(new RegExp("^\\s*\"(.*)\"\\s*$"), "$1");
      return memo;
    }), {});
}
env2vars;

function pparse(filename) {
  var parsed, parsed1;
  var parsed;
  var parsed1;
  parsed = path.parse(filename);
  parsed1 = path.parse(parsed.name);
  if (parsed1.ext) {
    parsed.ext2 = parsed1.ext;
    parsed.name = parsed1.name;
  }
  return parsed;
}
pparse;
async function runFile(filename, ctx) {
  var parsed, node, text, lctx, res, module, spawnSync, result, sres, _i, _ref, _ref0, _ref1, _ref2, _ref3;
  var args = 3 <= arguments.length ? [].slice.call(arguments, 2, _i = arguments.length - 0) : (_i = 2, []);
  try {
    var parsed;
    parsed = pparse(filename);
    if ((parsed.ext === ".chat")) {
      var node;
      node = await ctx.resolve(filename);
      var text;
      text = await node.read();
      var lctx;
      lctx = ctx.clone();
      lctx.use(envmd(args[0]));
      var res;
      res = await text2run(text, lctx);
      _ref = res["slice"](-1)[0].content;
    } else if (parsed.ext === ".mjs") {
      var module;
      module = await import(filename + "?t=" + Date.now());
      if ((typeof module.default !== "function")) throw Error("JS file does not export default function");
      _ref = module.default.call.apply(module.default, [].concat([ctx]).concat(args).concat([ctx]));
    } else if (parsed.ext === ".js" || parsed.ext === ".cjs") {
      var module;
      module = require(filename);
      if ((typeof module !== "function")) throw Error("JS file does not export default function");
      _ref = module.call.apply(module, [].concat([ctx]).concat(args).concat([ctx]));
    } else if (parsed.ext === ".py" || parsed.ext === ".php") {
      var spawnSync;
      spawnSync = require("child_process").spawnSync;
      var res;
      switch (parsed.ext) {
        case ".py":
          _ref0 = "python";
          break;
        case ".php":
          _ref0 = "php";
          break;
        default:
          _ref0 = undefined;
      }
      switch (parsed.ext) {
        case ".py":
          _ref1 = "run.py";
          break;
        case ".php":
          _ref1 = "run.php";
          break;
        default:
          _ref1 = undefined;
      }
      res = spawnSync(_ref0, Array(path.resolve(__dirname, _ref1)), {
        input: JSON.stringify({
          filename: filename,
          arguments: args[0],
          ctx: ""
        }),
        env: extend(process.env, ctx.env)
      });
      if (res.error) throw res.error;
      var result;
      result = Array();
      if (res.stderr.length) result.push(res.stderr.toString("utf8"));
      if (res.stdout.length) {
        var sres;
        try {
          _ref2 = msgpack.deserialize(Buffer.from(res.stdout.toString("utf8"), "hex"));
        } catch (e) {
          console.log("cant decode messageback", e);
          _ref2 = res.stdout.toString("utf8");
        }
        sres = _ref2;
        Array.isArray(sres) ? result = result.concat(sres) : result.push(sres);
      }
      if ((result.length === 1)) result = result[0];
      _ref = result;
    } else {
      _ref = undefined;
      throw Error(tpl("{ext} extension is not supported, for {filename} ", {
        ext: parsed.ext,
        filename: filename
      }));
    }
    _ref3 = _ref;
  } catch (e) {
    throw e;
  }
  return _ref3;
}
runFile;

function fsmd(paths, opts, fs) {
  var imageExt, audioExt, envCache;
  fs = fs || require("fs");
  if (!Array.isArray(paths)) paths = Array(paths);
  var imageExt;
  var audioExt;
  imageExt = "png jpeg jpg webp"
    .split(" ")
    .map((function(item) {
      return ("." + item);
    }));
  audioExt = "mp3 wav"
    .split(" ")
    .map((function(item) {
      return ("." + item);
    }));

  function mkfsmd1(p) {
    return (async function(name, ctx, args) {
      var fname, parsed, item, parsed1, fileType, fullname, schemaFile, schema, _i, _ref, _len, _ref0, _ref1, _ref2, _ref3;
      var fname;
      var parsed;
      fname = path.resolve(p, ((name === "*") ? "default" : name));
      parsed = pparse(fname);
      if (!fs.existsSync(parsed.dir)) return;
      _ref = fs.readdirSync(parsed.dir)
        .sort((function(a, b) {
          var exts, idx1, idx2;
          var exts;
          var idx1;
          var idx2;
          exts = [".js", ".mjs", ".cjs", ".py", ".php", ".chat"];
          idx1 = exts.indexOf(path.extname(a));
          idx2 = exts.indexOf(path.extname(b));
          return (idx2 - idx1);
        }));
      for (_i = 0, _len = _ref.length; _i < _len; ++_i) {
        item = _ref[_i];
        var parsed1;
        parsed1 = pparse(item);
        if ((parsed1.name !== parsed.name)) continue;
        var fileType;
        if ((parsed1.ext2 === ".tool")) {
          _ref0 = "tool";
        } else if (parsed1.ext2 === ".llm") {
          _ref0 = "llm";
        } else if (parsed1.ext2 === ".proc") {
          _ref0 = "processor";
        } else if (parsed1.ext === ".jpg" || parsed1.ext === ".jpeg" || parsed1.ext === ".png" || parsed1.ext === ".webp") {
          _ref0 = "image";
        } else if (parsed1.ext === ".mp3" || parsed1.ext === ".wav") {
          _ref0 = "audio";
        } else if (parsed1.ext2 === ".ctx") {
          _ref0 = "context";
        } else {
          _ref0 = "text";
        }
        fileType = _ref0;
        var fullname;
        fullname = path.resolve(parsed.dir, item);
        if ((args && (args !== fileType))) continue;
        if (((item === parsed.base) || !parsed.ext || (parsed1.ext2 && (parsed.base === (parsed1.name + parsed1.ext2))) || (name === "*"))) {
          switch (fileType) {
            case "tool":
              var schemaFile;
              schemaFile = path.format({
                root: parsed.root,
                dir: parsed.dir,
                name: parsed1.name,
                ext: ".schema.json"
              });
              var schema;
              schema;
              if (fs.existsSync(schemaFile)) {
                schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
              } else if (opts && opts.makeSchema) {
                schema = await opts.makeSchema({
                  text: fs.readFileSync(fullname, "utf8")
                }, ctx);
                fs.writeFileSync(schemaFile, schema);
                schema = JSON.parse(schema);
              } else {
                throw new TuneError(("schema file not found " + schemaFile));
              }
              _ref1 = {
                type: "tool",
                schema: schema,
                name: parsed1.name,
                exec: (async function(params, ctx) {
                  return runFile(fullname, ctx, params);
                }),
                read: (async function() {
                  return fs.readFileSync(fullname, "utf8");
                }),
                dirname: parsed.dir,
                fullname: fullname
              }
              break;
            case "llm":
              _ref1 = {
                type: "llm",
                dirname: parsed.dir,
                fullname: fullname,
                name: parsed1.name,
                exec: (async function(payload, ctx) {
                  return runFile(fullname, ctx, payload);
                }),
                read: (async function() {
                  return fs.readFileSync(fullname, "utf8");
                })
              }
              break;
            case "context":
              ctx.use((async function(name, ctx, args, next) {
                return runFile(fullname, ctx, name, ctx, args, next);
              }));
              _ref1 = {
                type: "text",
                read: (async function() {
                  return "";
                })
              }
              break;
            case "processor":
              _ref1 = {
                type: "processor",
                name: parsed1.name,
                exec: (function(node, args, ctx) {
                  return runFile(fullname, ctx, node, args);
                }),
                read: (async function() {
                  return fs.readFileSync(fullname, "utf8");
                }),
                dirname: parsed.dir,
                fullname: fullname
              }
              break;
            case "image":
              if ((parsed1.ext === ".jpg" || parsed1.ext === ".jpeg")) {
                _ref2 = "image/jpeg";
              } else if (parsed1.ext === ".png") {
                _ref2 = "image/png";
              } else if (parsed1.ext === ".webp") {
                _ref2 = "image/webp";
              } else {
                _ref2 = undefined;
              }
              _ref1 = {
                type: "image",
                dirname: parsed.dir,
                fullname: fullname,
                mimetype: _ref2,
                read: (async function() {
                  return fs.readFileSync(fullname);
                })
              }
              break;
            case "audio":
              if ((parsed1.ext === ".mp3")) {
                _ref3 = "audio/mpeg";
              } else if (parsed1.ext === ".wav") {
                _ref3 = "audio/wav";
              } else {
                _ref3 = undefined;
              }
              _ref1 = {
                type: "audio",
                dirname: parsed.dir,
                fullname: fullname,
                mimetype: _ref3,
                read: (async function() {
                  return fs.readFileSync(fullname);
                })
              }
              break;
            case "text":
              _ref1 = {
                type: "text",
                dirname: parsed.dir,
                fullname: fullname,
                name: parsed1.name,
                read: (async function(binary) {
                  var buf, i, c;
                  if (binary) return fs.readFileSync(fullname);
                  var buf;
                  buf = fs.readFileSync(fullname, "utf8");
                  var i;
                  i = 0;
                  while (i < Math.min(1024, buf.length)) {
                    var c;
                    c = buf.charCodeAt(i);
                    if (((c === 65533) || (c <= 8))) throw Error(tpl("{} is a binary file, can not include it", fullname));
                    i++;
                  }
                  return buf;
                })
              }
              break;
            default:
              _ref1 = undefined;
          }
          return _ref1;
        }
      }
      return undefined;
    });
  }
  mkfsmd1;
  envCache = {};
  return (async function(name, ctx, args, next) {
    var lpaths, handles, p, envFile, res, _i, _ref, _len;
    var lpaths;
    lpaths = ctx.stack
      .filter((function(item) {
        return !!item.dirname;
      }))
      .map((function(item) {
        return item.dirname;
      }))
      .reverse()
      .concat(paths);
    var handles;
    handles = [];
    _ref = lpaths;
    for (_i = 0, _len = _ref.length; _i < _len; ++_i) {
      p = _ref[_i];
      var envFile;
      envFile = path.resolve(p, ".env");
      if (!envCache[envFile]) envCache[envFile] = ((!envFile || !fs.existsSync(envFile)) ? {} : env2vars(fs.readFileSync(envFile, "utf8")));
      if (envCache[envFile][name]) return {
        type: "text",
        read: (async function() {
          return envCache[envFile][name];
        })
      };
      handles.push(mkfsmd1(p));
    }
    while (handles.length) {
      var res;
      res = await handles.shift()(name, ctx, args);
      if (res) return res;
    }
    return next();
  });
}
fsmd;

function _afor(next, body) {
  return new Promise((function(resolve, reject) {
    return (function(results, iter) {
      function handle() {
        var args;
        args = iter();
        return ((typeof args === "undefined") ? resolve(results) : body.apply(body, [].concat(args))
          .then((function(result) {
            results.push(result);
            return handle();
          }), (function(err) {
            return reject(err);
          })));
      }
      return handle();
    })([], next());
  }));
}
_afor;

function tpl(str) {
  var _i;
  var params = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
  return (function(paramIndex, params) {
    var _ref;
    try {
      _ref = str.replace(/{(\W*)(\w*)(\W*)}/gm, (function(_, pre, name, post) {
        return (function(res) {
          paramIndex += 1;
          return (res ? ((pre || "") + res + (post || "")) : "");
        })(params[name || paramIndex]);
      }));
    } catch (e) {
      _ref = console.log.apply(console, [].concat([e, str]).concat(params));
    }
    return _ref;
  })(0, (((typeof params[0] === "object") && (params.length === 1)) ? params[0] : params));
}
tpl;

function pick(obj) {
  var _i;
  var props = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
  return (function(it) {
    var prop, _i0, _ref, _len;
    _ref = props;
    for (_i0 = 0, _len = _ref.length; _i0 < _len; ++_i0) {
      prop = _ref[_i0];
      it[prop] = obj[prop];
    }
    return it;
  })({});
}
pick;

function extend() {
  var _i;
  var objects = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
  return (function(result) {
    var object, key, value, _i0, _ref, _len, _ref0, _len0;
    _ref = objects;
    for (_i0 = 0, _len = _ref.length; _i0 < _len; ++_i0) {
      object = _ref[_i0];
      _ref0 = object;
      for (key in _ref0) {
        value = _ref0[key];
        if ((typeof value !== 'undefined')) result[key] = JSON.parse(JSON.stringify(value));
      }
    }
    return result;
  })({});
}
extend;

function delay(ms, callback) {
  return new Promise((function(resolve, reject) {
    return setTimeout((function() {
      resolve();
      return ((typeof callback === "function") ? callback() : undefined);
    }), ms);
  }));
}
delay;
path = require("path");
assert = require("node:assert/strict");
util = require("util");
plen = process.argv.length;
fs = require("fs");
row = parseInt(process.argv[plen - 1]);
filename = process.argv[plen - 2];
buf = "";
split = {};
process.stdin.setEncoding("utf8");
process.stdin.on("data", (function(chunk) {
  var _ref, _err;
  buf += chunk;
  try {
    _ref = run(JSON.parse(buf).input);
  } catch (_err) {
    _ref = undefined;
  }
  return _ref;
}));
ctx;
(async function() {
  var dirs, dir, name, ext, module, m, _i, _res, _ref, _len, _i0, _res0, _ref0, _len0, _ref1, _i1, _res1, _ref2, _len1, _ref3, _ref4;
  try {
    log({
      output: "..."
    });
    dirs = [];
    if (process.env.TUNE_PATH) dirs = process.env.TUNE_PATH.split(path.delimiter);
    ctx = makeContext(process.env);
    ctx.stack.push({
      filename: filename
    });
    _res = [];
    _ref = dirs;
    for (_i = 0, _len = _ref.length; _i < _len; ++_i) {
      dir = _ref[_i];
      _res0 = [];
      _ref0 = ["default.ctx.js", "default.ctx.cjs", "default.ctx.mjs"];
      for (_i0 = 0, _len0 = _ref0.length; _i0 < _len0; ++_i0) {
        name = _ref0[_i0];
        var filename;
        var ext;
        filename = path.join(dir, name);
        ext = path.extname(name);
        if (!fs.existsSync(filename)) continue;
        module = ((ext === ".js" || ext === ".cjs") ? require(filename) : await import(filename));
        if ((typeof module === "function")) {
          _ref1 = ctx.use(module);
        } else if (Array.isArray(module)) {
          _res1 = [];
          _ref2 = module;
          for (_i1 = 0, _len1 = _ref2.length; _i1 < _len1; ++_i1) {
            m = _ref2[_i1];
            if (typeof(_ref3 = (typeof m === "function") ? ctx.use(m) : log({
                output: tpl("err: Context file export is not an array of functions or function {filename}", {
                  filename: filename
                })
              })) !== 'undefined') _res1.push(_ref3);
          }
          _ref1 = _res1;
        } else {
          _ref1 = log({
            output: tpl("err: Context file export is not an array of functions or function{filename}", {
              filename: filename
            })
          });
        }
        if (typeof _ref1 !== 'undefined') _res0.push(_ref1);
      }
      if (typeof _res0 !== 'undefined') _res.push(_res0);
    }
    _ref4 = _res;
  } catch (e) {
    log({
      output: "err: " + e.toString() + ((typeof e.stack === "string") ? ("\n" + e.stack) : "")
    });
    _ref4 = process.exit();
  }
  return _ref4;
})();

function log(obj) {
  return fs.writeFileSync(3, JSON.stringify(extend(obj, {
    split: split
  })) + "\n");
}
log;
async function run(text) {
  var res, chunk, all, lines, longFormatRegex, long, r, _err, _ref;
  try {
    var res;
    var chunk;
    res = "";
    chunk = {
      done: false
    };
    all = text.trim();
    lines = all.split("\n");
    split = text2cut(all, row);
    text = lines.slice(split.start, split.mid)
      .join("\n")
      .trim();
    longFormatRegex = /^(system|user|tool_call|tool_result|assistant|error):/;
    long = longFormatRegex.test(text);
    log({
      output: msg2text({
        role: "assistant",
        content: ""
      }, long)
    });
    r = text2run(text, ctx, {
      stop: "step",
      stream: true
    });
    r.promise.catch((function(e) {
      console.log(e);
      log({
        output: "err: " + e.toString() + ((typeof e.stack === "string") ? ("\n" + e.stack) : "")
      });
      return process.exit();
    }));
    if (r[Symbol.asyncIterator]) {
      while (!chunk.done) {
        res = chunk.value || "";
        if (!res) {
          chunk = await r.next();
          continue;
        }
        res = chunk.value;
        try {
          log({
            output: msg2text(res, long)
          });
        } catch (_err) {}
        chunk = await r.next();
      }
    } else {
      res = r;
    }
    log({
      output: msg2text(res, long)
    });
    await delay(500);
    _ref = process.exit();
  } catch (e) {
    log({
      output: "err: " + e.toString() + ((typeof e.stack === "string") ? ("\n" + e.stack) : "")
    });
    _ref = process.exit();
  }
  return _ref;
}
run;