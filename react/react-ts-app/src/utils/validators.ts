// Lightweight validators inspired by Angular CustomValidators

export function required(label: string) {
  return (val: unknown): string | null => {
    const v = typeof val === 'string' ? val.trim() : val;
    return v ? null : `The ${label} Field Is Required`;
  };
}

export function minLength(label: string, n: number) {
  return (val: unknown): string | null => {
    const v = String(val ?? '');
    return v.length >= n ? null : `${label} Min Length Should Be ${n}`;
  };
}

export function maxLength(label: string, n: number) {
  return (val: unknown): string | null => {
    const v = String(val ?? '');
    return v.length <= n ? null : `${label} Cannot Be Greater Than ${n}`;
  };
}

export function email(label: string) {
  // Simplified RFC 5322-like pattern; sufficient for typical validation and linter-friendly
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (val: unknown): string | null => {
    const v = String(val ?? '');
    if (!v) return null; // allow empty; combine with required if needed
    return re.test(v.toLowerCase()) ? null : `Please Enter Valid ${label}`;
  };
}

export function match(label: string, a: string, b: string) {
  return (values: Record<string, unknown>): string | null => {
    const av = String(values[a] ?? '');
    const bv = String(values[b] ?? '');
    return av === bv ? null : `${label} Field Doesn't Match with ${a}`;
  };
}

export function requiredWith(_label: string, a: string, b: string) {
  return (values: Record<string, unknown>): string | null => {
    const av = String(values[a] ?? '').trim();
    const bv = String(values[b] ?? '').trim();
    return av === bv ? null : `${b} Field Is Required With ${a} Field`;
  };
}
