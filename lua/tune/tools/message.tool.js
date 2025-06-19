module.exports = async function message({ filename, system, text, stop }, ctx) {
  let chat = await ctx.read(filename);
  if (!chat && system) {
    chat = `system: @@${system}`
  }
  chat = `${chat}\nuser:\n${text}`
  const messages = await ctx.text2run(chat, {stop: "assistant" })
  chat = `${chat}\n${ctx.msg2text(messages, true)}`
  await ctx.write(filename, chat)
  if (messages.length) {
    return messages[messages.length - 1].content
  }
  return ""
}
