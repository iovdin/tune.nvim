var path, assert, tune, util, fs, inStream, outStream, server, sctx;

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

function AsyncIter() {
  return (this[Symbol.asyncIterator] = this);
}
AsyncIter;
AsyncIter.prototype.next = (async function() {
  var self, result;
  var self;
  self = this;
  await _once((function() {
    return (!!self.err || !!self.result);
  }), (function() {
    return undefined;
  }));
  var result;
  result = self.result;
  self.result = undefined;
  if (self.err) throw self.err;
  return result;
});

function jsonrpc(params) {
  var client;
  var client;
  client = new JSONRPC(params);
  return new Proxy({}, {
    get: (function(target, prop, receiver) {
      return (function(params, stream) {
        return client._call(prop, params, stream);
      });
    }),
    set: (function(obj, prop, value) {
      return (client[prop] = value);
    })
  });
}
jsonrpc;

function JSONRPC(params) {
  var self;
  this.msgId = 1;
  this.chunks = [];
  this.inStream = params.inStream;
  this.outStream = params.outStream;
  this.debug = params.debug;
  this.name = params.name;
  this.exports = params.exports || {}
  this.callbacks = {};
  this.iterators = {};
  self = this;
  assert.ok(params.inStream, "inStream has to be defined");
  assert.ok(params.outStream, "outStream has to be defined");
  this.inStream.on("data", (function(data) {
    var buf, index, line, msg, cb, iter, err, _res, _ref, _ref0;
    self.chunks.push(data);
    var buf;
    buf = Buffer.concat(self.chunks);
    var index;
    index;
    _res = [];
    while (-1 !== (index = buf.indexOf("\n"))) {
      var line;
      line = buf.toString("utf8", 0, index);
      buf = buf.subarray(index + 1);
      self.chunks = [buf];
      if (self.debug) console.log(self.name, line);
      var msg;
      msg = JSON.parse(line);
      if (!msg.id) {
        console.log("messages has no id skipping", msg);
        continue;
      }
      var cb;
      var iter;
      cb = self.callbacks[msg.id];
      iter = self.iterators[msg.id];
      if (((cb || iter) && (((typeof msg !== 'undefined') && (typeof msg.result !== 'undefined')) || msg.error))) {
        if ((cb && ((typeof msg !== 'undefined') && (typeof msg.result !== 'undefined')))) {
          cb.resolve(msg.result);
        } else if (iter && ((typeof msg !== 'undefined') && (typeof msg.result !== 'undefined'))) {
          iter.result = {
            value: msg.result
          };
          if (msg.done) {
            iter.result.done = true;
            delete self.iterators[msg.id];
          }
        } else if (cb && msg.error) {
          var err;
          err = new Error(msg.error.message);
          err.stack = msg.error.stack;
          cb.reject(err);
        } else if (iter && msg.error) {
          iter.err = new Error(msg.error.message);
          iter.err.stack = msg.error.stack;
        }
        if (cb) {
          _ref = undefined;
          delete self.callbacks[msg.id];
        } else {
          _ref = undefined;
        }
        _ref0 = _ref;
      } else if (msg.method) {
        if (!self.exports[msg.method]) {
          self._error(msg.id, "method not found: " + msg.method);
          continue;
        }
        _ref0 = (async function(m, r, chunk) {
          var _res0, _ref1, _ref2, _ref3;
          m = msg;
          r = undefined;
          chunk = {};
          try {
            r = await self.exports[m.method](msg.params, msg.stream);
            if (((typeof r !== 'undefined') && !!r[Symbol.asyncIterator])) {
              _res0 = [];
              while (!chunk.done) {
                chunk = await r.next();
                if (chunk.err) throw chunk.err;
                if (typeof(_ref1 = !!chunk.value ? self._result(m.id, chunk.value, chunk.done) : undefined) !== 'undefined') _res0.push(_ref1);
              }
              _ref2 = _res0;
            } else {
              _ref2 = self._result(m.id, r, true);
            }
            _ref3 = _ref2;
          } catch (e) {
            _ref3 = self._error(m.id, e.message, e.stack);
          }
          return _ref3;
        }).call(this);
      } else {
        _ref0 = undefined;
      }
      if (typeof _ref0 !== 'undefined') _res.push(_ref0);
    }
    return _res;
  }));
  return this;
}
JSONRPC;
JSONRPC.prototype._write = (function(payload) {
  return this.outStream.write(JSON.stringify(payload) + "\n");
});
JSONRPC.prototype._error = (function(msgId, message, stack) {
  return this._write({
    jsonrpc: "2.0",
    id: msgId,
    error: {
      message: message,
      stack: stack
    }
  });
});
JSONRPC.prototype._result = (function(msgId, result, done) {
  return (function(self, payload) {
    if (done) payload.done = true;
    return self._write(payload);
  })(this, {
    jsonrpc: "2.0",
    id: msgId,
    result: ((typeof result !== 'undefined') ? result : null)
  });
});
JSONRPC.prototype._call = (async function(method, params, stream) {
  var self, msgId;
  var self;
  var msgId;
  self = this;
  msgId = self.msgId;
  self.msgId++;
  self.outStream.write(JSON.stringify({
    jsonrpc: "2.0",
    id: msgId,
    method: method,
    params: params,
    stream: stream
  }) + "\n");
  if (!stream) return new Promise((function(resolve, reject) {
    return (self.callbacks[msgId] = {
      resolve: resolve,
      reject: reject
    });
  }));
  return (self.iterators[msgId] = new AsyncIter());
});
path = require("path");
assert = require("node:assert/strict");
tune = require("./dist/tune.js");
util = require("util");
fs = require("fs");
process.stdin.setEncoding("utf8");
inStream = fs.createReadStream(null, {
  fd: 4,
  autoClose: true
});
outStream = fs.createWriteStream(null, {
  fd: 3,
  autoClose: true
});
server = jsonrpc({
  inStream: inStream,
  outStream: outStream,
  debug: true,
  name: "server",
  exports: {
    suggest: suggest,
    text2run: text2run
  }
});
async function editorContext(name, params) {
  var node;
  if ((0 !== name.indexOf("editor"))) return;
  var node;
  node = await server.resolve({
    name: name,
    params: params
  });
  if ((((typeof node !== "undefined") && (node !== null) && !Number.isNaN(node) && (typeof node.error !== "undefined") && (node.error !== null) && !Number.isNaN(node.error)) ? node.error : undefined)) return;
  node.read = (function() {
    return server.read({
      name: name,
      params: params
    });
  });
  return node;
}
editorContext;
async function getSuggestiongContext() {
  var sctx;
  if (!sctx) sctx = await initContext({
    TUNE_PATH: process.env.TUNE_PATH
  });
  return sctx;
}
getSuggestiongContext;
sctx;
async function suggest(params) {
  var ctx, node, _ref;
  var ctx;
  ctx = await getSuggestiongContext();
  var node;
  node = await ctx.resolve(params.query, {
    output: "all",
    match: "regex"
  });
  if (!node) {
    _ref = [];
  } else if (!Array.isArray(node)) {
    _ref = Array(node);
  } else {
    _ref = node;
  }
  node = _ref;
  return node.map((function(item) {
    return {
      name: item.name,
      dirname: item.dirname,
      fullname: item.fullname,
      basename: (item.fullname ? path.basename(item.fullname) : undefined),
      type: item.type
    }
  }));
}
suggest;
async function initContext(params) {
  var dirs, TUNE_PATH, filename, ctx, dir, ext, module, m, _i, _ref, _len, _i0, _ref0, _len0;
  dirs = [];
  TUNE_PATH = params.TUNE_PATH;
  filename = params.filename;
  if (TUNE_PATH) dirs = TUNE_PATH.split(path.delimiter);
  ctx = tune.makeContext(process.env);
  if (filename) ctx.stack.push({
    filename: filename,
    name: path.basename(filename),
    dirname: path.dirname(filename)
  });
  if (params.editorContext) ctx.use(editorContext);
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
      ctx.use(module);
    } else if (Array.isArray(module)) {
      _ref0 = module;
      for (_i0 = 0, _len0 = _ref0.length; _i0 < _len0; ++_i0) {
        m = _ref0[_i0];
        if ((typeof m === "function")) {
          ctx.use(m);
        } else {
          throw Error(tpl("Context file export is not an array of functions or function {filename}", {
            filename: filename
          }));
        }
      }
    } else {
      throw Error(tpl("Context file export is not an array of functions or function {filename}", {
        filename: filename
      }));
    }
  }
  return ctx;
}
initContext;
async function text2run(params, stream) {
  var filename, stop, text, format, ctx, stopVal, longFormatRegex, long, res, r, chunk, itergqJLkqD;
  var filename;
  var stop;
  var text;
  var format;
  filename = params.filename;
  stop = params.stop || "step";
  text = params.text;
  format = (((typeof params !== "undefined") && (params !== null) && !Number.isNaN(params) && (typeof params.format !== "undefined") && (params.format !== null) && !Number.isNaN(params.format)) ? params.format : (((typeof "text" !== "undefined") && ("text" !== null) && !Number.isNaN("text")) ? "text" : undefined));
  ctx = await initContext({
    filename: filename,
    TUNE_PATH: process.env.TUNE_PATH,
    editorContext: params.editorContext
  });
  stopVal = ((stop === "step" || stop === "assistant") ? stop : (function(msgs) {
    var lastMsg;
    var lastMsg;
    lastMsg = msgs["slice"](-1)[0];
    if (!lastMsg) return false;
    return (-1 !== (((typeof lastMsg !== "undefined") && (lastMsg !== null) && !Number.isNaN(lastMsg) && (typeof lastMsg.content !== "undefined") && (lastMsg.content !== null) && !Number.isNaN(lastMsg.content)) ? lastMsg.content : (((typeof "" !== "undefined") && ("" !== null) && !Number.isNaN("")) ? "" : undefined)).indexOf(stop));
  }));
  if ((filename && !text)) text = await ctx.read(filename);
  if (!text) throw Error("no chat content found");
  longFormatRegex = /^(system|user|tool_call|tool_result|assistant|error):/;
  long = longFormatRegex.test(text);
  if (!stream) {
    res = await ctx.text2run(text, {
      stop: stopVal
    });
    return ((format === "json") ? res : tune.msg2text(res, long));
  }
  r = await ctx.text2run(text, {
    stop: stopVal,
    stream: true
  });
  chunk = {};
  itergqJLkqD = new AsyncIter();
  (async function($lastRes) {
    var _ref;
    try {
      while (!chunk.done) {
        chunk = await r.next();
        res = (chunk.value || "");
        $lastRes = ((format === "json") ? res : tune.msg2text(res, long)) || $lastRes;
        itergqJLkqD.result = {
          value: $lastRes
        }
      }
      _ref = itergqJLkqD.result = {
        value: $lastRes,
        done: true
      }
    } catch (e) {
      _ref = (itergqJLkqD.err = e);
    }
    return _ref;
  })();
  return itergqJLkqD;
}
text2run;