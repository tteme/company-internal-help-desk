import { X } from "lucide-react";

function Modal({ title, children, onClose, size = "md" }) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          "flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-lg border border-border bg-surface shadow-xl",
          sizeClasses[size] || sizeClasses.md,
        ].join(" ")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-text">
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
