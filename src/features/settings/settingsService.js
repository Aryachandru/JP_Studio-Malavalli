// src/firebase/settingsService.js
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";

// Single document that stores all studio-wide settings.
const settingsRef = doc(db, "settings", "studio");

export function subscribeToSettings(callback) {
  return onSnapshot(settingsRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function getSettingsOnce() {
  const snap = await getDoc(settingsRef);
  return snap.exists() ? snap.data() : null;
}

export async function saveSettings(data) {
  return setDoc(settingsRef, data, { merge: true });
}
