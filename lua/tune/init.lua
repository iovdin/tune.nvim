local uv = (vim.uv or vim.loop)
-- Define highlight group for the text being generated
local ns_id = vim.api.nvim_create_namespace('tune_generating_text')

-- TODO:
-- add markdown syntax support (inject syntax?)
-- 3. test on new config
-- 2. option for filenames on/off
-- 3. option for schema generation on/off
-- 4. which node
-- no functioncall streaming, why?
-- configure errors as assistant output or tool result output
-- rename to TuneRespond
-- TuneResond auto - to run until assistant answr
-- configurable hotkeys
-- 1. escape to stop, multiple enters?
-- sometimes just stops and does not answer
-- 2. no syntax highlighting 

local kill_cmd  = ':TuneKill<CR>'
local tune_temp = {}
local tune_pid = {}
local folds = {}

local function tune_kill()
  local bufnr = vim.api.nvim_get_current_buf()
  local pid = tune_pid[bufnr]
  if pid ~= nil then
    -- print("kill " .. pid)
    uv.kill(pid, "sigkill")
    tune_pid[bufnr] = nil
  end
end

function slice(array, start, stop)
    local result = {}
    for i = start, (stop or #array) do
        result[#result + 1] = array[i]
    end
    return result
end

local function text2roles(lines)
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

  local result = {}
  local prev_role = nil
  for index, item in ipairs(lines) do
    role, content = item:match('^([%a_]+):(.*)')
    if role and roles[role]  then
      if prev_role then
        prev_role['end'] = index - 1
      end

      prev_role = {
        start = index,
        role = role,
        content = content
      } 
      table.insert(result, prev_role)
    end


    if prev_role then
      prev_role['end'] = #lines
    end
  end
  return result
end

local function set_cursor(bufnr, row, col)
   if row > vim.api.nvim_buf_line_count(bufnr) then
     return
   end
   local win = vim.fn.bufwinid(bufnr)

   if win ~= nil then
      vim.api.nvim_win_set_cursor(win, {row, col})
   end
end

local tool_call_fold = {
  tc = true,
  tool_call = true,
  tr = true,
  tool_result = true
}
local function perform_autofolding(bufnr, lines, start_pos, shift, skip_last)
  if lines == nil then
    lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  end
  folds[bufnr] = folds[bufnr] or {}
  local buf_folds = folds[bufnr]
  shift = shift or 1
  start_pos = start_pos or 0
  local roles = text2roles(lines)
  for index, role in ipairs(roles) do
    if skip_last and index == #roles then
      break
    end
    local first_line = lines[role['start']]
    if ((role['end'] - role['start']) > 8 or #first_line > 80) and tool_call_fold[role.role] then
      local start = role['start'] + start_pos
      if #first_line <=80 then
        start = start + 2
      end
      local finish = role['end'] + start_pos  
      local fold = string.format("%d,%d", start, finish)
      local fstart = buf_folds[start] or -1

      if fstart ~= finish then
        -- vim.api.nvim_command(fold .. "fold")
        buf_folds[start] = finish
      end
    end
  end
  if #roles > 0 then
    return roles[#roles].start 
  end
  return 1
end


local function tune_chat(opts, callback)
  tune_kill()
  local stop = "step"
  if #opts.args > 0 then
    stop = opts.args
  end


  local filename = vim.fn.expand("%:p") -- Full path of the current buffer
  local bufnr = vim.api.nvim_get_current_buf()
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  local winnr = vim.api.nvim_get_current_win()
  local line = vim.fn.line(".") - 1 -- Current line number
  local script_path = debug.getinfo(1, "S").source:sub(2)
  local dirname = vim.fn.fnamemodify(script_path, ":h")

  local delimiter = package.config:sub(1,1)  -- Will be '\\' on Windows, '/' on Unix-like systems
  local path_separator = vim.loop.os_uname().sysname == "Windows_NT" and ";" or ":"

  local s_start = nil
  local s_end = #lines
  local split = nil
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
  --print(vim.inspect(text2roles(lines)))
  for index, item in ipairs(lines) do
    index = index - 1
    role, content = item:match('^([%a_]+):(.*)')
    if role and roles[role]  then

      if s_start == nil and index > line then
        s_start = index
      end
      if  (role == "comment" or role == "c") and content:match('%s*%-%-%-.*') ~= nil and index > line and s_end == #lines then
        s_end = index
      end
    end
  end
  if s_start == nil then
    s_start = s_end
  end


  folds[bufnr] = {}

  local TUNE_PATH = ({
    vim.fn.getcwd(),
    dirname,
  })

  local env = vim.loop.os_environ()
  if env.TUNE_PATH then
    table.insert(TUNE_PATH, 2, env.TUNE_PATH)
  end

  env.TUNE_PATH = table.concat(TUNE_PATH, path_separator)

  local env_array = {}
  for key, value in pairs(env) do
    table.insert(env_array, key .. "=" .. value)
  end
  env = env_array

  local run_script =  dirname .. "/run.js"

  -- local cwd = uv.getcwd()
  local stdout = uv.new_pipe(false)
  local stdin = uv.new_pipe(false)
  local stderr = uv.new_pipe(false)
  local channel = uv.new_pipe(false)
  local timer = uv.new_timer()
  -- local last_role = nil
  local num_changes = 0
  local completion = nil
  local new_lines = nil
  local handle, pid

  handle, pid = uv.spawn("node", {
    args = { run_script, filename, line },
    stdio = { stdin, stdout, stderr, channel },
    env = env
  }, function(code, signal)
      stdout:close()
    stderr:close()
    stdin:close()
    channel:close()
    
    -- Clear the highlighting when generation is complete
    vim.schedule(function()
      vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)
    end)

    -- handle:close()
      --
    -- print("on end " .. pid)
    if tune_pid[bufnr] == pid then
      tune_pid[bufnr] = nil
    end


    vim.schedule(function()
      if split == nil or tune_pid[bufnr] ~= nil then
        return
      end


      if completion == nil then
        new_lines = { }
      else
        new_lines = vim.split(completion, "\n", { trimempty = false })
      end


      --if last_role == "assistant" then
      --  new_lines[#new_lines+1] = "u:  "
      --end

      -- vim.cmd("earlier " ..  num_changes)
      -- vim.api.nvim_buf_set_lines(bufnr, split["mid"], split["end"], true, new_lines)
      if s_start == nil then
        s_start = split["mid"]
        s_end = split["end"]
      end
      vim.api.nvim_buf_set_lines(bufnr, s_start, s_end, true, new_lines)
      s_end = split["mid"] + #new_lines 
      col = 0
      if #new_lines > 0 then
          col = #new_lines[#new_lines]
      end
      set_cursor(bufnr, s_end, col)

      perform_autofolding(bufnr)
    end)


    if callback then
      callback(code, signal)
    end
  end)


  tune_pid[bufnr] = pid
  -- print("start " .. pid)

  --push_key('<Esc>')
  --push_key('<C-c>')
  stdin:write(vim.json.encode({ input = table.concat(lines, "\n"), stop = stop}))
  
    -- Timer function removed - we'll highlight directly when data arrives

  uv.read_start(stdout, function(err, data)
    assert(not err, err)
    if data then
      print("stdout: " .. data)
    end
  end)
  local input_data = ""
  local shift = 1
  uv.read_start(channel, function(err, chunk)
    assert(not err, err)
    if chunk == nil then
      return
    end
    input_data = input_data .. chunk

    local data_lines = vim.split(input_data, "\n", { trimempty = true})
    -- print(data)
    local success, parsed = pcall(vim.json.decode, data_lines[#data_lines])
    if success == nil then
      print("data " .. input_data)
      print("parsed " .. parsed)
      exit()
      return
    end

    split = parsed.split
    -- last_role = parsed.lastRole

    if split == nil then
      return
    end

    if s_start == nil then
      s_start = split["mid"]
      s_end = split["end"]
    end

    completion = parsed.output
    -- Apply highlighting to the generated text
    vim.schedule(function()
      if not completion or #completion == 0 then
        return
      end
      -- First, clear any existing highlights in the namespace
      vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)

      -- Set the generated text in the buffer
      local new_lines = vim.split(completion, "\n", { trimempty = false })
      local sl = slice(new_lines, shift)
      vim.api.nvim_buf_set_lines(bufnr, s_start + shift - 1, s_end, true, sl)
      s_end = s_start + #new_lines

      -- Apply highlighting to each line of the generated text
      for line_num = shift, #new_lines do
        local line = new_lines[line_num]
        vim.api.nvim_buf_add_highlight(bufnr, ns_id, "CursorLine", line_num + s_start -1, 0, #line)
      end

      shift = perform_autofolding(bufnr, new_lines, s_start, shift, true)
      set_cursor(bufnr, s_end, 0)
    end)

  end)


  uv.read_start(stderr, function(err, data)
    assert(not err, err)
    if data then
      print("stderr: " .. data)
    end
  end)
end

local M = {}

local default_keymaps = {
  n = {
    ["<CR>"] = { ":TuneChat<CR>", "Execute TuneChat" },
    ["<C-CR>"] = { ":TuneChat assistant<CR>", "Execute TuneChat until assistant answer" },
    ["<Esc>"] = { ":TuneKill<CR>", "Execute TuneKill" },    -- New keymap
    ["<C-c>"] = { ":TuneKill<CR>", "Execute TuneKill" },  -- New keymap
  },
  i = {
    ["<S-CR>"] = { "<Esc>:TuneChat<CR>", "Execute TuneChat in Insert Mode" },
    ["<S-C-CR>"] = { "<Esc>:TuneChat assistant<CR>", "Execute TuneChat in Insert Mode until assistant answer" },
    ["<C-c>"] = { "<Esc>:TuneKill<CR>", "Execute TuneKill in Insert Mode" },  -- New keymap
  },
}


local function tune_save()
  -- This is a placeholder for your implementation
  -- You will implement the actual functionality yourself
  print("TuneSave command called")
end


local function setup_buffer(opts)
  local keymaps = vim.tbl_deep_extend("force", default_keymaps, opts.keymaps or {})
  vim.api.nvim_buf_create_user_command(0, "TuneChat", tune_chat, { nargs = '?'})
  vim.api.nvim_buf_create_user_command(0, "TuneKill", tune_kill, {})
  vim.api.nvim_buf_create_user_command(0, "TuneSave", tune_save, {})

  vim.bo.fileencoding = "utf-8"

  -- Perform autofolding when buffer is loaded
  local bufnr = vim.api.nvim_get_current_buf()

  perform_autofolding(bufnr)

  -- how to overwrite these keymaps
  for mode, mappings in pairs(keymaps) do
    for lhs, rhs in pairs(mappings) do
      if rhs ~= false then
        local opts = {
          noremap = true,
          silent = true,
          desc = rhs[2],
          buffer = true, -- Buffer-local
        }
        vim.keymap.set(mode, lhs, rhs[1], opts)
      end
    end
  end
end



local function setup(opts)
  local keymaps = vim.tbl_deep_extend("force", default_keymaps, opts.keymaps or {})

  vim.api.nvim_create_augroup("ChatAutoComplete", { clear = true })

  if vim.bo.filetype == "chat" then
    setup_buffer(opts)
  end

  vim.api.nvim_create_autocmd("FileType", {
    group = "ChatAutoComplete",
    pattern = "chat",
    callback = function()
       setup_buffer(opts)
    end,
  })
  
  -- Add an autocmd for when a file is opened
  vim.api.nvim_create_autocmd("BufReadPost", {
    group = "ChatAutoComplete",
    pattern = "*.chat",
    callback = function()
      local bufnr = vim.api.nvim_get_current_buf()
      perform_autofolding(bufnr)
    end,
  })




  local ok, parsers = pcall(require, "nvim-treesitter.parsers")
  if not ok then
    -- nvim-treesitter is not installed
    return false
  end

  local parser_config = parsers.get_parser_configs()

  parser_config.chat = {
    install_info = {
      url = "https://github.com/iovdin/tree-sitter-chat",
      --url = "~/projects/tree-sitter-chat", -- local path or git repo
      files = {"src/parser.c"}, -- note that some parsers also require src/scanner.c or src/scanner.cc
      branch = "master", -- default branch in case of git repo if different from master
      -- generate_requires_npm = false, -- if stand-alone parser without npm dependencies
      -- requires_generate_from_grammar = false, -- if folder contains pre-generated src/parser.c
    },
    filetype = "chat",
  }
end



-- Core plugin functionality
function M.setup(opts)
  setup(opts or {})
end

return M
