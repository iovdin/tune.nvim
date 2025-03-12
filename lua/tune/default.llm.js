module.exports = async function(payload, ctx) {
  const key = await ctx.read("OPENAI_KEY");
  if (! key) {
    throw Error("OPENAI_KEY is not set")
  }
  return ({
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
  })
}
