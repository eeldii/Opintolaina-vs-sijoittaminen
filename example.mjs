import { simulateComparison } from './simulation.mjs';

const inputs = { debt: 1000, cash: 600, monthlyBudget: 100, scheduledPayment: 100,
  months: 10, taxMode: 'none' };
const result = simulateComparison(inputs);
console.log('Zero-rate example — month-four records (EUR):');
console.table(Object.fromEntries(Object.entries(result.strategies).map(([id, strategy]) => {
  const record = strategy.records[4];
  return [id, { ...record, fees: record.fees.total }];
})));
console.log('Positive-interest example: 12% nominal annual loan rate, all other rates/fees/tax zero.');
const positive = simulateComparison({ ...inputs, annualLoanRate: 0.12 });
const a = positive.strategies.repayNow.final;
const b = positive.strategies.investFirst.final;
console.log(JSON.stringify({
  horizonMonths: inputs.months,
  repayNow: { interest: a.totalInterestCharged, endingDebt: a.remainingDebt, netWorth: a.netWorthAfterSale },
  investFirst: { interest: b.totalInterestCharged, endingDebt: b.remainingDebt, netWorth: b.netWorthAfterSale },
  interestSaved: b.totalInterestCharged - a.totalInterestCharged,
  endingNetWorthDifference: positive.endingNetWorthDifference,
}, null, 2));
