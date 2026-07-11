// src/shared/uploadImage.js
//
// One shared helper for "let the admin pick a photo from their phone/
// computer instead of pasting a URL" — used by Settings (hero banner
// images) and Packages (package cover photo).
//
// IMPORTANT: uses Firebase Storage, same as Gallery. As of Feb 2026,
// Firebase Storage requires the Blaze (pay-as-you-go) plan — Spark
// (free) plan projects get 402/403 errors on every Storage call. If
// uploads are failing, check Firebase Console → Usage and billing first.
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

export async function uploadImageFile(file, folder) {
  const path = `${folder}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}