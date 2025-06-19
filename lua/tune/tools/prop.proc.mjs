function parseVal(value) {
  try {
    return JSON.parse(value)
  } catch (e) { }
  return value
}
export default async function prop(node, args, ctx) {
  if (!node || node.type !== 'llm') {
    return node
  }

  const re = /(?<name>\w+)\s*=/
  let lastName;
  let m;
  let text = args;
  const vars = {};
  while ((m = re.exec(text)) !== null) {
    const { name } = m.groups

    if (lastName) {
      vars[lastName] = parseVal(text.slice(0, m.index).trim())
    }
    text = text.slice(m.index + m[0].length)
    lastName = name
  }

  if (lastName) {
    vars[lastName] = parseVal(text.trim())
  }
  return {
    ...node,
    exec: async (payload, ctx) => node.exec({ ...payload, ...vars }, ctx)
  }
}
