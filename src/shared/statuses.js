// src/constants/statuses.js
// The ordered production pipeline every booking moves through.
// This powers the "Update Status" timeline + the badge shown everywhere else.
export const STAGES = [
  "Booking Confirmed",
  "Photography Completed",
  "Photo Selection",
  "Editing",
  "Album Designing",
  "Printing",
  "Ready for Delivery",
];

// Top level filter used on the Bookings list tabs
export const TOP_LEVEL = {
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Given a stageIndex (0-based, index of the *current/last completed* stage)
// and a cancelled flag, work out the badge shown across the app.
export function getTopLevelStatus(stageIndex, cancelled) {
  if (cancelled) return TOP_LEVEL.CANCELLED;
  if (stageIndex <= 0) return TOP_LEVEL.CONFIRMED;
  if (stageIndex >= STAGES.length - 1) return TOP_LEVEL.COMPLETED;
  return TOP_LEVEL.IN_PROGRESS;
}

// Colors used for the pill / badge components (kept in one place so every
// page stays visually consistent with the mockup).
export const STATUS_COLORS = {
  [TOP_LEVEL.CONFIRMED]: { bg: "#e6f4ea", color: "#1e8e3e" },
  [TOP_LEVEL.IN_PROGRESS]: { bg: "#fff4e0", color: "#c9791a" },
  [TOP_LEVEL.COMPLETED]: { bg: "#e6f4ea", color: "#1e8e3e" },
  [TOP_LEVEL.CANCELLED]: { bg: "#fdeaea", color: "#d93025" },
  Editing: { bg: "#e8eefc", color: "#3b5fe0" },
  "Photo Selection": { bg: "#f3e8fd", color: "#8a3fd1" },
  "Album Designing": { bg: "#f3e8fd", color: "#8a3fd1" },
  Printing: { bg: "#fff4e0", color: "#c9791a" },
  "Ready for Delivery": { bg: "#e6f4ea", color: "#1e8e3e" },
};

export function stageStatusOf(booking) {
  return STAGES[booking.stageIndex ?? 0];
}
