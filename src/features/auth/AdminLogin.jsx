import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("prakash@jpstudio.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="card login-card" onSubmit={handleLogin}>
        <div className="login-brand">
          <div className="login-logo">JP</div>
          <h2>JP Studio Admin</h2>
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button className="btn btn-gold btn-block" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <div className="login-back-link">
          <a href="/">← Back to JP Studio website</a>
        </div>
      </form>
    </div>
  );
}
