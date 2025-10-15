// Utilities adapted from Angular utils/pagination.ts for React usage

export function totalPagesRange(totalPages: number): number[] {
  return Array.from({ length: Math.max(0, Number(totalPages) || 0) }, (_, i) => i + 1);
}

// Safe get via dot path
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

// Filter generic records by a set of column property paths
export function filterByColumns<T extends Record<string, unknown>>(rows: T[], columns: string[], term: string): T[] {
  const value = String(term || '').toLowerCase().trim();
  if (!value) return rows;
  const cols = Array.isArray(columns) ? columns : [];
  return rows.filter((row) => {
    for (const prop of cols) {
      const v = getByPath(row, prop);
      if (v != null && String(v).toLowerCase().includes(value)) return true;
    }
    return false;
  });
}
