'use client';

import { ExpenseFilters, Category } from '../lib/types';

interface Props {
  filters: ExpenseFilters;
  categories: Category[];
  onChange: (filters: ExpenseFilters) => void;
}

export function FiltersBar({ filters, categories, onChange }: Props) {
  const set = (patch: Partial<ExpenseFilters>) => onChange({ ...filters, ...patch });

  const hasActive = filters.search || filters.categoryIds.length > 0 ||
    filters.dateRange.from || filters.dateRange.to || filters.type !== 'all';

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-40 max-w-56">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          type="text" placeholder="Поиск…" value={filters.search}
          onChange={e => set({ search: e.target.value })}
          className="w-full pl-8 pr-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 placeholder-stone-400"
        />
      </div>

      {/* Date range */}
      <input
        type="date" value={filters.dateRange.from ?? ''}
        onChange={e => set({ dateRange: { ...filters.dateRange, from: e.target.value || null } })}
        className="border border-stone-200 rounded-lg px-3 py-2 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-600"
      />
      <span className="text-stone-300 text-xs">—</span>
      <input
        type="date" value={filters.dateRange.to ?? ''}
        onChange={e => set({ dateRange: { ...filters.dateRange, to: e.target.value || null } })}
        className="border border-stone-200 rounded-lg px-3 py-2 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-600"
      />

      {/* Type */}
      <select
        value={filters.type}
        onChange={e => set({ type: e.target.value as ExpenseFilters['type'] })}
        className="border border-stone-200 rounded-lg px-3 py-2 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-600"
      >
        <option value="all">Все типы</option>
        <option value="expense">Расходы</option>
        <option value="income">Доходы</option>
      </select>

      {/* Category chips */}
      {categories.slice(0, 5).map(cat => {
        const active = filters.categoryIds.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => set({
              categoryIds: active
                ? filters.categoryIds.filter(id => id !== cat.id)
                : [...filters.categoryIds, cat.id],
            })}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-all ${
              active ? 'shadow-sm' : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
            }`}
            style={active ? {
              backgroundColor: `${cat.color}15`,
              color: cat.color,
              borderColor: `${cat.color}40`,
            } : {}}
          >
            {cat.name}
          </button>
        );
      })}

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => onChange({ search: '', categoryIds: [], dateRange: { from: null, to: null }, type: 'all' })}
          className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5 transition-colors underline underline-offset-2"
        >
          Сбросить
        </button>
      )}
    </div>
  );
}
