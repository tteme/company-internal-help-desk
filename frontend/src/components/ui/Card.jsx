function Card({ children, className = "", as: Component = "article" }) {
  return (
    <Component
      className={`rounded-lg border border-border bg-surface ${className}`}
    >
      {children}
    </Component>
  );
}

export default Card;
