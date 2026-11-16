/** Pure monthly engine. Rates are decimals (0.04 = 4%), money is euros. */
export const STRATEGIES = Object.freeze({
  repayNow: 'Lyhennä lainaa heti',
  investFirst: 'Sijoita ja maksa laina erissä',
});

export const TAX_ASSUMPTIONS = Object.freeze({
  rulesChecked: '2026-11-15',
  label: 'Rajattu arvio Suomen luovutusvoittoverosta, ei henkilökohtainen verolaskelma.',
  limits: Object.freeze([
    'Kasvuosuuksinen rahasto tavallisessa verotuksessa; ei vuosittaisia tuotonjakoja.',
    'Ei muita luovutuksia tai aiempia luovutustappioita. Muut pääomatulot annetaan nettomääräisinä.',
    'Nykyiset 30/34 prosentin verokannat, 30 000 euron raja ja 1 000 euron pienten luovutusten raja pidetään ennallaan.',
    'Hankintameno-olettama valitaan eräkohtaisesti: 20 %, vähintään 10 vuoden omistuksella 40 %.',
    'Nettotappiosta ei kirjata välitöntä verohyötyä; mahdollinen henkilökohtainen hyöty jää arvion ulkopuolelle.',
    'Opintolainan korot eivät tuota verovähennystä. Kela-hyvitys on jo mukana avaavassa velkasaldossa.',
    'Hypoteettinen myyntivero ja lunastuspalkkio vähennetään vain nettovarallisuuden arvostuksessa, ei salkusta.',
  ]),
});

const DEFAULTS = Object.freeze({
  startDate: '2026-11-15', months: 120,
  debt: 0, cash: 0, monthlyBudget: 0, scheduledPayment: 0,
  annualLoanRate: 0, annualInvestmentReturn: 0,
  monthlyLoanFee: 0, initialRepaymentFee: 0,
  purchaseFeeRate: 0, saleFeeRate: 0,
  otherCapitalIncome: 0, taxMode: 'finnish-estimate', monthlyReturns: null,
});

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError('startDate must be a real YYYY-MM-DD date.');
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new TypeError('startDate must be a real YYYY-MM-DD date.');
  }
  return date;
}

// Always anchor to the original day: Jan 31 -> Feb 28 -> Mar 31.
function addMonths(date, months) {
  const target = new Date(date.getTime());
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);
  const lastDay = new Date(target.getTime());
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1);
  lastDay.setUTCDate(0);
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay.getUTCDate()));
  return target;
}

function validate(input) {
  const unknown = Object.keys(input).filter(key => !(key in DEFAULTS));
  if (unknown.length) throw new TypeError(`Unknown inputs: ${unknown.join(', ')}`);
  const c = { ...DEFAULTS, ...input };
  parseDate(c.startDate);
  for (const key of Object.keys(DEFAULTS).filter(key => typeof DEFAULTS[key] === 'number')) {
    if (typeof c[key] !== 'number' || !Number.isFinite(c[key])) {
      throw new TypeError(`${key} must be a finite number.`);
    }
    if (key !== 'annualInvestmentReturn' && c[key] < 0) {
      throw new RangeError(`${key} must be nonnegative.`);
    }
  }
  if (!Number.isInteger(c.months) || c.months > 2400) {
    throw new RangeError('months must be an integer from 0 to 2400.');
  }
  if (c.monthlyReturns !== null && (!Array.isArray(c.monthlyReturns) || c.monthlyReturns.length !== c.months
    || c.monthlyReturns.some(r => typeof r !== 'number' || !Number.isFinite(r) || r <= -1))) {
    throw new RangeError('monthlyReturns must contain exactly one finite return greater than -1 per month.');
  }
  if (c.annualInvestmentReturn <= -1) throw new RangeError('annualInvestmentReturn must exceed -1.');
  for (const key of ['purchaseFeeRate', 'saleFeeRate']) {
    if (c[key] >= 1) throw new RangeError(`${key} must be below 1.`);
  }
  if (!['none', 'finnish-estimate'].includes(c.taxMode)) throw new RangeError('Invalid taxMode.');
  return c;
}

export function monthlyRates(annualLoanRate, annualInvestmentReturn) {
  return {
    loan: annualLoanRate / 12,
    investment: Math.expm1(Math.log1p(annualInvestmentReturn) / 12),
  };
}

function capitalTax(x) {
  return 0.30 * Math.min(x, 30000) + 0.34 * Math.max(0, x - 30000);
}

function saleEstimate(state, date, c) {
  let portfolioMarketValue = 0;
  let estimatedTaxableGain = 0;
  for (const lot of state.lots) {
    portfolioMarketValue += lot.value;
    const assumedCostRate = date >= lot.tenYearDate ? 0.40 : 0.20;
    estimatedTaxableGain += Math.min(
      lot.value - lot.cost - lot.value * c.saleFeeRate,
      lot.value * (1 - assumedCostRate),
    );
  }
  const hypotheticalSaleFee = portfolioMarketValue * c.saleFeeRate;
  const smallSaleExempt = portfolioMarketValue <= 1000;
  const taxableGain = Math.max(0, estimatedTaxableGain);
  const estimatedTaxOnSale = c.taxMode === 'none' || smallSaleExempt ? 0
    : capitalTax(c.otherCapitalIncome + taxableGain) - capitalTax(c.otherCapitalIncome);
  return {
    portfolioMarketValue, hypotheticalSaleFee, estimatedTaxableGain,
    estimatedLossWithoutTaxCredit: Math.max(0, -estimatedTaxableGain),
    smallSaleExempt, estimatedTaxOnSale,
    netWorthBeforeSale: portfolioMarketValue - state.debt,
    netWorthAfterSale: portfolioMarketValue - hypotheticalSaleFee - estimatedTaxOnSale - state.debt,
  };
}

// Strategy differences are confined to the payment policy; all accounting is shared.
function paymentPlan(state, month, c, rates) {
  if (month === 0) {
    const repay = state.id === 'repayNow' && state.debt > 0 && c.cash > c.initialRepaymentFee;
    const initialRepayment = repay ? c.initialRepaymentFee : 0;
    const loanPayment = repay ? Math.min(state.debt, c.cash - initialRepayment) : 0;
    return { interestCharged: 0, loanFee: 0, initialRepayment, loanPayment,
      investmentContribution: c.cash - initialRepayment - loanPayment };
  }
  const interestCharged = state.debt * rates.loan;
  const due = state.debt + interestCharged;
  const loanFee = state.debt > 0 ? c.monthlyLoanFee : 0;
  const requiredPayment = Math.min(c.scheduledPayment, due);
  const minimumBudget = requiredPayment + loanFee;
  if (c.monthlyBudget < minimumBudget) {
    return { error: {
      code: 'INSUFFICIENT_BUDGET', minimumBudget,
      shortfall: minimumBudget - c.monthlyBudget,
      message: 'Kuukausibudjetti ei riitä pankin maksuerään ja kuluihin. Muuta budjettia tai pankin kanssa sovittua maksuerää.',
    } };
  }
  if (state.debt > 0 && c.scheduledPayment <= interestCharged && c.scheduledPayment < due) {
    return { error: { code: 'NON_AMORTIZING_PAYMENT', interestCharged,
      message: 'Pankin maksuerä ei lyhennä lainaa. Korjaa pankin kanssa sovittu maksuerä.' } };
  }
  const loanPayment = state.id === 'repayNow'
    ? Math.min(due, c.monthlyBudget - loanFee) : requiredPayment;
  return { interestCharged, loanFee, initialRepayment: 0, loanPayment,
    investmentContribution: c.monthlyBudget - loanFee - loanPayment };
}

function advance(state, plan, month, date, c, rates) {
  const openingDebt = state.debt;
  const investmentReturn = month === 0 ? 0 : (c.monthlyReturns?.[month - 1] ?? rates.investment);
  if (month > 0) {
    for (const lot of state.lots) lot.value *= 1 + investmentReturn;
  }
  state.debt = Math.max(0, openingDebt + plan.interestCharged - plan.loanPayment);
  const purchaseFee = plan.investmentContribution * c.purchaseFeeRate;
  if (plan.investmentContribution > 0) {
    state.lots.push({ date, tenYearDate: addMonths(date, 120), cost: plan.investmentContribution,
      value: plan.investmentContribution - purchaseFee });
  }
  state.totalInvestedCapital += plan.investmentContribution;
  state.totalInterestCharged += plan.interestCharged;
  const totalFees = plan.loanFee + plan.initialRepayment + purchaseFee;
  state.totalFeesPaid += totalFees;
  if (state.debt === 0 && state.payoffMonth === null) state.payoffMonth = month;
  const record = {
    month, date: date.toISOString().slice(0, 10), openingDebt,
    interestCharged: plan.interestCharged, investmentReturn,
    fees: { loan: plan.loanFee, initialRepayment: plan.initialRepayment, purchase: purchaseFee, total: totalFees },
    loanPayment: plan.loanPayment,
    principalRepaid: plan.loanPayment - plan.interestCharged,
    remainingDebt: state.debt,
    investmentContribution: plan.investmentContribution,
    investmentPurchased: plan.investmentContribution - purchaseFee,
    totalInvestedCapital: state.totalInvestedCapital,
    totalInterestCharged: state.totalInterestCharged,
    totalFeesPaid: state.totalFeesPaid,
    ...saleEstimate(state, date, c),
  };
  if (Object.values(record).some(value => typeof value === 'number' && !Number.isFinite(value))) {
    throw new RangeError('Simulation overflow: reduce the rate, amount or horizon.');
  }
  state.records.push(record);
}

/** Returns day zero plus months 1..N. Failed months never mutate either strategy. */
export function simulateComparison(input = {}) {
  const c = validate(input);
  const rates = monthlyRates(c.annualLoanRate, c.annualInvestmentReturn);
  const start = parseDate(c.startDate);
  const states = Object.keys(STRATEGIES).map(id => ({
    id, label: STRATEGIES[id], debt: c.debt, lots: [], records: [],
    totalInvestedCapital: 0, totalInterestCharged: 0, totalFeesPaid: 0, payoffMonth: null,
  }));
  let failure = null;
  for (let month = 0; month <= c.months; month++) {
    const date = addMonths(start, month);
    const plans = states.map(state => paymentPlan(state, month, c, rates));
    const problems = plans.flatMap((plan, index) => plan.error
      ? [{ strategy: states[index].id, ...plan.error }] : []);
    if (problems.length) {
      failure = { month, date: date.toISOString().slice(0, 10), problems };
      break;
    }
    states.forEach((state, index) => advance(state, plans[index], month, date, c, rates));
  }
  const strategies = Object.fromEntries(states.map(state => [state.id, {
    label: state.label, records: state.records, payoffMonth: state.payoffMonth,
    payoffDate: state.payoffMonth === null ? null : state.records[state.payoffMonth].date,
    final: failure ? null : state.records.at(-1),
  }]));
  return {
    status: failure ? 'infeasible' : 'complete', inputs: c,
    returnModel: c.monthlyReturns === null ? 'constant-annual' : 'historical-monthly',
    monthlyRates: {...rates, investment:c.monthlyReturns === null ? rates.investment : null},
    assumptions: TAX_ASSUMPTIONS, taxMode: c.taxMode, failure, strategies,
    endingNetWorthDifference: failure ? null
      : strategies.repayNow.final.netWorthAfterSale - strategies.investFirst.final.netWorthAfterSale,
  };
}
