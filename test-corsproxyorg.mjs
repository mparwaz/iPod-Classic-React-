async function test() {
  const url = "https://feed.podbean.com/thefplwire/feed.xml";
  const proxy = `https://corsproxy.org/?${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
