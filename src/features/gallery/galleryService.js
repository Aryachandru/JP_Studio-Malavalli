// src/firebase/galleryService.js
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/config";

const galleryCol = collection(db, "galleryPhotos");

export function subscribeToGallery(callback) {
  const q = query(galleryCol, orderBy("uploadedAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Uploads a File object to Firebase Storage, then writes a Firestore
// record pointing at it so it shows up live in the Gallery grid.
export async function uploadGalleryPhoto(file, category) {
  const path = `gallery/${category}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return addDoc(galleryCol, {
    url,
    category,
    fileName: file.name,
    uploadedAt: serverTimestamp(),
  });
}

export async function deleteGalleryPhoto(id) {
  return deleteDoc(doc(db, "galleryPhotos", id));
}
