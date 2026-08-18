import Alert from "@/components/Alert";
import UploadField from "@/components/UploadField";
import { formatDateTime } from "@/utils/format";
import { request } from "@/utils/request";
import { IconPaperclip } from "@tabler/icons-react";
import { useState } from "react";

function ReceiptUpload({ receipts, canUpload, onUploaded }) {
  const [sent, setSent] = useState(false);

  const send = async (file) => {
    const body = new FormData();
    body.append("file", file);

    await request({
      url: "/v1/ppdb/registration/payment-proof",
      method: "post",
      data: body,
    });

    setSent(true);
    await onUploaded();
  };

  return (
    <div className="card">
      <p className="m-0 text-sm font-semibold text-slate-500">
        Transfer receipt
      </p>

      {receipts.length > 0 ? (
        <ul className="m-0 mt-3 list-none space-y-2 p-0">
          {receipts.map((receipt) => (
            <li
              key={receipt.id}
              className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm"
            >
              <IconPaperclip size={18} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate">
                {receipt.original_name}
              </span>
              <span className="shrink-0 text-xs text-slate-500">
                {formatDateTime(receipt.created_at)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 mt-1 text-sm text-slate-500">
          No receipt uploaded yet.
        </p>
      )}

      {sent && (
        <div className="mt-4">
          <Alert type="success" title="Receipt sent">
            The school will check the bank statement, then update your
            registration status.
          </Alert>
        </div>
      )}

      {canUpload && (
        <div className="mt-4">
          <UploadField
            label="Upload your transfer receipt"
            note="Photo or PDF, up to 5 MB"
            onSend={send}
          />
        </div>
      )}
    </div>
  );
}

export default ReceiptUpload;
