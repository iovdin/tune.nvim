module.exports = async function resolve(node, args, ctx) {
  if (!node) {
    return
  }
  if (node.type !== "text") {
    throw Error(`can resolve only text nodes, got ${node.type}`)
  }
  const filename = await node.read()
  return ctx.resolve(filename.trim())
}
