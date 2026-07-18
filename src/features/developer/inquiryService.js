// src/features/developer/inquiryService.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

const inquiriesCol = collection(db, "projectInquiries");

// PUBLIC-SAFE: anyone visiting the developer page can submit an inquiry.
// Reading the list back is not exposed anywhere in this app on purpose —
// check Firestore Console → projectInquiries to review submissions, or
// wire up an admin view later if you want one in-app.
export async function submitProjectInquiry(data) {
  return addDoc(inquiriesCol, {
    projectType: data.projectType,
    name: data.name,
    phone: data.phone,
    email: data.email,
    description: data.description,
    budget: data.budget,
    timeline: data.timeline,
    createdAt: serverTimestamp(),
  });
}