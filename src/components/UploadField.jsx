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
const MAX_BYTES = 5 * 1024 * 1024;

const readableSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * One upload slot, always two steps: pick a file, look at it, then send. The
 * caller owns the request — this only decides what the parent sees.
 */
function UploadField({
  label,
  note,
  status,
  rejectReason,
  currentName,
  onSend,
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

  const pickFile = (event) => {
    const picked = event.target.files?.[0];
    if (fileInput.current) fileInput.current.value = "";
    if (!picked) return;

    if (!ACCEPTED.includes(picked.type)) {
      setError("Only photos (JPG, PNG, WebP) or PDF files are accepted.");
      return;
    }

    if (picked.size > MAX_BYTES) {
      setError(`This file is ${readableSize(picked.size)}. The limit is 5 MB.`);
      return;
    }

    setError("");
    setFile(picked);
  };

  const send = async () => {
    if (!file) return;

    setSending(true);
    setError("");

    try {
      await onSend(file);
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
          {note && <p className="m-0 text-xs text-slate-500">{note}</p>}
        </div>
        {status && <UploadStatus status={status} />}
      </div>

      {currentName && !file && (
        <p className="m-0 mt-2 flex items-center gap-1.5 truncate text-xs text-slate-500">
          <IconFileText size={14} className="shrink-0" />
          {currentName}
        </p>
      )}

      {status === "rejected" && rejectReason && (
        <p className="m-0 mt-2 text-xs italic text-red-600">{rejectReason}</p>
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
              onClick={send}
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
          disabled={disabled}
        >
          <IconUpload size={18} />
          {currentName ? "Upload Again" : "Choose File"}
        </button>
      )}
    </div>
  );
}

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABEL = {
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Rejected",
};

function UploadStatus({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLE[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status === "approved" && <IconCheck size={13} />}
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default UploadField;
