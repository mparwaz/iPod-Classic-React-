const res = await fetch("https://invidious.nerdvpn.de/api/v1/search?q=test&type=video", {
  headers: { 'Origin': 'https://i-pod-classic-react.vercel.app' }
});
console.log(res.status, res.headers.get('Access-Control-Allow-Origin'));
