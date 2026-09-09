import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const sessionKey = 'bharat-visa-session-draft-v3';
const abandonedSessionKey = 'bharat-visa-session-draft-v4';
const showcaseSyncContextKey = 'visa-showcase-sync-v1';
const legacyPersistentKey = 'bharat-visa-drafts';
const legacyDatabaseName = 'bharat-visa-drafts';
const schemaVersion = 4;

export const formatReference = (reference) => reference?.replace(/-DEMO(?=-|$)/g, '');

const makeReference = (prefix) => {
  const random = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 12)
    || Math.random().toString(36).slice(2, 14);
  return `${prefix}-${random.toUpperCase()}`;
};

const makeDefaultState = () => ({
  schemaVersion,
  type: 'evisa',
  step: 0,
  furthestStep: 0,
  data: {
    application_type: 'evisa',
    visa_category: '',
    demo_only: true,
  },
  docs: [],
  finder: { answers: {}, step: 0, showResult: false },
  flowDrafts: {},
  identifiers: {
    temporaryDemoId: makeReference('TMP'),
    finalDemoId: null,
    formPreparationId: null,
  },
  outcome: null,
  backend: null,
  submitted: false,
});

export const safeDocumentMetadata = (document, { hydrated = false } = {}) => {
  if (!document || !document.type) return null;
  const extension = String(document.extension || document.name || '')
    .split('.')
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);

  return {
    type: String(document.type),
    displayName: document.displayName || `${String(document.type).replace(/_/g, ' ')}${extension ? `.${extension}` : ''}`,
    extension,
    mimeType: String(document.mimeType || (extension === 'pdf' ? 'application/pdf' : ['jpg', 'jpeg'].includes(extension) ? 'image/jpeg' : extension === 'png' ? 'image/png' : '')),
    size: Number.isFinite(document.size) ? document.size : null,
    width: Number.isFinite(document.width) ? document.width : null,
    height: Number.isFinite(document.height) ? document.height : null,
    // File bytes deliberately are not persisted. A remembered selection must be
    // reselected after reload before it can satisfy document completeness.
    status: document.cloudId ? 'uploaded' : hydrated ? 'needs-reselection' : 'selected-this-session',
    ...(document.cloudId ? { cloudId: document.cloudId } : {}),
    selectedAt: document.selectedAt || new Date().toISOString(),
  };
};

export const isMeaningfulDraft = (state) => Boolean(
  state?.submitted
  || state?.step > 0
  || state?.docs?.length
  || state?.data?.visa_category
  || state?.data?.nationality
  || state?.data?.given_name
);

export const hydrateState = (saved) => {
  const base = makeDefaultState();
  if (!saved || typeof saved !== 'object') return base;

  return {
    ...base,
    ...saved,
    schemaVersion,
    data: { ...base.data, ...(saved.data || {}), demo_only: true },
    docs: Array.isArray(saved.docs) ? saved.docs.map((document) => safeDocumentMetadata(document, { hydrated: true })).filter(Boolean) : [],
    identifiers: {
      ...base.identifiers,
      ...(saved.identifiers || {}),
      temporaryDemoId: saved.identifiers?.temporaryDemoId || makeReference('TMP'),
    },
  };
};

const loadSessionDraft = () => {
  try {
    const saved = globalThis.sessionStorage?.getItem(sessionKey);
    return {
      state: saved ? hydrateState(JSON.parse(saved)) : makeDefaultState(),
      persistence: {
        status: 'saved',
        message: saved
          ? 'Your draft was restored.'
          : 'No saved draft found.',
      },
    };
  } catch (error) {
    return {
      state: makeDefaultState(),
      persistence: {
        status: 'error',
        message: 'Your saved draft could not be opened. Check that browser storage is enabled and try again.',
      },
    };
  }
};

const deleteLegacyDatabase = () => new Promise((resolve, reject) => {
  if (!globalThis.indexedDB) {
    resolve();
    return;
  }

  const request = globalThis.indexedDB.deleteDatabase(legacyDatabaseName);
  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error || new Error('The legacy browser database could not be erased.'));
  request.onblocked = () => reject(new Error('The legacy browser database is open in another tab. Close other copies of this site and try again.'));
});

export const applyDataUpdate = (previous, field, value) => {
  const changed = previous.data?.[field] !== value;
  const invalidatesDocuments = changed && ['visa_category', 'afghan_purpose', 'student_course_type', 'oci_category', 'basis_of_origin'].includes(field);
  const data = { ...previous.data, [field]: value };

  if (changed && field === 'visa_category') {
    data.afghan_purpose = '';
    data.student_course_type = '';
  }

  return {
    ...previous,
    data,
    // Revalidate later steps if an earlier form answer changes after Back.
    furthestStep: changed ? Math.min(previous.furthestStep || previous.step || 0, previous.step || 0) : previous.furthestStep,
    docs: invalidatesDocuments ? [] : previous.docs,
  };
};

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [initialSnapshot] = useState(loadSessionDraft);
  const [state, setState] = useState(initialSnapshot.state);
  const [persistence, setPersistence] = useState(initialSnapshot.persistence);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    try {
      globalThis.sessionStorage?.setItem(sessionKey, JSON.stringify(state));
      setPersistence({
        status: 'saved',
        message: 'Your draft is available while this tab stays open.',
      });
    } catch (error) {
      setPersistence({
        status: 'error',
        message: 'Your draft could not be saved. Keep this page open and check that browser storage is enabled.',
      });
    }
  }, [state]);

  const updateState = (newState) => {
    setState((previous) => {
      const normalized = newState.data
        ? { ...newState, data: { ...newState.data, demo_only: true } }
        : newState;
      const next = { ...previous, ...normalized };
      const isExplicitFreshStart = newState.step === 0
        && newState.submitted === false
        && Array.isArray(newState.docs)
        && newState.docs.length === 0
        && newState.data;
      const isStartingNewFlow = newState.step === 0 && newState.data
        && (newState.data.application_type !== previous.data?.application_type || previous.submitted || isExplicitFreshStart);

      if (isStartingNewFlow) {
        next.furthestStep = 0;
        next.identifiers = {
          temporaryDemoId: makeReference('TMP'),
          finalDemoId: null,
          formPreparationId: null,
        };
        next.outcome = null;
        next.cloud = newState.cloud || null;
      } else if (Number.isInteger(newState.step)) {
        next.furthestStep = Math.max(previous.furthestStep || 0, previous.step || 0, newState.step);
      }
      return next;
    });
  };

  const updateData = (field, value) => {
    setState((previous) => applyDataUpdate(previous, field, value));
  };

  const updateFinder = (update) => {
    setState((previous) => ({
      ...previous,
      finder: typeof update === 'function' ? update(previous.finder) : { ...previous.finder, ...update },
    }));
  };

  const updateFlowDraft = (key, draft) => {
    setState((previous) => ({ ...previous, flowDrafts: { ...previous.flowDrafts, [key]: draft } }));
  };

  const addDocument = (type, fileMetadata) => {
    const metadata = safeDocumentMetadata({ type, ...fileMetadata });
    if (!metadata) return;
    setState((previous) => ({
      ...previous,
      docs: [...previous.docs.filter((document) => document.type !== type), metadata],
    }));
  };

  const removeDocument = (type) => {
    setState((previous) => ({
      ...previous,
      docs: previous.docs.filter((document) => document.type !== type),
    }));
  };

  const completeDemo = (kind = 'application-preparation', backendRecord = null) => {
    setState((previous) => {
      const isFormOnly = kind === 'voa-form';
      return {
        ...previous,
        submitted: true,
        outcome: isFormOnly ? 'form-prepared' : 'demo-preparation-complete',
        backend: backendRecord ? {
          status: 'synced',
          applicationId: backendRecord.id,
          reference: backendRecord.reference,
          submittedAt: backendRecord.submitted_at,
        } : null,
        identifiers: {
          ...previous.identifiers,
          finalDemoId: isFormOnly
            ? previous.identifiers.finalDemoId
            : backendRecord?.reference || previous.identifiers.finalDemoId || makeReference('APP'),
          formPreparationId: isFormOnly
            ? backendRecord?.reference || previous.identifiers.formPreparationId || makeReference('VOA-FORM')
            : previous.identifiers.formPreparationId,
        },
      };
    });
  };

  const clearLocalDraft = async () => {
    setPersistence({ status: 'clearing', message: 'Erasing your draft…' });
    const failures = [];

    try {
      globalThis.sessionStorage?.removeItem(sessionKey);
      globalThis.sessionStorage?.removeItem(abandonedSessionKey);
      globalThis.sessionStorage?.removeItem(showcaseSyncContextKey);
    } catch (error) {
      failures.push(`session draft: ${error instanceof Error ? error.message : 'browser storage error'}`);
    }

    try {
      // Older builds used persistent localStorage. It is deliberately never read
      // by this version and is removed only after this explicit user action.
      globalThis.localStorage?.removeItem(legacyPersistentKey);
    } catch (error) {
      failures.push(`legacy local storage: ${error instanceof Error ? error.message : 'browser storage error'}`);
    }

    try {
      // Older builds also copied the same draft into IndexedDB. Do not inspect it;
      // delete the database only after the user explicitly requests erasure.
      await deleteLegacyDatabase();
    } catch (error) {
      failures.push(`legacy browser database: ${error instanceof Error ? error.message : 'browser database error'}`);
    }

    // Clear in-memory state after the storage attempts and suppress the next save
    // so sensitive old values are not written back by the state-change effect.
    skipNextSave.current = true;
    setState(makeDefaultState());

    if (failures.length) {
      const message = 'Some saved data could not be erased. Close other Visa Seva tabs and try again.';
      setPersistence({ status: 'error', message });
      return { ok: false, message };
    }

    const message = 'Your saved draft was erased.';
    setPersistence({ status: 'cleared', message });
    return { ok: true, message };
  };

  // Starting another application must not reuse the previous finder result or cloud ID.
  const startNewApplication = () => setState(makeDefaultState());
  const resetState = clearLocalDraft;

  return (
    <StoreContext.Provider value={{
      state,
      updateState,
      updateData,
      updateFinder,
      updateFlowDraft,
      addDocument,
      removeDocument,
      completeDemo,
      clearLocalDraft,
      persistence,
      resetState,
      startNewApplication,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
