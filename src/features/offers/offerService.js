// src/features/offers/offerService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const offersCol = collection(db, "offers");

// PUBLIC-SAFE: anyone can read offers (shown as a banner on the public site).
export function subscribeToOffers(callback) {
  const q = query(offersCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ADMIN ONLY (writes require auth under Firestore rules).
export async function createOffer(data) {
  return addDoc(offersCol, {
    title: data.title,
    message: data.message,
    active: data.active !== false,
    createdAt: serverTimestamp(),
  });
}

export async function updateOffer(id, data) {
  return updateDoc(doc(db, "offers", id), data);
}

export async function deleteOffer(id) {
  return deleteDoc(doc(db, "offers", id));
}

export async function toggleOfferActive(id, currentActive) {
  return updateDoc(doc(db, "offers", id), { active: !currentActive });
}
