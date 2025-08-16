local M = {}

-- Helper function to find role boundaries
local function find_role_bounds(line_num)
  local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
  local roles = {
    c = true, comment = true, s = true, system = true,
    u = true, user = true, a = true, assistant = true,
    tc = true, tool_call = true, tr = true, tool_result = true,
    err = true, error = true,
  }
  
  local start_line = nil
  local end_line = #lines
  
  -- Find previous role (start)
  for i = line_num, 1, -1 do
    local line = lines[i]
    if line then
      local role = line:match('^([%a_]+):')
      if role and roles[role] then
        start_line = i
        break
      end
    end
  end
  
  -- Find next role (end)
  for i = line_num + 1, #lines do
    local line = lines[i]
    if line then
      local role = line:match('^([%a_]+):')
      if role and roles[role] then
        end_line = i - 1
        break
      end
    end
  end
  
  return start_line, end_line
end

-- Helper function to find chat bounds (between c: --- lines or buffer bounds)
local function find_chat_bounds(line_num)
  local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
  local start_line = 1
  local end_line = #lines
  local header_line = nil
  
  -- Find previous c: --- line (start)
  for i = line_num, 1, -1 do
    local line = lines[i]
    if line then
      local role, content = line:match('^([%a_]+):(.*)')
      if role and (role == "comment" or role == "c") and content:match('%s*%-%-%-.*') then
        start_line = i + 1  -- Content starts after the header
        header_line = i
        break
      end
    end
  end
  
  -- Find next c: --- line (end)
  for i = line_num + 1, #lines do
    local line = lines[i]
    if line then
      local role, content = line:match('^([%a_]+):(.*)')
      if role and (role == "comment" or role == "c") and content:match('%s*%-%-%-.*') then
        end_line = i - 1
        break
      end
    end
  end
  
  return start_line, end_line, header_line
end

-- Text object for role (r)
local function select_role(inner)
  local cursor_line = vim.fn.line('.')
  local start_line, end_line = find_role_bounds(cursor_line)
  
  if not start_line then
    return
  end
  
  if inner then
    -- Inner: just the text between roles (skip the role: line)
    start_line = start_line + 1
  end
  -- Outer: include the role: line + text
  
  -- Convert to 0-based for API calls, but keep 1-based for cursor
  vim.api.nvim_buf_set_mark(0, '<', start_line, 0, {})
  vim.api.nvim_buf_set_mark(0, '>', end_line, vim.fn.col({end_line, '$'}) - 1, {})
  vim.cmd('normal! gv')
end

-- Text object for chat (c)
local function select_chat(inner)
  local cursor_line = vim.fn.line('.')
  local start_line, end_line, header_line = find_chat_bounds(cursor_line)
  
  if inner then
    -- Inner: just the chat content between c: --- lines
    vim.api.nvim_buf_set_mark(0, '<', start_line, 0, {})
    vim.api.nvim_buf_set_mark(0, '>', end_line, vim.fn.col({end_line, '$'}) - 1, {})
  else
    -- Outer: include the header line if it exists
    local actual_start = header_line or start_line
    vim.api.nvim_buf_set_mark(0, '<', actual_start, 0, {})
    vim.api.nvim_buf_set_mark(0, '>', end_line, vim.fn.col({end_line, '$'}) - 1, {})
  end
  
  vim.cmd('normal! gv')
end

-- Text object for tail (t) - from cursor to end of chat
local function select_tail(inner)
  local cursor_line = vim.fn.line('.')
  local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
  local roles = {
    c = true, comment = true, s = true, system = true,
    u = true, user = true, a = true, assistant = true,
    tc = true, tool_call = true, tr = true, tool_result = true,
    err = true, error = true,
  }
  
  -- Find the current or previous role line as start
  local start_line = cursor_line
  for i = cursor_line, 1, -1 do
    local line = lines[i]
    if line then
      local role = line:match('^([%a_]+):')
      if role and roles[role] then
        start_line = i
        break
      end
    end
  end
  
  -- Find end of chat (next c: --- line or buffer end)
  local end_line = #lines
  for i = cursor_line + 1, #lines do
    local line = lines[i]
    if line then
      local role, content = line:match('^([%a_]+):(.*)')
      if role and (role == "comment" or role == "c") and content:match('%s*%-%-%-.*') then
        end_line = i - 1
        break
      end
    end
  end
  
  if inner then
    -- Inner: skip the role line, just the content
    start_line = start_line + 1
  end
  -- Outer: include the role line
  
  vim.api.nvim_buf_set_mark(0, '<', start_line, 0, {})
  vim.api.nvim_buf_set_mark(0, '>', end_line, vim.fn.col({end_line, '$'}) - 1, {})
  vim.cmd('normal! gv')
end

function M.setup()
  -- Role text objects
  vim.keymap.set({'o', 'x'}, 'ir', function() select_role(true) end, { desc = 'Inner role content' })
  vim.keymap.set({'o', 'x'}, 'ar', function() select_role(false) end, { desc = 'Around role (with header)' })
  
  -- Chat text objects  
  vim.keymap.set({'o', 'x'}, 'ic', function() select_chat(true) end, { desc = 'Inner chat content' })
  vim.keymap.set({'o', 'x'}, 'ac', function() select_chat(false) end, { desc = 'Around chat (with header)' })
  
  -- Tail text objects
  vim.keymap.set({'o', 'x'}, 'it', function() select_tail(true) end, { desc = 'Inner tail (from cursor to end)' })
  vim.keymap.set({'o', 'x'}, 'at', function() select_tail(false) end, { desc = 'Around tail (include role header)' })
end

return M