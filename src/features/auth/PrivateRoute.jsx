import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { subscribeToAuthState } from "./auth";

// Wraps every /admin/* route (except /admin/login). Waits for Firebase to
// report the current auth state, then either renders the admin page or
// bounces to the login screen. This is what makes the hamburger's
// "Admin Login" -> real dashboard flow actually secure.
export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | in | out

  useEffect(() => {
    const unsub = subscribeToAuthState((user) => {
      setStatus(user ? "in" : "out");
    });
    return () => unsub();
  }, []);

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b90a0" }}>
        Checking session…
      </div>
    );
  }

  if (status === "out") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
