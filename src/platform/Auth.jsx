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
      <div className="platform-page platform-unavailable-wrapper">
        <div className="platform-unavailable-card">
          <div className="platform-unavailable-emblem">
            <img
              src="/emblem.svg"
              alt=""
              className="w-12 h-12 opacity-90 mx-auto mb-3"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(20%) sepia(20%) saturate(1500%) hue-rotate(190deg)",
              }}
            />
          </div>
          <span className="platform-kicker">Government of India · Ministry of Home Affairs</span>
          <h1>Application access unavailable</h1>
          <p role="alert">{APPLICATION_ACCESS_UNAVAILABLE}</p>
          <div className="platform-unavailable-note">
            <p className="text-xs text-text/70 mt-4">
              Please verify that <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 border border-amber-200">VITE_SUPABASE_URL</code> and <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 border border-amber-200">VITE_SUPABASE_ANON_KEY</code> are configured in your environment.
            </p>
          </div>
        </div>
      </div>
    );

  if (session === undefined)
    return (
      <div className="platform-page platform-loading-wrapper" role="status">
        <div className="platform-spinner" aria-hidden="true"></div>
        <p>Opening your application…</p>
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

  if (admin) {
    return (
      <div className="platform-admin-auth-wrapper">
        {/* Tricolor Top Stripe */}
        <div className="platform-tricolor-stripe" aria-hidden="true">
          <span className="stripe-saffron"></span>
          <span className="stripe-white"></span>
          <span className="stripe-green"></span>
        </div>

        <div className="platform-admin-split-container">
          {/* Left Side: Official Government Details & Department Information */}
          <aside className="platform-admin-info-side">
            <div className="platform-admin-info-content">
              <div className="platform-gov-emblem-wrap">
                <img
                  src="/emblem.svg"
                  alt="Emblem of India"
                  className="platform-gov-emblem"
                />
              </div>

              <div className="platform-gov-titles">
                <div className="platform-gov-hindi">भारत सरकार</div>
                <div className="platform-gov-eng">Government of India</div>
                <div className="platform-gov-dept">Ministry of Home Affairs & Bureau of Immigration</div>
              </div>

              <div className="platform-gov-divider" aria-hidden="true"></div>

              <div className="platform-system-intro">
                <h2>National Visa Administration System</h2>
                <p>
                  Not Official adjudication console for authorized Consular Officers, Foreigners Regional Registration Officers (FRRO), and Immigration Authorities.
                </p>
              </div>

              <div className="platform-admin-left-footer">
                <p className="platform-gov-warning-text">
                  Restricted to authorized personnel only. Protected under the Official Secrets Act and Information Technology Act.
                </p>
                <div className="platform-gov-nic">
                  National Informatics Centre (NIC)
                </div>
              </div>
            </div>
          </aside>

          {/* Right Side: Officer Sign-in Form */}
          <main className="platform-admin-form-side">
            <div className="platform-login platform-admin-login-card">
              <p className="platform-kicker">Visa Seva administration</p>
              <h1>Admin sign in</h1>
              <p className="platform-form-subtext">
                Sign in with your assigned account.
              </p>

              <form onSubmit={submit} className="platform-form">
                <label>
                  <span>Email address</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    readOnly={sent}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                {message && (
                  <p role="alert" className="platform-admin-error-msg">
                    {message}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEmail("nisarvskp@gmail.com");
                    setPassword("Vs!c3kYuSFhESF7nJwhX7qtSmjW");
                    setMessage("");
                  }}
                  className="platform-demo-btn"
                >
                  Fill Demo Credentials
                </button>

                <div className="platform-form-action">
                  <button className="platform-primary platform-admin-submit-btn" disabled={busy}>
                    {busy ? "Signing in…" : "Sign in"}
                  </button>
                </div>

                <p className="platform-admin-help-text">
                  For technical support, contact the NIC IVFRT Helpdesk at <span className="underline">support-ivfrt@nic.in</span>
                </p>
              </form>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* Regular Applicant Login Flow */
  return (
    <div className="platform-user-auth-wrapper">
      <div className="platform-login">
        <div className="text-center mb-4">
          <img
            src="/emblem.svg"
            alt=""
            className="w-10 h-10 opacity-90 mx-auto mb-2"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(20%) sepia(20%) saturate(1500%) hue-rotate(190deg)",
            }}
          />
        </div>
        <p className="platform-kicker">
          Your application, one link away
        </p>
        <h1>
          {sent ? "Check your email" : "Get a secure link"}
        </h1>
        <p>
          Enter your email to save your progress or reopen an application. No password needed.
        </p>
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              readOnly={sent}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {sent && !defaultEmail && (
            <label>
              Email code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit verification code"
                pattern="[0-9]{6,10}"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          )}
          {message && (
            <p role="status" className="my-4 text-sm text-red-700 font-medium">
              {message}
            </p>
          )}
          {(!sent || !defaultEmail) && (
            <button className="platform-primary" disabled={busy}>
              {busy
                ? "Please wait…"
                : sent
                  ? "Continue securely"
                  : "Email me a secure link"}
            </button>
          )}
        </form>
        {sent && (
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
    </div>
  );
}

