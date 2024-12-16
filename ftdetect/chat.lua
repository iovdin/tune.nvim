vim.filetype.add({
  extension = {
    chat = "chat",
  }
})


local ok, parsers = pcall(require, "nvim-treesitter.parsers")
if ok then
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
