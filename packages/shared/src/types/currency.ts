import type { INTL_CURRENCIES } from "#/constants/currency"

export type IntlCurrency = (typeof INTL_CURRENCIES)[number]

export type CurrencyFormatOptions = NonNullable<Parameters<Intl.NumberFormatConstructor>[1]>
