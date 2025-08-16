local uv = (vim.uv or vim.loop)
local ns_id = vim.api.nvim_create_namespace('tune_generating_text')

local jsonrpc = require('tune.jsonrpc')
local context = require('tune.context')

local tune_pid = {}
local current_client = {}

function table.slice(tbl, first, last, step)
  local sliced = {}

  for i = first or 1, last or #tbl, step or 1 do
    sliced[#sliced+1] = tbl[i]
  end

  return sliced
end

local function tune_kill()
  local bufnr = vim.api.nvim_get_current_buf()
  local client = current_client[bufnr]
  -- and client.is_running
  if client then
    client:stop()
    vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)
    current_client[bufnr] = nil
  end
end

local function set_cursor(bufnr, row, col)
  if row > vim.api.nvim_buf_line_count(bufnr) then
    return
  end
  local win = vim.fn.bufwinid(bufnr)
  if win ~= nil then
    vim.api.nvim_win_set_cursor(win, { row, col })
  end
end

local function spawn_tune() 
  local env = vim.loop.os_environ()
  local cmd = { 'tune-sdk', 'rpc' }
  if env.TUNE_PATH and #env.TUNE_PATH > 0 then
    table.insert(cmd, '--path')
    table.insert(cmd, env.TUNE_PATH)
  end

  -- Expose minimal exports used by tune-sdk contexts if needed later

  local client, err = jsonrpc.start(cmd, { exports = context })
  if err or not client then
    return client, err
  end

  client.init({ 'resolve', 'read'}, false, function(_e, _r) end)
  return client, err

end

local function tune_new(opts, callback)
  -- Create a new buffer
  local bufnr = vim.api.nvim_create_buf(false, true)  -- not listed, scratch
  vim.api.nvim_set_current_buf(bufnr)
  
  -- Set the filetype to 'chat'
  vim.api.nvim_buf_set_option(bufnr, 'filetype', 'chat')
  
  -- Prepare initial text based on whether parameter is provided
  local initial_text
  if opts.args and #opts.args > 0 then
    -- Parameter provided: "system: @@<param>\nuser:\n"
    initial_text = {"system: @@" .. opts.args, "user:", ""}
  else
    -- No parameter: "user:\n"
    initial_text = {"user:", ""}
  end
  
  -- Insert the initial text
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, initial_text)
  
  -- Set cursor position (last line, beginning)
  vim.api.nvim_win_set_cursor(0, {#initial_text, 0})
  
  -- Enter insert mode
  vim.cmd('startinsert!')
end

local function tune_save(opts, callback)
  local bufnr = vim.api.nvim_get_current_buf()
  
  -- Check if buffer has a name (is not unnamed)
  local current_name = vim.api.nvim_buf_get_name(bufnr)
  if current_name ~= "" then
    vim.notify("Buffer already has a name: " .. current_name, vim.log.levels.WARN)
    return
  end
  
  -- Set the buffer name (hardcoded for now)
  local client, err = spawn_tune()
  if err then
    vim.notify("Error giving name: " .. tostring(err), vim.log.levels.WARN)
  end


  client.file2run({ 
    filename = "editor-filename.chat",
    stop = "assistant",  
    response = "json"
  }, false, function(err, result)

      vim.notify(vim.inspect(err))
      if err then
        vim.notify("Error giving name: " .. tostring(err), vim.log.levels.WARN)
      end
      vim.api.nvim_buf_set_name(bufnr, result.filename)
  
      -- Mark buffer as not scratch and listed
      vim.api.nvim_buf_set_option(bufnr, 'buflisted', true)
      vim.api.nvim_buf_set_option(bufnr, 'buftype', '')
  
      -- Save the buffer
      -- vim.cmd('write')
      client:stop()
    end)

end

local function tune_chat(opts, callback)
  tune_kill()
  local stop = 'step'
  if #opts.args > 0 then
    stop = opts.args
  end

  local filename = vim.fn.expand('%:p')
  local bufnr = vim.api.nvim_get_current_buf()
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  local line = vim.fn.line('.') - 1

  -- compute split boundaries like old run.js did via tune.text2cut on server side
  
  local s_start = 1 
  local s_mid = nil 
  local s_end = #lines
  local roles = {
    c = true,
    comment = true,
    s = true,
    system = true,
    u = true,
    user = true,
    a = true,
    assistant = true,
    tc = true,
    tool_call = true,
    tr = true,
    tool_result = true,
    err = true,
    error = true,
  }
  -- print("line: " .. line)
  for index, item in ipairs(lines) do
    index = index - 1
    role, content = item:match('^([%a_]+):(.*)')
    if role and roles[role]  then
      if s_mid == nil and index > line then
        s_mid = index
      end
      if  (role == "comment" or role == "c") and content:match('%s*%-%-%-.*') ~= nil then
        if index < line then
          s_start = index + 2
        end
        if index > line and s_end == #lines then
          s_end = index
        end
      end
    end
  end
  if s_mid == nil then
    s_mid = s_end
  end

  -- Clear highlight namespace early
  vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)


  -- Helper to update buffer with streamed content and highlight
  local last_completion
  local function render_output(completion)
    local new_lines = {}
    if completion and #completion > 0 then
      last_completion = completion
      new_lines = vim.split(completion, '\n', { trimempty = false })
    end
    vim.api.nvim_buf_set_lines(bufnr, s_mid, s_end, true, new_lines)
    s_end = s_mid + #new_lines
    vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)
    for line_num = s_mid, s_end - 1 do
      if line_num < vim.api.nvim_buf_line_count(bufnr) then
        local l = vim.api.nvim_buf_get_lines(bufnr, line_num, line_num + 1, false)[1]
        vim.api.nvim_buf_add_highlight(bufnr, ns_id, 'DiffChange', line_num, 0, #l)
      end
    end
    set_cursor(bufnr, s_end, 0)
  end


  local client, err = spawn_tune()
  if err or not client then
    render_output("err: \n" .. 'tune: failed to start rpc: ' .. tostring(err))
    return
  end

  current_client[bufnr] = client

  -- Request iterative generation like vscode client.file2run(..., response='chat')
  local params = {
    text = table.concat(table.slice(lines, s_start, s_mid), '\n'),
    stop = stop,
    filename = filename,
    response = 'chat',
  }

  render_output("...")
  -- Start streaming: first call returns an iterator id or first chunk depending on rpc design
  client.file2run(params, true, function(err, chunk)
    if err then
      vim.schedule(function()
        local message
        if err.message then
          message = err.message
        else
          message = vim.json.encode(err)
        end
        render_output("err: \n" .. message)
        vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)
        client:stop()
      end)
      return
    end

    if current_client[bufnr] ~= client then return end
    if not chunk then return end
    local done = chunk.done
    local res = chunk.value or ''
    vim.schedule(function()
      render_output(res)
    end)
    if done then
      client:stop()
      vim.defer_fn(function()
        vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)
      end, 50)
    end
  end)
end

local M = {}

local default_keymaps = {
  n = {
    ['<CR>'] = { ':TuneChat<CR>', 'Execute TuneChat' },
    ['<C-CR>'] = { ':TuneChat assistant<CR>', 'Execute TuneChat until assistant answer' },
    ['<Esc>'] = { ':TuneKill<CR>', 'Execute TuneKill' },
    ['<C-c>'] = { ':TuneKill<CR>', 'Execute TuneKill' },
  },
  i = {
    ['<S-CR>'] = { '<Esc>:TuneChat<CR>', 'Execute TuneChat in Insert Mode' },
    ['<S-C-CR>'] = { '<Esc>:TuneChat assistant<CR>', 'Execute TuneChat in Insert Mode until assistant answer' },
    ['<C-c>'] = { '<Esc>:TuneKill<CR>', 'Execute TuneKill in Insert Mode' },
  },
}

local function setup_buffer(opts)
  local keymaps = vim.tbl_deep_extend('force', default_keymaps, opts.keymaps or {})
  vim.api.nvim_buf_create_user_command(0, 'TuneChat', tune_chat, { nargs = '?' })
  vim.api.nvim_buf_create_user_command(0, 'TuneSave', tune_save, { nargs = '?' })
  vim.api.nvim_buf_create_user_command(0, 'TuneKill', tune_kill, {})

  vim.bo.fileencoding = 'utf-8'
  for mode, mappings in pairs(keymaps) do
    for lhs, rhs in pairs(mappings) do
      if rhs ~= false then
        local kopts = { noremap = true, silent = true, desc = rhs[2], buffer = true }
        vim.keymap.set(mode, lhs, rhs[1], kopts)
      end
    end
  end
end

local function setup(opts)
  local keymaps = vim.tbl_deep_extend('force', default_keymaps, opts.keymaps or {})  vim.api.nvim_create_augroup('ChatAutoComplete', { clear = true })
  -- Make TuneNew a global command so it's available even when no chat buffer exists
  vim.api.nvim_create_user_command('TuneNew', tune_new, { nargs = '?' })
  
  -- Setup text objects
  local textobjects = require('tune.textobjects')
  textobjects.setup()
  
  if vim.bo.filetype == 'chat' then
    setup_buffer(opts)
  end
  vim.api.nvim_create_autocmd('FileType', {
    group = 'ChatAutoComplete',
    pattern = 'chat',
    callback = function()
      setup_buffer(opts)
    end,
  })

  local ok, parsers = pcall(require, 'nvim-treesitter.parsers')
  if not ok then return false end
  local parser_config = parsers.get_parser_configs()
  parser_config.chat = {
    install_info = {
      url = 'https://github.com/iovdin/tree-sitter-chat',
      files = { 'src/parser.c' },
      branch = 'master',
    },
    filetype = 'chat',
  }
end

function M.setup(opts)
  setup(opts or {})
end


local ok, cmp = pcall(require, 'cmp')
if ok then
  local source = require('tune.source')
  local client, err = spawn_tune()
  if not err and client then
    cmp.register_source('tune', source.new(client))
  end

end

return M
