const path = require("path");
const fs = require("fs");

const cacheDir = path.join(__dirname, ".cache");
const cacheFile = path.join(cacheDir, "openrouter_models.json");
let cache;

// Create cache directory if it doesn't exist
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

async function getModels() {
  // Check if cache exists and is less than a day old
  if (cache) {
    return cache;
  }
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const cacheAge = Date.now() - stats.mtimeMs;
    const oneHourMs = 60 * 60 * 1000; // 1 hour in milliseconds

    if (cacheAge < oneHourMs) {
      cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      return cache;
    }
  }

  // Fetch from API if cache doesn't exist, is too old, or couldn't be read
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    method: "GET",
  });

  if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);

  const content = await res.json();

  // Save to cache
  cache = content.data;
  fs.writeFileSync(cacheFile, JSON.stringify(cache), "utf8");

  return cache;
}

const envr = /^[A-Z_0-9]+$/;
module.exports = async function openrouter(name, context, type, next) {
  if (envr.test(name)) {
    return next();
  }
  const models = await getModels();
  const model = models.find((item) => item.id === name);
  if (!model) {
    return next();
  }
  return {
    type: "llm",
    exec: async (payload, ctx) => {
      const key = await context.read("OPENROUTER_KEY");
      return {
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          ...payload,
          model: model.id,
        }),
      };
    },
  };
};
