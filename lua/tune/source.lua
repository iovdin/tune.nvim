local MySource = {}
MySource.new = function(client)
  MySource.client = client
  local self = setmetatable({}, { __index = MySource })
  return self
end

function MySource:is_available()
  return true
end

-- function MySource:get_trigger_characters()
--   return {'@'}
-- end

function MySource:complete(params, callback)
  -- vim.notify(vim.inspect(params))
  local line = params.context.cursor_line
  local col = params.context.cursor.col
  local before_cursor = line:sub(1, col - 1)
  
  -- Check for snippet patterns first
  local snippet_match = before_cursor:match("^([usc])$")
  
  if snippet_match then
    local snippets = {
      u = { label = "user:", insertText = "user:\n", kind = 15 }, -- Snippet kind
      s = { label = "system:", insertText = "system:\n", kind = 15 },
      c = { label = "comment:", insertText = "c: -----------------------------------------\n", kind = 15 }
    }
    
    local snippet = snippets[snippet_match]
    if snippet then
      callback({snippet})
      return
    end
  end
  
  local at_start = before_cursor:find("@[^@]*$")

  local mention = nil
  if at_start then
    local after_at = line:sub(at_start + 1)
    mention = after_at:match("^%S*")
  end

  if not mention then
    callback({})
    return
  end
  self.client.suggest({ query = mention}, false, function(err, result)
    if err then
      vim.notify(vim.json.encode(err))
      return callback ({})
    end
    -- vim.notify(vim.inspect(result))
    local res = { 
      -- { label = "user:\n" }, 
      -- { label = "system:\n" },
      -- { label = "system:\n" }
    }
    for _, item in pairs(result) do
      table.insert(res, {
        label = item.name, 
        type = item.type,
        menu = "[" .. (item.source or "") .. "]",
        dup = true
      })
    end

    callback(res)
  end)

end

return MySource
