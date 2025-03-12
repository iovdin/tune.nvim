# tune.nvim

A Neovim plugin to chat with LLM in buffer.

## Demo

<img src="https://github.com/iovdin/tune/blob/770f382a03a25e15eeef293f553b6aee0f3531f6/docs/assets/gifs/tune.gif">

## Why tune.nvim?

- **Native Editor Experience**: Chat with LLMs using your familiar text editor environment and keybindings
- **File-Based Chat**: Store and organize your conversations in `.chat` files
- **Variable Expansion**: Easily include content from files, environment variables, and even images in your prompts
- **Tool Integration**: Create and use custom tools (Python, JavaScript, PHP, or even chat-based) for extended functionality
- **Flexible LLM Configuration**: Support for different LLM providers through simple configuration files
- **Structured Chat Format**: Clear syntax for different message types (system, user, assistant, etc.)


## Features

### Chat File Format

Use `.chat` files with a clear syntax for different message types:
```chat
 s: system prompt
 u: user message
 a: assistant reply
 c: comment
 tc: tool call
 tr: result of a tool call
 err: error that occurred
```

### Variable Expansion

Include external content in your chats:
```chat
 s: @system           # Expand from system.txt
 u: @env_variable     # Use environment variables
 u: describe @image   # Include images
```

### Multiple Chats

Separate multiple conversations in a single file:
```chat
 s: You're groot
 u: hi how are you?
 a: I am Groot.
 c: ---
 u: What is the meaning of life?
 a: 42
```

### Default Keymaps

- `<CR>` in normal mode: Execute TuneChat
- `<S-CR>` in insert mode: Execute TuneChat
- `<Esc>` or `<C-c>` in any mode: Cancel generation

You can customize the keymaps in your configuration:

```lua
require("tune").setup({
  keymaps = {
    n = {
      ["<CR>"] = { ":TuneChat<CR>", "Execute TuneChat" },
      ["<Esc>"] = { ":TuneKill<CR>", "Execute TuneKill" },
      ["<C-c>"] = { ":TuneKill<CR>", "Execute TuneKill" },
    },
    i = {
      ["<S-CR>"] = { "<Esc>:TuneChat<CR>", "Execute TuneChat in Insert Mode" },
      ["<C-c>"] = { "<Esc>:TuneKill<CR>", "Execute TuneKill in Insert Mode" },
    },
  }
})
```


## Installation

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
