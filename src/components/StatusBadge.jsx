const COLORS = {
  draft: "bg-slate-100 text-slate-700",
  awaiting_psychotest_payment: "bg-amber-100 text-amber-800",
  psychotest_paid: "bg-sky-100 text-sky-800",
  scheduled: "bg-sky-100 text-sky-800",
  psychotest_completed: "bg-sky-100 text-sky-800",
  passed: "bg-emerald-100 text-emerald-800",
  not_passed: "bg-red-100 text-red-800",
  awaiting_registration_payment: "bg-amber-100 text-amber-800",
  document_submission: "bg-yellow-100 text-yellow-800",
  document_review: "bg-violet-100 text-violet-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  absent: "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-800",
};

function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        COLORS[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
