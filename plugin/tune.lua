if vim.g.loaded_tune then
  return
end
vim.g.loaded_tune = true

vim.api.nvim_set_hl(0, "@role", { fg = 'white', bg = 'gray'})
vim.api.nvim_set_hl(0, "@role.system", { fg = 'white', bg = 'gray'})
vim.api.nvim_set_hl(0, "@role.user", { fg = 'white', bg = 'blue'})
vim.api.nvim_set_hl(0, "@role.assistant", { fg = 'white', bg = 'green'})
vim.api.nvim_set_hl(0, "@role.tool_call", { fg = 'white', bg = 'gray'})
vim.api.nvim_set_hl(0, "@role.tool_result", { fg = 'white', bg = 'gray'})
vim.api.nvim_set_hl(0, "@role.comment", { fg = 'white', bg = 'gray'})
vim.api.nvim_set_hl(0, "@role.err", { fg = 'white', bg = 'red'})
