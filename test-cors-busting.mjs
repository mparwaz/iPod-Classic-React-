const res = await fetch("https://itunes.apple.com/lookup?id=1585025879&entity=podcastEpisode&limit=50&_c=" + Date.now(), {
  method: 'GET',
  headers: {
    'Origin': 'https://i-pod-classic-react.vercel.app'
  }
});
console.log(res.status, res.headers.get('Access-Control-Allow-Origin'));
