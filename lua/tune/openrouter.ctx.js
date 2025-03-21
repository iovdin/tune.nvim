const path = require("path");
const fs = require("fs");

const cacheFile = path.join(__dirname, "openrouter_models.json");
let cache

async function getModels() {
  // Check if cache exists and is less than a day old
  if (cache) {
    return cache
  }
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const cacheAge = Date.now() - stats.mtimeMs;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (cacheAge < oneDayMs) {
      cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return cache 
    }
  }
  
  // Fetch from API if cache doesn't exist, is too old, or couldn't be read
  const res = await fetch("https://openrouter.ai/api/v1/models", {method: "GET"});
  
  if (!res.ok)
    throw new Error(`Error: ${res.status} ${res.statusText}`);

  const content = await res.json();
  
  // Save to cache
  cache = content.data
  fs.writeFileSync(cacheFile, JSON.stringify(cache), 'utf8');
  
  return cache;
}

module.exports = async function openrouter(name, context, type, next) {
  if (name === "OPENROUTER_KEY") {
    return next()
  }
  const key = await context.read("OPENROUTER_KEY")
  if (!key) {
    return next()
  }

  const models = await getModels();
  const model = models.find(item => item.id === name)
  if (!model) {
    return next()
  }
  return { 
    type: "llm",
    exec: async (payload, ctx) => ({
      url: "https://openrouter.ai/api/v1/chat/completions",
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
