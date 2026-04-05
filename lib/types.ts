export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  date: string; // ISO date string
  amount: number;
  categoryId: string;
  comment?: string;
  tags?: string[];
  type: TransactionType;
  createdAt: string;
  // Reserved for future use
  is_recurring?: boolean;
  user_id?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface ExpenseFilters {
  dateRange: DateRange;
  categoryIds: string[];
  search: string;
  type: TransactionType | 'all';
}
