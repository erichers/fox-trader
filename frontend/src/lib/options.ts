// Render option setups in a human-readable format, e.g. "June 22, 2026, $300 Call".

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function formatExpiration(iso?: string, label?: string): string {
  if (label) return label;
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "June 26, 2026, $380 Call" */
export function formatOption(setup: any): string {
  if (!setup) return '';
  if (setup.readable) return setup.readable;
  const exp = formatExpiration(setup.expiration, setup.expiration_label);
  const strike = setup.strike != null ? `$${setup.strike}` : '';
  const type = setup.option_type ? setup.option_type[0].toUpperCase() + setup.option_type.slice(1) : '';
  return [exp, [strike, type].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

/** Short label from a bot's action JSON when no concrete strike is set. */
export function optionLabelFromAction(action: any): string {
  if (!action?.option_type) return '';
  const tgt = action.strike_target ? `${action.strike_target.toUpperCase()} ` : '';
  const exp = action.expiration ? action.expiration : '';
  return `${tgt}${action.option_type}${exp ? ` · ${exp}` : ''}`;
}

/** Parse an OCC option symbol (e.g. NVDA260116C00800000). */
export function occToContract(occ: string): { underlying: string; type: 'call' | 'put'; strike: number; expiration: string } | null {
  const m = /^([A-Z]+)(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/.exec(String(occ || '').toUpperCase());
  if (!m) return null;
  const [, underlying, yy, mm, dd, cp, strk] = m;
  return { underlying, type: cp === 'C' ? 'call' : 'put', strike: Number(strk) / 1000, expiration: `20${yy}-${mm}-${dd}` };
}

/** "META 150 put Sep 20" */
export function formatOccShort(occ: string): string {
  const c = occToContract(occ);
  if (!c) return occ || '';
  const d = new Date(c.expiration + 'T00:00:00');
  const md = isNaN(d.getTime()) ? c.expiration : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${c.underlying} ${c.strike} ${c.type} ${md}`;
}
