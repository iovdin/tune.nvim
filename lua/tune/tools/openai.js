module.exports = function(props, transform) {
  return async function(payload, ctx) {
    const { auth_key, url } = props;
    delete props.auth_key;
    delete props.url;
    const key = await ctx.read('OPENAI_KEY' || auth_key);
    if (typeof(transform) === 'function') {
      payload = transform(payload)
    }

    return ({
      url: url || "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: { 
        "content-type": "application/json",
        authorization: `Bearer ${key}` 
      },
      body: JSON.stringify({ 
        ...props,
        ...payload,
        messages: payload.messages.filter(msg => msg.role !== 'comment'),
      })
    })
  }
}
