// src/firebase/auth.js
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

// Subscribes to Firebase's login state. callback receives the user
// object (or null if signed out). Used by PrivateRoute to guard /admin/*.
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  return signOut(auth);
}
