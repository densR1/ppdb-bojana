import Alert from "@/components/Alert";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime } from "@/utils/format";
import { errorMessage, request } from "@/utils/request";
import { hasToken } from "@/utils/session";
import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

// What the parent should do next, per state. Keys must match
// App\Enums\RegistrationState — a stale key silently hides this card.
const NEXT_STEP = {
  awaiting_psychotest_payment: {
    title: "Pay the registration fee",
    body: "Open the invoice page, transfer the exact amount, then upload your receipt.",
    action: { to: "/status/invoice", label: "View Invoice" },
  },
  psychotest_paid: {
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
    body: "Please continue with the school fee payment.",
  },
  not_passed: {
    title: "Your child was not accepted",
    body: "Thank you for trusting Bojana Tirta Islamic School.",
  },
  awaiting_registration_payment: {
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
    title: "Your child is accepted",
    body: "Congratulations! The school will contact you about the next steps.",
  },
  cancelled: {
    title: "Registration cancelled",
    body: "Please contact the school if you think this is a mistake.",
  },
};

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
  const step = NEXT_STEP[registration?.current_state];
  const timeline = registration?.timeline ?? [];

  return (
    <Shell
      title="My Registration"
      subtitle={registration?.registration_number}
      backTo="/"
    >
      <div className="card">
        <p className="m-0 text-lg font-bold text-navy">{child?.full_name}</p>
        <div className="mt-3">
          <StatusBadge
            status={registration?.current_state}
            label={registration?.current_state_label}
          />
        </div>
      </div>

      {step && (
        <div className="card border-2 border-primary/30 bg-primary/5">
          <p className="m-0 text-sm font-semibold text-primary">Next step</p>
          <p className="m-0 mt-1 text-lg font-bold text-navy">{step.title}</p>
          <p className="m-0 mt-1 text-sm text-slate-600">{step.body}</p>

          {step.action && (
            <Link to={step.action.to} className="block no-underline">
              <button className="btn-primary btn-block mt-4">
                {step.action.label}
              </button>
            </Link>
          )}
        </div>
      )}

      {registration?.invoice?.id && step?.action?.to !== "/status/invoice" && (
        <Link to="/status/invoice" className="block no-underline">
          <div className="card flex items-center gap-3 transition hover:border-secondary hover:shadow-md">
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm text-slate-500">Invoice</p>
              <p className="m-0 font-semibold text-navy">
                {registration.invoice.type_label}
              </p>
              <p className="m-0 text-xs text-slate-500">
                {registration.invoice.status_label}
              </p>
            </div>
            <IconChevronRight size={20} className="shrink-0 text-slate-400" />
          </div>
        </Link>
      )}

      {timeline.length > 0 && (
        <div className="card">
          <p className="m-0 mb-4 text-sm font-semibold text-slate-500">
            History
          </p>
          <ol className="m-0 list-none space-y-4 p-0">
            {timeline.map((item, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  {index < timeline.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-slate-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="m-0 text-sm font-medium text-navy">
                    {item.label}
                  </p>
                  <p className="m-0 text-xs text-slate-500">
                    {formatDateTime(item.at)}
                  </p>
                  {item.reason && (
                    <p className="m-0 mt-1 text-sm italic text-slate-600">
                      {item.reason}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Shell>
  );
}

export default RegistrationDetail;
