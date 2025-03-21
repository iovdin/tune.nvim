const path = require("path");
const fs = require("fs");

const cacheFile = path.join(__dirname, "openai_models.json");
let cache

async function getModels(apiKey) {
  if (cache) {
    return cache
  }
  // Check if cache exists and is less than a day old
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const cacheAge = Date.now() - stats.mtimeMs;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (cacheAge < oneDayMs) {
      const cachedData = fs.readFileSync(cacheFile, 'utf8');
      cache = JSON.parse(cachedData)
      return cache
    }
  }
  
  // Fetch from API if cache doesn't exist, is too old, or couldn't be read
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });
  
  if (!res.ok)
    throw new Error(`Error: ${res.status} ${res.statusText}`);

  const content = await res.json();
  
  cache = content.data
  fs.writeFileSync(cacheFile, JSON.stringify(content.data, null, "  "), 'utf8');
  
  return content.data;
}

module.exports = async function openai(name, context, type, next) {
  if (name === "OPENAI_KEY") {
    return next()
  }
  const key = await context.read("OPENAI_KEY")
  console.log("openaikey", key)
  
  if (!key) {
    return next()
  }

  const models = await getModels(key);
  const model = models.find(item => item.id === name)
  if (!model) {
    return next()
  }
  return { 
    type: "llm",
    exec: async (payload, ctx) => ({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: { 
        "content-type": "application/json",
        authorization: `Bearer ${key}` 
      },
      body: JSON.stringify({ 
        ...payload,
        model: model.id
      })
    })
  }
}
