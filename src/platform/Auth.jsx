import React, { useEffect, useState } from "react";
import { supabase, platformEnabled, APPLICATION_ACCESS_UNAVAILABLE } from "./client";
import "./platform.css";
export default function Auth({ children, admin = false, initialEmail = "" }) {
  const defaultEmail = import.meta.env.VITE_AUTH_EMAIL_TEMPLATE === "default";
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null));
    const { data } = supabase.auth.onAuthStateChange((_event, value) =>
      setSession(value),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  if (!platformEnabled)
    return (
      <div className="platform-page">
        <h1>Application access unavailable</h1>
        <p role="alert">{APPLICATION_ACCESS_UNAVAILABLE}</p>
      </div>
    );
  if (session === undefined)
    return (
      <div className="platform-page" role="status">
        Opening your application…
      </div>
    );
  if (session) return children;
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (admin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (sent) {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: "email",
        });
        if (error) throw error;
      } else {
        const next =
          window.location.pathname === "/apply"
            ? "/applications"
            : window.location.pathname + window.location.search;
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setSent(true);
        setMessage(
          defaultEmail
            ? "Open the secure link from your email in this browser to continue."
            : "Check your email for a secure link. You can also enter the code here to keep working in this tab.",
        );
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="platform-login">
      <p className="platform-kicker">
        {admin ? "Visa Seva administration" : "Your application, one link away"}
      </p>
      <h1>
        {admin
          ? "Admin sign in"
          : sent
            ? "Check your email"
            : "Get a secure link"}
      </h1>
      <p>
        {admin
          ? "Sign in with your assigned account."
          : "Enter your email to save your progress or reopen an application. No password needed."}
      </p>
      <form onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            readOnly={sent}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {admin && (
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        )}
        {!admin && sent && !defaultEmail && (
          <label>
            Email code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,10}"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </label>
        )}
        {message && (
          <p role="status" className="my-4">
            {message}
          </p>
        )}
        {(!sent || admin || !defaultEmail) && (
          <button className="platform-primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : admin
                ? "Sign in"
                : sent
                  ? "Continue securely"
                  : "Email me a secure link"}
          </button>
        )}
      </form>
      {!admin && sent && (
        <button
          className="platform-link"
          onClick={() => {
            setSent(false);
            setCode("");
            setMessage("");
          }}
        >
          Use another email or request a new link
        </button>
      )}
    </div>
  );
}
