/**
 * Warna disamakan dengan panel e-raport. Panel memakai Tag bawaan antd, jadi
 * nilainya diambil langsung dari palet antd v5 supaya kedua aplikasi tampil
 * sama. Nama status -> nama warna di sini harus sama persis dengan
 * STATE_COLOR pada panel (src/utils/ppdbState.js).
 */
const ANTD = {
  default: { bg: "#fafafa", border: "#d9d9d9", text: "#434343" },
  orange: { bg: "#fff7e6", border: "#ffd591", text: "#d46b08" },
  gold: { bg: "#fffbe6", border: "#ffe58f", text: "#d48806" },
  cyan: { bg: "#e6fffb", border: "#87e8de", text: "#08979c" },
  blue: { bg: "#e6f4ff", border: "#91caff", text: "#0958d9" },
  green: { bg: "#f6ffed", border: "#b7eb8f", text: "#389e0d" },
  purple: { bg: "#f9f0ff", border: "#d3adf7", text: "#531dab" },
  volcano: { bg: "#fff2e8", border: "#ffbb96", text: "#d4380d" },
  red: { bg: "#fff2f0", border: "#ffccc7", text: "#cf1322" },
};

const STATE_COLOR = {
  draft: "default",
  awaiting_registration_payment: "orange",
  registration_paid: "cyan",
  scheduled: "blue",
  psychotest_completed: "blue",
  passed: "green",
  not_passed: "red",
  awaiting_school_fee_payment: "orange",
  document_submission: "gold",
  document_review: "purple",
  enrolled: "green",
  absent: "volcano",
  cancelled: "red",
};

function StatusBadge({ status, label }) {
  const warna = ANTD[STATE_COLOR[status] ?? "default"];

  return (
    <span
      className="inline-block rounded-full border border-solid px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: warna.bg,
        borderColor: warna.border,
        color: warna.text,
      }}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
