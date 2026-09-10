import Alert from "@/components/Alert";
import ReceiptCard from "@/components/ReceiptCard";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime } from "@/utils/format";
import { errorMessage, request } from "@/utils/request";
import { hasToken } from "@/utils/session";
import {
  IconBrandWhatsapp,
  IconCheck,
  IconChevronRight,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

// What the parent should do next, per state. Keys must match
// App\Enums\RegistrationState — a stale key silently hides this card.
const NEXT_STEP = {
  awaiting_registration_payment: {
    title: "Pay the registration fee",
    body: "Open the invoice page, transfer the exact amount, then upload your receipt.",
    action: { to: "/status/invoice", label: "View Invoice" },
  },
  registration_paid: {
    title: "Waiting for your psychotest schedule",
    body: "We have received your payment. The schedule will be sent to your email.",
  },
  scheduled: {
    title: "Psychotest scheduled",
    body: "Please check the schedule we emailed you and arrive on time.",
  },
  psychotest_completed: {
    title: "Psychotest done",
    body: "The result will be announced by email.",
  },
  absent: {
    title: "You missed the psychotest",
    body: "Please contact the school to arrange another session.",
  },
  passed: {
    title: "Your child passed",
    body: "Complete your child's details and upload the documents. The school fee is billed once you submit them.",
    action: { to: "/status/enrollment", label: "Open Re-registration" },
  },
  not_passed: {
    title: "Your child was not accepted",
    body: "Thank you for trusting Bojana Tirta Islamic School.",
  },
  awaiting_school_fee_payment: {
    title: "Pay the school fee",
    body: "Open the invoice page, transfer the exact amount, then upload your receipt.",
    action: { to: "/status/invoice", label: "View Invoice" },
  },
  document_submission: {
    title: "Complete your re-registration",
    body: "Fill in your child's remaining details and upload the required documents.",
    action: { to: "/status/enrollment", label: "Open Re-registration" },
  },
  document_review: {
    title: "Documents under review",
    body: "Please wait while the school reviews your documents.",
  },
  enrolled: {
    kicker: "Official admission decision",
    title: "Your child is officially accepted",
    body: "Congratulations! The school will contact you about the next steps.",
  },
  cancelled: {
    title: "Registration cancelled",
    body: "Please contact the school if you think this is a mistake.",
  },
};

// Penjelasan singkat tiap langkah di riwayat. Ini keterangan arti statusnya,
// bukan data pendaftar — jadi tidak ada yang dikarang di sini.
const ARTI_LANGKAH = {
  draft: "Application form created",
  awaiting_registration_payment: "Registration fee invoice issued",
  registration_paid: "Registration fee confirmed by the school",
  scheduled: "Psychotest session assigned",
  psychotest_completed: "Attended the psychotest",
  absent: "Missed the psychotest session",
  passed: "Passed the psychotest",
  not_passed: "Did not pass the psychotest",
  awaiting_school_fee_payment: "School fee invoice issued",
  document_submission: "Re-registration documents requested",
  document_review: "Documents submitted, waiting for the school to check",
  enrolled: "Enrolled at Bojana Tirta Islamic School",
  cancelled: "Registration closed",
};

const HELPDESK = {
  whatsapp: "+62 811-375-566",
};

const inisial = (nama) =>
  (nama ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0].toUpperCase())
    .join("") || "?";

function RegistrationDetail() {
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await request({ url: "/v1/ppdb/registration" });
        setRegistration(response.data.data.registration);
      } catch (err) {
        setError(errorMessage(err, "Failed to load your registration"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (!hasToken()) {
    return <Navigate to="/check-status" replace />;
  }

  if (loading) {
    return (
      <Shell title="My Registration" backTo="/">
        <div className="card text-center text-slate-500">Loading...</div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell title="My Registration" backTo="/">
        <Alert type="error">{error}</Alert>
        <Link to="/check-status" className="no-underline">
          <button className="btn-primary btn-block">Try Again</button>
        </Link>
      </Shell>
    );
  }

  const child = registration?.students?.[0];
  const invoice = registration?.invoice;
  const timeline = registration?.timeline ?? [];
  const selesai = registration?.current_state === "enrolled";

  const proofRejected =
    invoice?.status === "unpaid" && Boolean(invoice?.proof_rejected_at);

  const step = proofRejected
    ? {
        tone: "danger",
        title: "Your payment proof was rejected",
        body: [
          invoice?.proof_reject_reason,
          "Please upload a new receipt on the invoice page.",
        ]
          .filter(Boolean)
          .join(" "),
        action: { to: "/status/invoice", label: "View Invoice" },
      }
    : invoice?.awaiting_proof_review
      ? {
          title: "Waiting for the school to check your payment",
          body: "Your receipt is in. The school matches it against the bank statement before confirming, so this can take a day or two.",
          action: { to: "/status/invoice", label: "View Invoice" },
        }
      : NEXT_STEP[registration?.current_state];

  const nadaSorot = proofRejected
    ? "border-red-200 bg-red-50"
    : selesai
      ? "border-emerald-200 bg-emerald-50/70"
      : "border-primary/40 bg-primary/10";

  const pesanWhatsapp =
    `https://wa.me/${HELPDESK.whatsapp.replace(/\D/g, "")}?text=` +
    encodeURIComponent(
      `Halo, saya ingin bertanya soal pendaftaran ${
        registration?.registration_number ?? ""
      } atas nama ${child?.full_name ?? ""}.`,
    );

  return (
    <Shell title="My Registration" backTo="/" narrow={false}>
      <div className="container-app grid items-start gap-5 py-8 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-secondary" />

            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                    {inisial(child?.full_name)}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Prospective Student
                    </p>
                    <p className="m-0 text-xl font-bold text-navy">
                      {child?.full_name ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {registration?.registration_number && (
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold tracking-wide text-secondary-dark">
                      {registration.registration_number}
                    </span>
                  )}
                  <StatusBadge
                    status={registration?.current_state}
                    label={registration?.current_state_label}
                  />
                </div>
              </div>

              {step && (
                <div
                  className={`mt-6 rounded-2xl border-2 border-solid p-5 ${nadaSorot}`}
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {step.kicker ?? "Next step"}
                  </p>
                  <p className="m-0 mt-2 text-xl font-bold leading-snug text-navy">
                    {step.title}
                  </p>
                  <p className="m-0 mt-2 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>

                  {step.action && (
                    <Link
                      to={step.action.to}
                      className="block no-underline sm:inline-block"
                    >
                      <button
                        className={
                          proofRejected
                            ? "btn mt-4 w-full bg-red-600 text-white shadow-sm hover:bg-red-700 sm:w-auto"
                            : "btn-primary mt-4 w-full sm:w-auto"
                        }
                      >
                        {step.action.label}
                      </button>
                    </Link>
                  )}
                </div>
              )}

              {selesai && (
                <p className="m-0 mt-4 text-sm text-slate-500">
                  Our administration office will follow up by WhatsApp and
                  email.
                </p>
              )}
            </div>
          </div>

          {invoice?.id && step?.action?.to !== "/status/invoice" && (
            <Link to="/status/invoice" className="block no-underline">
              <div className="card flex items-center gap-3 transition hover:border-secondary hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm text-slate-500">Invoice</p>
                  <p className="m-0 font-semibold text-navy">
                    {invoice.type_label}
                  </p>
                  <p className="m-0 text-xs text-slate-500">
                    {proofRejected
                      ? "Payment proof rejected"
                      : invoice.status_label}
                  </p>
                </div>
                <IconChevronRight
                  size={20}
                  className="shrink-0 text-slate-400"
                />
              </div>
            </Link>
          )}

          <ReceiptCard />
        </div>

        <div className="lg:col-span-2">
          {timeline.length > 0 && (
            <div className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-base font-bold text-navy">
                    Registration History
                  </p>
                  <p className="m-0 mt-0.5 text-sm text-slate-500">
                    Step-by-step admission progress
                  </p>
                </div>
                <span
                  className={
                    selesai
                      ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                      : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  }
                >
                  {selesai ? "Completed" : "In progress"}
                </span>
              </div>

              <ol className="m-0 mt-5 list-none space-y-1 p-0">
                {timeline.map((item, index) => {
                  const terakhir = index === timeline.length - 1;
                  const akhir = terakhir && selesai;

                  return (
                    <li key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            akhir
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-primary/20 text-primary-dark"
                          }`}
                        >
                          <IconCheck size={14} stroke={3} />
                        </span>
                        {!terakhir && (
                          <span className="my-1 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div
                        className={`min-w-0 flex-1 pb-5 ${
                          akhir
                            ? "-mt-1 mb-1 rounded-xl border border-solid border-emerald-200 bg-emerald-50/70 p-3 pb-3"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="m-0 text-sm font-semibold text-navy">
                            {item.label}
                          </p>
                          {akhir && (
                            <span className="shrink-0 text-xs font-semibold text-emerald-700">
                              Final
                            </span>
                          )}
                        </div>
                        {ARTI_LANGKAH[item.state] && (
                          <p className="m-0 mt-0.5 text-sm text-slate-600">
                            {ARTI_LANGKAH[item.state]}
                          </p>
                        )}
                        <p className="m-0 mt-1 font-mono text-xs text-slate-400">
                          {formatDateTime(item.at)}
                        </p>
                        {item.reason && (
                          <p className="m-0 mt-1 text-sm italic text-slate-600">
                            {item.reason}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <div className="card mt-5 bg-navy-soft text-white">
            <p className="m-0 text-base font-bold">Registration Information</p>
            <p className="m-0 mt-1 text-sm text-white/75">
              Have questions about registration? We&rsquo;re here to help.
            </p>

            <div className="mt-4">
              <a
                href={pesanWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy no-underline transition hover:bg-[#25D366] hover:text-white"
              >
                <IconBrandWhatsapp size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default RegistrationDetail;
