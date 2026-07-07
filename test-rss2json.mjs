async function test() {
  const url = "https://feed.podbean.com/thefplwire/feed.xml";
  const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  const data = await res.json();
  console.log(data);
}
test();
