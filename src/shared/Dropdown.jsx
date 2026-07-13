import React, { useEffect, useRef, useState } from "react";
import "./Dropdown.css";

// Custom-styled dropdown, drop-in replacement for a native <select>.
// `options` accepts either an array of plain strings, or an array of
// {value, label} objects when the displayed label needs to differ from
// the stored value. Usage mirrors a controlled <select>:
//   <Dropdown options={["A", "B"]} value={x} onChange={setX} placeholder="Choose…" />
export default function Dropdown({ options, value, onChange, placeholder = "Select…", disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const selected = normalized.find((o) => o.value === value);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className={`dd-wrap${disabled ? " disabled" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className={`dd-trigger${open ? " open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className={selected ? "dd-value" : "dd-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="dd-chevron">▾</span>
      </button>

      {open && (
        <div className="dd-menu">
          {normalized.map((opt) => (
            <div
              key={opt.value}
              className={`dd-option${opt.value === value ? " selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <span className="dd-check">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}