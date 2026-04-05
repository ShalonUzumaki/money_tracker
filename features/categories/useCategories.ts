'use client';

import { useState, useEffect, useCallback } from 'react';
import { Category } from '../../lib/types';
import { categoryRepository } from './categoryRepository';


export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryRepository.getAll().then(setCategories);
  }, []);

  const getCategoryById = useCallback(
    (id: string) => categories.find(c => c.id === id) ?? null,
    [categories]
  );

  return { categories, getCategoryById };
}
