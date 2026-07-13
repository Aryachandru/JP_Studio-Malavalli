import React, { createContext, useCallback, useContext, useState } from "react";
import "./DialogProvider.css";

const DialogContext = createContext(null);

// Wraps the whole app (see App.js) and gives every component access to
// styled, Promise-based replacements for window.alert()/window.confirm()
// via the useDialog() hook below — same call pattern, just:
//   alert("message")               ->  await alertDialog("message")
//   if (window.confirm("..."))     ->  if (await confirmDialog("..."))
export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const alertDialog = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      setDialog({
        type: "alert",
        message,
        title: opts.title || (opts.tone === "error" ? "Something went wrong" : "Notice"),
        tone: opts.tone || "info",
        okLabel: opts.okLabel || "OK",
        resolve,
      });
    });
  }, []);

  const confirmDialog = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      setDialog({
        type: "confirm",
        message,
        title: opts.title || "Please confirm",
        tone: opts.tone || "warning",
        confirmLabel: opts.confirmLabel || "Confirm",
        cancelLabel: opts.cancelLabel || "Cancel",
        resolve,
      });
    });
  }, []);

  function close(result) {
    if (dialog) dialog.resolve(result);
    setDialog(null);
  }

  return (
    <DialogContext.Provider value={{ alertDialog, confirmDialog }}>
      {children}

      {dialog && (
        <div className="dlg-overlay" onClick={() => dialog.type === "alert" && close(true)}>
          <div className="dlg-panel" onClick={(e) => e.stopPropagation()}>
            <div className={`dlg-icon dlg-icon-${dialog.tone}`}>
              {dialog.tone === "error" ? "✕" : dialog.tone === "warning" ? "!" : dialog.tone === "success" ? "✓" : "i"}
            </div>
            <h3 className="dlg-title">{dialog.title}</h3>
            <p className="dlg-message">{dialog.message}</p>
            <div className="dlg-actions">
              {dialog.type === "confirm" && (
                <button className="dlg-btn dlg-btn-ghost" onClick={() => close(false)}>
                  {dialog.cancelLabel}
                </button>
              )}
              <button
                className={`dlg-btn ${dialog.tone === "error" || dialog.tone === "warning" ? "dlg-btn-danger" : "dlg-btn-primary"}`}
                onClick={() => close(true)}
              >
                {dialog.type === "confirm" ? dialog.confirmLabel : dialog.okLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog() must be called from a component rendered inside <DialogProvider>");
  }
  return ctx;
}