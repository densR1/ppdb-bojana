import Alert from "@/components/Alert";
import ReceiptUpload from "@/components/ReceiptUpload";
import Shell from "@/components/Shell";
import { daysLeft, formatDate, formatDateTime, rupiah } from "@/utils/format";
import { errorMessage, request } from "@/utils/request";
import { IconCopy, IconFileText } from "@tabler/icons-react";
import { hasToken } from "@/utils/session";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

function Invoice() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [openingLetter, setOpeningLetter] = useState(false);

  const load = async () => {
    try {
      const response = await request({ url: "/v1/ppdb/registration/invoice" });
      setInvoice(response.data.data.invoice);
    } catch (err) {
      setError(errorMessage(err, "Failed to load invoice"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openLetter = async () => {
    setOpeningLetter(true);
    setError("");

    try {
      const response = await request({
        url: "/v1/ppdb/registration/fee-letter",
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener");
      // Dibiarkan hidup sebentar supaya tab baru sempat memuatnya.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(errorMessage(err, "Failed to open the letter"));
    } finally {
      setOpeningLetter(false);
    }
  };

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("");
    }
  };

  const backTo = "/status";

  if (!hasToken()) {
    return <Navigate to="/check-status" replace />;
  }

  if (loading) {
    return (
      <Shell title="Invoice" backTo={backTo}>
        <div className="card text-center text-slate-500">Loading...</div>
      </Shell>
    );
  }

  if (!invoice) {
    return (
      <Shell title="Invoice" backTo={backTo}>
        <Alert type="error">{error || "No invoice yet"}</Alert>
      </Shell>
    );
  }

  const instructions = invoice.instructions ?? {};
  const remaining = daysLeft(invoice.expires_at);
  const unpaid = invoice.status === "unpaid";
  const receipts = invoice.payment_proof ?? [];

  return (
    <Shell title="Invoice" subtitle={invoice.type_label} backTo={backTo}>
      {invoice.status === "paid" ? (
        <>
          <Alert type="success" title="Payment received">
            Confirmed on {formatDateTime(invoice.confirmed_at)}.
          </Alert>

          {invoice.receipt_number && (
            <div className="card border-2 border-emerald-200 bg-emerald-50/60">
              <p className="m-0 text-sm font-semibold text-emerald-800">
                Receipt
              </p>
              <p className="m-0 mt-1 text-2xl font-bold tracking-wide text-navy">
                {invoice.receipt_number}
              </p>
              <p className="m-0 mt-1 text-xs text-slate-500">
                {invoice.type_label} &middot; issued{" "}
                {formatDateTime(invoice.receipt_issued_at)}
              </p>
              <p className="m-0 mt-3 text-sm text-slate-600">
                Keep this number. Mention it if you ever need to ask the school
                about this payment.
              </p>
            </div>
          )}
        </>
      ) : invoice.status === "expired" ? (
        <Alert type="warning" title="This invoice is past its due date">
          If you have already transferred, upload the receipt anyway. The school
          will review it.
        </Alert>
      ) : remaining !== null && remaining <= 2 ? (
        <Alert type="warning" title="Payment due soon">
          {remaining <= 0
            ? "Today is the last day."
            : `Only ${remaining} day(s) left.`}
        </Alert>
      ) : null}

      {invoice.has_fee_letter && (
        <div className="card">
          <h2 className="m-0 text-base font-bold text-navy">Payment details</h2>
          <p className="m-0 mt-1 text-sm leading-relaxed text-slate-600">
            The full breakdown is in the letter the school sent you. Open it for
            the amount and the account to transfer to.
          </p>

          <button
            className="btn-primary btn-block mt-4"
            onClick={openLetter}
            disabled={openingLetter}
          >
            <IconFileText size={20} />
            {openingLetter ? "Opening..." : "Open the Letter"}
          </button>
        </div>
      )}

      <div className="card">
        <p className="m-0 mb-3 text-sm font-semibold text-slate-500">
          Transfer to
        </p>

        {instructions.account_number ? (
          <>
            <p className="m-0 text-sm">{instructions.bank}</p>
            <p className="m-0 text-2xl font-bold tabular-nums text-navy">
              {instructions.account_number}
            </p>
            <p className="m-0 text-sm text-slate-500">
              on behalf of {instructions.account_holder}
            </p>

            <button
              onClick={() => copy(instructions.account_number, "account")}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-secondary"
            >
              <IconCopy size={16} />
              {copied === "account"
                ? "Account number copied"
                : "Copy account number"}
            </button>
          </>
        ) : (
          <p className="m-0 text-sm text-slate-500">
            Bank details are not set yet. Please contact the school.
          </p>
        )}

        {instructions.payment_reference && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="m-0 text-slate-500">
              Write this in the transfer note
            </p>
            <p className="m-0 font-semibold text-navy">
              {instructions.payment_reference}
            </p>
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Due date</span>
            <span className="font-semibold">
              {formatDate(invoice.expires_at)}
            </span>
          </div>
          {invoice.outstanding > 0 && invoice.status === "paid" && (
            <div className="mt-1 flex justify-between text-red-600">
              <span>Underpaid</span>
              <span className="font-semibold">{rupiah(invoice.outstanding)}</span>
            </div>
          )}
        </div>
      </div>

      <ReceiptUpload
        receipts={receipts}
        canUpload={invoice.status !== "paid"}
        onUploaded={load}
      />

      {unpaid && (
        <Alert type="info">
          Uploading a receipt does not mark the invoice as paid. The school
          still checks the bank statement before confirming your payment.
        </Alert>
      )}

      <Link to="/status" className="block no-underline">
        <button className="btn-primary btn-block">Check Status</button>
      </Link>
    </Shell>
  );
}

export default Invoice;
