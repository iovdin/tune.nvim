var path, assert, tune, util, plen, fs, row, buf, split, ctx, initPromise;

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
          return ((typeof res !== 'undefined') ? ((pre || "") + res + (post || "")) : "");
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
tune = require("./dist/tune.js");
util = require("util");
plen = process.argv.length;
fs = require("fs");
row = parseInt(process.argv[plen - 1]);
global.filename = process.argv[plen - 2];
buf = "";
split = {};
process.stdin.setEncoding("utf8");
process.stdin.on("data", (async function(chunk) {
  var val, _ref, _err;
  buf += chunk;
  try {
    val = JSON.parse(buf);
    _ref = run(val.input, val.stop || "step");
  } catch (_err) {
    _ref = undefined;
  }
  return _ref;
}));
ctx;
async function initContext() {
  var dirs, dir, filename, ext, module, m, _i, _res, _ref, _len, _ref0, _i0, _res0, _ref1, _len0, _ref2, _ref3;
  try {
    log({
      output: "..."
    });
    dirs = [];
    if (process.env.TUNE_PATH) dirs = process.env.TUNE_PATH.split(path.delimiter);
    ctx = tune.makeContext(process.env);
    ctx.stack.push({
      filename: global.filename,
      name: path.basename(global.filename),
      dirname: path.dirname(global.filename)
    });
    _res = [];
    _ref = dirs;
    for (_i = 0, _len = _ref.length; _i < _len; ++_i) {
      dir = _ref[_i];
      var filename;
      filename = ["default.ctx.js", "default.ctx.cjs", "default.ctx.mjs"]
        .find((function(name) {
          return fs.existsSync(path.join(dir, name));
        }));
      if (!filename) continue;
      filename = path.join(dir, filename);
      ext = path.extname(filename);
      if ((ext === ".js" || ext === ".cjs")) {
        module = require(filename);
      } else {
        module = await import(filename);
        module = module.default;
      }
      if ((typeof module === "function")) {
        _ref0 = ctx.use(module);
      } else if (Array.isArray(module)) {
        _res0 = [];
        _ref1 = module;
        for (_i0 = 0, _len0 = _ref1.length; _i0 < _len0; ++_i0) {
          m = _ref1[_i0];
          if (typeof(_ref2 = (typeof m === "function") ? ctx.use(m) : log({
              output: tpl("err: Context file export is not an array of functions or function {filename}", {
                filename: filename
              })
            })) !== 'undefined') _res0.push(_ref2);
        }
        _ref0 = _res0;
      } else {
        _ref0 = log({
          output: tpl("err: Context file export is not an array of functions or function{filename}", {
            filename: filename
          })
        });
      }
      if (typeof _ref0 !== 'undefined') _res.push(_ref0);
    }
    _ref3 = _res;
  } catch (e) {
    log({
      output: "err: " + e.toString() + ((typeof e.stack === "string") ? ("\n" + e.stack) : "")
    });
    _ref3 = process.exit();
  }
  return _ref3;
}
initContext;
initPromise = initContext();

function log(obj) {
  return fs.writeFileSync(3, JSON.stringify(extend(obj, {
    split: split
  })) + "\n");
}
log;
async function run(text, stop) {
  var stopVal, res, chunk, all, lines, longFormatRegex, long, r, _err, _ref;
  try {
    await initPromise;
    stopVal = ((stop === "step" || stop === "assistant") ? stop : (function(msgs) {
      var lastMsg;
      var lastMsg;
      lastMsg = msgs["slice"](-1)[0];
      if (!lastMsg) return false;
      return (-1 !== (((typeof lastMsg !== "undefined") && (lastMsg !== null) && !Number.isNaN(lastMsg) && (typeof lastMsg.content !== "undefined") && (lastMsg.content !== null) && !Number.isNaN(lastMsg.content)) ? lastMsg.content : (((typeof "" !== "undefined") && ("" !== null) && !Number.isNaN("")) ? "" : undefined)).indexOf(stop));
    }));
    var res;
    var chunk;
    res = "";
    chunk = {
      done: false
    };
    all = text.trim();
    lines = all.split("\n");
    split = tune.text2cut(all, row);
    text = lines.slice(split.start, split.mid)
      .join("\n")
      .trim();
    longFormatRegex = /^(system|user|tool_call|tool_result|assistant|error):/;
    long = longFormatRegex.test(text);
    log({
      output: tune.msg2text({
        role: "assistant",
        content: ""
      }, long)
    });
    r = await tune.text2run(text, ctx, {
      stop: stopVal,
      stream: true
    });
    while (!chunk.done) {
      chunk = await r.next();
      res = chunk.value || res || "";
      try {
        log({
          output: tune.msg2text(res, long)
        });
      } catch (_err) {}
    }
    log({
      output: tune.msg2text(res, long)
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