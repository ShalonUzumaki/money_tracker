'use client';

interface Props {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ visible, onUndo, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-stone-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl toast-enter">
      <span className="text-stone-300">Запись удалена</span>
      <button
        onClick={onUndo}
        className="font-semibold text-white hover:text-stone-200 underline underline-offset-2 transition-colors"
      >
        Отменить
      </button>
      <button
        onClick={onDismiss}
        className="w-5 h-5 flex items-center justify-center text-stone-500 hover:text-stone-300 transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
