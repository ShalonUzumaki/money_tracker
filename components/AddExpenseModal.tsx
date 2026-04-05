'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Expense, Category, TransactionType } from '../lib/types';
import { todayISO } from '../lib/utils';

interface Props {
  categories: Category[];
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const EMPTY = {
  date: todayISO(),
  amount: '',
  categoryId: '',
  comment: '',
  type: 'expense' as TransactionType,
  tags: [] as string[],
};

export function AddExpenseModal({ categories, onSave, onClose }: Props) {
  const [form, setForm] = useState({ ...EMPTY, categoryId: categories[0]?.id ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(f => ({ ...f, categoryId: categories[0]?.id ?? '' }));
    setTimeout(() => amountRef.current?.focus(), 100);
  }, [categories]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Введите сумму';
    if (!form.date) e.date = 'Укажите дату';
    if (!form.categoryId) e.category = 'Выберите категорию';
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        date: form.date,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId,
        comment: form.comment.trim() || undefined,
        type: form.type,
        tags: form.tags.length ? form.tags : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') onClose();
  }

  const field = (id: string) => ({
    className: `w-full border rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:bg-white focus:outline-none transition-all ${
      errors[id] ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-stone-200 focus:ring-2 focus:ring-stone-200 focus:border-stone-400'
    }`,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer / Modal */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl modal-enter">
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-900 text-[15px]">Новая запись</h3>
          {/* Type toggle */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 gap-0.5">
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                  form.type === t ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {t === 'expense' ? 'Расход' : 'Доход'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1.5 block">Сумма ₽ *</label>
              <input
                ref={amountRef}
                type="number" min="0" step="any" placeholder="0"
                value={form.amount}
                onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(p => ({ ...p, amount: '' })); }}
                {...field('amount')}
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1.5 block">Дата *</label>
              <input
                type="date" value={form.date}
                onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(p => ({ ...p, date: '' })); }}
                {...field('date')}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-stone-500 mb-2 block">Категория *</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, categoryId: cat.id })); setErrors(p => ({ ...p, category: '' })); }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                    form.categoryId === cat.id ? 'shadow-sm ring-2' : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                  style={form.categoryId === cat.id ? {
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                    borderColor: `${cat.color}40`,
                    ringColor: `${cat.color}50`,
                  } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">
              Комментарий <span className="font-normal text-stone-300">(необязательно)</span>
            </label>
            <input
              type="text" placeholder="Краткое описание..."
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              {...field('comment')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button" onClick={onClose}
            className="flex-1 border border-stone-200 text-stone-600 text-sm font-medium py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button" onClick={handleSave} disabled={saving}
            className="flex-1 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
