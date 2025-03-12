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
 error: error that occurred
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

It is possible to use @name for variable expansion, variables are kept in files or environment
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
    const key = await ctx.read("OPENAI_KEY")
    return {
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: { 
            "content-type": "application/json",
            "authorization": `Bearer ${key}`
        },
        body: JSON.stringify({ 
            ...payload,
            model: "gpt-4o-mini",
        })
    }
}
```
It is a javascript that is given `payload` variable that contains messages/tools/streaming properties and also environment variables.

Last statement should be full payload object to make a http request.

Payload format is an `openai` format. Streaming the result uses openai format too.
So to use claude you'll have to use e.g. openrouter.ai

Here is how a claude.llm.js might look like:
```javascript

module.exports = async function(payload, ctx) {
    const key = await ctx.read("OPENROUTER_KEY")
    return {
        url: https://openrouter.ai/api/v1/chat/completions",
        method: "POST",
        headers: { 
            "content-type": "application/json",
            "authorization": `Bearer ${key}`
        },
        body: JSON.stringify({ 
            ...payload,
            model: "gpt-4o-mini",
            model: "anthropic/claude-3.7-sonnet"
        })
    }
}
```

Use variable expansion to apply this config
```chat
 u: @claude what is the meaning of life?
```

*Tools*
It is possible to create a use a tool with Tune.

Tools is a script that will LLM can call. 
It can be javascript/python or php script, or even another chat.

The file must have .tool.mjs/cjs/js/py/php/chat extension. 
the default exported function (for javsacript) is used to call the tool. 

Lets create `websearch` tool based on jina.ai api.
here is websearch.tool.mjs from example above.
```javascript
export default async function searchWeb({ query }) {
  const url = `https://s.jina.ai/${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}
````

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
 tr: <content0>
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



END OF DOCUMENT
