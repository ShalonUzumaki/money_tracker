'use client';

import { useState, useMemo } from 'react';
import { useExpenses, filterExpenses } from '../features/expenses/useExpenses';
import { useCategories } from '../features/categories/useCategories';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { ExpenseTable } from '../components/ExpenseTable';
import { ExpenseCards } from '../components/ExpenseCards';
import { FiltersBar } from '../components/FiltersBar';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { UndoToast } from '../components/UndoToast';
import { ExpenseFilters, Expense } from '../lib/types';

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  categoryIds: [],
  dateRange: { from: null, to: null },
  type: 'all',
};

type Tab = 'list' | 'analytics';

export default function HomePage() {
  const { expenses, loading, create, update, remove, undoItem, undoDelete, dismissUndo } = useExpenses();
  const { categories, getCategoryById } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [tab, setTab] = useState<Tab>('list');

  const filtered = useMemo(() => filterExpenses(expenses, filters), [expenses, filters]);

  const handleSave = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    await create(data);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
     

      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="white" strokeWidth="1.3"/>
                <path d="M1 6h12" stroke="white" strokeWidth="1.3"/>
                <path d="M5 9h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-stone-900 text-[15px] tracking-tight">Финансы</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 gap-0.5">
            {(['list', 'analytics'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-all ${
                  tab === t ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {t === 'list' ? 'Записи' : 'Аналитика'}
              </button>
            ))}
          </div>

          {/* Desktop add button */}
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Добавить
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'analytics' ? (
          <AnalyticsPanel expenses={expenses} categories={categories} />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-4">
              <FiltersBar filters={filters} categories={categories} onChange={setFilters} />
            </div>

            {/* List */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-700">История</h2>
                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full tabular-nums">
                  {filtered.length}
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-stone-400 text-sm">Загрузка…</div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block">
                    <ExpenseTable
                      expenses={filtered}
                      categories={categories}
                      onUpdate={async (id, patch) => {
  await update(id, patch)
}}
                      onDelete={remove}
                    />
                  </div>
                  {/* Mobile cards */}
                  <div className="sm:hidden pt-3">
                    <ExpenseCards
                      expenses={filtered}
                      categories={categories}
                      onDelete={remove}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* FAB — mobile */}
      <button
        onClick={() => setModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-5 z-40 w-14 h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl shadow-lg shadow-stone-900/20 flex items-center justify-center fab-pulse transition-all"
        aria-label="Добавить запись"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3v14M3 10h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Modal */}
      {modalOpen && (
        <AddExpenseModal
          categories={categories}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Undo toast */}
      <UndoToast visible={!!undoItem} onUndo={undoDelete} onDismiss={dismissUndo} />
    </div>
  );
}
