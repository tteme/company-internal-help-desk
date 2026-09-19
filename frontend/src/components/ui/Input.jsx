function Input({ label, id, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-text">
        {label}
      </label>

      <input
        id={id}
        {...props}
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-text outline-none transition placeholder:text-text-muted focus:ring-2 focus:ring-accent/20 ${
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-accent"
        }`}
      />

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
