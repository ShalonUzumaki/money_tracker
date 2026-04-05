'use client';

import { useState } from 'react';
import { Expense, Category } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/utils';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  expenses: Expense[];
  categories: Category[];
  onUpdate: (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface EditingCell {
  id: string;
  field: 'amount' | 'comment' | 'date';
  value: string;
}

export function ExpenseTable({ expenses, categories, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<EditingCell | null>(null);

  function startEdit(id: string, field: EditingCell['field'], value: string) {
    setEditing({ id, field, value });
  }

  async function commitEdit() {
    if (!editing) return;
    const { id, field, value } = editing;
    const patch: Partial<Omit<Expense, 'id' | 'createdAt'>> = {};
    if (field === 'amount') {
      const n = parseFloat(value);
      if (!isNaN(n) && n > 0) patch.amount = n;
    } else if (field === 'comment') {
      patch.comment = value.trim() || undefined;
    } else if (field === 'date') {
      if (value) patch.date = value;
    }
    if (Object.keys(patch).length) await onUpdate(id, patch);
    setEditing(null);
  }

  const catMap = new Map(categories.map(c => [c.id, c]));

  if (expenses.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-400 text-sm">Нет записей. Нажмите «+», чтобы добавить.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100">
            {['Дата', 'Тип', 'Категория', 'Сумма', 'Комментарий', ''].map(h => (
              <th key={h} className="text-left text-xs font-medium text-stone-400 uppercase tracking-widest px-4 py-3 first:pl-6 last:pr-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {expenses.map(e => {
            const cat = catMap.get(e.categoryId) ?? null;
            return (
              <tr key={e.id} className="group hover:bg-stone-50/70 transition-colors">
                {/* Date */}
                <td className="px-4 py-3 first:pl-6 whitespace-nowrap text-stone-500 text-xs tabular-nums">
                  {editing?.id === e.id && editing.field === 'date' ? (
                    <input
                      type="date" autoFocus value={editing.value}
                      onChange={ev => setEditing(p => p ? { ...p, value: ev.target.value } : p)}
                      onBlur={commitEdit}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(); if (ev.key === 'Escape') setEditing(null); }}
                      className="border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
                    />
                  ) : (
                    <span className="cursor-pointer hover:text-stone-800" onClick={() => startEdit(e.id, 'date', e.date)}>
                      {formatDate(e.date)}
                    </span>
                  )}
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    e.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {e.type === 'income' ? '↑ Доход' : '↓ Расход'}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-3"><CategoryBadge category={cat} /></td>

                {/* Amount */}
                <td className="px-4 py-3 tabular-nums font-medium whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {editing?.id === e.id && editing.field === 'amount' ? (
                    <input
                      type="number" autoFocus value={editing.value} min="0" step="any"
                      onChange={ev => setEditing(p => p ? { ...p, value: ev.target.value } : p)}
                      onBlur={commitEdit}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(); if (ev.key === 'Escape') setEditing(null); }}
                      className="border border-stone-300 rounded px-2 py-1 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    />
                  ) : (
                    <span
                      className={`cursor-pointer hover:underline underline-offset-2 ${e.type === 'income' ? 'text-green-700' : 'text-stone-900'}`}
                      onClick={() => startEdit(e.id, 'amount', String(e.amount))}
                    >
                      {e.type === 'income' ? '+' : ''}{formatCurrency(e.amount)}
                    </span>
                  )}
                </td>

                {/* Comment */}
                <td className="px-4 py-3 max-w-xs">
                  {editing?.id === e.id && editing.field === 'comment' ? (
                    <input
                      type="text" autoFocus value={editing.value}
                      onChange={ev => setEditing(p => p ? { ...p, value: ev.target.value } : p)}
                      onBlur={commitEdit}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(); if (ev.key === 'Escape') setEditing(null); }}
                      className="border border-stone-300 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
                    />
                  ) : (
                    <span
                      className="text-stone-500 truncate block cursor-pointer hover:text-stone-800 group-hover:underline underline-offset-2"
                      onClick={() => startEdit(e.id, 'comment', e.comment ?? '')}
                      title={e.comment}
                    >
                      {e.comment ?? <span className="text-stone-300 no-underline">Добавить…</span>}
                    </span>
                  )}
                </td>

                {/* Delete */}
                <td className="px-4 py-3 last:pr-6">
                  <button
                    onClick={() => onDelete(e.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"
                    title="Удалить"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
