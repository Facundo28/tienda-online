export function formatCurrencyFromCents(cents: number, currency: string = "USD") {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
