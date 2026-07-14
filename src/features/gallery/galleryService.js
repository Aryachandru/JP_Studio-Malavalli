// src/features/gallery/galleryService.js
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const galleryCol = collection(db, "galleryPhotos");

// The assignable categories for a gallery item (distinct from "All
// Photos", which is a filter-only option on the public page, not a real
// category anything gets tagged with).
export const GALLERY_CATEGORIES = ["Wedding", "Pre Wedding", "Baby Shoot", "Birthday", "Maternity"];

export function subscribeToGallery(callback) {
  const q = query(galleryCol, orderBy("addedAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Adds a gallery item by URL — no file upload, no Firebase Storage
// involved at all. This means gallery management works regardless of
// whether your Firebase project is on the Spark or Blaze plan, unlike
// the old device-upload flow which needed Storage (Blaze-only as of
// Feb 2026).
// `mediaType` is "image" or "video". For video, `url` can be either a
// YouTube link (any shape) or a direct video file URL (.mp4 etc) — both
// are handled automatically wherever this is displayed.
export async function addGalleryItem({ url, category, mediaType = "image" }) {
  return addDoc(galleryCol, {
    url: url.trim(),
    category,
    mediaType,
    addedAt: serverTimestamp(),
  });
}

export async function deleteGalleryItem(id) {
  return deleteDoc(doc(db, "galleryPhotos", id));
}