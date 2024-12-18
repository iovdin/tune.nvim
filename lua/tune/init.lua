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
      if split == nil or tune_pid[bufnr] ~= nil then
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
    end)


    if callback then
      callback(code, signal)
    end
  end)


  tune_pid[bufnr] = pid
  -- print("start " .. pid)

  --push_key('<Esc>')
  --push_key('<C-c>')
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

local default_keymaps = {
  n = {
    ["<CR>"] = { ":TuneChat<CR>", "Execute TuneChat" },
    ["<Esc>"] = { ":TuneKill<CR>", "Execute TuneKill" },    -- New keymap
    ["<C-c>"] = { ":TuneKill<CR>", "Execute TuneKill" },  -- New keymap
  },
  i = {
    ["<S-CR>"] = { "<Esc>:TuneChat<CR>", "Execute TuneChat in Insert Mode" },
    ["<C-c>"] = { "<Esc>:TuneKill<CR>", "Execute TuneKill in Insert Mode" },  -- New keymap
  },
}


local function setup_buffer(opts)

  local keymaps = vim.tbl_deep_extend("force", default_keymaps, opts.keymaps or {})
    vim.api.nvim_buf_create_user_command(0, "TuneChat", tune_chat, {})
    vim.api.nvim_buf_create_user_command(0, "TuneKill", tune_kill, {})

      vim.bo.fileencoding = "utf-8"
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
