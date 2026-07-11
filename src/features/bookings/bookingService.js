// src/features/bookings/bookingService.js
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  runTransaction,
  where
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { STAGES } from "../../shared/statuses";


const bookingsCol = collection(db, "bookings");

async function getNextBookingCode() {
  const counterRef = doc(db, "counters", "bookingCounter");
  const nextCount = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().count : 0;
    const next = current + 1;
    tx.set(counterRef, { count: next });
    return next;
  });
  return `JP${1000 + nextCount}`;
}

export function subscribeToBookings(callback) {
  const q = query(bookingsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

export function subscribeToBooking(bookingId, callback) {
  const ref = doc(db, "bookings", bookingId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  });
}

export async function getBookingOnce(bookingId) {
  const ref = doc(db, "bookings", bookingId);
  const snap = await getDocs(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Strips everything except digits, then keeps only the last 10 digits —
// this makes "+91 98765 43210", "9876543210", and "091-9876543210" all
// normalize to the same value, regardless of how anyone typed it.
export function normalizeMobile(value) {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  return digitsOnly.slice(-10) || String(value || "").trim();
}

export async function trackBookingByCodeAndMobile(bookingCode, mobile) {
  try {
    const normalizedCode = bookingCode.trim().toUpperCase();
    const normalizedMobile = normalizeMobile(mobile);

    const q = query(
      collection(db, "bookings"),
      where("bookingCode", "==", normalizedCode)
    );

    const snap = await getDocs(q);

    if (snap.empty) return { error: "not_found" };

    const docData = snap.docs[0].data();

    if (normalizeMobile(docData.mobile) !== normalizedMobile) {
      return { error: "mismatch" };
    }

    return { booking: { id: snap.docs[0].id, ...docData } };
  } catch (err) {
    return { error: "firebase_error", firebaseCode: err.code, firebaseMessage: err.message };
  }
}


export async function createBooking(data, source = "public") {
  const code = await getNextBookingCode();
  const ref = doc(bookingsCol, code);

  let reminderDate = null;
  if (data.eventDate) {
    const d = new Date(data.eventDate);
    d.setDate(d.getDate() - 1);
    reminderDate = d.toISOString().slice(0, 10);
  }

  await setDoc(ref, {
    bookingCode: code,
    customerName: data.customerName,
    mobile: normalizeMobile(data.mobile),
    email: data.email || "",
    eventType: data.eventType,
    eventDate: data.eventDate,
    location: data.location,
    packageName: data.packageName,
    amount: Number(data.amount) || 0,
    photographer: data.photographer || "Unassigned",
    stageIndex: 0,
    cancelled: false,
    source,
    reminderDate,
    stageHistory: [{ stage: STAGES[0], date: new Date().toISOString() }],
    createdAt: serverTimestamp(),
  });

  return { id: code };
}

export async function updateBooking(bookingId, data) {
  const ref = doc(db, "bookings", bookingId);
  return updateDoc(ref, data);
}

export async function updateBookingStage(bookingId, newStageIndex, existingHistory = []) {
  const ref = doc(db, "bookings", bookingId);
  const history = [
    ...existingHistory,
    { stage: STAGES[newStageIndex], date: new Date().toISOString() },
  ];
  return updateDoc(ref, { stageIndex: newStageIndex, stageHistory: history });
}

export async function cancelBooking(bookingId) {
  const ref = doc(db, "bookings", bookingId);
  return updateDoc(ref, { cancelled: true });
}

// -----------------------------------------------------------------------
// PAYMENT TRACKING
// Each booking stores its own `payments` array — one entry per amount
// received (advance, installment, final balance, etc). `amount` on the
// booking stays the TOTAL package price; how much has actually come in
// is just the sum of `payments`.
// -----------------------------------------------------------------------

export async function addPayment(bookingId, existingPayments, payment) {
  const ref = doc(db, "bookings", bookingId);
  const updated = [
    ...(existingPayments || []),
    {
      amount: Number(payment.amount) || 0,
      method: payment.method || "Cash",
      note: payment.note || "",
      date: new Date().toISOString(),
    },
  ];
  await updateDoc(ref, { payments: updated });
  return updated;
}

export async function removePayment(bookingId, existingPayments, index) {
  const updated = (existingPayments || []).filter((_, i) => i !== index);
  await updateDoc(doc(db, "bookings", bookingId), { payments: updated });
  return updated;
}

export function totalPaid(payments) {
  return (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export async function deleteBooking(bookingId) {
  return deleteDoc(doc(db, "bookings", bookingId));
}