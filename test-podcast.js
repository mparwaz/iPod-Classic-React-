const fetch = require('node-fetch');

async function test() {
  const url = "https://feed.podbean.com/thefplwire/feed.xml";
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  const data = await res.json();
  console.log(data.contents.substring(0, 100));
}
test();
