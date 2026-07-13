import React, { useEffect, useState } from "react";
import Layout from "../adminShell/Layout";
import {
  subscribeToPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  PACKAGE_CATEGORIES,
} from "./packageService";
import { useDialog } from "../../shared/DialogProvider";
import Dropdown from "../../shared/Dropdown";
import "./AdminPackages.css";

const EMPTY_FORM = {
  name: "",
  category: PACKAGE_CATEGORIES[0],
  price: "",
  status: "Active",
  imageUrl: "",
  description: "",
  inclusions: [],
};

export default function Packages() {
  const { alertDialog, confirmDialog } = useDialog();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [inclusionInput, setInclusionInput] = useState("");

  useEffect(() => {
    const unsub = subscribeToPackages((rows) => {
      setPackages(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setInclusionInput("");
    setShowForm(true);
  }

  function openEdit(pkg) {
    setForm({ ...EMPTY_FORM, ...pkg, inclusions: pkg.inclusions || [] });
    setEditingId(pkg.id);
    setInclusionInput("");
    setShowForm(true);
  }

  function addInclusion() {
    const value = inclusionInput.trim();
    if (!value) return;
    setForm((f) => ({ ...f, inclusions: [...(f.inclusions || []), value] }));
    setInclusionInput("");
  }

  function removeInclusion(idx) {
    setForm((f) => ({ ...f, inclusions: f.inclusions.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      await alertDialog("Package name and price are required.");
      return;
    }
    const payload = {
      name: form.name,
      category: form.category || PACKAGE_CATEGORIES[0],
      price: Number(form.price),
      status: form.status,
      imageUrl: form.imageUrl,
      description: form.description,
      inclusions: form.inclusions || [],
    };
    if (editingId) {
      await updatePackage(editingId, payload);
    } else {
      await createPackage(payload);
    }
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (await confirmDialog("Delete this package?", { tone: "warning", confirmLabel: "Delete" })) {
      await deletePackage(id);
    }
  }

  return (
    <Layout title="Packages">
      <div className="packages-toolbar">
        <button className="btn btn-gold" onClick={openNew}>
          + Add Package
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 14 }}>{editingId ? "Edit Package" : "New Package"}</h3>
          <div className="grid grid-2">
            <div className="field">
              <label>Package Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Event Category</label>
              <Dropdown
                options={PACKAGE_CATEGORIES}
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v }))}
              />
              <p className="field-hint">This decides which tab/dropdown this package shows up under on the public site.</p>
            </div>
            <div className="field">
              <label>Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="field">
              <label>Status</label>
              <Dropdown
                options={["Active", "Inactive"]}
                value={form.status}
                onChange={(v) => setForm((f) => ({ ...f, status: v }))}
              />
            </div>
            <div className="field">
              <label>Image URL (Optional)</label>
              <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="A short description shown to customers on the public site…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="field">
            <label>What's Included (press Enter to add)</label>
            <div className="inclusion-input-row">
              <input
                placeholder="e.g. Drone Shoot, 8 Hours Coverage, 1 Album"
                value={inclusionInput}
                onChange={(e) => setInclusionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInclusion();
                  }
                }}
              />
              <button type="button" className="btn btn-outline" onClick={addInclusion}>
                Add
              </button>
            </div>
            <div className="inclusion-chip-row">
              {(form.inclusions || []).map((item, idx) => (
                <span key={idx} className="inclusion-chip">
                  {item}
                  <button type="button" onClick={() => removeInclusion(idx)}>✕</button>
                </span>
              ))}
              {(form.inclusions || []).length === 0 && (
                <span className="inclusion-empty">No inclusions added yet.</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-gold" onClick={handleSave}>
              Save Package
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading && <div className="loading-line">Loading packages…</div>}
        {!loading && packages.length === 0 && <div className="empty-state">No packages yet. Add your first one above.</div>}
        {packages.map((p) => (
          <div key={p.id} className="list-row package-row">
            <div
              className="avatar-thumb package-thumb"
              style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "var(--ink-600)" }}>{p.category} · ₹{Number(p.price).toLocaleString("en-IN")}</div>
              {p.inclusions && p.inclusions.length > 0 && (
                <div className="package-row-inclusions">
                  {p.inclusions.slice(0, 3).map((inc, i) => (
                    <span key={i} className="inclusion-chip small">{inc}</span>
                  ))}
                  {p.inclusions.length > 3 && <span className="inclusion-more">+{p.inclusions.length - 3} more</span>}
                </div>
              )}
              <span
                className="badge package-status-badge"
                style={{
                  background: p.status === "Active" ? "var(--green-bg)" : "#eef0f5",
                  color: p.status === "Active" ? "var(--green)" : "var(--ink-400)",
                }}
                onClick={() => togglePackageStatus(p.id, p.status)}
              >
                {p.status}
              </span>
            </div>
            <button className="btn btn-ghost" onClick={() => openEdit(p)}>
              ✏️
            </button>
            <button className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={() => handleDelete(p.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}