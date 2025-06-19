
module.exports = async function (payload, ctx) {
  const key = await ctx.read("DEEPSEEK_KEY");

  return {
    url: "https://api.deepseek.com/v1/chat/completions",
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      ...payload,
      model: "deepseek-reasoner"
    }),
  };
};
