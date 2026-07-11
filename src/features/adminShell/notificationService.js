// src/firebase/notificationService.js
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
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
