import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./client";
import "./platform.css";
import { completeEmailLink, safeEmailNext } from "./emailLink.js";
let verification;
export default function MagicLink() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [params] = useState(() => new URLSearchParams(window.location.search));
  useEffect(() => {
    const token = params.get("token_hash") || params.get("code") || "";
    if (!verification || verification.token !== token) {
      const next = safeEmailNext(params.get("next"));
      window.history.replaceState(null, "", "/auth/confirm");
      verification = {
        token,
        promise: (async () => {
          await completeEmailLink(supabase, params);
          return next;
        })(),
      };
    }
    let active = true;
    verification.promise
      .then((next) => {
        if (active) navigate(next, { replace: true });
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [navigate, params]);
  return (
    <div className="platform-login">
      <h1>{error ? "Request a fresh link" : "Opening securely…"}</h1>
      {error ? (
        <>
          <p role="alert">{error}</p>
          <Link
            className="platform-primary mt-6"
            to={safeEmailNext(params.get("next"))}
          >
            Email me a new link
          </Link>
        </>
      ) : (
        <p role="status">Verifying your email link.</p>
      )}
    </div>
  );
}
