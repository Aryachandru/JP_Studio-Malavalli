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

// Call this once per Dashboard load with the list of bookings happening
// tomorrow. It only actually fires a notification once per calendar day,
// so re-renders / re-mounts don't spam the admin repeatedly.
export function notifyTomorrowBookings(bookingsTomorrow) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!bookingsTomorrow || bookingsTomorrow.length === 0) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const lastNotified = localStorage.getItem(STORAGE_KEY);
  if (lastNotified === todayKey) return; // already notified today

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
    // Some browsers (e.g. iOS Safari home-screen web apps) restrict this —
    // fail silently, the in-app Dashboard widget still shows the reminder.
    console.warn("Notification failed:", err);
  }
}
