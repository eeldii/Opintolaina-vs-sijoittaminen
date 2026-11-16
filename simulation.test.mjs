import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateComparison, monthlyRates } from './simulation.mjs';

const base = { debt: 1000, cash: 600, monthlyBudget: 100, scheduledPayment: 100,
  months: 10, taxMode: 'none' };
const near = (actual, expected, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const run = overrides => simulateComparison({ ...base, ...overrides });

test('requested zero-rate baseline: day zero, month four and month ten', () => {
  const result = run();
  assert.equal(result.status, 'complete');
  for (const s of Object.values(result.strategies)) {
    near(s.records[0].netWorthAfterSale, -400);
    near(s.records[4].netWorthAfterSale, 0);
    near(s.records[10].netWorthAfterSale, 600);
  }
  assert.equal(result.strategies.repayNow.payoffMonth, 4);
  assert.equal(result.strategies.investFirst.payoffMonth, 10);
});

test('positive interest reconciles exactly to ending net worth, even before slow payoff', () => {
  for (const months of [10, 12]) {
    const r = run({ annualLoanRate: 0.12, months });
    const a = r.strategies.repayNow.final;
    const b = r.strategies.investFirst.final;
    assert.ok(a.totalInterestCharged < b.totalInterestCharged);
    near(r.endingNetWorthDifference, b.totalInterestCharged - a.totalInterestCharged);
    near(a.netWorthAfterSale, 600 - 1000 + months * 100 - a.totalInterestCharged);
    near(b.netWorthAfterSale, 600 - 1000 + months * 100 - b.totalInterestCharged);
  }
});

test('final partial payment: precisely 40 loan, 60 investment, zero debt', () => {
  for (const s of Object.values(run({ debt: 40, cash: 0, months: 1 }).strategies)) {
    const record = s.final;
    assert.equal(record.loanPayment, 40);
    assert.equal(record.investmentContribution, 60);
    assert.equal(record.remainingDebt, 0);
    assert.equal(record.portfolioMarketValue, 60);
  }
});

test('cash above debt is invested without creating negative debt', () => {
  const r = run({ debt: 100, cash: 150, months: 1 });
  const a = r.strategies.repayNow;
  assert.equal(a.records[0].loanPayment, 100);
  assert.equal(a.records[0].investmentContribution, 50);
  assert.equal(a.records[0].remainingDebt, 0);
  assert.equal(a.final.netWorthAfterSale, 150);
  assert.equal(r.strategies.investFirst.final.netWorthAfterSale, 150);
});

test('zero cash and shared budget equal to payment produce identical paths', () => {
  const r = run({ cash: 0, annualLoanRate: 0.03, annualInvestmentReturn: 0.04, months: 14 });
  assert.deepEqual(r.strategies.repayNow.records, r.strategies.investFirst.records);
});

test('negative return reduces old holdings, not new end-of-month contributions', () => {
  const r = run({ debt: 0, cash: 1000, annualInvestmentReturn: 0.9 ** 12 - 1, months: 2 });
  for (const s of Object.values(r.strategies)) {
    near(s.records[1].portfolioMarketValue, 1000);
    near(s.final.portfolioMarketValue, 1000);
    near(s.final.totalInvestedCapital, 1200);
    assert.equal(s.final.estimatedTaxOnSale, 0);
    near(s.final.estimatedLossWithoutTaxCredit, 200);
  }
});

test('horizon before payoff retains outstanding debt in net worth', () => {
  const r = run({ months: 2 });
  assert.equal(r.strategies.repayNow.final.remainingDebt, 200);
  assert.equal(r.strategies.investFirst.final.remainingDebt, 800);
  for (const s of Object.values(r.strategies)) {
    assert.equal(s.payoffMonth, null);
    assert.equal(s.final.netWorthAfterSale, -200);
  }
});

test('insufficient budget stops both paths before the failed month', () => {
  const r = run({ monthlyBudget: 99 });
  assert.equal(r.status, 'infeasible');
  assert.equal(r.failure.month, 1);
  for (const problem of r.failure.problems) {
    assert.equal(problem.code, 'INSUFFICIENT_BUDGET');
    assert.equal(problem.minimumBudget, 100);
    assert.equal(problem.shortfall, 1);
  }
  for (const s of Object.values(r.strategies)) {
    assert.equal(s.records.length, 1);
    assert.equal(s.final, null);
  }
  assert.equal(r.endingNetWorthDifference, null);
});

test('budget validation uses actual final due, includes fees and identifies the failing path', () => {
  assert.equal(run({ debt: 40, cash: 0, monthlyBudget: 60, months: 1 }).status, 'complete');
  const r = run({ cash: 1000, monthlyBudget: 100, monthlyLoanFee: 1 });
  assert.equal(r.failure.problems.length, 1);
  assert.equal(r.failure.problems[0].strategy, 'investFirst');
  assert.equal(r.failure.problems[0].minimumBudget, 101);
});

test('non-amortizing agreed payment returns a structured failure', () => {
  const r = run({ annualLoanRate: 0.12, scheduledPayment: 10, cash: 0 });
  assert.equal(r.failure.problems[0].code, 'NON_AMORTIZING_PAYMENT');
});

test('fees conserve cash; paid fees exclude hypothetical sale fees', () => {
  const r = run({ debt: 100, cash: 160, monthlyBudget: 120, scheduledPayment: 100,
    initialRepaymentFee: 10, monthlyLoanFee: 5, purchaseFeeRate: 0.1, saleFeeRate: 0.05, months: 2 });
  const a0 = r.strategies.repayNow.records[0];
  assert.equal(a0.loanPayment, 100);
  assert.equal(a0.investmentContribution, 50);
  assert.equal(a0.portfolioMarketValue, 45);
  assert.deepEqual(a0.fees, { loan: 0, initialRepayment: 10, purchase: 5, total: 15 });
  const b1 = r.strategies.investFirst.records[1];
  assert.equal(b1.loanPayment, 100);
  assert.equal(b1.investmentContribution, 15);
  assert.equal(b1.fees.loan, 5);
  assert.equal(r.strategies.investFirst.records[2].fees.loan, 0);
  for (const s of Object.values(r.strategies)) {
    for (const rec of s.records) {
      const available = rec.month === 0 ? 160 : 120;
      near(rec.loanPayment + rec.fees.loan + rec.fees.initialRepayment + rec.investmentContribution, available);
      near(rec.netWorthAfterSale, rec.portfolioMarketValue - rec.hypotheticalSaleFee - rec.remainingDebt);
    }
    near(s.final.portfolioMarketValue, s.final.totalInvestedCapital * 0.9);
  }
});

test('no initial repayment fee if there is no debt or cash cannot cover the fee', () => {
  for (const input of [{ debt: 0, cash: 5 }, { debt: 100, cash: 10 }, { debt: 100, cash: 5 }]) {
    const rec = run({ ...input, initialRepaymentFee: 10, months: 0 }).strategies.repayNow.final;
    assert.equal(rec.fees.initialRepayment, 0);
    assert.equal(rec.investmentContribution, input.cash);
  }
});

test('hypothetical tax is never withdrawn from the growing portfolio', () => {
  const r = run({ debt: 0, cash: 2000, monthlyBudget: 0,
    annualInvestmentReturn: 1.1 ** 12 - 1, months: 2, taxMode: 'finnish-estimate' });
  for (const s of Object.values(r.strategies)) {
    near(s.records[1].portfolioMarketValue, 2200);
    near(s.records[1].estimatedTaxOnSale, 60);
    near(s.final.portfolioMarketValue, 2420);
    near(s.final.estimatedTaxOnSale, 126);
    near(s.final.netWorthAfterSale, 2294);
  }
});

test('small-sale exemption, tax bands and sale costs', () => {
  const small = run({ debt: 0, cash: 500, monthlyBudget: 0, annualInvestmentReturn: 2 ** 12 - 1,
    months: 1, taxMode: 'finnish-estimate' }).strategies.repayNow.final;
  near(small.portfolioMarketValue, 1000);
  assert.equal(small.estimatedTaxOnSale, 0);
  const taxed = run({ debt: 0, cash: 2000, monthlyBudget: 0, otherCapitalIncome: 29950,
    annualInvestmentReturn: 1.1 ** 12 - 1, saleFeeRate: 0.01,
    months: 1, taxMode: 'finnish-estimate' }).strategies.repayNow.final;
  near(taxed.estimatedTaxableGain, 178);
  near(taxed.estimatedTaxOnSale, 50 * 0.3 + 128 * 0.34);
  near(taxed.netWorthAfterSale, 2200 - 22 - 58.52);
});

test('deemed acquisition cost uses each individual lot age, including ten-year boundary', () => {
  const r = run({ startDate: '2016-11-15', debt: 0, cash: 1000, monthlyBudget: 100,
    annualInvestmentReturn: 1, months: 120, taxMode: 'finnish-estimate' });
  let gain = 0;
  for (let purchaseMonth = 0; purchaseMonth <= 120; purchaseMonth++) {
    const cost = purchaseMonth === 0 ? 1000 : 100;
    const value = cost * 2 ** ((120 - purchaseMonth) / 12);
    gain += Math.min(value - cost, value * (purchaseMonth === 0 ? 0.6 : 0.8));
  }
  const final = r.strategies.repayNow.final;
  near(final.estimatedTaxableGain, gain, 1e-6);
  near(final.estimatedTaxOnSale, 9000 + (gain - 30000) * 0.34, 1e-6);
});

test('SPEC worked example is reproduced including its tax-dependent difference', () => {
  const r = run({ debt: 2000, cash: 1000, monthlyBudget: 600, scheduledPayment: 500,
    annualLoanRate: 0.12, annualInvestmentReturn: 1.01 ** 12 - 1,
    months: 6, taxMode: 'finnish-estimate' });
  const a = r.strategies.repayNow;
  const b = r.strategies.investFirst;
  assert.equal(a.payoffMonth, 2);
  assert.equal(b.payoffMonth, 5);
  near(a.records[2].investmentContribution, 185.9);
  near(b.records[5].loanPayment, 51.5175952);
  near(a.final.portfolioMarketValue, 2629.688885459);
  near(b.final.portfolioMarketValue, a.final.portfolioMarketValue);
  near(a.final.netWorthAfterSale, 2616.5522198213);
  near(b.final.netWorthAfterSale, 2605.3269412613);
});

test('annual conversion and calendar anchoring are explicit and timezone-independent', () => {
  near(monthlyRates(0.12, 1.01 ** 12 - 1).loan, 0.01);
  near(monthlyRates(0.12, 1.01 ** 12 - 1).investment, 0.01);
  const r = run({ startDate: '2027-01-31', months: 2 });
  assert.deepEqual(r.strategies.repayNow.records.map(x => x.date), ['2027-01-31', '2027-02-28', '2027-03-31']);
});

test('reject invalid dates, rates, horizons, nonfinite values and misspelled fields', () => {
  for (const input of [
    { startDate: '2026-02-30' }, { annualLoanRate: -0.01 },
    { annualInvestmentReturn: -1 }, { purchaseFeeRate: 1 }, { saleFeeRate: 1 },
    { months: 1.5 }, { months: -1 }, { months: 2401 }, { cash: NaN },
    { debt: Infinity }, { taxMode: 'wrong' }, { monthlyBudjet: 100 },
  ]) assert.throws(() => run(input));
});
