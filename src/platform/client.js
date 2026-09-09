import { createClient } from "@supabase/supabase-js";
export const APPLICATION_ACCESS_UNAVAILABLE =
  "Application access is temporarily unavailable. Please try again later.";
export const platformEnabled = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);
export const supabase = platformEnabled
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: "pkce",
          storage: globalThis.localStorage,
          detectSessionInUrl: false,
        },
      },
    )
  : null;
const base = (import.meta.env.VITE_PLATFORM_API_URL || "").replace(/\/$/, "");
export async function api(path, options = {}) {
  if (!supabase) throw new Error(APPLICATION_ACCESS_UNAVAILABLE);
  const { data } = await supabase.auth.getSession();
  if (!data.session)
    throw new Error("Use your secure email link to save this application.");
  const response = await fetch(
    `${base}${path.startsWith("/oauth/") ? path : `/api/platform${path}`}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        ...(!(options.body instanceof File)
          ? { "Content-Type": "application/json" }
          : { "Content-Type": "application/octet-stream" }),
        ...options.headers,
      },
      body:
        options.body instanceof File
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
    },
  );
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) {
    const e = new Error(result.error || "Unable to complete the request.");
    e.details = result.details;
    throw e;
  }
  return result;
}
// Actual file bytes stay in memory until explicitly saved to the applicant's account.
export const selectedFiles = new Map();
export async function saveApplication(state, onSaved, { syncDocuments = true } = {}) {
  if (!supabase) throw new Error(APPLICATION_ACCESS_UNAVAILABLE);
  let app;
  if (state.cloud?.id) {
    app = await api(`/applications/${state.cloud.id}`);
    if (app.version !== state.cloud.version)
      throw new Error(
        "Your application changed elsewhere. Open it from My applications before editing.",
      );
    app = await api(`/applications/${app.id}`, {
      method: "PATCH",
      body: { answers: state.data, version: app.version },
    });
  } else {
    app = await api("/applications", {
      method: "POST",
      body: {
        answers: state.data,
        draft_key: state.identifiers.temporaryDemoId,
      },
    });
    onSaved({ id: app.id, version: app.version });
    if (JSON.stringify(app.answers) !== JSON.stringify(state.data))
      app = await api(`/applications/${app.id}`, {
        method: "PATCH",
        body: { answers: state.data, version: app.version },
      });
  }
  onSaved({ id: app.id, version: app.version });
  if (!syncDocuments) return app;
  const remote = await api(`/applications/${app.id}`);
  for (const doc of remote.documents)
    if (!state.docs.some((d) => d.type === doc.type)) {
      app = await api(`/applications/${app.id}/documents/${doc.type}`, {
        method: "DELETE",
        body: { version: app.version },
      });
      onSaved({ id: app.id, version: app.version });
    }
  for (const doc of state.docs) {
    const file = selectedFiles.get(doc.type);
    if (!file) continue;
    try {
      app = await api(
        `/applications/${app.id}/documents/${doc.type}?version=${app.version}`,
        { method: "POST", body: file },
      );
    } catch (error) {
      error.message = `${doc.type.replaceAll('_', ' ')}: ${error.message}`;
      throw error;
    }
    selectedFiles.delete(doc.type);
    onSaved({ id: app.id, version: app.version });
  }
  const saved = await api(`/applications/${app.id}`);
  onSaved(
    { id: saved.id, version: saved.version },
    saved.documents.map((d) => ({
      type: d.type,
      mimeType: d.mime_type,
      size: d.size,
      status: "uploaded",
      cloudId: d.id,
    })),
  );
  return app;
}
