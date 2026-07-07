const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://itunes.apple.com/lookup?id=1585025879"), {
  method: 'GET',
  headers: {
    'Origin': 'https://i-pod-classic-react.vercel.app'
  }
});
console.log(res.status, res.headers.get('Access-Control-Allow-Origin'));
