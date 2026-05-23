const USD_TO_KHR = 4000;

export function formatUSD(amount: number, options?: Intl.NumberFormatOptions): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, ...options })}`;
}

export function formatKHR(amount: number): string {
  const khr = Math.round(amount * USD_TO_KHR);
  return `៛${khr.toLocaleString('en-US')}`;
}

export function formatDual(amount: number): string {
  return `${formatUSD(amount)} (${formatKHR(amount)})`;
}

export function formatAmount(amount: number, mode: 'usd' | 'dual' = 'usd'): string {
  if (mode === 'dual') return formatDual(amount);
  return formatUSD(amount);
}