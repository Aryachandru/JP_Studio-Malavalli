import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const testimonialsCol = collection(db, "testimonials");

// PUBLIC-SAFE: anyone can submit a testimonial (same trust model as the
// rest of this app — bookings, project inquiries, etc. all allow public
// create). New testimonials start unapproved so nothing shows on the
// public site until the admin reviews it.
export async function submitTestimonial({ bookingCode, customerName, rating, message }) {
  return addDoc(testimonialsCol, {
    bookingCode: bookingCode || "",
    customerName,
    rating: Number(rating) || 5,
    message,
    approved: false,
    featured: false,
    createdAt: serverTimestamp(),
  });
}

// One-off check (not a live subscription) used by the Track Booking page
// to avoid showing the "leave a review" prompt twice for the same
// booking.
export async function hasTestimonialForBooking(bookingCode) {
  if (!bookingCode) return false;
  const q = query(testimonialsCol, where("bookingCode", "==", bookingCode), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ADMIN: live list of every testimonial (approved or not), newest first.
export function subscribeToTestimonials(callback) {
  const q = query(testimonialsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// PUBLIC: live list of approved testimonials only — this is what the
// homepage "What Our Clients Say" section reads from.
//
// NOTE: deliberately NOT combining where("approved"...) with
// orderBy("createdAt") in the same Firestore query — that combo needs a
// composite index to be manually created in the Firebase console before
// it'll work, which is an easy thing to trip over. Sorting the (small)
// result set client-side instead avoids that entirely.
export function subscribeToApprovedTestimonials(callback, max = 20) {
  const q = query(testimonialsCol, where("approved", "==", true), limit(max));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(rows);
  });
}

export async function approveTestimonial(id) {
  return updateDoc(doc(db, "testimonials", id), { approved: true });
}

export async function unapproveTestimonial(id) {
  return updateDoc(doc(db, "testimonials", id), { approved: false });
}

export async function toggleFeatured(id, current) {
  return updateDoc(doc(db, "testimonials", id), { featured: !current });
}

export async function deleteTestimonial(id) {
  return deleteDoc(doc(db, "testimonials", id));
}