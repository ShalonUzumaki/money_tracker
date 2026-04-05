import { Expense } from '@/lib/types';
import storage from '@/lib/storage';
import { generateId } from '@/lib/utils';

const KEY = 'expenses_v1';

export const expenseRepository = {
  async getAll(): Promise<Expense[]> {
    return storage.get<Expense[]>(KEY) ?? [];
  },

  async create(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const all = await this.getAll();
    const item: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    storage.set(KEY, [item, ...all]);
    return item;
  },

  async update(id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense | null> {
    const all = await this.getAll();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    storage.set(KEY, all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    storage.set(KEY, all.filter(e => e.id !== id));
  },

  async setAll(items: Expense[]): Promise<void> {
    storage.set(KEY, items);
  },
};