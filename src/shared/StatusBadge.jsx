import React from "react";
import { STATUS_COLORS } from "./statuses";
import "./StatusBadge.css";

export default function StatusBadge({ label }) {
  const palette = STATUS_COLORS[label] || { bg: "#eef0f5", color: "#5b6072" };
  return (
    <span className="badge" style={{ background: palette.bg, color: palette.color }}>
      {label}
    </span>
  );
}
