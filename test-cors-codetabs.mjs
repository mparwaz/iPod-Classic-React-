const res = await fetch("https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent("https://yewtu.be/api/v1/search?q=test&type=video"), {
  method: 'GET',
  headers: {
    'Origin': 'https://i-pod-classic-react.vercel.app'
  }
});
const text = await res.text();
console.log(res.status, res.headers.get('Access-Control-Allow-Origin'));
console.log(text.substring(0, 100));
