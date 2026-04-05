import { Category } from '../lib/types';

interface Props {
  category: Category | null;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: Props) {
  if (!category) return <span className="text-stone-400 text-xs">—</span>;

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ${pad}`}
      style={{
        backgroundColor: `${category.color}18`,
        color: category.color,
        border: `1px solid ${category.color}30`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
      {category.name}
    </span>
  );
}
