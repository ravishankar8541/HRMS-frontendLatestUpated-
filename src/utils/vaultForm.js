// Copy only editable form fields; IDs and delivery/approval states are not drafts.
export function vaultForm(defaults, record, aliases = {}) {
  if (!record) return { ...defaults };
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
    let value = record[aliases[key] || key] ?? fallback;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) value = value.slice(0, 10);
    return [key, value];
  }));
}
