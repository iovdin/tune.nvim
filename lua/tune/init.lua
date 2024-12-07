local uv = (vim.uv or vim.loop)
local progress_chars = { '⠟', '⠯', '⠷', '⠾', '⠽', '⠻' } 
local progress_index = 0

local get_progress = function()
  progress_index = (progress_index + 1) % #progress_chars
  return progress_chars[progress_index + 1]
end

-- TODO:
-- add {} to highlight syntax
-- add  c: ---- highlight syntax
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

local function tune_kill()
  local bufnr = vim.api.nvim_get_current_buf()
  local pid = tune_pid[bufnr]
  if pid ~= nil then
    -- print("kill " .. pid)
    uv.kill(pid, "sigkill")
    tune_pid[bufnr] = nil
  end
end

local function getkey(key)
  local keymaps = vim.api.nvim_get_keymap('n')
  for _, map in ipairs(keymaps) do
    -- Compare the lhs (left-hand side) with the desired key
    if map.lhs == key then
      return map.rhs
    end
  end
end

local function restore_key(key)
    local cur_key = getkey(key)
    if cur_key then
      if tune_temp[key] then
        vim.api.nvim_set_keymap('n', key, tune_temp[key], { noremap = true, silent = true })
        tune_temp[key] = nil
      else
        vim.api.nvim_del_keymap('n', key)
      end
    end
end

local function push_key(key)
  local cur_key = getkey(key)
  if cur_key ~= nil and cur_key ~= kill_cmd  then
    tune_temp[key] = cur_key
  end
  vim.api.nvim_set_keymap('n', key, kill_cmd, { noremap = true, silent = true })
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

local function tune_chat(opts, callback)
  tune_kill()

  local filename = vim.fn.expand("%:p") -- Full path of the current buffer
  local bufnr = vim.api.nvim_get_current_buf()
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  local winnr = vim.api.nvim_get_current_win()
  local line = vim.fn.line(".") - 1 -- Current line number
  local script_path = debug.getinfo(1, "S").source:sub(2)
  local dirname = vim.fn.fnamemodify(script_path, ":h")

  local delimiter = package.config:sub(1,1)  -- Will be '\\' on Windows, '/' on Unix-like systems
  local path_separator = vim.loop.os_uname().sysname == "Windows_NT" and ";" or ":"

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
  local s_end = nil
  local s_start = nil
  local split = nil
  local last_role = nil
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
    timer:stop()
    timer:close()

    -- handle:close()
      --
    -- print("on end " .. pid)
    if tune_pid[bufnr] == pid then
      tune_pid[bufnr] = nil
    end

    vim.schedule(function()
      restore_key('<Esc>')
      restore_key('<C-c>')
      if new_lines == nil or split == nil or tune_pid[bufnr] ~= nil then
        return
      end


      if completion == nil then
        new_lines = { }
      else
        new_lines = vim.split(completion, "\n", { trimempty = false })
      end

      if last_role == "assistant" then
        new_lines[#new_lines+1] = "u:  "
      end

      -- vim.cmd("earlier " ..  num_changes)
      -- vim.api.nvim_buf_set_lines(bufnr, split["mid"], split["end"], true, new_lines)
      vim.api.nvim_buf_set_lines(bufnr, s_start, s_end, true, new_lines)
      s_end = split["mid"] + #new_lines 
      col = 0
      if #new_lines > 0 then
          col = #new_lines[#new_lines]
      end
      set_cursor(bufnr, s_end, col)
    end)


    if callback then
      callback(code, signal)
    end
  end)


  tune_pid[bufnr] = pid
  -- print("start " .. pid)

  push_key('<Esc>')
  push_key('<C-c>')
  stdin:write(vim.json.encode({ input = table.concat(lines, "\n")}))
  
  timer:start(0, 100, function()
    if tune_pid[bufnr] ~= pid then
      return
    end
    vim.schedule(function()
      if s_end == nil then
        return
      end
  
      if completion == nil then
        new_lines = { get_progress() }
      else
        new_lines = vim.split(completion, "\n", { trimempty = false })
        new_lines[#new_lines + 1] = get_progress()
      end
      vim.api.nvim_buf_set_lines(bufnr, s_start, s_end, true, new_lines)
      s_end = s_start + #new_lines 
      num_changes = num_changes + 1
      set_cursor(bufnr, s_end, 0)
    end)
  end)
  uv.read_start(stdout, function(err, data)
    assert(not err, err)
    if data then
      print("stdout: " .. data)
    end
  end)
  uv.read_start(channel, function(err, data)
    assert(not err, err)
    if data then
      local data_lines = vim.split(data, "\n", { trimempty = true})
      -- print(data)
      local success, parsed = pcall(vim.json.decode, data_lines[#data_lines])
      if success == nil then
        print(data)
        print(parsed)
        exit()
        return
      end

      split = parsed.split
      last_role = parsed.lastRole

      if split == nil then
         return
      end

      if s_start == nil then
        s_start = split["mid"]
        s_end = split["end"]
      end

      completion = parsed.output
    end
  end)

  uv.read_start(stderr, function(err, data)
    assert(not err, err)
    if data then
      print("stderr: " .. data)
    end
  end)
end

local M = {}

-- Core plugin functionality
function M.setup(opts)
  opts = opts or {}
  print("setup tune.nvim")

  local dest_dir = vim.fn.stdpath("config") .. "/after/queries/chat"
  local dest = dest_dir .. "/highlights.scm"

  -- Create directory if it doesn't exist
  vim.fn.mkdir(dest_dir, "p")

  -- Copy file if it doesn't exist
  local content = [[
((role) @role.user
 (#eq? @role.user "u:"))

((role) @role.assistant
 (#eq? @role.assistant "a:"))

((role) @role.system
 (#eq? @role.system "s:"))

((role) @role.tool_call
 (#eq? @role.tool_call "tc:"))

((role) @role.tool_result
 (#eq? @role.tool_result "tr:"))

((role) @role.comment
 (#eq? @role.comment "c:"))

((role) @role.err
 (#eq? @role.err "err:"))
]]
  if vim.fn.filereadable(dest) == 0 then
      vim.fn.writefile(vim.split(content, "\n"), dest)
  end

  vim.api.nvim_create_augroup("ChatAutoComplete", { clear = true })

  vim.api.nvim_create_autocmd("FileType", {
    group = "ChatAutoComplete",
    pattern = "chat",
    callback = function()
      vim.api.nvim_create_user_command("TuneChat", tune_chat, {})
      vim.api.nvim_create_user_command("TuneKill", tune_kill, {})

      vim.opt.fileencoding = "utf-8"
      vim.api.nvim_buf_set_keymap(0, "n", "<CR>", ":TuneChat<CR>", { noremap = true, silent = true })
      vim.api.nvim_buf_set_keymap(0, "i", "<S-CR>", "<Esc>:TuneChat<CR>", { noremap = true, silent = true })
      vim.api.nvim_set_hl(0, "@role", { fg = 'white', bg = 'gray'})
      vim.api.nvim_set_hl(0, "@role.system", { fg = 'white', bg = 'gray'})
      vim.api.nvim_set_hl(0, "@role.user", { fg = 'white', bg = 'blue'})
      vim.api.nvim_set_hl(0, "@role.assistant", { fg = 'white', bg = 'green'})
      vim.api.nvim_set_hl(0, "@role.tool_call", { fg = 'white', bg = 'gray'})
      vim.api.nvim_set_hl(0, "@role.tool_result", { fg = 'white', bg = 'gray'})
      vim.api.nvim_set_hl(0, "@role.comment", { fg = 'white', bg = 'gray'})
      vim.api.nvim_set_hl(0, "@role.err", { fg = 'white', bg = 'red'})

    end,
  })

  vim.filetype.add({
    extension = {
      chat = "chat",
    }
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

return M
