'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Expense, ExpenseFilters } from '../../lib/types';
import { expenseRepository } from './expenseRepository';

const UNDO_TIMEOUT = 5000;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoItem, setUndoItem] = useState<{ expense: Expense; snapshot: Expense[] } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const data = await expenseRepository.getAll();
    setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const item = await expenseRepository.create(data);
    setExpenses(prev => [item, ...prev]);
    return item;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    const updated = await expenseRepository.update(id, patch);
    if (updated) setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    const snapshot = await expenseRepository.getAll();
    const target = snapshot.find(e => e.id === id);
    if (!target) return;

    await expenseRepository.delete(id);
    setExpenses(prev => prev.filter(e => e.id !== id));

    // Set up undo
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoItem({ expense: target, snapshot });
    undoTimer.current = setTimeout(() => setUndoItem(null), UNDO_TIMEOUT);
  }, []);

  const undoDelete = useCallback(async () => {
    if (!undoItem) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    await expenseRepository.setAll(undoItem.snapshot);
    setExpenses(undoItem.snapshot);
    setUndoItem(null);
  }, [undoItem]);

  const dismissUndo = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoItem(null);
  }, []);

  return { expenses, loading, create, update, remove, undoItem, undoDelete, dismissUndo };
}

/** Apply filters client-side */
export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return expenses.filter(e => {
    if (filters.type !== 'all' && e.type !== filters.type) return false;
    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(e.categoryId)) return false;
    if (filters.dateRange.from && e.date < filters.dateRange.from) return false;
    if (filters.dateRange.to && e.date > filters.dateRange.to) return false;
    if (filters.search && !e.comment?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
