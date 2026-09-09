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
      <p className="m-0 mb-3 text-sm font-semibold text-slate-500">Receipts</p>

      <ul className="m-0 list-none space-y-3 p-0">
        {receipts.map((receipt) => (
          <li
            key={receipt.receipt_number}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3"
          >
            <IconReceipt size={20} className="shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-semibold text-navy">
                {receipt.fee_label}
              </p>
              <p className="m-0 text-xs text-slate-500">
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
              {sedang === receipt.receipt_number ? "Preparing..." : "Download"}
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="m-0 mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default ReceiptCard;
