import { Category } from '../../lib/types';
import storage from '../../lib/storage';
import { DEFAULT_CATEGORIES } from '../../lib/defaultCategories';

const KEY = 'categories_v1';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    const stored = storage.get<Category[]>(KEY);
    if (!stored || stored.length === 0) {
      storage.set(KEY, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return stored;
  },

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    const all = await categoryRepository.getAll();
    const item: Category = { ...data, id: `cat_${Date.now()}` };
    storage.set(KEY, [...all, item]);
    return item;
  },

  async update(id: string, patch: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
    const all = await categoryRepository.getAll();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    storage.set(KEY, all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    const all = await categoryRepository.getAll();
    storage.set(KEY, all.filter(c => c.id !== id));
  },
};
