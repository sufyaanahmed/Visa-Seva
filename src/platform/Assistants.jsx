import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Auth from "./Auth";
import { api } from "./client";
const permissions = {
  "applications:read": "Read my applications and progress",
  "drafts:write": "Create and edit my drafts",
  "applications:submit": "Submit after I confirm on this website",
  "checkout:create": "Create checkout links for me to authorize",
};
function Connections() {
  const [grants, setGrants] = useState([]),
    [token, setToken] = useState(""),
    [label, setLabel] = useState(""),
    [scopes, setScopes] = useState(["applications:read"]),
    [error, setError] = useState(""),
    [config, setConfig] = useState(null),
    [busy, setBusy] = useState(false);
  async function load() {
    setGrants(await api("/agents"));
  }
  useEffect(() => {
    Promise.all([load(), api("/config").then(setConfig)]).catch((e) =>
      setError(e.message),
    );
  }, []);
  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const g = await api("/agents", {
        method: "POST",
        body: { label, scopes },
      });
      setToken(g.token);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="platform-page">
      <Link className="platform-link" to="/applications">
        ← My applications
      </Link>
      <h1>Connected assistants</h1>
      <p>
        Choose what an assistant can access. You still confirm your application
        and authorize checkout here.
      </p>
      <p className="mt-3">
        New to this? <Link className="platform-link" to="/ai-assistants">See how to connect ChatGPT or Claude</Link>.
      </p>
      {error && (
        <p className="platform-alert" role="alert">
          {error}
        </p>
      )}
      <div className="platform-card">
        <h2>Connect with OAuth</h2>
        <p>
          Add this MCP endpoint in an assistant that supports remote MCP and
          OAuth:
        </p>
        <code className="platform-token block mt-4">
          {config?.mcpUrl || "Loading…"}
        </code>
        <p className="platform-muted mt-4">
          Your assistant will open a permission screen. Clients without OAuth
          support can use a temporary access token below.
        </p>
      </div>
      <form className="platform-card" onSubmit={create}>
        <h2>Temporary access token</h2>
        <label>
          Assistant name
          <input
            required
            maxLength={80}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        {Object.entries(permissions).map(([scope, text]) => (
          <label key={scope}>
            <input
              type="checkbox"
              checked={scopes.includes(scope)}
              onChange={(e) =>
                setScopes((current) =>
                  e.target.checked
                    ? [...current, scope]
                    : current.filter((s) => s !== scope),
                )
              }
              className="mr-2"
            />
            {text}
          </label>
        ))}
        <p className="platform-muted">
          Expires in 24 hours. Share the token only with the assistant you
          authorize.
        </p>
        <button
          disabled={busy || !scopes.length}
          className="platform-primary mt-4"
        >
          Authorize assistant
        </button>
        {token && (
          <div role="status" className="mt-5">
            <p>Copy this token now. It is shown only here.</p>
            <code className="platform-token block">{token}</code>
            <button
              type="button"
              className="platform-link"
              onClick={() => setToken("")}
            >
              Hide token
            </button>
          </div>
        )}
      </form>
      <div className="platform-card">
        <h2>Access history</h2>
        {grants.map((g) => (
          <div className="platform-toolbar" key={g.id}>
            <div>
              <strong>{g.label}</strong>
              <p className="platform-muted">
                {g.revoked_at
                  ? "Revoked"
                  : `Expires ${new Date(g.expires_at).toLocaleString()}`}
              </p>
            </div>
            {!g.revoked_at && (
              <button
                className="platform-secondary"
                onClick={async () => {
                  try {
                    await api(`/agents/${g.id}`, { method: "DELETE" });
                    setToken("");
                    await load();
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Revoke access
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default function Assistants() {
  return (
    <Auth>
      <Connections />
    </Auth>
  );
}
function Consent() {
  const [params] = useSearchParams();
  const id = params.get("request");
  const [request, setRequest] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api(`/oauth/request/${id}`)
      .then(setRequest)
      .catch((e) => setError(e.message));
  }, [id]);
  async function choose(approved) {
    setBusy(true);
    try {
      const r = await api(`/oauth/request/${id}`, {
        method: "POST",
        body: { approved },
      });
      window.location.assign(r.redirect);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <div className="platform-page">
      <div className="platform-card max-w-xl mx-auto">
        <p className="platform-kicker">Assistant authorization</p>
        <h1>Allow access?</h1>
        {error && <p role="alert">{error}</p>}
        {request && (
          <>
            <p>
              <strong>{request.client_name}</strong> wants permission to:
            </p>
            <p className="platform-muted mt-2">
              Connection returns to {request.redirect_origin}
            </p>
            <ul className="list-disc pl-5 my-5 space-y-3">
              {request.scopes.map((s) => (
                <li key={s}>{permissions[s]}</li>
              ))}
            </ul>
            <p>
              You can revoke access from Connected assistants at any time. Access
              expires in one hour.
            </p>
            <div className="platform-actions">
              <button
                className="platform-primary"
                disabled={busy}
                onClick={() => choose(true)}
              >
                Allow access
              </button>
              <button
                className="platform-secondary"
                disabled={busy}
                onClick={() => choose(false)}
              >
                Deny
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export function AssistantConsent() {
  return (
    <Auth>
      <Consent />
    </Auth>
  );
}
