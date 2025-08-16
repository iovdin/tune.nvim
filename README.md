# tune.nvim

A Neovim plugin to chat with LLM in buffer. [Tune](https://github.com/iovdin/tune)

## Demo

<video src="https://github.com/user-attachments/assets/23f8ab30-58db-4159-8761-f212a7960e0c">
</video>

## Quick Start

1. Install the plugin with your preferred package manager
2. Install `npm install -g tune-sdk`
3. Initialize tune-sdk `tune-sdk init` 
4. edit `~/.tune/.env` add `OPENAI_KEY` and other keys
5. Run `:TuneNew` to create a new chat buffer
6. Type your message and press `<CR>` to send
7. Use `:TuneSave` to save your conversation with an AI-generated filename

## Why tune.nvim?

- **Native Editor Experience**: Chat with LLMs using your familiar text editor environment and keybindings
- **File-Based Chat**: Store and organize your conversations in `.chat` files
- **Variable Expansion**: Easily include content from files, environment variables, and even images in your prompts
- **Tool Integration**: Create and use custom tools (Python, JavaScript, PHP, or even chat-based) for extended functionality
- **Flexible LLM Configuration**: Support for different LLM providers through simple configuration files
- **Structured Chat Format**: Clear syntax for different message types (system, user, assistant, etc.)
- **Smart Text Objects**: Navigate and edit chat conversations with purpose-built text objects
- **Autocomplete**: Auto-complete models tools and filenames
- **AI-Generated Filenames**: Automatically generate meaningful filenames for your chat sessions


## Features

### Chat File Format

Use `.chat` files with a clear syntax for different message types:
```chat
system: system prompt
user: user message
assistant: assistant reply
comment: comment
tool_call: tool call
tool_result: result of a tool call
err: error that occurred
```



### Variable Expansion

Include external content in your chats:
```chat
system: 
@system           # Expand from system.txt
user: 
describe @image   # Include images
```


### Commands

- `:TuneNew [system_prompt]` - Create a new chat buffer (optionally with a system prompt)
- `:TuneChat [stop]` - Execute chat completion (stops at 'step' by default, or 'assistant' if specified)
- `:TuneSave` - Save buffer with an AI-generated filename
- `:TuneKill` - Cancel ongoing generation

### Default Keymaps

- `<CR>` in normal mode: Execute TuneChat
- `<C-CR>` in normal mode: Execute TuneChat until assistant answer
- `<S-CR>` in insert mode: Execute TuneChat
- `<S-C-CR>` in insert mode: Execute TuneChat until assistant answer
- `<Esc>` or `<C-c>` in any mode: Cancel generation

You can customize the keymaps in your configuration:

```lua
require("tune").setup({
  keymaps = {
    n = {
      ["<CR>"] = { ":TuneChat<CR>", "Execute TuneChat" },
      ["<C-CR>"] = { ":TuneChat assistant<CR>", "Execute TuneChat until assistant answer" },
      ["<Esc>"] = { ":TuneKill<CR>", "Execute TuneKill" },
      ["<C-c>"] = { ":TuneKill<CR>", "Execute TuneKill" },
    },
    i = {
      ["<S-CR>"] = { "<Esc>:TuneChat<CR>", "Execute TuneChat in Insert Mode" },
      ["<S-C-CR>"] = { "<Esc>:TuneChat assistant<CR>", "Execute TuneChat in Insert Mode until assistant answer" },
      ["<C-c>"] = { "<Esc>:TuneKill<CR>", "Execute TuneKill in Insert Mode" },
    },
  }
})
```

### Text Objects

The plugin provides custom text objects for easier navigation and editing in chat files:

- `ar` / `ir` - Around/inner role content (select entire role block or just content)
- `ac` / `ic` - Around/inner chat conversation (select entire chat or just content between separators)
- `at` / `it` - Around/inner tail (select from cursor to end of current chat)

Examples:
- `var` - Select around current role (including the role header)
- `vir` - Select just the content of current role
- `dac` - Delete entire current chat conversation
- `cit` - Change content from cursor to end of chat

### Completion Support

The plugin integrates with [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) to provide:

1. **Snippet completion**: Type `u`, `s`, or `c` and press your completion key to expand to role headers
2. **Variable completion**: Type `@` followed by partial variable names to see available expansions

Built-in variables include:
- `@editor/filename` - Current file path
- `@editor/buffer` - Current buffer content
- `@editor/buffers` - List of all open buffers
- `@editor/selection` - Currently selected text


## Installation

### Prerequisites

Before installing, ensure you have:
- Neovim >= 0.8.0
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) installed
- [tune-sdk](https://github.com/iovdin/tune) installed globally `npm install -g tune-sdk`  

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
},
```

### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

```lua
use {
  'iovdin/tune.nvim',
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

2. (Optional) For completion support, ensure you have [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) installed and add the tune source:

```lua
{
  "hrsh7th/nvim-cmp",
  config = function()
    local cmp = require('cmp')
    cmp.setup({
      sources = cmp.config.sources({
        { name = 'tune' },  -- Add tune completion source
        -- your other sources...
      })
    })
  end
}
```
