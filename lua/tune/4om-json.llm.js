module.exports = require("./openai")({ 
  model:  "gpt-4o-mini",
  response_format: { type: "json_object" } 
})
