const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://yewtu.be/api/v1/search?q=test&type=video"), {
  method: 'GET',
  headers: {
    'Origin': 'https://i-pod-classic-react.vercel.app'
  }
});
const data = await res.json();
console.log(res.status, res.headers.get('Access-Control-Allow-Origin'));
if(data.contents) console.log(data.contents.substring(0, 100));
