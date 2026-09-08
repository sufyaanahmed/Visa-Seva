import React, { useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { api, supabase, selectedFiles } from "./client";
import Auth from "./Auth";
import { useStore } from "../store";
import { getSteps } from "../domain/applicationForm";
export const labels = {
  draft: "Draft",
  awaiting_payment: "Awaiting payment",
  submitted: "Submitted",
  under_review: "Under review",
  waiting_for_information: "Waiting for information",
  accepted: "Accepted",
  rejected: "Rejected",
  unpaid: "Unpaid",
  paid: "Paid",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
  cancelled: "Cancelled",
};
export const Badge = ({ value }) => (
  <span className={`platform-badge ${value}`}>{labels[value] || value}</span>
);

// --- Beautiful UI Components ---
function MandalaCorner({ className = '' }) {
  return (
    <svg viewBox="0 0 60 60" className={`w-7 h-7 ${className}`} fill="none">
      <path d="M2 2 L35 2 Q2 2 2 35 Z" fill="#D4AF37" fillOpacity="0.15" stroke="#D4AF37" strokeWidth="1" />
      <path d="M2 2 L22 2 Q2 2 2 22 Z" fill="#1E2A4F" fillOpacity="0.1" />
      <circle cx="10" cy="10" r="4" fill="#D4AF37" fillOpacity="0.5" />
      <path d="M2 18 Q18 18 18 2" stroke="#D4AF37" strokeWidth="0.75" fill="none" />
      <path d="M2 28 Q28 28 28 2" stroke="#1E2A4F" strokeWidth="0.75" strokeDasharray="1.5 1.5" fill="none" />
    </svg>
  );
}

function AshokaChakraWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
      <svg viewBox="0 0 200 200" className="w-64 h-64 text-[#1E2A4F]">
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="7" fill="currentColor" />
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="100" y1="100" x2="100" y2="15"
            stroke="currentColor" strokeWidth="1.5"
            transform={`rotate(${i * 15} 100 100)`}
          />
        ))}
      </svg>
    </div>
  );
}

const AcceptedCard = ({ app }) => {
  const applicantName = [app.answers.given_name, app.answers.surname].filter(Boolean).join(' ') || 'Not provided';
  const visaCategory = app.answers.visa_category || 'e-Visa';
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1E2A4F] to-[#0d152b] rounded-xl border border-[#D4AF37]/40 shadow-xl p-6 text-white max-w-lg mx-auto transform transition hover:scale-[1.01]">
      <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
         <svg viewBox="0 0 200 200" className="w-64 h-64 text-white"><circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="4" /><circle cx="100" cy="100" r="16" fill="none" stroke="currentColor" strokeWidth="4" />{[...Array(24)].map((_, i) => (<line key={i} x1="100" y1="100" x2="100" y2="15" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${i * 15} 100 100)`} />))}</svg>
      </div>
      
      <div className="flex justify-between items-start mb-6 border-b border-[#D4AF37]/20 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/emblem.svg" alt="Emblem" className="w-10 h-10 opacity-90" style={{ filter: 'brightness(0) invert(1)' }} />
          <div>
            <h3 className="font-serif font-bold text-[#D4AF37] uppercase tracking-widest text-[10px]">Republic of India</h3>
            <h2 className="font-sans font-semibold text-lg tracking-wide">{visaCategory}</h2>
          </div>
        </div>
        <div className="bg-[#176B45] text-white px-3 py-1 rounded text-xs font-bold shadow-sm uppercase tracking-wider">
          {app.status === 'accepted' ? 'GRANTED' : app.status}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 relative z-10 text-sm">
        <div>
          <p className="text-gray-400 text-[10px] uppercase font-semibold">Applicant Name</p>
          <p className="font-medium text-white uppercase">{applicantName}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] uppercase font-semibold">Reference ID</p>
          <p className="font-mono font-bold text-[#D4AF37] uppercase">{app.reference}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] uppercase font-semibold">Nationality</p>
          <p className="font-medium text-white uppercase">{app.answers.nationality || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] uppercase font-semibold">Updated At</p>
          <p className="font-medium text-white">{new Date(app.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-[#D4AF37]/20 flex justify-between items-end relative z-10">
        <p className="text-[9px] text-gray-400 max-w-[250px] leading-relaxed">
          Present this authorized document along with your passport at the immigration checkpoint upon arrival.
        </p>
        <button className="bg-[#D4AF37] hover:bg-[#C9933A] text-[#1E2A4F] px-4 py-1.5 rounded text-xs font-bold transition focus:ring-2 focus:ring-white">
          Download ETA
        </button>
      </div>
    </div>
  );
};

const RejectedCard = ({ app }) => {
  const rejectedHistory = [...(app.history || [])].reverse().find(h => h.to_status === 'rejected');
  const reason = rejectedHistory?.reason || 'Your application did not meet the necessary requirements.';

  return (
    <div className="relative overflow-hidden bg-white rounded-xl border border-red-200 shadow-md p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <div>
            <h3 className="font-serif font-bold text-gray-900 text-lg">Application Declined</h3>
            <p className="text-xs text-gray-500 font-mono uppercase">{app.reference}</p>
          </div>
        </div>
        <div className="border border-red-600 text-red-600 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
          {app.status}
        </div>
      </div>
      <div className="bg-red-50/50 border-l-2 border-red-500 p-3 text-sm text-red-900 mb-4 rounded-r">
        <strong>Reason provided by Consular Officer:</strong>
        <p className="mt-1 opacity-90 text-xs">{reason}</p>
      </div>
      <div className="text-xs text-gray-600 flex justify-between items-center">
        <p>Please review guidelines and apply again with valid documents.</p>
        <Link to="/guide/visa-finder" className="text-[#1E2A4F] font-bold underline hover:text-blue-800">Start New Application</Link>
      </div>
    </div>
  );
};

const ReviewCard = ({ app }) => {
  const isPaid = app.payment_status === 'paid';

  return (
    <div className="relative overflow-hidden bg-[#FAF7F0] rounded-xl border border-[#D4AF37]/30 shadow-md p-6 max-w-lg mx-auto">
      <MandalaCorner className="absolute top-0 left-0" />
      <MandalaCorner className="absolute bottom-0 right-0 transform rotate-180" />
      <AshokaChakraWatermark />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-white flex items-center justify-center mb-3 shadow-sm">
          <svg className="w-6 h-6 text-[#1E2A4F] animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div className="bg-[#1E2A4F]/10 text-[#1E2A4F] px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2">
          {app.status.replace(/_/g, ' ')}
        </div>
        <h3 className="font-serif font-bold text-gray-900 text-lg mb-1">Dossier Processing</h3>
        <p className="text-xs text-gray-600 max-w-xs mx-auto mb-5">
          Your application <span className="font-mono font-semibold uppercase">{app.reference}</span> has been successfully submitted and is currently under consular evaluation.
        </p>
        
        <div className="w-full bg-white border border-[#D4AF37]/40 shadow-xs rounded p-4 text-left">
          <div className="flex justify-between items-center text-xs mb-3">
            <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Payment Status</span>
            {isPaid ? (
              <span className="text-[#176B45] font-bold flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Fee Received
              </span>
            ) : (
              <span className="text-[#C4762A] font-bold">Unpaid</span>
            )}
          </div>
          <div className="w-full bg-[#E6DFD3] rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#1E2A4F] h-1.5 w-2/3 animate-pulse"></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-gray-500">Processing Step 2 of 3</span>
            <span className="text-[10px] font-semibold text-[#C4762A]">Estimated: 48-72 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};
// ------------------------------
export async function signOut() {
  selectedFiles.clear();
  sessionStorage.removeItem("bharat-visa-session-draft-v3");
  await supabase.auth.signOut();
  window.location.assign("/");
}
export function Details({ application }) {
  const steps = getSteps(
    application.answers.application_type,
    application.answers,
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {steps.map((step, idx) => {
        const fields = (step.fields || []).filter((f) => !f.visible || f.visible(application.answers));
        if (fields.length === 0) return null;
        
        return (
          <div key={step.name || idx} className="bg-white rounded-xl border border-[#E6DFD3] shadow-sm overflow-hidden">
            <div className="bg-[#FAF7F0] border-b border-[#E6DFD3] px-5 py-3">
              <h3 className="font-serif font-bold text-[#1E2A4F] text-[1.05rem]">{step.title || step.name}</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {fields.map((f) => (
                <div key={f.name} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">{f.label}</span>
                  <span className="font-medium text-gray-900 text-[0.95rem]">
                    {typeof application.answers[f.name] === "boolean"
                      ? application.answers[f.name] ? "Yes" : "No"
                      : String(application.answers[f.name] || "—")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function History({ items }) {
  return (
    <div className="relative border-l-2 border-[#D4AF37]/30 ml-4 space-y-6 max-w-2xl">
      {items.map((h) => (
        <div key={h.id} className="relative pl-6">
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#D4AF37]"></div>
          <strong className="block font-sans text-sm uppercase tracking-wider text-[#1E2A4F] mb-1">{labels[h.to_status]}</strong>
          <time dateTime={h.created_at} className="block text-xs text-gray-500 mb-2">
            {new Date(h.created_at).toLocaleString()}
          </time>
          {h.reason && (
            <p className="bg-[#FAF7F0] p-3 rounded-lg text-sm text-gray-700 border border-[#E6DFD3] shadow-sm">
              {h.reason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
function ApplicationList() {
  const { startNewApplication } = useStore();
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [page, setPage] = useState(0),
    [refresh, setRefresh] = useState(0),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api(`/applications?page=${page}`)
      .then((x) => active && setResult(x))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, refresh]);
  return (
    <div className="platform-page">
      <div className="platform-toolbar">
        <div>
          <p className="platform-kicker">Your applications</p>
          <h1>My applications</h1>
        </div>
        <button className="platform-secondary" onClick={signOut}>
          Close secure access
        </button>
      </div>
      <div className="platform-actions">
        <Link
          className="platform-primary"
          to="/guide/visa-finder"
          onClick={() => {
            selectedFiles.clear();
            startNewApplication();
          }}
        >
          Start an application
        </Link>
        <Link className="platform-secondary" to="/assistants">
          Connected assistants
        </Link>
      </div>
      {error && (
        <p role="alert" className="platform-alert">
          {error}
          <button
            className="platform-secondary ml-3"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Try again
          </button>
        </p>
      )}
      {!result && !error && <p role="status">Loading applications…</p>}
      {result?.applications.length === 0 && (
        <div className="platform-card">
          <h2>Ready when you are</h2>
          <p>Start with the Visa Finder to choose your application route.</p>
        </div>
      )}
      {result?.applications.map((a) => (
        <Link
          key={a.id}
          to={`/applications/${a.id}`}
          className="platform-card block"
        >
          <div className="platform-toolbar">
            <strong>{a.reference}</strong>
            <Badge value={a.status} />
          </div>
          <p>
            {[a.answers.given_name, a.answers.surname]
              .filter(Boolean)
              .join(" ") || "Untitled application"}
          </p>
          <p className="platform-muted">
            {a.answers.visa_category} · Updated{" "}
            {new Date(a.updated_at).toLocaleDateString()}
          </p>
        </Link>
      ))}
      {result && (
        <div className="platform-actions">
          <button
            disabled={loading || !page}
            className="platform-secondary"
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <button
            disabled={loading || (page + 1) * 25 >= result.count}
            className="platform-secondary"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
export default function Applications() {
  return (
    <Auth>
      <ApplicationList />
    </Auth>
  );
}
function ApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateState } = useStore();
  const [app, setApp] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirmed, setConfirmed] = useState(false),
    [validation, setValidation] = useState(null);
  const load = useCallback(async () => {
    const a = await api(`/applications/${id}`);
    setApp(a);
    return a;
  }, [id]);
  useEffect(() => {
    setApp(null);
    setError("");
    setConfirmed(false);
    setValidation(null);
    load().catch((e) => setError(e.message));
  }, [load]);
  async function action(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
      if (e.details) setValidation(e.details);
    } finally {
      setBusy(false);
    }
  }
  async function edit() {
    let a = app;
    if (a.status === "awaiting_payment")
      a = await api(`/applications/${id}/reopen`, { method: "POST" });
    selectedFiles.clear();
    updateState({
      data: a.answers,
      type: a.answers.application_type,
      step: 0,
      furthestStep: getSteps(a.answers.application_type, a.answers).length - 1,
      submitted: false,
      cloud: { id: a.id, version: a.version },
      docs: app.documents.map((d) => ({
        type: d.type,
        mimeType: d.mime_type,
        size: d.size,
        status: "uploaded",
        cloudId: d.id,
      })),
      identifiers: { temporaryDemoId: a.draft_key, finalDemoId: null },
    });
    navigate("/apply");
  }
  async function checkout() {
    const p = await api(`/applications/${id}/checkout`, {
      method: "POST",
      body: { version: app.version, request_key: crypto.randomUUID() },
    });
    navigate(`/applications/${id}/checkout?session=${p.id}`);
  }
  if (!app)
    return (
      <div className="platform-page">
        <Link to="/applications">← My applications</Link>
        <p role={error ? "alert" : "status"}>
          {error || "Opening application…"}
        </p>
        {error && (
          <button
            className="platform-secondary mt-4"
            onClick={() => {
              setError("");
              load().catch((e) => setError(e.message));
            }}
          >
            Try again
          </button>
        )}
      </div>
    );
  const editable = [
    "draft",
    "waiting_for_information",
    "awaiting_payment",
  ].includes(app.status);
  const currentConfirmation =
    app.confirmed_version === app.version &&
    Date.parse(app.confirmed_at) > Date.now() - 86400000;
  return (
    <div className="platform-page">
      <Link className="platform-link mb-4 inline-block" to="/applications">
        ← My applications
      </Link>
      
      <div className="mb-10">
        {app.status === 'accepted' && <AcceptedCard app={app} />}
        {app.status === 'rejected' && <RejectedCard app={app} />}
        {['submitted', 'under_review', 'processing', 'pending'].includes(app.status) && <ReviewCard app={app} />}
        
        {!['accepted', 'rejected', 'submitted', 'under_review', 'processing', 'pending'].includes(app.status) && (
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-[#E6DFD3] shadow-sm max-w-4xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4762A] mb-1">{app.reference}</p>
              <h1 className="font-serif text-2xl text-[#1E2A4F] font-bold m-0">Your Application</h1>
            </div>
            <Badge value={app.status} />
          </div>
        )}
      </div>
      <div className="platform-card">
        <div className="platform-toolbar">
          <h2>Payment</h2>
          <Badge value={app.payment_status} />
        </div>
        {app.payment_status === "paid" ? (
          <p>
            Payment received.{" "}
            {editable ? "You can submit once your details are confirmed." : ""}
          </p>
        ) : (
          <p>Review your details before continuing to checkout.</p>
        )}
      </div>
      {app.status === "waiting_for_information" && (
        <div className="platform-alert">
          <strong>Additional information needed</strong>
          <p>
            {
              [...app.history]
                .reverse()
                .find((h) => h.to_status === "waiting_for_information")?.reason
            }
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="platform-alert">
          {error}
        </p>
      )}
      {validation && !validation.complete && (
        <ul className="platform-alert list-disc pl-8">
          {Object.entries(validation.errors).map(([key, value]) => (
            <li key={key}>
              {key.replaceAll("_", " ")}: {value}
            </li>
          ))}
        </ul>
      )}
      <section className="mt-8">
        <h2 className="text-xl font-serif font-bold text-[#1E2A4F] mb-6">Applicant details</h2>
        <Details application={app} />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-serif font-bold text-[#1E2A4F] mb-4">Documents</h2>
        {app.documents.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            {app.documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E6DFD3] shadow-sm">
                <span className="font-medium text-gray-800 capitalize">{d.type.replaceAll("_", " ")}</span>
                <button
                  className="bg-[#FAF7F0] hover:bg-[#E6DFD3] text-[#1E2A4F] px-4 py-1.5 rounded text-xs font-bold transition focus:ring-2 focus:ring-[#D4AF37]"
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      const r = await api(
                        `/applications/${id}/documents/${d.id}`,
                      );
                      window.location.assign(r.signedUrl);
                    })
                  }
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No documents uploaded.</p>
        )}
      </section>
      {editable && (
        <section className="platform-card">
          <h2>Review and continue</h2>
          <p>Check all answers and documents before confirming.</p>
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mr-2"
            />
            I have reviewed these details and authorize submission of this
            application.
          </label>
          <div className="platform-actions">
            <button
              className="platform-secondary"
              disabled={busy}
              onClick={() => action(edit)}
            >
              Edit application
            </button>
            <button
              className="platform-secondary"
              disabled={busy}
              onClick={() =>
                action(async () =>
                  setValidation(
                    await api(`/applications/${id}/validate`, {
                      method: "POST",
                    }),
                  ),
                )
              }
            >
              Check completeness
            </button>
            {!currentConfirmation && (
              <button
                className="platform-primary"
                disabled={busy || !confirmed}
                onClick={() =>
                  action(async () => {
                    await api(`/applications/${id}/confirm`, {
                      method: "POST",
                      body: { version: app.version },
                    });
                    setConfirmed(false);
                  })
                }
              >
                Confirm details
              </button>
            )}
            {currentConfirmation && app.payment_status !== "paid" && (
              <button
                className="platform-primary"
                disabled={busy}
                onClick={() => action(checkout)}
              >
                Continue to checkout
              </button>
            )}
            {currentConfirmation && app.payment_status === "paid" && (
              <button
                className="platform-primary"
                disabled={busy}
                onClick={() =>
                  action(async () =>
                    api(`/applications/${id}/submit`, {
                      method: "POST",
                      body: { version: app.version },
                    }),
                  )
                }
              >
                Submit application
              </button>
            )}
          </div>
        </section>
      )}
      {app.history.length > 0 && (
        <section className="mt-12 mb-8">
          <h2 className="text-xl font-serif font-bold text-[#1E2A4F] mb-6">Application history</h2>
          <History items={app.history} />
        </section>
      )}
    </div>
  );
}
export function ApplicationDetail() {
  return (
    <Auth>
      <ApplicationView />
    </Auth>
  );
}
function CheckoutView() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const paymentId = params.get("session");
  const [app, setApp] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [outcome, setOutcome] = useState("paid");
  const load = useCallback(async () => {
    const a = await api(`/applications/${id}`);
    setApp(a);
    return a;
  }, [id]);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  async function pay(result) {
    setBusy(true);
    setError("");
    try {
      await api(`/applications/${id}/payments/${paymentId}`, {
        method: "POST",
        body: { outcome: "processing" },
      });
      await load();
      await new Promise((r) => setTimeout(r, 1000));
      await api(`/applications/${id}/payments/${paymentId}`, {
        method: "POST",
        body: { outcome: result },
      });
      await load();
    } catch (e) {
      setError(e.message);
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  const payment = app?.payments.find((p) => p.id === paymentId);
  return (
    <div className="platform-page">
      <div className="platform-checkout">
        <Link to={`/applications/${id}`} className="platform-link">
          ← Back to application
        </Link>
        <div className="platform-card">
          <p className="platform-kicker">Secure checkout · Sandbox</p>
          <h1>
            {payment?.status === "paid"
              ? "Payment successful"
              : "Complete payment"}
          </h1>
          {error && (
            <p role="alert" className="platform-alert">
              {error}
            </p>
          )}
          {!app && !error && <p role="status">Opening checkout…</p>}
          {app && !payment && (
            <p role="alert">
              Checkout session not found. Return to your application.
            </p>
          )}
          {payment && (
            <>
              <p className="platform-muted">{app.reference}</p>
              <p className="text-3xl my-6 font-serif">
                {new Intl.NumberFormat("en", {
                  style: "currency",
                  currency: payment.currency,
                }).format(payment.amount / 100)}
              </p>
              <div className="flex gap-3 my-5">
                <span className="platform-badge">VISA</span>
                <span className="platform-badge">Mastercard</span>
              </div>
              <p className="platform-muted">
                No money is charged. No card details are needed.
              </p>
              <div className="my-5">
                <Badge value={payment.status} />
              </div>
              {busy && (
                <div role="status">
                  <div className="platform-spinner" />
                  Processing payment…
                </div>
              )}
              {!busy && ["pending", "processing"].includes(payment.status) && (
                <>
                  {payment.status === "processing" && (
                    <p className="platform-alert">
                      Payment was interrupted. Continue with this session to
                      avoid starting another payment.
                    </p>
                  )}
                  <label>
                    Test payment result
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                    >
                      <option value="paid">Successful</option>
                      <option value="failed">Declined</option>
                      <option value="pending">Pending</option>
                    </select>
                  </label>
                  <div className="platform-actions">
                    <button
                      className="platform-primary"
                      onClick={() => pay(outcome)}
                    >
                      Authorize payment
                    </button>
                    <button
                      className="platform-secondary"
                      onClick={() => pay("cancelled")}
                    >
                      Cancel payment
                    </button>
                  </div>
                </>
              )}
              {payment.status === "paid" && (
                <p>
                  Your payment is recorded. Return to your application to submit
                  it.
                </p>
              )}
              {["failed", "cancelled"].includes(payment.status) && (
                <p>
                  {payment.status === "failed"
                    ? "The payment was declined."
                    : "Payment was cancelled."}{" "}
                  Your application is saved. Return to it to retry checkout.
                </p>
              )}
              <Link
                className="platform-secondary mt-6"
                to={`/applications/${id}`}
              >
                {payment.status === "paid"
                  ? "Continue to submission"
                  : "Return to application"}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export function Checkout() {
  return (
    <Auth>
      <CheckoutView />
    </Auth>
  );
}
