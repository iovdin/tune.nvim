module.exports = async function head(node, args, context) {
  // Only transform text nodes
  if (!node || node.type !== 'text') {
    return node;
  }

  // Parse the number of lines argument, default is 20
  const n = parseInt(args, 10);
  const linesCount = (isNaN(n) || n <= 0) ? 20 : n;

  const newNode = Object.assign({}, node);

  newNode.read = async () => {
    const text = await node.read();
    // Split text into lines
    const lines = text.split(/\r?\n/);
    // Take first linesCount lines
    const firstLines = lines.slice(0, linesCount);
    // Join back into string
    return firstLines.join('\n');
  };
  
  return newNode;
};