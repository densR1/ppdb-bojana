import { formatDateTime } from "@/utils/format";
import { request } from "@/utils/request";
import { IconDownload, IconReceipt } from "@tabler/icons-react";
import { useEffect, useState } from "react";

/**
 * Kwitansi untuk setiap tagihan yang sudah lunas. Berkas PDF dibuat di
 * peramban, dan pustaka pembuatnya baru diunduh saat tombol ditekan supaya
 * tidak membebani halaman.
 */
function ReceiptCard() {
  const [receipts, setReceipts] = useState([]);
  const [sedang, setSedang] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;

    request({ url: "/v1/ppdb/registration/receipts" })
      .then((response) => {
        if (!batal) setReceipts(response.data.data.receipts ?? []);
      })
      .catch(() => {
        if (!batal) setReceipts([]);
      });

    return () => {
      batal = true;
    };
  }, []);

  const unduh = async (receipt) => {
    setSedang(receipt.receipt_number);
    setError("");
    try {
      const [{ pdf }, { default: ReceiptPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ReceiptPdf"),
      ]);

      const blob = await pdf(<ReceiptPdf data={receipt} />).toBlob();
      const url = URL.createObjectURL(blob);
      const tautan = document.createElement("a");
      tautan.href = url;
      tautan.download = `Receipt ${receipt.receipt_number}.pdf`;
      tautan.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not build the PDF. Please try again.");
    } finally {
      setSedang("");
    }
  };

  if (receipts.length === 0) return null;

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-base font-bold text-navy">
            Receipts &amp; Payments
          </p>
          <p className="m-0 mt-0.5 text-sm text-slate-500">
            Verified proof of the payments the school has confirmed
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {receipts.length} {receipts.length === 1 ? "Document" : "Documents"}
        </span>
      </div>

      <ul className="m-0 mt-4 list-none space-y-3 p-0">
        {receipts.map((receipt) => (
          <li
            key={receipt.receipt_number}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400">
              <IconReceipt size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 text-sm font-semibold text-navy">
                  {receipt.fee_label}
                </p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  Paid
                </span>
              </div>
              <p className="m-0 mt-0.5 text-xs text-slate-500">
                {receipt.receipt_number} &middot;{" "}
                {formatDateTime(receipt.issued_at)}
              </p>
            </div>
            <button
              className="btn-secondary shrink-0 px-4 py-2 text-sm"
              onClick={() => unduh(receipt)}
              disabled={sedang === receipt.receipt_number}
            >
              <IconDownload size={16} />
              {sedang === receipt.receipt_number
                ? "Preparing..."
                : "Download PDF"}
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="m-0 mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default ReceiptCard;
