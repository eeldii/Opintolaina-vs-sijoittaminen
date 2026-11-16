import { SP500_DATA } from './sp500-data.mjs';

export const EARLIEST_START_YEAR = 2000;

/** Public calculator boundary; the generic engine retains older data for regression checks. */
export function calculatorInputs(input) {
  if (Number(String(input.startMonth).slice(0,4)) < EARLIEST_START_YEAR) {
    throw new RangeError('Aloitusvuosi ei voi olla ennen vuotta 2000.');
  }
  return comparisonInputs(input);
}

/** Both strategies receive identical cash, debt, budget and return assumptions. */
export function comparisonInputs({ startMonth, endMonth, monthlyPayment, returnMode='historical',
  annualInvestmentReturn=0, scenario='savings-only', ...settings }) {
  if (!Number.isFinite(monthlyPayment) || monthlyPayment < 0) throw new RangeError('Kuukausierän on oltava vähintään 0 €.');
  if (!['historical','custom'].includes(returnMode)) throw new RangeError('Valitse tuottotapa.');
  if (!['savings-only','invest-loan'].includes(scenario)) throw new RangeError('Valitse skenaario.');
  for (const key of ['cash','debt']) if (!Number.isFinite(settings[key] ?? 0) || (settings[key] ?? 0) < 0) throw new RangeError('Säästöjen ja velan on oltava vähintään 0 €.');
  const index = value => {
    const parts = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
    if (!parts) throw new RangeError('Valitse kelvollinen kuukausi ja vuosi.');
    return Number(parts[1])*12+Number(parts[2])-1;
  };
  const months=index(endMonth)-index(startMonth);
  if (months<=0 || months>2400) throw new RangeError('Päättymisajan on oltava aloitusajan jälkeen; enimmäispituus on 200 vuotta.');
  const first = SP500_DATA.rows.findIndex(row => row[0] === startMonth);
  const last = SP500_DATA.rows.findIndex(row => row[0] === endMonth);
  if (returnMode==='historical' && (first < 0 || last <= first)) throw new RangeError('Valitse historiallisessa vertailussa ajankohdat aineiston sisältä.');
  if (!Number.isFinite(annualInvestmentReturn) || annualInvestmentReturn<=-1) throw new RangeError('Oman vuosituoton on oltava suurempi kuin −100 %.');
  const loanFee = settings.monthlyLoanFee ?? 0;
  const monthlyReturns = returnMode==='historical'
    ? SP500_DATA.rows.slice(first + 1, last + 1).map((row, i) => row[1] / SP500_DATA.rows[first + i][1] - 1) : null;
  return {
    ...settings, cash:(settings.cash ?? 0)+(scenario==='invest-loan' ? (settings.debt ?? 0) : 0),
    startDate: `${startMonth}-01`, months,
    monthlyBudget: monthlyPayment, scheduledPayment: Math.max(0, monthlyPayment - loanFee),
    annualInvestmentReturn: returnMode==='custom' ? annualInvestmentReturn : 0, monthlyReturns,
  };
}

export function historicalInputs(input) { return comparisonInputs({...input,returnMode:'historical',scenario:'savings-only'}); }
