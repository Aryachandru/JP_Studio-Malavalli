// src/firebase/bookingService.js
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
  getDoc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { STAGES } from "../../shared/statuses";
import { createNotification } from "../adminShell/notificationService";

const bookingsCol = collection(db, "bookings");
const bookedDatesCol = collection(db, "bookedDates");

// -----------------------------------------------------------------------
// AVAILABILITY CALENDAR (public-safe)
// `bookedDates/{isoDate}` stores ONLY a date and a count — never a name,
// phone number, or anything else private. It's what lets the public Book
// Now page show "this date already has a booking" without needing
// Firestore "list" access to the real /bookings collection (which stays
// admin-only). Kept in sync automatically by createBooking/cancelBooking/
// deleteBooking below — you never touch this collection directly.
// -----------------------------------------------------------------------
async function bumpBookedDateCount(isoDate, delta) {
  if (!isoDate) return;
  const ref = doc(bookedDatesCol, isoDate);
  await setDoc(ref, { count: increment(delta) }, { merge: true });
}

// PUBLIC-SAFE: live list of { date, count } for every date that has at
// least one active booking. Used by the Book Now availability calendar.
export function subscribeToBookedDates(callback) {
  return onSnapshot(bookedDatesCol, (snap) => {
    const map = {};
    snap.docs.forEach((d) => {
      const count = d.data().count || 0;
      if (count > 0) map[d.id] = count;
    });
    callback(map);
  });
}

// -----------------------------------------------------------------------
// IMPORTANT DESIGN NOTE:
// Each booking's Firestore *document ID* is the human-readable booking
// code itself (e.g. "JP1007") instead of a random auto-id. This is what
// lets a customer look their own booking up on the public Track Booking
// page with a plain getDoc() — no login, no Firestore "list" permission
// needed (which stays admin-only). The number is handed out from a
// single counters/bookingCounter doc via a transaction, so it stays
// unique even though public users and the admin can both create bookings.
// -----------------------------------------------------------------------
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

// Live-subscribe to ALL bookings, newest first. ADMIN ONLY (Firestore
// rules require auth for "list" queries against /bookings).
export function subscribeToBookings(callback) {
  const q = query(bookingsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

// ADMIN ONLY (used on the Booking Details page, which is behind login).
export function subscribeToBooking(bookingId, callback) {
  const ref = doc(db, "bookings", bookingId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  });
}

export async function getBookingOnce(bookingId) {
  const ref = doc(db, "bookings", bookingId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// PUBLIC-SAFE: a customer types their exact booking code + mobile number
// on the Track Booking page. We fetch the single doc by ID (allowed for
// anyone under the rules), then verify the mobile number matches before
// handing back any data.
// Strips everything except digits, then keeps only the last 10 digits —
// this makes "+91 98765 43210", "9876543210", and "091-9876543210" all
// normalize to the same value, regardless of how anyone typed it.
export function normalizeMobile(value) {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  return digitsOnly.slice(-10) || String(value || "").trim();
}

export async function trackBookingByCodeAndMobile(bookingCode, mobile) {
  const ref = doc(db, "bookings", bookingCode.trim().toUpperCase());
  let snap;
  try {
    snap = await getDoc(ref);
  } catch (err) {
    return { error: "firebase_error", firebaseCode: err.code, firebaseMessage: err.message };
  }
  if (!snap.exists()) return { error: "not_found" };
  const data = snap.data();
  if (normalizeMobile(data.mobile) !== normalizeMobile(mobile)) {
    return { error: "mismatch" };
  }
  return { booking: { id: snap.id, ...data } };
}

// Creates a booking. `source` is "public" (customer used the Book Now
// wizard) or "admin" (staff booked on the customer's behalf).
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

  await bumpBookedDateCount(data.eventDate, 1);

  // Only alert the admin for bookings customers made themselves — no
  // point notifying admin about a booking admin just typed in personally.
  if (source === "public") {
    const prettyDate = new Date(data.eventDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    await createNotification(
      `New booking: ${data.customerName} · ${data.eventType} · ${prettyDate} (${code})`
    );
  }

  return { id: code };
}

export async function updateBooking(bookingId, data) {
  const ref = doc(db, "bookings", bookingId);

  if (data.eventDate) {
    const snap = await getDoc(ref);
    const oldDate = snap.exists() ? snap.data().eventDate : null;
    const wasCancelled = snap.exists() ? snap.data().cancelled : false;
    if (oldDate && oldDate !== data.eventDate && !wasCancelled) {
      await bumpBookedDateCount(oldDate, -1);
      await bumpBookedDateCount(data.eventDate, 1);
    }
  }

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
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;
  await updateDoc(ref, { cancelled: true });
  if (data && !data.cancelled) {
    await bumpBookedDateCount(data.eventDate, -1);
  }
}

// -----------------------------------------------------------------------
// PAYMENT TRACKING
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
  const ref = doc(db, "bookings", bookingId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;
  await deleteDoc(ref);
  if (data && !data.cancelled) {
    await bumpBookedDateCount(data.eventDate, -1);
  }
}