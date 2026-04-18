export const PREFERRED_CURRENCIES = ['JPY', 'TWD', 'USD', 'KRW', 'CNY'] as const

export interface CurrencyOption {
  value: string
  label: string
}

export function toCurrencyOptions(
  codes: readonly string[],
  symbolsMap: Record<string, string> = {}
): CurrencyOption[] {
  return codes.map(code => ({
    value: code,
    label: symbolsMap[code] ? `${code} — ${symbolsMap[code]}` : code
  }))
}
