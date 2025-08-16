--- A Lua implementation of a JSON-RPC 2.0 client for Neovim.
--
-- This module allows you to start and communicate with an external process
-- over stdio using the JSON-RPC protocol. It leverages Neovim's built-in
-- job control and JSON APIs, so it has no external dependencies.
--
-- Example Usage:
--
--   -- assuming this file is in 'lua/my/jsonrpc.lua'
--   local jsonrpc = require('my.jsonrpc')
--
--   -- Define methods that the child process can call on Neovim
--   local my_exports = {
--     echo = function(params)
--       vim.notify('Child process sent: ' .. vim.inspect(params))
--       return params
--     end
--   }
--
--   -- Start a Node.js script as a child process
--   local client, err = jsonrpc.start({'node', 'my-rpc-server.js'}, {
--     exports = my_exports
--   })
--
--   if err then
--     vim.notify('Failed to start process: ' .. err, vim.log.levels.ERROR)
--     return
--   end
--
--   -- Call a method on the child process
--   -- The last argument is a callback: function(err, result)
--   client.add({ 2, 3 }, function(rpc_err, result)
--     if rpc_err then
--       vim.notify('RPC Error: ' .. rpc_err.message, vim.log.levels.ERROR)
--     else
--       vim.notify('Result of 2+3 is: ' .. result, vim.log.levels.INFO) -- Result: 5
--     end
--   end)
--

local api = vim.api
local fn = vim.fn

local Client = {}
Client.__index = Client

--- The main factory function to start a new RPC client.
-- @param cmd (table) A command and its arguments, e.g., {'node', 'server.js'}.
-- @param opts (table, optional) Options table.
--   - exports (table, optional): Methods that the child process can invoke.
-- @return (table, string) A client proxy object on success, or (nil, error_message) on failure.
local function start(cmd, opts, callback)
  opts = opts or {}
  local self = setmetatable({
    msgId = 1,
    buffer = '',
    errbuf = '',
    callbacks = {},
    iters = {},
    process_callback = callback,
    exports = opts.exports or {},
    obj = nil
  }, Client)

  local job_opts = {
    stdout = vim.schedule_wrap(function(err, data) self:_on_data(err, data) end),
    stderr = vim.schedule_wrap(function(err, data) self:_on_stderr(err, data) end),
    stdin = true,
    text = true,
  }

  self.obj = vim.system(cmd, job_opts, vim.schedule_wrap(function(obj) self:_on_exit(obj) end))
  -- TODO how to check if it fails?
  -- vim.notify(vim.inspect(self.obj))
  if self.obj == nil then
    return nil, 'Failed to start job. Code: ' .. tostring(self.obj)
  end

  -- The proxy table is what the user interacts with.
  -- It translates method calls into JSON-RPC messages.
  local proxy = {}
  setmetatable(proxy, {
    __index = function(_, key)
      if key == 'stop' then
        return function() self:_stop() end
      end
      if key == 'is_running' then
        return self.obj == nil
      end
      -- Fallback for any other method call, assuming it's an RPC call.
      return function(params, stream, callback)
        self:_call(key, params, stream, callback)
      end
    end,
  })

  return proxy, nil
end

--- Internal: Stop the underlying job.
function Client:_stop()
  if self.obj then
    self.obj:kill(15)
    self.obj = nil --  Mark as stopped
  end
end

--- Internal: Handle incoming data from the child process's stdout.
function Client:_on_data(err, data)
  if not data then return end
  -- `data` is a table of strings. Concat them and any previous buffer.
  self.buffer = self.buffer .. data

  while true do
    local newline_pos = self.buffer:find('\n', 1, true)
    if not newline_pos then break end

    local line = self.buffer:sub(1, newline_pos - 1)
    self.buffer = self.buffer:sub(newline_pos + 1)

    if line and #line > 0 then
      self:_handle_message(line)
    end
  end
end

--- Internal: Handle stderr from the child process.
function Client:_on_stderr(err, data)
  if data then
    self.errbuf = self.errbuf .. data
  end
end

--- Internal: Handle the job exiting.
function Client:_on_exit(obj)
  -- vim.notify(" on_exit " .. obj.code .. " " .. obj.signal)

  -- Reject any pending callbacks
  for id, callback in pairs(self.callbacks) do
    if not (obj.code == 0) then
      callback({ message = self.errbuf })
    end
    self.callbacks[id] = nil
  end
  for id, iter in pairs(self.iters) do
    if not (obj.code == 0) then
      iter({ message = self.errbuf }, { value = '', done = true })
    end
    self.iters[id] = nil
  end
  if not (obj.code == 0) then
    vim.notify(self.errbuf, vim.log.levels.WARN)
  end
  self.obj = nil -- Mark as no longer running
end


--- Internal: Parse and dispatch a single JSON message.
function Client:_handle_message(line)
  local ok, msg = pcall(vim.json.decode, line)
  if not ok then
    -- vim.notify('JSONRPC: Could not decode JSON: ' .. line, vim.log.levels.ERROR)
    return
  end

  if not msg.id then
    -- It's a notification, we could handle it if needed.
    return
  end

  -- Is it a response to a call we made?
  if msg.result or msg.error then
    local callback = self.callbacks[msg.id]
    local iter = self.iters[msg.id]
    if callback then
      self.callbacks[msg.id] = nil
      callback(msg.error, msg.result)
    elseif iter then
      if msg.done then
        self.iters[msg.id] = nil
      end
      iter(msg.error, { value = msg.result, done = msg.done })
    end
  -- Is it a request for us to handle?
  elseif msg.method then
    local handler = self.exports[msg.method]
    if handler then
      -- Run the exported method in a protected call to catch errors.
      -- Use `vim.schedule` to avoid blocking the main loop on long tasks.
      vim.schedule(function()
        local status, result = pcall(handler, msg.params)
        if status then
          self:_result(msg.id, result)
        else
          self:_error(msg.id, 'Error in method ' .. msg.method .. ': ' .. tostring(result))
        end
      end)
    else
      self:_error(msg.id, 'Method not found: ' .. msg.method)
    end
  end
end

--- Internal: Write a JSON payload to the child's stdin.
function Client:_write(payload)
  if self.obj == nil or self.obj:is_closing() then return end -- Don't send if job is stopped.
  local ok, json_string = pcall(vim.json.encode, payload)
  if not ok then
    -- This is a serious internal error.
    self:_error(payload.id, 'Failed to encode response: ' .. tostring(json_string))
    return
  end
  -- jobsend expects a list of lines, add the trailing newline.
  self.obj:write(json_string .. '\n')
end

--- Internal: Send an error response.
function Client:_error(id, message)
  self:_write({
    jsonrpc = '2.0',
    id = id,
    error = { message = message },
  })
end

--- Internal: Send a success response.
function Client:_result(id, result)
  self:_write({
    jsonrpc = '2.0',
    id = id,
    result = result -- `vim.json` handles nil -> null automatically
  })
end

--- Internal: Make a remote procedure call.
function Client:_call(method, params, stream, callback)
  local id = self.msgId
  self.msgId = self.msgId + 1

  if callback and type(callback) == 'function' then
    if stream then
      self.iters[id] = vim.schedule_wrap(callback) -- Ensure callback runs on main thread
    else
      self.callbacks[id] = vim.schedule_wrap(callback) -- Ensure callback runs on main thread
    end
  end

  self:_write({
    jsonrpc = '2.0',
    id = id,
    method = method,
    params = params,
    stream = stream
  })
end

-- Return the public API
return {
  start = start,
}
