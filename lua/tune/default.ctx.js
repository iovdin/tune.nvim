const { runFile, fsmd } = require('./tunemd.js');
const path = require("path"); 


async function makeSchema(params, ctx) {
   return runFile(path.join(__dirname, "schema.tool.chat"), ctx, params )
}
let dirs = [] 
if (process.env.TUNE_PATH) {
  dirs = process.env.TUNE_PATH.split(path.delimiter)
}


module.exports = [
  fsmd(dirs, {makeSchema}), 
  require("./openai.ctx.js"), 
  require("./openrouter.ctx.js")
]
