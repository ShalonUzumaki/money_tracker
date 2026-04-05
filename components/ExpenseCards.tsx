'use client';

import { Expense, Category } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/utils';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => Promise<void>;
}

export function ExpenseCards({ expenses, categories, onDelete }: Props) {
  const catMap = new Map(categories.map(c => [c.id, c]));

  if (expenses.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-stone-400 text-sm">Нет записей. Нажмите «+», чтобы добавить.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4 pb-6">
      {expenses.map(e => {
        const cat = catMap.get(e.categoryId) ?? null;
        return (
          <div key={e.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <CategoryBadge category={cat} size="sm" />
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                  e.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {e.type === 'income' ? 'Доход' : 'Расход'}
                </span>
              </div>
              {e.comment && (
                <p className="text-sm text-stone-600 truncate mb-1">{e.comment}</p>
              )}
              <p className="text-xs text-stone-400">{formatDate(e.date)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`font-semibold tabular-nums text-sm ${e.type === 'income' ? 'text-green-700' : 'text-stone-900'}`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {e.type === 'income' ? '+' : ''}{formatCurrency(e.amount)}
              </span>
              <button
                onClick={() => onDelete(e.id)}
                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
