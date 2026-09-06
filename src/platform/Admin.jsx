import React, { useEffect, useRef, useState } from "react";
import { api } from "./client";
import Auth from "./Auth";
import { Badge, Details, History, labels, signOut } from "./Applications";
export function AdminPortal({ request = api }) {
  const [me, setMe] = useState(null),
    [rows, setRows] = useState([]),
    [total, setTotal] = useState(0),
    [counts, setCounts] = useState({}),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState(null),
    [detailId, setDetailId] = useState(null),
    [detailRefresh, setDetailRefresh] = useState(0),
    [detailBusy, setDetailBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [success, setSuccess] = useState(""),
    [reason, setReason] = useState(""),
    [target, setTarget] = useState("under_review"),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [refresh, setRefresh] = useState(0),
    [accessRefresh, setAccessRefresh] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    setError(null);
    request("/me")
      .then((value) => active && setMe(value))
      .catch(
        (e) => active && setError({ scope: "access", message: e.message }),
      );
    return () => {
      active = false;
    };
  }, [accessRefresh, request]);
  useEffect(() => {
    if (!me?.role || detailId) return;
    let active = true;
    setError(null);
    setRows([]);
    setTotal(0);
    setBusy(true);
    Promise.all([
      request(
        `/admin/applications?${new URLSearchParams({ status, search, page })}`,
      ),
      request("/admin/counts"),
    ])
      .then(([result, c]) => {
        if (active) {
          if (page > 0 && page * 25 >= result.count) {
            setPage(Math.max(0, Math.ceil(result.count / 25) - 1));
            return;
          }
          setRows(result.applications);
          setTotal(result.count);
          setCounts(c);
        }
      })
      .catch((e) => active && setError({ scope: "queue", message: e.message }))
      .finally(() => active && setBusy(false));
    return () => {
      active = false;
    };
  }, [me?.role, status, search, page, refresh, detailId, request]);
  useEffect(() => {
    if (!detailId || !me?.role) return;
    let active = true;
    setSelected(null);
    setDetailBusy(true);
    setError(null);
    request(`/admin/applications/${detailId}`)
      .then((a) => {
        if (!active) return;
        setSelected(a);
        setReason("");
        setTarget(
          a.status === "under_review"
            ? "waiting_for_information"
            : "under_review",
        );
      })
      .catch((e) => active && setError({ scope: "detail", message: e.message }))
      .finally(() => active && setDetailBusy(false));
    return () => {
      active = false;
    };
  }, [detailId, detailRefresh, me?.role, request]);
  function open(id) {
    setSelected(null);
    setSuccess("");
    setError(null);
    setDetailId(id);
  }
  function retry() {
    if (error?.scope === "access") setAccessRefresh((x) => x + 1);
    else if (detailId) setDetailRefresh((x) => x + 1);
    else setRefresh((x) => x + 1);
  }
  async function transition(e) {
    e.preventDefault();
    if (submitting.current || !selected) return;
    if (reason.trim().length < 3) {
      setError({
        scope: "decision",
        message: "Enter a reason with at least 3 characters.",
      });
      return;
    }
    submitting.current = true;
    setError(null);
    setSuccess("");
    setSaving(true);
    try {
      await request(`/admin/applications/${selected.id}/transition`, {
        method: "POST",
        body: { version: selected.version, status: target, reason },
      });
      setSelected(null);
      setSuccess("Decision recorded.");
      setDetailRefresh((x) => x + 1);
      setRefresh((x) => x + 1);
    } catch (e) {
      setError({ scope: "decision", message: e.message });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }
  const options =
    selected?.status === "submitted"
      ? ["under_review", "waiting_for_information"]
      : selected?.status === "under_review"
        ? [
            "waiting_for_information",
            ...(["decision_maker", "administrator"].includes(me?.role)
              ? ["accepted", "rejected"]
              : []),
          ]
        : selected?.status === "waiting_for_information"
          ? ["under_review"]
          : [];
  const reviewStatuses = [
    "submitted",
    "under_review",
    "waiting_for_information",
  ];
  const summaryStatuses = ["draft", "awaiting_payment", "accepted", "rejected"];
  const reviewPanel = selected && options.length > 0 && (
    <form className="platform-card platform-review-panel" onSubmit={transition}>
      <div>
        <p className="platform-kicker">Next action</p>
        <h2>Update application status</h2>
      </div>
      <div className="platform-review-fields">
        <label>
          Move application to
          <select
            disabled={saving}
            value={options.includes(target) ? target : ""}
            required
            onChange={(e) => setTarget(e.target.value)}
          >
            <option value="" disabled>
              Choose a status
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {labels[option]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reason and next steps
          <textarea
            disabled={saving}
            required
            minLength={3}
            maxLength={4000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain the decision or specify the information needed."
          />
        </label>
      </div>
      <div className="platform-review-submit">
        <p className="platform-muted">Visible to the applicant.</p>
        <button
          className="platform-primary"
          disabled={saving || detailBusy || !options.includes(target)}
        >
          {saving ? "Recording decision…" : "Record update"}
        </button>
      </div>
    </form>
  );
  return (
    <>
      <header className="platform-admin-header">
        <strong>Visa Seva · Administration</strong>
        <div className="platform-admin-account">
          {me?.role && (
            <span>{labels[me.role] || me.role.replaceAll("_", " ")}</span>
          )}
          <button disabled={saving} onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="platform-page">
        {error && (
          <p role="alert" className="platform-alert">
            {error.message}
            <button
              className="platform-secondary ml-3"
              disabled={saving || detailBusy || (busy && !detailId)}
              onClick={retry}
            >
              {error.scope === "decision" ? "Reload application" : "Try again"}
            </button>
          </p>
        )}
        {success && (
          <p role="status" className="platform-card">
            {success}
          </p>
        )}
        {!me && !error && <p role="status">Checking access…</p>}
        {me && !me.role && (
          <div className="platform-card">
            <h1>Access restricted</h1>
            <p>Your account does not have an assigned admin role.</p>
          </div>
        )}
        {me?.role && (
          <>
            {detailId ? (
              <>
                <button
                  className="platform-link"
                  disabled={saving}
                  onClick={() => {
                    setDetailId(null);
                    setSelected(null);
                    setDetailBusy(false);
                    setError(null);
                    setSuccess("");
                  }}
                >
                  ← All applications
                </button>
                {detailBusy && <p role="status">Opening application…</p>}
                {selected && (
                  <>
                    <div className="platform-toolbar mt-6">
                      <div>
                        <p className="platform-kicker">Application</p>
                        <h1>{selected.reference}</h1>
                      </div>
                      <div className="platform-record-status">
                        <span>Current status</span>
                        <Badge value={selected.status} />
                      </div>
                    </div>
                    {reviewPanel}
                    <div className="platform-card">
                      <h2>Documents</h2>
                      {!selected.documents.length && (
                        <p>No documents uploaded.</p>
                      )}
                      {selected.documents.map((d) => (
                        <div className="platform-toolbar" key={d.id}>
                          <span>
                            {d.type.replaceAll("_", " ")} ·{" "}
                            {Math.ceil(d.size / 1024)} KB
                          </span>
                          <button
                            className="platform-secondary"
                            onClick={async () => {
                              try {
                                const result = await request(
                                  `/admin/applications/${selected.id}/documents/${d.id}`,
                                );
                                window.location.assign(result.signedUrl);
                              } catch (e) {
                                setError({
                                  scope: "download",
                                  message: e.message,
                                });
                              }
                            }}
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="platform-card">
                      <h2>Payment</h2>
                      <Badge value={selected.payment_status} />
                      {selected.payments.map((p) => (
                        <p key={p.id} className="mt-3 platform-muted">
                          {p.currency} {(p.amount / 100).toFixed(2)} ·{" "}
                          {p.status} ·{" "}
                          {p.transaction_reference ||
                            "No transaction reference"}
                        </p>
                      ))}
                    </div>
                    <details className="platform-card platform-disclosure">
                      <summary>
                        <span>Application answers</span>
                        <span className="platform-muted">View full form</span>
                      </summary>
                      <Details application={selected} />
                    </details>
                    <div className="platform-card">
                      <h2>Decision history</h2>
                      <History items={selected.history} />
                    </div>
                    <div className="platform-card">
                      <h2>Email delivery</h2>
                      {selected.emails.length ? (
                        selected.emails.map((e) => (
                          <div className="py-3 border-b" key={e.id}>
                            <strong>{e.subject}</strong>
                            <p className="platform-muted">
                              {e.status} · {e.attempts} attempts ·{" "}
                              {new Date(e.created_at).toLocaleString()}
                            </p>
                            {e.last_error && <p>{e.last_error}</p>}
                          </div>
                        ))
                      ) : (
                        <p>No notifications yet.</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="platform-kicker">Application management</p>
                <h1>Review queue</h1>
                <p className="platform-page-intro">
                  Prioritize submitted applications and cases that need action.
                </p>
                <div className="platform-grid platform-review-stats">
                  {reviewStatuses.map((key) => (
                    <button
                      key={key}
                      className="platform-stat"
                      aria-pressed={status === key}
                      onClick={() => {
                        setStatus(status === key ? "" : key);
                        setPage(0);
                      }}
                    >
                      <strong>{counts[key] || 0}</strong>
                      {labels[key]}
                    </button>
                  ))}
                </div>
                <div
                  className="platform-queue-summary"
                  aria-label="Other application statuses"
                >
                  {summaryStatuses.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setStatus(key);
                        setPage(0);
                      }}
                    >
                      {labels[key]} <strong>{counts[key] || 0}</strong>
                    </button>
                  ))}
                </div>
                <div className="platform-filter-bar">
                  <label className="platform-search-field">
                    Search by reference
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                      }}
                      placeholder="Enter a Visa Seva reference"
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(0);
                      }}
                    >
                      <option value="">All statuses</option>
                      {Object.entries(labels)
                        .slice(0, 7)
                        .map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    className="platform-secondary"
                    disabled={busy}
                    onClick={() => setRefresh((x) => x + 1)}
                  >
                    Refresh queue
                  </button>
                </div>
                {busy && <p role="status">Loading applications…</p>}
                <div className="platform-card platform-scroll platform-queue-card">
                  <table className="platform-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Applicant</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Updated</th>
                        <th>
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <strong>{a.reference}</strong>
                          </td>
                          <td>
                            {a.answers.given_name} {a.answers.surname}
                          </td>
                          <td>
                            <Badge value={a.status} />
                          </td>
                          <td>
                            <Badge value={a.payment_status} />
                          </td>
                          <td>{new Date(a.updated_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="platform-row-action"
                              aria-label={`Review ${a.reference}`}
                              disabled={busy}
                              onClick={() => open(a.id)}
                            >
                              Review <span aria-hidden="true">→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!rows.length && !busy && !error && (
                    <p className="p-5">No matching applications.</p>
                  )}
                </div>
                <div className="platform-actions">
                  <button
                    className="platform-secondary"
                    disabled={!page || busy}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="p-3">
                    Page {page + 1} · {total} applications
                  </span>
                  <button
                    className="platform-secondary"
                    disabled={(page + 1) * 25 >= total || busy}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
export default function Admin() {
  return (
    <Auth admin>
      <AdminPortal />
    </Auth>
  );
}
