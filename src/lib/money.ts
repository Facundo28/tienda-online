export function formatCurrencyFromCents(cents: number, currency: string = "ARS") {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
