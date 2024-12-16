## Installation

There are several ways to install this plugin:

### Prerequisites

Before installing, ensure you have:
- Neovim >= 0.8.0
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) installed

### Using [lazy.nvim](https://github.com/folke/lazy.nvim) (recommended)

Add this to your Neovim configuration:

```lua
{
  "iovdin/tune.nvim",
  dependencies = {
    'iovdin/tree-sitter-chat',
    'nvim-treesitter/nvim-treesitter'
  },
  config = function() 
    require("tune").setup({})
  end,
  ft = { "chat" }
},
```

### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

```lua
use {
  'iovdin/tune.nvim',
  ft = { 'chat' },
  config = function() 
    require("tune").setup({})
  end,
  requires = {
    'nvim-treesitter/nvim-treesitter',
    'iovdin/tree-sitter-chat'
  },
}
```

### Using [vim-plug](https://github.com/junegunn/vim-plug)

Add this to your init.vim:

```vim
call plug#begin('~/.config/nvim/plugged')

" Install nvim-treesitter and run :TSUpdate after installation
Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

" Install tree-sitter-chat parser
Plug 'iovdin/tree-sitter-chat'

" Install tune.nvim and lazy-load it for 'chat' filetype
Plug 'iovdin/tune.nvim', { 'for': 'chat' }

call plug#end()

" Initialize tune.nvim for 'chat' filetype
augroup TuneSetup
  autocmd!
  autocmd FileType chat lua require("tune").setup({})
augroup END
```

### Post-installation Setup

After installation, make sure to:

1. Add "chat" to your nvim-treesitter configuration:

```lua
{
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function () 
        local configs = require("nvim-treesitter.configs")
        configs.setup({
            ensure_installed = { "c", "lua", "vim", "vimdoc", "javascript", "html", "css", "python", "typescript", "chat"},
            sync_install = false,
            highlight = { enable = true },
            indent = { enable = true },  
        })
    end
},
```

Alternatively, you can install the chat parser manually after installation:

```
:TSInstall chat
```
