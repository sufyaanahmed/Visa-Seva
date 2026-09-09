export async function completeEmailLink(client, params) {
  if (!client) throw new Error("Application access is not configured.");
  if (params.get("error") || params.get("error_code")) {
    throw new Error(
      "This link has expired or was already used. Request a new secure link.",
    );
  }
  const token = params.get("token_hash");
  const code = params.get("code");
  if (!token && !code)
    throw new Error("This link is incomplete. Request a new secure link.");
  const result = token
    ? await client.auth.verifyOtp({ token_hash: token, type: "email" })
    : await client.auth.exchangeCodeForSession(code);
  if (result.error || !result.data?.session) {
    throw new Error(
      code
        ? "Open this link in the browser where you requested it, or request a fresh link here."
        : "This link has expired or was already used. Request a new secure link.",
    );
  }
}

export function safeEmailNext(requested) {
  if (typeof requested !== "string" || requested.includes("\\"))
    return "/applications";
  if (
    /^\/applications(?:\/[a-f0-9-]{36}(?:\/checkout)?(?:\?[^#]*)?)?$/.test(
      requested,
    )
  )
    return requested;
  if (/^\/(assistants|assistant-consent)(?:\?[^#]*)?$/.test(requested))
    return requested;
  return "/applications";
}
