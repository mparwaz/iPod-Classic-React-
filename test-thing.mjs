async function test() {
  const url = "https://feed.podbean.com/thefplwire/feed.xml";
  const proxy = `https://thingproxy.freeboard.io/fetch/${url}`;
  const res = await fetch(proxy);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
