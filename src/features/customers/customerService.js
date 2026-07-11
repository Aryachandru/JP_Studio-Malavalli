// src/firebase/customerService.js
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const customersCol = collection(db, "customers");

export function subscribeToCustomers(callback) {
  const q = query(customersCol, orderBy("name"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToCustomer(customerId, callback) {
  const ref = doc(db, "customers", customerId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  });
}

export async function getCustomerOnce(customerId) {
  const ref = doc(db, "customers", customerId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Customers are keyed by phone number so a repeat customer's stats
// (totalBookings / totalSpent) accumulate automatically across bookings.
export async function upsertCustomerFromBooking(booking) {
  const ref = doc(db, "customers", booking.mobile);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    await updateDoc(ref, {
      totalBookings: increment(1),
      totalSpent: increment(Number(booking.amount) || 0),
      inProgress: increment(1),
      name: booking.customerName,
      email: booking.email || existing.data().email || "",
    });
  } else {
    await setDoc(ref, {
      name: booking.customerName,
      mobile: booking.mobile,
      email: booking.email || "",
      address: booking.location || "",
      totalBookings: 1,
      totalSpent: Number(booking.amount) || 0,
      completed: 0,
      inProgress: 1,
    });
  }
}

export async function markCustomerBookingCompleted(mobile) {
  const ref = doc(db, "customers", mobile);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await updateDoc(ref, {
    completed: increment(1),
    inProgress: increment(-1),
  });
}
