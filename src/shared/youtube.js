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

// hqdefault.jpg exists for every YouTube video ever uploaded (unlike
// maxresdefault, which not all videos have), so it's the safe default
// to use for thumbnails.
export function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
