import { useEffect, useRef } from 'react';

export default function EmployeeDialog({ children, label, onClose, busy = false, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      aria-busy={busy}
      onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
      className={`m-auto max-h-[92dvh] w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}
    >
      <div className="flex max-h-[92dvh] flex-col">{children}</div>
    </dialog>
  );
}
