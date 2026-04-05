/** Generate a simple unique ID */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Format number as RUB currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format ISO date string to display format */
export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Today's date as ISO string (YYYY-MM-DD) */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns YYYY-MM-DD for start and end of current month */
export function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

/** Group expenses by date label for line chart */
export function groupByDay<T extends { date: string; amount: number }>(
  items: T[]
): Array<{ date: string; amount: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.date, (map.get(item.date) ?? 0) + item.amount);
  }
  return Array.from(map.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
