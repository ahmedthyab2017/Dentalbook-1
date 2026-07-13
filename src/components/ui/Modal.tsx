"use client";

// Ported from the .overlay/.modal markup used throughout index.html
// (e.g. #mo-patient, app/index.html:694-776) + .overlay.open toggle in app.css.
// Callers supply their own .modal-body/.modal-foot children so state
// (e.g. form fields) can live in a component keyed for remount instead of
// being reset via a setState-in-effect.

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
