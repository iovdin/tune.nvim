/*
  *  { type: "text" | "image" | "llm" | "tool" | "processor" }
  *  name
  *  read (afn )
  */
module.exports = async function(node, args) {
  if (! node) {
    return node
  }
  const res = Object.assign({}, node);
  res.read = async function(args) {
    let contents = await node.read(args);
    contents = contents.split("\n");
    const pad = `${contents.length}`.length;
    return contents.map((item, index) => {
      const lineNum = `${index + 1}`.padEnd(pad + 1, " ") + "|";
      return `${lineNum} ${item}`
    }).join("\n")
  }
  return res
}
