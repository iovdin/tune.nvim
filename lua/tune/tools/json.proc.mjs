export default async function json_format(node, args, ctx) {
  let json_format = { "type": "json_object" };
  if (args.trim()) {
    const schema = awaitn ctx.read(args.trim())
    json_format = { 
      "type": "json_schema",
      "json_schema": JSON.parse(schema)
    }
  }
  return {
    ...node,
    exec: async (payload, ctx) => node.exec({ ...payload, json_format }, ctx)
  }
}
