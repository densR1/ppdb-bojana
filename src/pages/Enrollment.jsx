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

function Enrollment() {
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [state, setState] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    setFieldErrors({});

    try {
      const details = await request({
        url: "/v1/ppdb/registration/enrollment",
        method: "post",
        data: { parent_expectation: child.parent_expectation },
      });

      setDocuments(details.data.data.documents);

      const response = await request({
        url: "/v1/ppdb/registration/enrollment/submit",
        method: "post",
      });
      const enrolled =
        response.data.data.registration.current_state === "enrolled";

      navigate(enrolled ? "/status" : "/status/invoice");
    } catch (err) {
      setFieldErrors(err.response?.data?.data?.errors ?? {});
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
    <Shell title="Re-registration" subtitle={child?.full_name} backTo="/status">
      <div className="card space-y-3">
        <div>
          <h2 className="m-0 text-base font-bold text-secondary">Documents</h2>
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

      <div className="card">
        <Field
          label="Hopes and Suggestions for Bojana Tirta Islamic School"
          hint="Optional. Tell us what you would like the school to apply."
        >
          <textarea
            className="input"
            rows={3}
            value={child?.parent_expectation ?? ""}
            onChange={set("parent_expectation")}
          />
        </Field>
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
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </Shell>
  );
}

export default Enrollment;
