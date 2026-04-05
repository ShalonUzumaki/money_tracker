'use client';

import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Expense, Category } from '../lib/types';
import { formatCurrency, currentMonthRange, groupByDay } from '../lib/utils';

interface Props {
  expenses: Expense[];
  categories: Category[];
}

export function AnalyticsPanel({ expenses, categories }: Props) {
  const catMap = new Map(categories.map(c => [c.id, c]));
  const { from, to } = currentMonthRange();

  const monthExpenses = useMemo(
    () => expenses.filter(e => e.type === 'expense' && e.date >= from && e.date <= to),
    [expenses, from, to]
  );
  const monthIncome = useMemo(
    () => expenses.filter(e => e.type === 'income' && e.date >= from && e.date <= to),
    [expenses, from, to]
  );

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const incomeTotal = monthIncome.reduce((s, e) => s + e.amount, 0);
  const balance = incomeTotal - monthTotal;

  // Pie data — expenses by category this month
  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
    return Array.from(map.entries()).map(([id, value]) => ({
      name: catMap.get(id)?.name ?? id,
      value,
      color: catMap.get(id)?.color ?? '#94a3b8',
    })).sort((a, b) => b.value - a.value);
  }, [monthExpenses, catMap]);

  // Line data — daily expenses last 30 days
  const lineData = useMemo(() => {
    const d30 = new Date(); d30.setDate(d30.getDate() - 29);
    const d30str = d30.toISOString().split('T')[0];
    const recent = expenses.filter(e => e.type === 'expense' && e.date >= d30str);
    return groupByDay(recent).map(item => ({
      ...item,
      label: item.date.slice(5), // MM-DD
    }));
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Summary cards */}
      <div className="lg:col-span-1 grid grid-cols-1 gap-3">
        <StatCard label="Расходы за месяц" value={formatCurrency(monthTotal)} sub={`${monthExpenses.length} операций`} accent="#ef4444" />
        <StatCard label="Доходы за месяц" value={formatCurrency(incomeTotal)} sub={`${monthIncome.length} операций`} accent="#22c55e" />
        <StatCard
          label="Баланс"
          value={formatCurrency(Math.abs(balance))}
          sub={balance >= 0 ? 'профицит' : 'дефицит'}
          accent={balance >= 0 ? '#22c55e' : '#ef4444'}
        />
      </div>

      {/* Pie chart */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">По категориям</h3>
        {pieData.length === 0 ? (
          <EmptyChart />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), '']}
                  contentStyle={{ border: '1px solid #e7e5e4', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {pieData.slice(0, 4).map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-stone-600">{d.name}</span>
                  </div>
                  <span className="text-stone-500 tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {formatCurrency(d.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Line chart */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Расходы по дням (30 дн.)</h3>
        {lineData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Расходы']}
                contentStyle={{ border: '1px solid #e7e5e4', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              <Line
                type="monotone" dataKey="amount" stroke="#1c1917"
                strokeWidth={1.5} dot={{ r: 3, fill: '#1c1917', strokeWidth: 0 }}
                activeDot={{ r: 4, fill: '#1c1917' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className="text-xl font-semibold tracking-tight" style={{ color: accent, fontFamily: "'DM Mono', monospace" }}>{value}</p>
      <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-40 flex items-center justify-center text-stone-300 text-sm">Нет данных</div>;
}
