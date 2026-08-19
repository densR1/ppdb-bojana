import Alert from "@/components/Alert";
import Field from "@/components/Field";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import UploadField from "@/components/UploadField";
import { errorMessage, request } from "@/utils/request";
import { hasToken } from "@/utils/session";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const LIVES_WITH = [
  "Both Parents",
  "Father",
  "Mother",
  "Grandparents",
  "Guardian",
  "Boarding House",
];

function Enrollment() {
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [state, setState] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const load = async () => {
    try {
      const response = await request({
        url: "/v1/ppdb/registration/enrollment",
      });
      const data = response.data.data;

      setChild(data.child);
      setDocuments(data.documents);
      setIsOpen(data.is_open);
      setState({ value: data.current_state, label: data.current_state_label });
    } catch (err) {
      setError(errorMessage(err, "Failed to load re-registration data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (event) =>
    setChild((prev) => ({ ...prev, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    setFieldErrors({});

    try {
      const response = await request({
        url: "/v1/ppdb/registration/enrollment",
        method: "post",
        data: {
          nik: child.nik,
          gender: child.gender,
          lives_with: child.lives_with,
        },
      });

      setDocuments(response.data.data.documents);
      setSaved(true);
    } catch (err) {
      setFieldErrors(err.response?.data?.data?.errors ?? {});
      setError(errorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const sendDocument = (type) => async (file) => {
    const body = new FormData();
    body.append("type", type);
    body.append("file", file);

    const response = await request({
      url: "/v1/ppdb/registration/enrollment/documents",
      method: "post",
      data: body,
    });

    setDocuments(response.data.data.documents);
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");

    try {
      await request({
        url: "/v1/ppdb/registration/enrollment/submit",
        method: "post",
      });
      navigate("/status");
    } catch (err) {
      setError(errorMessage(err, "Cannot submit yet"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasToken()) {
    return <Navigate to="/check-status" replace />;
  }

  if (loading) {
    return (
      <Shell title="Re-registration" backTo="/status">
        <div className="card text-center text-slate-500">Loading...</div>
      </Shell>
    );
  }

  if (!isOpen) {
    return (
      <Shell title="Re-registration" backTo="/status">
        <Alert type="info" title="Not open right now">
          Re-registration opens once the school has confirmed your registration
          fee, and closes when your documents are submitted.
        </Alert>
        {state && (
          <div className="card text-center">
            <p className="m-0 text-sm text-slate-500">Current status</p>
            <div className="mt-2">
              <StatusBadge status={state.value} label={state.label} />
            </div>
          </div>
        )}
      </Shell>
    );
  }

  // Berkas wajib yang belum terkirim, atau sudah dikembalikan sekolah.
  // Server memeriksa ulang saat submit; ini supaya tombolnya tidak
  // menjanjikan sesuatu yang pasti ditolak.
  const outstanding = documents
    .filter((item) => item.required && !item.original_name)
    .map((item) => item.label);

  return (
    <Shell
      title="Re-registration"
      subtitle={child?.full_name}
      backTo="/status"
    >
      <form onSubmit={save} className="card space-y-4">
        <h2 className="m-0 text-base font-bold text-navy">
          Complete your child&apos;s details
        </h2>
        <p className="m-0 text-sm text-slate-500">
          Only what the registration form did not ask for yet.
        </p>

        <Field
          label="Child's NIK"
          hint="16 digits, as printed on the family card"
          error={fieldErrors.nik?.[0]}
        >
          <input
            className="input"
            value={child?.nik ?? ""}
            onChange={set("nik")}
            inputMode="numeric"
            maxLength={16}
            required
          />
        </Field>

        <Field label="Gender" error={fieldErrors.gender?.[0]}>
          <select
            className="input"
            value={child?.gender ?? ""}
            onChange={set("gender")}
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>

        <Field label="Lives With" error={fieldErrors.lives_with?.[0]}>
          <select
            className="input"
            value={child?.lives_with ?? ""}
            onChange={set("lives_with")}
            required
          >
            <option value="">Select</option>
            {LIVES_WITH.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        {saved && <Alert type="success">Details saved.</Alert>}

        <button className="btn-primary btn-block" disabled={saving}>
          {saving ? "Saving..." : "Save Details"}
        </button>
      </form>

      <div className="card space-y-3">
        <div>
          <h2 className="m-0 text-base font-bold text-navy">Documents</h2>
          <p className="m-0 text-sm text-slate-500">
            Upload each one. You can replace a file any time before submitting.
          </p>
        </div>

        {documents.map((document) => (
          <UploadField
            key={document.type}
            label={document.label}
            note={document.note}
            status={document.status}
            rejectReason={document.reject_reason}
            currentName={document.original_name}
            immediate
            onSend={sendDocument(document.type)}
          />
        ))}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {outstanding.length > 0 && (
        <Alert type="warning" title="Still needed before you can submit">
          {outstanding.join(", ")}
        </Alert>
      )}

      <button
        className="btn-primary btn-block"
        onClick={submit}
        disabled={submitting || outstanding.length > 0}
      >
        <IconCheck size={20} />
        {submitting ? "Submitting..." : "Submit for Review"}
      </button>

      <Alert type="info">
        Once submitted, the school reviews every document. If something needs
        replacing, this page opens again with a note telling you what to fix.
      </Alert>
    </Shell>
  );
}

export default Enrollment;
