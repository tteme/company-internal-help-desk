const variants = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
  accent: "bg-accent-light text-accent",
  neutral: "bg-surface-muted text-text-secondary",
};

function Badge({ children, variant = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        variants[variant] || variants.neutral
      }`}
    >
      {children}
    </span>
  );
}

export default Badge;
