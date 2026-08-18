import Alert from "@/components/Alert";
import Field from "@/components/Field";
import Shell from "@/components/Shell";
import { errorMessage, request } from "@/utils/request";
import { saveToken } from "@/utils/session";
import { emailError, phoneError } from "@/utils/validate";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Bumped when the field names change. A draft written by an older version of
// this form is unreadable, and restoring it would blank every input instead of
// falling back to the defaults.
const DRAFT_KEY = "ppdb_draft_v2";
const STALE_DRAFT_KEYS = ["ppdb_draft"];

const EDUCATION = [
  "Doctorate (S3)",
  "Master's (S2)",
  "Bachelor's (S1/D4)",
  "Diploma (D3)",
  "High School (SMA/SMK)",
  "Other",
];

const INCOME = [
  "More than Rp 20,000,000",
  "Rp 15,000,000 - Rp 20,000,000",
  "Rp 10,000,000 - Rp 15,000,000",
  "Rp 5,000,000 - Rp 10,000,000",
  "Less than Rp 5,000,000",
];

const RELATIONSHIP = ["Biological Child", "Adopted Child", "Other"];

const emptyGuardian = {
  name: "",
  place_of_birth: "",
  date_of_birth: "",
  education: "",
  occupation: "",
  work_address: "",
  phone: "",
  email: "",
  monthly_income: "",
};

const initial = {
  full_name: "",
  nickname: "",
  previous_school: "",
  nisn: "",
  place_of_birth: "",
  date_of_birth: "",
  address: "",
  relationship: "",
  father: { ...emptyGuardian },
  mother: { ...emptyGuardian },
  siblings: Array.from({ length: 5 }, () => ({ name: "", age: "" })),
  emergency_name: "",
  emergency_relation: "",
  emergency_address: "",
  emergency_phone: "",
};

const STEPS = [
  "Child Details",
  "Father's Details",
  "Mother's Details",
  "Siblings",
  "Emergency Contact",
];

// Required fields per step, so Next does not send the parent to the end of
// the form only to say something was left blank.
const REQUIRED = [
  [
    "full_name",
    "nickname",
    "previous_school",
    "nisn",
    "place_of_birth",
    "date_of_birth",
    "address",
    "relationship",
  ],
  Object.keys(emptyGuardian).map((key) => `father.${key}`),
  Object.keys(emptyGuardian).map((key) => `mother.${key}`),
  [],
  ["emergency_name", "emergency_relation", "emergency_address", "emergency_phone"],
];

const pick = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

// Field yang punya aturan format, dikelompokkan per langkah supaya tombol
// Next ikut memeriksa tanpa harus menunggu server.
const FORMAT_RULES = {
  1: { "father.phone": phoneError, "father.email": emailError },
  2: { "mother.phone": phoneError, "mother.email": emailError },
  4: { emergency_phone: phoneError },
};

const formatErrorsFor = (stepIndex, values) =>
  Object.entries(FORMAT_RULES[stepIndex] ?? {}).reduce((acc, [path, check]) => {
    const message = check(pick(values, path));
    return message ? { ...acc, [path]: [message] } : acc;
  }, {});

// Only fields the form still knows about are restored, and the guardian
// objects are merged key by key — a partial draft must never leave an input
// with an undefined value, which would flip it to uncontrolled.
const loadDraft = () => {
  STALE_DRAFT_KEYS.forEach((key) => localStorage.removeItem(key));

  let saved = null;

  try {
    saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
  } catch {
    saved = null;
  }

  if (!saved) return initial;

  const known = Object.keys(initial)
    .filter((key) => key in saved)
    .map((key) => [key, saved[key]]);

  return {
    ...initial,
    ...Object.fromEntries(known),
    father: { ...emptyGuardian, ...saved.father },
    mother: { ...emptyGuardian, ...saved.mother },
  };
};

function RegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(loadDraft);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // This form is long and parents fill it on a phone, often interrupted —
  // so every change is saved locally.
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  }, [values]);

  const set = (path) => (event) => {
    const value = event?.target ? event.target.value : event;

    setValues((prev) => {
      const keys = path.split(".");
      if (keys.length === 1) return { ...prev, [path]: value };

      const [group, key] = keys;
      return { ...prev, [group]: { ...prev[group], [key]: value } };
    });
  };

  const checkFormat = (path, check) => () => {
    const message = check(pick(values, path));

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[path] = [message];
      else delete next[path];
      return next;
    });
  };

  const setSibling = (index, key) => (event) =>
    setValues((prev) => {
      const siblings = [...prev.siblings];
      siblings[index] = { ...siblings[index], [key]: event.target.value };
      return { ...prev, siblings };
    });

  const next = () => {
    const missing = REQUIRED[step].filter((path) => !pick(values, path));

    if (missing.length > 0) {
      setError("Please complete all required fields on this page.");
      return;
    }

    const badFormat = formatErrorsFor(step, values);

    if (Object.keys(badFormat).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...badFormat }));
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setError("");
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setError("");
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event) => {
    event.preventDefault();

    const missing = REQUIRED[step].filter((path) => !pick(values, path));
    if (missing.length > 0) {
      setError("Please complete all required fields on this page.");
      return;
    }

    // Semua langkah diperiksa, bukan hanya yang terakhir — kolom bermasalah
    // bisa saja ada di halaman yang sudah dilewati.
    const badFormat = Object.keys(FORMAT_RULES).reduce(
      (acc, index) => ({ ...acc, ...formatErrorsFor(Number(index), values) }),
      {},
    );

    if (Object.keys(badFormat).length > 0) {
      setFieldErrors(badFormat);
      setError("Please fix the highlighted fields before submitting.");
      return;
    }

    setFieldErrors({});
    setError("");
    setSubmitting(true);

    try {
      const response = await request({
        url: "/v1/ppdb/registrations",
        method: "post",
        data: {
          ...values,
          siblings: values.siblings.filter((item) => item.name.trim()),
        },
      });
      saveToken(response.data.data.access_token);
      localStorage.removeItem(DRAFT_KEY);
      navigate("/status/invoice");
    } catch (err) {
      setFieldErrors(err.response?.data?.data?.errors ?? {});
      setError(errorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const guardianFields = (role, label) => (
    <div className="card space-y-4">
      <h2 className="m-0 text-base font-bold text-navy">{label}</h2>

      <Field label="Full Name" error={fieldErrors[`${role}.name`]?.[0]}>
        <input
          className="input"
          value={values[role].name}
          onChange={set(`${role}.name`)}
          required
        />
      </Field>

      <Field label="Place of Birth">
        <input
          className="input"
          value={values[role].place_of_birth}
          onChange={set(`${role}.place_of_birth`)}
          required
        />
      </Field>

      <Field label="Date of Birth">
        <input
          className="input"
          type="date"
          value={values[role].date_of_birth}
          onChange={set(`${role}.date_of_birth`)}
          required
        />
      </Field>

      <Field label="Highest Education">
        <select
          className="input"
          value={values[role].education}
          onChange={set(`${role}.education`)}
          required
        >
          <option value="">Select education</option>
          {EDUCATION.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Occupation">
        <input
          className="input"
          value={values[role].occupation}
          onChange={set(`${role}.occupation`)}
          required
        />
      </Field>

      <Field label="Work Address">
        <input
          className="input"
          value={values[role].work_address}
          onChange={set(`${role}.work_address`)}
          required
        />
      </Field>

      <Field
        label="Mobile Phone Number"
        hint={
          role === "father"
            ? "This number is how you come back to your registration later"
            : undefined
        }
        error={fieldErrors[`${role}.phone`]?.[0]}
      >
        <input
          className="input"
          value={values[role].phone}
          onChange={set(`${role}.phone`)}
          onBlur={checkFormat(`${role}.phone`, phoneError)}
          inputMode="numeric"
          placeholder="08xxxxxxxxxx"
          required
        />
      </Field>

      <Field label="Email Address" error={fieldErrors[`${role}.email`]?.[0]}>
        <input
          className="input"
          type="email"
          value={values[role].email}
          onChange={set(`${role}.email`)}
          onBlur={checkFormat(`${role}.email`, emailError)}
          required
        />
      </Field>

      <Field label="Monthly Income">
        <select
          className="input"
          value={values[role].monthly_income}
          onChange={set(`${role}.monthly_income`)}
          required
        >
          <option value="">Select income range</option>
          {INCOME.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );

  return (
    <Shell
      title="Registration Form"
      subtitle={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
      backTo="/"
    >
      <ol className="m-0 flex list-none gap-2 p-0">
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                index < step
                  ? "bg-primary"
                  : index === step
                  ? "bg-secondary"
                  : "bg-slate-200"
              }`}
            />
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Alert type="info" title="Your answers are saved automatically">
          If you get interrupted, reopen this page on the same device and your
          answers will still be here.
        </Alert>
      )}

      <form onSubmit={submit} className="space-y-5">
        {step === 0 && (
          <div className="card space-y-4">
            <h2 className="m-0 text-base font-bold text-navy">Child Details</h2>

            <Field
              label="Full Name"
              hint="As written on the birth certificate"
              error={fieldErrors.full_name?.[0]}
            >
              <input
                className="input"
                value={values.full_name}
                onChange={set("full_name")}
                required
              />
            </Field>

            <Field label="Nickname">
              <input
                className="input"
                value={values.nickname}
                onChange={set("nickname")}
                required
              />
            </Field>

            <Field label="Kindergarten / Previous School">
              <input
                className="input"
                value={values.previous_school}
                onChange={set("previous_school")}
                required
              />
            </Field>

            <Field
              label="NISN"
              hint="Enter a dash - if your child does not have one yet"
              error={fieldErrors.nisn?.[0]}
            >
              <input
                className="input"
                value={values.nisn}
                onChange={set("nisn")}
                required
              />
            </Field>

            <Field label="Place of Birth">
              <input
                className="input"
                value={values.place_of_birth}
                onChange={set("place_of_birth")}
                required
              />
            </Field>

            <Field
              label="Date of Birth"
              hint="Used together with your phone number to come back later"
              error={fieldErrors.date_of_birth?.[0]}
            >
              <input
                className="input"
                type="date"
                value={values.date_of_birth}
                onChange={set("date_of_birth")}
                required
              />
            </Field>

            <Field label="Home Address">
              <textarea
                className="input"
                rows={3}
                value={values.address}
                onChange={set("address")}
                required
              />
            </Field>

            <Field label="Relationship to Child">
              <select
                className="input"
                value={values.relationship}
                onChange={set("relationship")}
                required
              >
                <option value="">Select relationship</option>
                {RELATIONSHIP.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 1 && guardianFields("father", "Father / Male Guardian")}
        {step === 2 && guardianFields("mother", "Mother / Female Guardian")}

        {step === 3 && (
          <div className="card space-y-4">
            <h2 className="m-0 text-base font-bold text-navy">Siblings</h2>
            <p className="m-0 text-sm text-slate-500">
              List them in order, including your child. Leave blank if none.
            </p>

            {values.siblings.map((item, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[2fr,1fr]">
                <Field label={`Child ${index + 1}`}>
                  <input
                    className="input"
                    value={item.name}
                    onChange={setSibling(index, "name")}
                    placeholder="Name"
                  />
                </Field>
                <Field label="Age">
                  <input
                    className="input"
                    value={item.age}
                    onChange={setSibling(index, "age")}
                    placeholder="Years"
                    inputMode="numeric"
                  />
                </Field>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="card space-y-4">
            <h2 className="m-0 text-base font-bold text-navy">
              Emergency Contact
            </h2>
            <p className="m-0 text-sm text-slate-500">
              Someone other than both parents, in case you are hard to reach.
            </p>

            <Field label="Full Name">
              <input
                className="input"
                value={values.emergency_name}
                onChange={set("emergency_name")}
                required
              />
            </Field>

            <Field label="Relationship to Child">
              <input
                className="input"
                value={values.emergency_relation}
                onChange={set("emergency_relation")}
                placeholder="Uncle, grandmother, and so on"
                required
              />
            </Field>

            <Field label="Address">
              <textarea
                className="input"
                rows={2}
                value={values.emergency_address}
                onChange={set("emergency_address")}
                required
              />
            </Field>

            <Field label="Mobile Phone Number">
              <input
                className="input"
                value={values.emergency_phone}
                onChange={set("emergency_phone")}
                onBlur={checkFormat("emergency_phone", phoneError)}
                inputMode="numeric"
                placeholder="08xxxxxxxxxx"
                required
              />
            </Field>

            <Alert type="info" title="What happens next">
              You will be taken to the payment page to upload your psychotest fee
              transfer receipt.
            </Alert>
          </div>
        )}

        {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn-primary btn-block"
              onClick={next}
            >
              Next
            </button>
          ) : (
            <button
              className="btn-primary btn-block"
              disabled={submitting}
            >
              <IconCheck size={20} />
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          )}

          {step > 0 && (
            <button
              type="button"
              className="btn-secondary btn-block"
              onClick={back}
            >
              Back
            </button>
          )}
        </div>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/check-status" className="font-semibold text-secondary">
          Check your status
        </Link>
      </p>
    </Shell>
  );
}

export default RegistrationForm;
