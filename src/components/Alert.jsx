import {
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

const STYLES = {
  info: "bg-blue-50 text-blue-800 border-blue-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
};

const ICONS = {
  info: IconInfoCircle,
  success: IconCircleCheck,
  error: IconAlertCircle,
  warning: IconAlertCircle,
};

function Alert({ type = "info", title, children }) {
  const Icon = ICONS[type];

  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${STYLES[type]}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="m-0 font-semibold">{title}</p>}
        {children && <div className={title ? "mt-1" : ""}>{children}</div>}
      </div>
    </div>
  );
}

export default Alert;
