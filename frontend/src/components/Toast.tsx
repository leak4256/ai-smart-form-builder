type ToastProps = {
  open: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

export default function Toast({ open, message, type, onClose }: ToastProps) {
  if (!open) {
    return null;
  }

  const toneClass =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-red-200 bg-red-50 text-red-900';

  const icon = type === 'success' ? '✓' : '!';

  return (
    <div className="fixed start-4 top-4 z-50 w-full max-w-sm">
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${toneClass}`}
      >
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs font-bold">
          {icon}
        </span>

        <p className="flex-1 text-sm font-medium">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-xs font-semibold hover:bg-black/5"
        >
          סגירה
        </button>
      </div>
    </div>
  );
}
