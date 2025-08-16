
function pick(tbl, keys)
  local result = {}
  for _, key in ipairs(keys) do
    if tbl[key] ~= nil then
      result[key] = tbl[key]
    end
  end
  return result
end

local evars = { 
  ["editor/filename"] = {
    name = "filename",
    fullname = "editor/filename",
    type = "text",
    read = function()
      return vim.api.nvim_buf_get_name(0)
    end
  },
  ["editor/buffer"] = {
    name = "buffer",
    fullname = "editor/buffer",
    type = "text",
    read = function()
      return table.concat(vim.api.nvim_buf_get_lines(0, 0, -1, false), "\n")
    end
  },
  ["editor/buffers"] = {
    name = "buffers",
    fullname = "editor/buffers",
    type = "text",
    read = function()
      lines = {}
      for _, bufnr in pairs(vim.api.nvim_list_bufs()) do
        table.insert(lines, bufnr .. " " .. vim.api.nvim_buf_get_name(bufnr))
      end
      return table.concat(lines , "\n")
    end
  },
  ["editor/selection"] = {
    name = "selection",
    fullname = "editor/selection",
    type = "text",
    read = function()
      -- Get the positions of the start and end of the visual selection
      local start_pos = vim.fn.getpos("'<")
      local end_pos = vim.fn.getpos("'>")

      local start_line = start_pos[2]
      local start_col = start_pos[3]
      local end_line = end_pos[2]
      local end_col = end_pos[3]

      -- Get lines in selection range
      local lines = vim.api.nvim_buf_get_lines(0, start_line - 1, end_line, false)

      if #lines == 0 then return '' end

      -- If selection is single-line, slice the line
      if #lines == 1 then
        lines[1] = string.sub(lines[1], start_col, end_col)
      else
        -- For multi-line selection, crop start and end lines based on columns
        lines[1] = string.sub(lines[1], start_col)
        lines[#lines] = string.sub(lines[#lines], 1, end_col)
      end

      return table.concat(lines, '\n')
    end
  }
}
local context = {}
context.resolve = function(params)
  if evars[params.name] then
    return pick(evars[params.name], {'name', 'fullname', 'type'})
  end

  return { error = "not found" }
end
context.read = function(params)
  if evars[params.name] then
    return evars[params.name].read()
  end

  return { error = "not found" }
end

return context 
