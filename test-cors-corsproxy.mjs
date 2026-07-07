const res = await fetch("https://corsproxy.io/?" + encodeURIComponent("https://iv.melmac.space/api/v1/search?q=test&type=video"));
const text = await res.text();
console.log(text.substring(0, 100));
