module.exports = async function(node, schemaFile, ctx) {
  const newNode = Object.assign({}, node);
  let schema = await ctx.resolve(schemaFile.trim());
  if (!schema) throw Error(`schema file not found ${schemaFile.trim()}`)
  newNode.exec = async function(payload, ctx) {
    payload.response_format = { 
      "type": "json_schema",
      "json_schema": { 
        "name": "suggestion_output", 
        "schema": JSON.parse(await schema.read()) 
      }
    } 
    return node.exec(payload, ctx)
  }
  return newNode;
}
