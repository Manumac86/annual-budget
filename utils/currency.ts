// Currency data by country
export const COUNTRIES_WITH_CURRENCY = [
  { country: "United States", currency: "USD", symbol: "$" },
  { country: "Spain", currency: "EUR", symbol: "€" },
  { country: "United Kingdom", currency: "GBP", symbol: "£" },
  { country: "Canada", currency: "CAD", symbol: "C$" },
  { country: "Australia", currency: "AUD", symbol: "A$" },
  { country: "Japan", currency: "JPY", symbol: "¥" },
  { country: "China", currency: "CNY", symbol: "¥" },
  { country: "India", currency: "INR", symbol: "₹" },
  { country: "Brazil", currency: "BRL", symbol: "R$" },
  { country: "Mexico", currency: "MXN", symbol: "$" },
  { country: "Argentina", currency: "ARS", symbol: "$" },
  { country: "Chile", currency: "CLP", symbol: "$" },
  { country: "Colombia", currency: "COP", symbol: "$" },
  { country: "Peru", currency: "PEN", symbol: "S/" },
  { country: "Uruguay", currency: "UYU", symbol: "$U" },
  { country: "Germany", currency: "EUR", symbol: "€" },
  { country: "France", currency: "EUR", symbol: "€" },
  { country: "Italy", currency: "EUR", symbol: "€" },
  { country: "Portugal", currency: "EUR", symbol: "€" },
  { country: "Netherlands", currency: "EUR", symbol: "€" },
  { country: "Belgium", currency: "EUR", symbol: "€" },
  { country: "Switzerland", currency: "CHF", symbol: "CHF" },
  { country: "Sweden", currency: "SEK", symbol: "kr" },
  { country: "Norway", currency: "NOK", symbol: "kr" },
  { country: "Denmark", currency: "DKK", symbol: "kr" },
  { country: "Poland", currency: "PLN", symbol: "zł" },
  { country: "Russia", currency: "RUB", symbol: "₽" },
  { country: "Turkey", currency: "TRY", symbol: "₺" },
  { country: "South Africa", currency: "ZAR", symbol: "R" },
  { country: "South Korea", currency: "KRW", symbol: "₩" },
  { country: "Singapore", currency: "SGD", symbol: "S$" },
  { country: "Hong Kong", currency: "HKD", symbol: "HK$" },
  { country: "New Zealand", currency: "NZD", symbol: "NZ$" },
  { country: "Thailand", currency: "THB", symbol: "฿" },
  { country: "Malaysia", currency: "MYR", symbol: "RM" },
  { country: "Indonesia", currency: "IDR", symbol: "Rp" },
  { country: "Philippines", currency: "PHP", symbol: "₱" },
  { country: "Vietnam", currency: "VND", symbol: "₫" },
  { country: "Egypt", currency: "EGP", symbol: "E£" },
  { country: "Nigeria", currency: "NGN", symbol: "₦" },
  { country: "Kenya", currency: "KES", symbol: "KSh" },
  { country: "Israel", currency: "ILS", symbol: "₪" },
  { country: "UAE", currency: "AED", symbol: "د.إ" },
  { country: "Saudi Arabia", currency: "SAR", symbol: "﷼" },
  { country: "Pakistan", currency: "PKR", symbol: "₨" },
  { country: "Bangladesh", currency: "BDT", symbol: "৳" },
  { country: "Czech Republic", currency: "CZK", symbol: "Kč" },
  { country: "Hungary", currency: "HUF", symbol: "Ft" },
  { country: "Romania", currency: "RON", symbol: "lei" },
  { country: "Greece", currency: "EUR", symbol: "€" },
] as const;

export function getCurrencyByCountry(country: string) {
  const found = COUNTRIES_WITH_CURRENCY.find(
    (c) => c.country.toLowerCase() === country.toLowerCase()
  );
  return found || { country, currency: "USD", symbol: "$" };
}

export function getCurrencySymbol(currency: string): string {
  const found = COUNTRIES_WITH_CURRENCY.find((c) => c.currency === currency);
  return found?.symbol || "$";
}

export function getAllCountries() {
  return COUNTRIES_WITH_CURRENCY.map((c) => c.country).sort();
}

export function getAllCurrencies() {
  // Get unique currencies
  const uniqueCurrencies = Array.from(
    new Set(COUNTRIES_WITH_CURRENCY.map((c) => c.currency))
  );
  return uniqueCurrencies.sort();
}
