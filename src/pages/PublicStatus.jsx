import Alert from "@/components/Alert";
import Field from "@/components/Field";
import Shell from "@/components/Shell";
import { errorMessage, request } from "@/utils/request";
import { saveToken } from "@/utils/session";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * The only way in. No account, no password — the parent's phone number (or the
 * child's NIK/NISN) plus the child's date of birth are the key. The token this
 * returns only carries the parent through the screens that follow; coming back
 * here always costs the lookup again.
 */
function PublicStatus() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ identity: "", date_of_birth: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const change = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await request({
        url: "/v1/ppdb/check-status",
        method: "post",
        data: values,
      });
      saveToken(response.data.data.access_token);
      navigate("/status");
    } catch (err) {
      setError(errorMessage(err, "Registration not found"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell
      title="Check Your Registration"
      subtitle="No account needed — your phone number and your child's date of birth are enough"
      backTo="/"
    >
      <form onSubmit={submit} className="card space-y-4">
        <Field
          label="Parent's Phone Number"
          hint="The father's number from the registration form. Your child's NIK or NISN works too, if you have one."
        >
          <input
            className="input"
            value={values.identity}
            onChange={change("identity")}
            inputMode="numeric"
            placeholder="08xxxxxxxxxx"
            required
          />
        </Field>

        <Field label="Child's Date of Birth">
          <input
            className="input"
            type="date"
            value={values.date_of_birth}
            onChange={change("date_of_birth")}
            required
          />
        </Field>

        {error && <Alert type="error">{error}</Alert>}

        <button className="btn-primary btn-block" disabled={submitting}>
          {submitting ? "Searching..." : "Open My Registration"}
        </button>
      </form>

      <Alert type="info">
        Both fields must match. If you cannot get in, contact the school —
        there is no password to reset.
      </Alert>
    </Shell>
  );
}

export default PublicStatus;
