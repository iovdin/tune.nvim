export default async function brave({text}, ctx) {
  const key = await ctx.read("BRAVE_KEY");

  if (!key) {
    throw new Error("BRAVE_KEY not found in context. Please set up your Brave Search API key.");
  }

  if (!text) {
    throw new Error("Query parameter is required.");
  }

  const encodedQuery = encodeURIComponent(text);
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodedQuery}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': key
    }
  });


  if (!response.ok) {
    throw new Error(`Brave Search API returned ${response.status}: ${response.statusText}\n`);
  }

  const data = await response.json();
  return data.web.results.map(item => 
    `${item.title}\n${item.url}\n${item.description}`
  ).join("\n\n").replace(/@/g, "\\@");
}
