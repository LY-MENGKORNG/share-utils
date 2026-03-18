import type { CurrencyFormatOptions, IntlCurrency } from "#/types/currency"

export function formatCurrency(
	amount: number,
	locale: string,
	options: CurrencyFormatOptions = {}
) {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "KHR" as IntlCurrency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		...options,
	}).format(amount)
}
