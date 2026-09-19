const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "border border-border bg-surface text-text hover:bg-surface-muted",
  accent: "bg-accent text-white hover:bg-primary",
  danger: "bg-danger text-white hover:bg-red-700",
};

function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
