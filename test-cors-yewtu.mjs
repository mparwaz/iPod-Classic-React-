const res = await fetch("https://yewtu.be/api/v1/search?q=test&type=video", {
  method: 'GET',
  headers: {
    'Origin': 'https://i-pod-classic-react.vercel.app'
  }
});
console.log(res.status, res.headers.get('Access-Control-Allow-Origin'));
