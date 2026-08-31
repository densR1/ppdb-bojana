import Alert from "@/components/Alert";
import { errorMessage } from "@/utils/request";
import {
  IconCheck,
  IconFileText,
  IconSend,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const readableSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * One upload slot. With `immediate` the file is sent as soon as it is picked;
 * otherwise the parent gets a look at it and presses Send. Five slots on one
 * page are tedious to confirm one by one, but a payment receipt is worth the
 * second look. The caller owns the request.
 */
function UploadField({
  label,
  note,
  currentName,
  onSend,
  immediate = false,
  disabled = false,
}) {
  const fileInput = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openPicker = () => fileInput.current?.click();

  const pickFile = async (event) => {
    const picked = event.target.files?.[0];
    if (fileInput.current) fileInput.current.value = "";
    if (!picked) return;

    if (!ACCEPTED.includes(picked.type)) {
      setError("Only photos (JPG, PNG, WebP) or PDF files are accepted.");
      return;
    }

    if (picked.size > MAX_BYTES) {
      setError(
          `This file is ${readableSize(picked.size)}. The limit is ${MAX_MB} MB.`,
        );
      return;
    }

    setError("");

    if (immediate) {
      await deliver(picked);
      return;
    }

    setFile(picked);
  };

  const deliver = async (target) => {
    setSending(true);
    setError("");

    try {
      await onSend(target);
      setFile(null);
    } catch (err) {
      setError(errorMessage(err, "Failed to send this file"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-navy">{label}</p>
          <p className="m-0 text-xs text-slate-500">
            {note ? `${note} · ` : ""}JPG, PNG, WebP, or PDF · max {MAX_MB} MB
          </p>
        </div>
      </div>

      {currentName && !file && (
        <p className="m-0 mt-2 flex items-center gap-1.5 truncate text-xs text-emerald-700">
          <IconCheck size={14} className="shrink-0" />
          {currentName}
        </p>
      )}

      {error && (
        <div className="mt-3">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={pickFile}
      />

      {file ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white">
                <IconFileText size={22} className="text-slate-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-sm font-medium text-navy">
                {file.name}
              </p>
              <p className="m-0 text-xs text-slate-500">
                {readableSize(file.size)} · ready to send
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={sending}
              aria-label="Remove file"
              className="shrink-0 text-slate-400 transition hover:text-red-600"
            >
              <IconX size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1 !py-2.5 !text-sm"
              onClick={() => deliver(file)}
              disabled={sending}
            >
              <IconSend size={18} />
              {sending ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              className="btn-secondary !py-2.5 !text-sm"
              onClick={openPicker}
              disabled={sending}
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn-secondary btn-block mt-3 !py-2.5 !text-sm"
          onClick={openPicker}
          disabled={disabled || sending}
        >
          <IconUpload size={18} />
          {sending
            ? "Uploading..."
            : currentName
            ? "Upload Again"
            : "Choose File"}
        </button>
      )}
    </div>
  );
}

export default UploadField;
