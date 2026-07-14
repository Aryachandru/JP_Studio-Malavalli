import React, { useEffect } from "react";
import { getYouTubeEmbedUrl } from "../../shared/youtube";
import "./GalleryLightbox.css";

// Fullscreen viewer for a gallery item
export default function GalleryLightbox({
  items,
  index,
  onClose,
  onNavigate,
}) {
  const item = items[index];

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        onNavigate((index - 1 + items.length) % items.length);
      }

      if (e.key === "ArrowRight") {
        onNavigate((index + 1) % items.length);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  const embedUrl =
    item.mediaType === "video"
      ? getYouTubeEmbedUrl(item.url)
      : null;

  const hasMultiple = items.length > 1;

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button
        className="lb-close"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      {hasMultiple && (
        <button
          className="lb-nav lb-prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index - 1 + items.length) % items.length);
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      <div
        className="lb-content"
        onClick={(e) => e.stopPropagation()}
      >
        {item.mediaType === "video" ? (
          embedUrl ? (
            <iframe
              key={item.id}
              src={`${embedUrl}?autoplay=1`}
              title="Gallery video"
              className="lb-video-iframe"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={item.id}
              src={item.url}
              controls
              autoPlay
              className="lb-video-tag"
            />
          )
        ) : (
          <img
            src={item.url}
            alt="Enlarged"
            className="lb-image"
          />
        )}
      </div>

      {hasMultiple && (
        <button
          className="lb-nav lb-next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index + 1) % items.length);
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}

      {hasMultiple && (
        <div className="lb-counter">
          {index + 1} / {items.length}
        </div>
      )}
    </div>
  );
}