function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
      {hint && !error && (
        <p className="m-0 mt-1 text-xs text-slate-500">{hint}</p>
      )}
      {error && <p className="m-0 mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Field;
