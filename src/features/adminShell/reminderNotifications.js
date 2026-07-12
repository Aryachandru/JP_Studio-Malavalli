// src/features/adminShell/reminderNotifications.js
//
// Fires a native OS/browser notification (via the standard Notification
// API) when the admin has bookings scheduled for tomorrow. This works
// today in any modern browser as long as the admin has the dashboard
// open (or the tab in the background) and has granted permission.
//
// IMPORTANT — read this before converting to an APK:
// The Notification API by itself only fires while this page is loaded
// somewhere (even a background tab). It CANNOT wake up a fully-closed
// app/browser. For a true "notify me even if the app is closed" reminder
// once you wrap this in an APK, you have two solid paths:
//   1. If you wrap this web app in Capacitor: swap this file's calls for
//      Capacitor's Local Notifications plugin (works even app-closed).
//   2. If you keep it as a pure PWA/WebView: add Firebase Cloud Messaging
//      (a service worker + a scheduled Cloud Function that checks
//      `reminderDate` on bookings daily) — this requires the Blaze plan
//      for Cloud Functions, see README "Push Notifications" section.
// Everything below still works standalone in the meantime.

const STORAGE_KEY = "jpstudio_last_reminder_notified_date";

export async function ensureNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

// Generic one-off browser push — used by Topbar.jsx to alert the admin
// the instant a new booking notification lands in Firestore, on
// whichever admin page they happen to be looking at right now (not just
// the Dashboard). Unlike notifyTomorrowBookings below, this fires every
// time it's called — the caller (Topbar) is responsible for only calling
// it once per genuinely new notification, not on every render.
export function fireBrowserNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body, icon: "/logo192.png", tag: "jpstudio-live" });
  } catch (err) {
    console.warn("Notification failed:", err);
  }
}

// Call this once per Dashboard load with the list of bookings happening
// tomorrow. It only actually fires a notification once per calendar day,
// so re-renders / re-mounts don't spam the admin repeatedly.
export function notifyTomorrowBookings(bookingsTomorrow) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!bookingsTomorrow || bookingsTomorrow.length === 0) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const lastNotified = localStorage.getItem(STORAGE_KEY);
  if (lastNotified === todayKey) return;

  const count = bookingsTomorrow.length;
  const first = bookingsTomorrow[0];
  const title = count === 1 ? "Shoot tomorrow" : `${count} shoots tomorrow`;
  const body =
    count === 1
      ? `${first.customerName} · ${first.eventType} · ${first.location || "location TBD"}`
      : bookingsTomorrow.map((b) => b.customerName).slice(0, 3).join(", ") + (count > 3 ? "…" : "");

  try {
    // eslint-disable-next-line no-new
    new Notification(title, {
      body,
      icon: "/logo192.png",
      tag: "jpstudio-reminder",
    });
    localStorage.setItem(STORAGE_KEY, todayKey);
  } catch (err) {
    console.warn("Notification failed:", err);
  }
}