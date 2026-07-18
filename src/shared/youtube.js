// src/shared/youtube.js
//
// Shared everywhere a YouTube URL needs to become something usable —
// currently the Home page's video section and the Gallery's video
// support. Handles watch links, share links (youtu.be), and embed links.

export function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?&]+)/,
    /(?:youtube\.com\/embed\/)([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function isYouTubeUrl(url) {
  return !!getYouTubeId(url);
}

export function getYouTubeEmbedUrl(url) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// mqdefault.jpg (320x180) is roughly a third the file size of hqdefault.jpg
// (480x360) and loads noticeably faster in grids/carousels where the
// thumbnail is small anyway — use "hq" only where the thumbnail is shown
// large (e.g. a bigger hero-style preview).
export function getYouTubeThumbnail(url, quality = "mq") {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}default.jpg` : null;
}