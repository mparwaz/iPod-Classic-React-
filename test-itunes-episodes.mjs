async function test() {
  const res = await fetch("https://itunes.apple.com/lookup?id=1436696954&entity=podcastEpisode&limit=5");
  const data = await res.json();
  console.log(data.resultCount);
  if(data.results && data.results.length > 1) {
    console.log(data.results[1].trackName);
    console.log(data.results[1].episodeUrl);
  }
}
test();
