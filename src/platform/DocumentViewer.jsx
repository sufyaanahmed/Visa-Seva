import React, { useEffect, useRef } from "react";
export default function DocumentViewer({ document, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = window.document.activeElement;
    dialog.current.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="platform-document-modal"
      aria-labelledby="document-title"
      onCancel={onClose}
    >
      <div className="platform-toolbar">
        <h2 id="document-title">{document.type.replaceAll("_", " ")}</h2>
        <button autoFocus className="platform-secondary" onClick={onClose}>
          Close preview
        </button>
      </div>
      {document.mime_type === "image/jpeg" ? (
        <img
          src={document.signedUrl}
          alt={document.type.replaceAll("_", " ")}
        />
      ) : (
        <iframe
          title={`${document.type.replaceAll("_", " ")} preview`}
          src={document.signedUrl}
          referrerPolicy="no-referrer"
        />
      )}
      <p className="platform-muted">
        Preview expires after five minutes.{" "}
        <a href={document.signedUrl} target="_blank" rel="noopener noreferrer">
          Open in a new tab
        </a>
      </p>
    </dialog>
  );
}
