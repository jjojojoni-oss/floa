/** Isi {nama} di dalam teks: fmt('Untuk {to}', { to: 'Laras' }). Aman dipakai di server maupun client. */
export function fmt(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}
