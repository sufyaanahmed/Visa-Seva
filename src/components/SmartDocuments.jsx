import React, { useRef, useState } from "react";
import { useStore } from "../store";
import { selectedFiles, platformEnabled } from "../platform/client";

import { getRequiredDocuments } from "../domain/documentRequirements.js";
export { getRequiredDocuments } from "../domain/documentRequirements.js";
import { validateFile } from "../domain/documentValidation.js";
import { compressImage } from "../domain/imageCompression.js";
const KB = 1024;

export default function SmartDocuments() {
  const { state, addDocument, removeDocument } = useStore();
  const [errors, setErrors] = useState({});
  const selections = useRef({});
  const requiredDocs = getRequiredDocuments(state.data);

  const handleDocument = async (event, requirement) => {
    const input = event.target;
    let file = input.files?.[0];
    if (!file) return;
    input.value = "";
    const attempt = (selections.current[requirement.type] || 0) + 1;
    selections.current[requirement.type] = attempt;
    try {
      let wasOptimized = false;
      let originalSize = file.size;

      // Auto-compress and center-crop if image exceeds size limit or needs square ratio (100% in browser, 0 server load)
      const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].some((ext) => file.name.toLowerCase().endsWith(ext));
      if (isImage && (requirement.square || (requirement.maxBytes && file.size > requirement.maxBytes) || file.size > 1024 * 1024)) {
        try {
          const compressionResult = await compressImage(file, {
            maxBytes: requirement.maxBytes || 1024 * 1024,
            minBytes: requirement.minBytes || 10 * 1024,
            square: Boolean(requirement.square),
            maxWidth: requirement.square ? 1000 : 1600,
            maxHeight: requirement.square ? 1000 : 1600,
          });
          if (compressionResult && compressionResult.file) {
            file = compressionResult.file;
            wasOptimized = compressionResult.wasCompressed;
            originalSize = compressionResult.originalSize;
          }
        } catch (compressionErr) {
          console.warn("Client-side image compression fallback:", compressionErr);
        }
      }

      const validation = await validateFile(file, requirement);
      if (selections.current[requirement.type] !== attempt) return;
      if (typeof validation === "string") {
        setErrors((current) => ({
          ...current,
          [requirement.type]: validation,
        }));

        return;
      }
      if (platformEnabled) selectedFiles.set(requirement.type, file);
      addDocument(requirement.type, {
        extension: validation.extension,
        mimeType: file.type || requirement.mimeTypes[0],
        size: file.size,
        originalSize: wasOptimized ? originalSize : undefined,
        wasOptimized,
        width: validation.width,
        height: validation.height,
        selectedAt: new Date().toISOString(),
      });
      setErrors((current) => ({ ...current, [requirement.type]: null }));
    } catch (error) {
      if (selections.current[requirement.type] !== attempt) return;
      setErrors((current) => ({
        ...current,
        [requirement.type]: error.message,
      }));
    }
  };

  if (state.data.application_type === "voa") {
    return (
      <div className="border border-blue-200 bg-blue-50 p-5 rounded text-blue-950">
        <strong className="block mb-2">Documents to bring</strong>
        <p className="text-sm">
          Carry your completed Annexure I form, arrival card, passport, return
          or onward ticket, and evidence of funds to the airport.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requiredDocs.map((requirement) => {
        const remembered = state.docs.find(
          (document) => document.type === requirement.type,
        );
        const selected = ["selected-this-session", "uploaded"].includes(
          remembered?.status,
        )
          ? remembered
          : null;
        const inputId = `document-${requirement.type}`;
        const ruleId = `${inputId}-rule`;
        const errorId = `${inputId}-error`;
        return (
          <div
            key={requirement.type}
            className={`border rounded p-5 ${selected ? "border-green-300 bg-green-50" : "border-gray-300 bg-white"}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex gap-4">
                <div
                  className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {selected ? "✓" : "○"}
                </div>
                <div>
                  <strong className="text-gray-900 text-lg block mb-1">
                    {requirement.title}
                  </strong>
                  <p className="text-gray-600 text-sm">{requirement.desc}</p>
                  <p id={ruleId} className="text-xs text-gray-500 mt-2">
                    {requirement.rule}
                    {!requirement.maxBytes && " Upload limit: 10 MB per file."}
                  </p>
                  {selected && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm text-green-800 font-bold">
                        {selected.extension?.toUpperCase()}
                        {selected.size
                          ? ` · ${Math.round(selected.size / KB)} KB`
                          : ""}
                      </p>
                      {selected.wasOptimized && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span>Auto-optimized</span>
                          <span className="text-emerald-700 font-normal">
                            ({Math.round((selected.originalSize || 0) / KB)} KB → {Math.round(selected.size / KB)} KB)
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  {!selected && remembered?.status === "needs-reselection" && (
                    <p className="mt-2 text-sm font-bold text-amber-800">
                      Choose this file again to continue.
                    </p>
                  )}
                  {errors[requirement.type] && (
                    <p
                      id={errorId}
                      role="alert"
                      className="mt-2 text-sm font-bold text-red-700"
                    >
                      {errors[requirement.type]}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {selected && (
                  <button
                    type="button"
                    onClick={() => {
                      selections.current[requirement.type] =
                        (selections.current[requirement.type] || 0) + 1;
                      selectedFiles.delete(requirement.type);
                      removeDocument(requirement.type);
                      setErrors((current) => ({
                        ...current,
                        [requirement.type]: null,
                      }));
                    }}
                    className="px-3 py-2 text-sm font-bold text-red-700 border border-red-200 rounded"
                  >
                    Remove
                  </button>
                )}
                <input
                  id={inputId}
                  type="file"
                  className="sr-only peer"
                  accept={requirement.accepted}
                  aria-invalid={Boolean(errors[requirement.type])}
                  aria-describedby={`${ruleId}${errors[requirement.type] ? ` ${errorId}` : ""}`}
                  onChange={(event) => handleDocument(event, requirement)}
                />
                <label
                  htmlFor={inputId}
                  className="cursor-pointer whitespace-nowrap px-5 py-2 text-sm font-bold rounded bg-[#0b2540] text-white hover:bg-[#163a5f] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0b2540]"
                >
                  {selected ? "Replace" : "Choose file"}
                </label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
