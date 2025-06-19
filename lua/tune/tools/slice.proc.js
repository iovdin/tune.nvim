module.exports = async function slice(node, args, context) {
  if (!node || node.type !== 'text') {
    return node;
  }

  const parts = args ? args.trim().split(/\s+/) : [];
  let start, end;

  const parseIdx = (str) => {
    const n = parseInt(str, 10);
    if (isNaN(n)) return undefined;
    return n;
  };

  if (parts.length >= 1) start = parseIdx(parts[0]);
  if (parts.length >= 2) end = parseIdx(parts[1]);

  const newNode = Object.assign({}, node);

  newNode.read = async () => {
    const text = await node.read();
    const lines = text.split(/\r?\n/);
    const N = lines.length;

    // Convert 1-based to 0-based, handle negative indices
    let s = start;
    let e = end;

    if (s === undefined) {
      s = 1;  // default to line 1
    }
    s = s < 0 ? N + s : s - 1;  // negative or positive 1-based 
    if (s < 0) s = 0;
    if (s > N) s = N;

    if (e !== undefined) {
      e = e < 0 ? N + e : e;  // negative or positive 1-based inclusive
    }
    // Since Array.slice end index is exclusive and ours is inclusive, add 0 if undefined, +0 else +0
    // But since end is inclusive for user, exclusive for slice, +1
    if (e !== undefined) {
      e = e < 0 ? Math.max(0, e + 1) : e;  // ensure inclusive end
    }

    // Convert to slice compatible indices
    const result = lines.slice(
      s,
      e !== undefined ? e : undefined
    );

    return result.join('\n');
  };

  return newNode;
};