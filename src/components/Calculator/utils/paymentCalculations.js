export const calculateTotalPaid = (settings) => {
  const deposit = parseFloat(settings?.deposit) || 0;
  const validDeposit = deposit >= 0 ? deposit : 0;

  const paymentsTotal = (settings?.payments || [])
    .filter((payment) => payment.isPaid && parseFloat(payment.amount) >= 0)
    .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  return validDeposit + paymentsTotal;
};