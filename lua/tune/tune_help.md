You are helping with Tune based on the following document:
BEGIN OF DOCUMENT
Tune extension is a way to chat with llm using your texteditor (vscode).
Because it might be a better interface for chat.

*Chat file*
Chat is a text file with .chat extension.

There is a syntax for chat content
```chat
 s: system prompt
 u: user message
 a: assistant reply
 c: comment
 tc: tool call
 tr: result of a tool call
 err: error that occurred
```

To actually chat with an llm use Shift + Enter when cursor is on the user prompt
i.e.
```chat
 s: You're Groot
 u: hi how are  you? <cursor is here> <Shift> + <Enter>
 c: and llm wil generate assistant's answer like
 a: I am Groot.
```

You can have multiple chats in a single file .chat file
use `c: ---` as delimiter
```chat
 s: You're groot
 u: hi how are you?
 a: I am Groot.
 c: ---
 u: What is the meaning of life?
 a: 42
```

*Variable Expansion*

It is possible to use {name} for variable expansion, variables are kept in files or environment
e.g. there is a file system.txt in the folder
```chat
 s: @system
 u: what is a meaning of life?
```
@system will be expanded with content of system.txt

Tune will read and parse .env files. Varaibles from the .env file will be available in the chat
```chat
 s: You're echo, you print back everythig user writes.
 u: @OPENAI_KEY
 a: <actual value of OPENAI_KEY from env or .env>
```

it is possible to attach images to the chat using variable expansion.
e.g. you have an image.jpg in the folder.
```chat
 u: what is on the picture @image
```

*LLM configuration*
It is possible to use different LLMs with tune. It can be done by providing .llm.js file.
By default Tune will look for default.llm.js file in current folder. and in tune installation folder. 
Here is the one from Tune installation folder:
```javascript
module.exports = async function(payload, ctx) {
  const key = await ctx.read('OPENAI_KEY');
  return ({
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: { 
      "content-type": "application/json",
      authorization: `Bearer ${key}` 
    },
    body: JSON.stringify({ 
      ...payload,
      model: "gpt-4o"
    })
  })
}
```
It is a javascript that is given `payload` variable that contains messages/tools/streaming properties and also environment variables.

Last statement should be full payload object to make a http request.

Payload format is an `openai` format. Streaming the result uses openai format too.
So to use claude you'll have to use e.g. openrouter.ai

Here is how a `claude.llm.js` might look like:
```javascript
module.exports = async function(payload, ctx) {
  // this will read OPENROUTER_KEY from .env file
  const key = await ctx.read('OPENROUTER_KEY');
  return ({
    url: "https://openrouter.ai/api/v1/chat/completions",
    method: "POST",
    headers: { 
      "content-type": "application/json",
      authorization: `Bearer ${key}` 
    },
    body: JSON.stringify({ 
      ...payload,
        model: "anthropic/claude-3.7-sonnet"
    })
  })
}
```



Use variable expansion to apply this config
```chat
 u: @claude what is the meaning of life?
```

By default VScode extension and Neovim plugin if `OPENAI_KEY` is set, all the openai models can be referenced without defining `.llm.js` file, the same is for `OPENROUTER_KEY`
```chat
 s: @gpt-4o-mini 
 c: use open ai model if OPENAI_KEY is set
 s: @anthropic/claude-3.7-sonnet 
 c: use openrouter model if OPENROUTER_KEY is set
```

*Tools*
It is possible to create a use a tool with Tune.

Tools is a script that will LLM can call. 
It can be javascript/python or php script, or even another chat.

The file must have .tool.mjs/cjs/js/py/php/chat extension. 
the default exported function (for javsacript) is used to call the tool. 

Lets create `websearch` tool based on jina.ai api.
here is `websearch.tool.mjs` from example above.
```javascript
export default async function searchWeb({ query }, ctx) {
  const url = `https://s.jina.ai/${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}
````
Always use `ctx.read` to get authentication key from `.env` file do not pass keys as a tool parameter

JSON schema is required to use the tool. It is saved into `websearch.schema.json` next to .mjs file.
If it does not exists Tune will create one based on the code content and LLM prompt.
here is `websearch.schema.json` file:
```json
{
  "description": "Search the web for a specific query",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query"
      }
    },
    "required": ["query"]
  }
}
```

** How to use a tool? **

```chat
 c: first connect the tool using variable expansion
 u: @websearch
what are the latest news? 
 tc: websearch { query: "latest news" }
 c: call of the tool
 tr: <content>
```

for commonjs it should be .tool.js or .tool.cjs file


```javascript
module.exports = async function helloWorld() {
    return "Hello, World!";
}
```

Another tool example: Python code execution
file `py.tool.py`
```python
def main(params): 
  return eval(params['code'])
```

here is how to use it
```chat
 u: @py calculate using python 1 + 2
 tc: py { code: "print(1 + 2)"}
```

If code is large, it is the call become unreadable by human.
Thus Tune treat special named parameter `text` in a different way
Imagine we replaced `code` with `text`. Then you can use it like:
```chat
 u: @py calculate using python 1 + 2
 tc: py
 1 + 2
```
so the parameter is not encoded into json, but used as a text

for php it is `sum.tool.php`
```
<?php
function main($params) {
    return $params['a'] + $params['b'];
}
?>
```

to make tool out of .chat. The expansion variables become parameters of the tool
e.g. lets make a tool that name file based on the content `filename.too.chat`
```chat
 s: You're given text content, please come up with a filename for the content.
 it should use camel case
 u: @text
```

here is how to use it
```chat
 s: @filename 
 tc: filename
 console.log("hello world")
 tr: helloWorld.js
```

By default VScode extension and Neovim plugin have these tools in the package:
@writefile @readfile @sh @patch

*Processors*
Processor is a way to extend tune
```chat
    c: resize or convert an image before it is being sent to llm. 
    u: what is on the picture @{ image | resize 512 }

    c: set initial value of a file if it does not exists yet
    u: knowledge about you
    @{ memory | init empty }

    c: set a model parameterer
    u: @{ openrouter | model deepseek/r1 }

    c: set model output to json_schema
    u: @{ 4o | json_schema path_to/schema.json }

    c: show file with line numbers
    u: @{ src/server.js | linenum }
```

lets implement `init.proc.js`
```javascript
module.exports = async function init(node, args, context) {
    // file "memory" has been found, return as-is
    if (node) {
        return node;
    }
    // file not found, lets return a node that contains 'empty'
    return {
        type: "text",
        read: async() =>(args || "") 
    }
}
```

here is a `model.proc.js` implementation
```javascript
module.exports = async model(node, args, context) =>  {
    // model not found
    if (!node) {
        return
    }
    // clone the node, to keep all additional properties of the original node
    const newNode = Object.assign({}, node);
    // overwrite just the exec function
    newNode.exec = async (payload, ctx) => {
        payload.model = args.trim();
        return node.exec(payload, ctx);
    }
    return newNode;
}
```

By default VScode extension and Neovim plugin have these tools in the package:
`mcp.proc.mjs` - it allows to use model context protocol servers' tools
i.e.
```chat
 s: @{| mcp npx -y @modelcontextprotocol/server-filesystem ./ }
 u: what is in my current directory?
 tc: list_allowed_directories
 tr: Allowed directories:
 /Users/iovdin/projects/tune
 tc: list_directory {"path":"/Users/iovdin/projects/tune"}
 tr: [FILE] .DS_Store
 [DIR] .git
 [DIR] .github
 [FILE] .gitignore
 ...
```


*Context*
With context you have full control over variable expansion
e.g. `web.ctx.js` defines a context middleware that will be used to resolve variables
```javascript
module.exports = async (name, context, args, next) => {
    if (name.indexOf("https://") == -1) {
        return next();
    }
    const url = name.trim()

    // returns a tune node of type 'text'
    return {
        type: "text",
        name,
        read: async () => {
            const res = await fetch(url);
            return res.text()
        }
    }
}
```

```chat
 s: @web
 u: Summarize the content:
 @https://domain.com/file.txt
```

There are 4 types of tune nodes
['text', 'image', 'tool', 'llm', 'processor']
```javascript
// text/image node
{
    type: "text", // or "image"
    name: "OPENROUTER_KEY", // optional
    read: async () => // return text or buffer for image
}


// tool
{   
    type: "tool",
    name: "websearch", // optional
    schema: { description: "...", parameters: { /*... */ }}, // like schema for openai tool
    exec: async (params, context) => { /* actuall function call see websearch.tool.mjs */}
}

// llm
{   
    type: "llm",
    name: "anthropic/calude-3.7-sonnet", // optional
    exec: async ({message, tools, stream}, context) => { /* return fetch payload */}
}

// 
{   
    type: "processor",
    name: "init", // optional
    exec: async (node, args, context) => { /* processor implementation, see init.proc.js */}
}
```

Context middleware can return any of these nodes or array of nodes 


END OF DOCUMENT
