import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

let server, dom, root, host, AdminPortal, createRoot;
before(async () => {
  dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost/",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import("react-dom/client"));
  server = await createServer({
    envDir: false,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  ({ AdminPortal } = await server.ssrLoadModule("/src/platform/Admin.jsx"));
  host = document.getElementById("root");
});
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
});
after(async () => {
  await server?.close();
  dom?.window.close();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});
const record = (id = "one", status = "submitted", version = 1) => ({
  id,
  reference: `VS-${id}`,
  status,
  version,
  payment_status: "paid",
  answers: { application_type: "regular", given_name: id, surname: "Test" },
  documents: [],
  payments: [],
  history: [],
  emails: [],
  updated_at: "2026-09-06T12:00:00Z",
});
function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
function backend(override = () => undefined, role = "reviewer") {
  return async (path, options) => {
    const response = override(path, options);
    if (response !== undefined) return response;
    if (path === "/me") return { role };
    if (path === "/admin/counts") return { submitted: 1 };
    if (path.startsWith("/admin/applications?"))
      return { applications: [record()], count: 1 };
    return record();
  };
}
async function render(request) {
  root = createRoot(host);
  await act(async () =>
    root.render(React.createElement(AdminPortal, { request })),
  );
}
const button = (label) =>
  [...host.querySelectorAll("button")].find(
    (node) =>
      node.textContent.trim() === label ||
      node.getAttribute("aria-label") === `Review ${label}`,
  );
async function click(label) {
  const node = button(label);
  assert.ok(node, label);
  assert.equal(node.disabled, false, `${label} enabled`);
  await act(async () => node.click());
}
async function text(value) {
  const input = host.querySelector("textarea");
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      dom.window.HTMLTextAreaElement.prototype,
      "value",
    ).set.call(input, value);
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  });
}
async function submit() {
  await act(async () =>
    host
      .querySelector("form")
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
}

test("failed access check retries, while unassigned accounts never load the queue", async () => {
  let calls = 0,
    queueCalls = 0;
  await render(
    backend((path) => {
      if (path === "/me")
        return ++calls === 1
          ? Promise.reject(new Error("Access request failed"))
          : { role: null };
      queueCalls++;
      return undefined;
    }),
  );
  assert.match(host.textContent, /Access request failed/);
  await click("Try again");
  assert.match(host.textContent, /Access restricted/);
  assert.equal(queueCalls, 0);
});

test("failed detail load retries that record instead of refreshing the queue", async () => {
  let attempts = 0;
  await render(
    backend((path) => {
      if (path === "/admin/applications/one")
        return ++attempts === 1
          ? Promise.reject(new Error("Record unavailable"))
          : record();
    }),
  );
  await click("VS-one");
  assert.match(host.textContent, /Record unavailable/);
  await click("Try again");
  assert.match(host.textContent, /Application answers/);
  assert.equal(attempts, 2);
});

test("queue emphasizes actionable work and keeps full answers collapsed", async () => {
  await render(backend());
  assert.match(
    host.querySelector(".platform-admin-account").textContent,
    /reviewer/i,
  );
  assert.equal(host.querySelectorAll(".platform-stat").length, 3);
  assert.match(host.textContent, /Prioritize submitted applications/);
  await click("VS-one");
  const answers = host.querySelector(".platform-disclosure");
  assert.ok(answers);
  assert.equal(answers.open, false);
  const review = host.querySelector(".platform-review-panel");
  assert.ok(review);
  assert.ok(
    review.compareDocumentPosition(answers) &
      dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  );
});

test("returning to the queue cancels a pending detail response", async () => {
  const pending = deferred();
  await render(
    backend((path) =>
      path === "/admin/applications/one" ? pending.promise : undefined,
    ),
  );
  await click("VS-one");
  await click("← All applications");
  await act(async () => pending.resolve(record()));
  assert.match(host.textContent, /Review queue/);
  assert.doesNotMatch(host.textContent, /Applicant details/);
});

test("reviewer cannot choose final decisions; decision makers can", async () => {
  for (const role of ["reviewer", "decision_maker", "administrator"]) {
    await render(
      backend(
        (path) =>
          path === "/admin/applications/one"
            ? record("one", "under_review")
            : undefined,
        role,
      ),
    );
    await click("VS-one");
    const choices = [...host.querySelectorAll("form option")].map(
      (o) => o.value,
    );
    assert.equal(choices.includes("accepted"), role !== "reviewer");
    assert.equal(choices.includes("rejected"), role !== "reviewer");
    assert.equal(
      host.querySelector("form select").value,
      "waiting_for_information",
    );
    await act(() => root.unmount());
    root = null;
  }
});

test("saved decisions cannot be resubmitted if the follow-up detail refresh fails", async () => {
  let loads = 0,
    writes = 0;
  await render(
    backend((path, options) => {
      if (options?.method === "POST") {
        writes++;
        assert.equal(options.body.version, 1);
        return record("one", "under_review", 2);
      }
      if (path === "/admin/applications/one")
        return ++loads === 2
          ? Promise.reject(new Error("Refresh failed"))
          : record(
              "one",
              loads > 2 ? "under_review" : "submitted",
              loads > 2 ? 2 : 1,
            );
    }),
  );
  await click("VS-one");
  await text("Documents reviewed");
  await submit();
  assert.match(host.textContent, /Decision recorded/);
  assert.match(host.textContent, /Refresh failed/);
  assert.equal(host.querySelector("form"), null);
  await click("Try again");
  assert.equal(
    host.querySelector("form select").value,
    "waiting_for_information",
  );
  assert.equal(writes, 1);
});

test("stale-version errors preserve the reason and reload the latest decision state", async () => {
  let loads = 0;
  await render(
    backend((path, options) => {
      if (options?.method === "POST")
        return Promise.reject(
          new Error("This application changed. Reload it before continuing."),
        );
      if (path === "/admin/applications/one")
        return record("one", ++loads > 1 ? "accepted" : "under_review", loads);
    }, "decision_maker"),
  );
  await click("VS-one");
  await text("Checked all documents");
  await submit();
  assert.equal(host.querySelector("textarea").value, "Checked all documents");
  await click("Reload application");
  assert.equal(host.querySelector("form"), null);
  assert.match(host.textContent, /Accepted/);
});

test("failed queue refresh clears old rows without claiming there are no matches", async () => {
  let loads = 0;
  await render(
    backend((path) =>
      path.startsWith("/admin/applications?") && ++loads === 2
        ? Promise.reject(new Error("Queue unavailable"))
        : undefined,
    ),
  );
  await click("Refresh queue");
  assert.match(host.textContent, /Queue unavailable/);
  assert.doesNotMatch(host.textContent, /VS-one|No matching applications/);
  await click("Try again");
  assert.ok(button("VS-one"));
});

test("double submission records one decision and locks navigation until it finishes", async () => {
  const pending = deferred();
  let writes = 0;
  await render(
    backend((path, options) => {
      if (options?.method === "POST") {
        writes++;
        return pending.promise;
      }
    }),
  );
  await click("VS-one");
  await text("Review started");
  await submit();
  await submit();
  assert.equal(writes, 1);
  assert.equal(button("← All applications").disabled, true);
  assert.equal(host.querySelector("textarea").disabled, true);
  await act(async () => pending.resolve(record("one", "under_review", 2)));
  assert.equal(button("← All applications").disabled, false);
});

test("pagination recovers when the last page disappears after a refresh", async () => {
  let shrunk = false;
  await render(
    backend((path) => {
      if (!path.startsWith("/admin/applications?")) return undefined;
      const page = Number(new URLSearchParams(path.split("?")[1]).get("page"));
      return {
        count: shrunk ? 1 : 26,
        applications: shrunk && page ? [] : [record(page ? "last" : "first")],
      };
    }),
  );
  await click("Next");
  assert.ok(button("VS-last"));
  shrunk = true;
  await click("Refresh queue");
  assert.ok(button("VS-first"));
  assert.match(host.textContent, /Page 1/);
  assert.equal(button("Previous").disabled, true);
  assert.equal(button("Next").disabled, true);
});

test("leaving a pending detail still allows retrying a queue failure", async () => {
  const pending = deferred();
  let queueLoads = 0;
  await render(
    backend((path) => {
      if (path === "/admin/applications/one") return pending.promise;
      if (path.startsWith("/admin/applications?") && ++queueLoads === 2)
        return Promise.reject(new Error("Queue failed"));
    }),
  );
  await click("VS-one");
  await click("← All applications");
  await click("Try again");
  assert.ok(button("VS-one"));
  await act(async () => pending.resolve(record()));
  assert.match(host.textContent, /Review queue/);
});
