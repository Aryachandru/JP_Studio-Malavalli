// import React, { useEffect, useState } from "react";
// import PublicLayout from "../publicLayout/PublicLayout";
// import { subscribeToGallery } from "./galleryService";
// import "./PublicGallery.css";

// const CATEGORIES = ["All Photos", "Wedding", "Pre Wedding", "Baby Shoot", "Birthday", "Maternity"];

// export default function PublicGallery() {
//   const [photos, setPhotos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [category, setCategory] = useState("All Photos");
//   const [lightbox, setLightbox] = useState(null);

//   useEffect(() => {
//     const unsub = subscribeToGallery((rows) => {
//       setPhotos(rows);
//       setLoading(false);
//     });
//     return () => unsub();
//   }, []);

//   const filtered = category === "All Photos" ? photos : photos.filter((p) => p.category === category);

//   return (
//     <PublicLayout>
//       <section className="page-header">
//         <h1>Our Gallery</h1>
//         <p>A few favorites from weddings, pre-weddings, birthdays and more.</p>
//       </section>

//       <section className="section">
//         <div className="tab-row public-gallery-tabs">
//           {CATEGORIES.map((c) => (
//             <button key={c} className={`tab-pill${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
//               {c}
//             </button>
//           ))}
//         </div>

//         {loading && <div className="loading-line">Loading gallery…</div>}
//         {!loading && filtered.length === 0 && <div className="empty-state">No photos in this category yet.</div>}

//         <div className="gallery-grid">
//           {filtered.map((p) => (
//             <img
//               key={p.id}
//               src={p.url}
//               alt={p.fileName || "Studio photo"}
//               className="gallery-photo"
//               onClick={() => setLightbox(p.url)}
//             />
//           ))}
//         </div>
//       </section>

//       {lightbox && (
//         <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
//           <img src={lightbox} alt="Enlarged" />
//         </div>
//       )}
//     </PublicLayout>
//   );
// }
import React, { useState } from "react";
import PublicLayout from "../publicLayout/PublicLayout";
import STATIC_PHOTOS from "./staticPhotos";
import "./PublicGallery.css";

const CATEGORIES = ["All Photos", "Wedding", "Pre Wedding", "Baby Shoot", "Birthday", "Maternity"];

export default function PublicGallery() {
  const [category, setCategory] = useState("All Photos");
  const [lightbox, setLightbox] = useState(null);

  // Flatten all categories if "All Photos" is selected
  const allPhotos = Object.values(STATIC_PHOTOS).flat();
  const filtered = category === "All Photos" ? allPhotos : STATIC_PHOTOS[category] || [];

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Our Gallery</h1>
        <p>A few favorites from weddings, pre-weddings, birthdays and more.</p>
      </section>

      <section className="section">
        <div className="tab-row public-gallery-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`tab-pill${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && <div className="empty-state">No photos in this category yet.</div>}

        <div className="gallery-grid">
          {filtered.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`${category} ${idx + 1}`}
              className="gallery-photo"
              onClick={() => setLightbox(src)}
            />
          ))}
        </div>
      </section>

      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Enlarged" />
        </div>
      )}
    </PublicLayout>
  );
}

