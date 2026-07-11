// src/firebase/packageService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const packagesCol = collection(db, "packages");

// The fixed set of event categories used everywhere a package needs to be
// filtered by event type: admin package form, public Book Now cascading
// dropdown, and Packages page tabs. Keep this list in sync with the event
// type options on the booking forms.
export const PACKAGE_CATEGORIES = ["Wedding", "Pre Wedding", "Baby Shoot", "Birthday", "Maternity"];

// PUBLIC-SAFE: anyone can read packages (shown on the public site).
export function subscribeToPackages(callback) {
  const q = query(packagesCol, orderBy("price", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ADMIN ONLY (writes require auth under Firestore rules).
export async function createPackage(data) {
  return addDoc(packagesCol, {
    name: data.name,
    category: data.category || PACKAGE_CATEGORIES[0],
    price: Number(data.price) || 0,
    status: data.status || "Active",
    imageUrl: data.imageUrl || "",
    description: data.description || "",
    // e.g. ["Drone Shoot", "8 Hours Coverage", "1 Photographer + 1 Assistant"]
    inclusions: data.inclusions || [],
  });
}

export async function updatePackage(id, data) {
  return updateDoc(doc(db, "packages", id), data);
}

export async function deletePackage(id) {
  return deleteDoc(doc(db, "packages", id));
}

export async function togglePackageStatus(id, currentStatus) {
  return updateDoc(doc(db, "packages", id), {
    status: currentStatus === "Active" ? "Inactive" : "Active",
  });
}
