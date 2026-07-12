// src/firebase/notificationService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const notifCol = collection(db, "notifications");

export function subscribeToNotifications(callback) {
  const q = query(notifCol, orderBy("createdAt", "desc"), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function markNotificationRead(id) {
  return updateDoc(doc(db, "notifications", id), { read: true });
}

// PUBLIC-SAFE (create only — see firestore.rules): used by bookingService's
// createBooking() to alert the admin the moment a customer books through
// the public site. Anyone can create one of these, but nobody except the
// signed-in admin can read/list/update/delete them, so this can't be used
// to snoop on existing notifications — only to add a new one.
export async function createNotification(message) {
  return addDoc(notifCol, {
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}