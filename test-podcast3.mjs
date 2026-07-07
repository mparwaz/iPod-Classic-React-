async function test() {
  const url = "https://feed.podbean.com/thefplwire/feed.xml";
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
