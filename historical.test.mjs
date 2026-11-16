import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { SP500_DATA } from './sp500-data.mjs';
import { historicalInputs, comparisonInputs, calculatorInputs, EARLIEST_START_YEAR } from './historical.mjs';
import { simulateComparison } from './simulation.mjs';
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-7, `${a} != ${b}`);

test('market snapshot integrity and every month in chronological order', async () => {
  const csv=await readFile(new URL('sp500-source.csv',import.meta.url),'utf8');
  assert.equal(createHash('sha256').update(csv).digest('hex'),SP500_DATA.sha256);
  assert.equal(SP500_DATA.rows.length,1869);
  assert.deepEqual(SP500_DATA.rows[0],['1871-01',4.44]);
  assert.deepEqual(SP500_DATA.rows.at(-1),['2026-09',7669.41]);
  for(let i=1;i<SP500_DATA.rows.length;i++) {
    const [y,m]=SP500_DATA.rows[i-1][0].split('-').map(Number);
    assert.equal(SP500_DATA.rows[i][0],new Date(Date.UTC(y,m,1)).toISOString().slice(0,7));
  }
});

test('first historical return is independently checkable: 4.50 / 4.44 - 1', () => {
  const input=historicalInputs({startMonth:'1871-01',endMonth:'1871-02',monthlyPayment:0,cash:100,debt:0,taxMode:'none'});
  assert.equal(input.months,1);
  near(input.monthlyReturns[0],4.5/4.44-1);
  const result=simulateComparison(input);
  for(const strategy of Object.values(result.strategies)) near(strategy.final.portfolioMarketValue,100*4.5/4.44);
});

test('same x/a/y; debt is never invested and y is used only once', () => {
  const input=historicalInputs({startMonth:'2007-01',endMonth:'2009-01',monthlyPayment:100,cash:600,debt:1000,taxMode:'none'});
  const result=simulateComparison(input);
  const a=result.strategies.repayNow.records,b=result.strategies.investFirst.records;
  assert.equal(a[0].portfolioMarketValue,0);
  assert.equal(a[0].remainingDebt,400);
  assert.equal(b[0].portfolioMarketValue,600);
  assert.equal(b[0].remainingDebt,1000);
  assert.equal(a[0].netWorthAfterSale,b[0].netWorthAfterSale);
  assert.equal(result.strategies.repayNow.payoffMonth,4);
  assert.equal(result.strategies.investFirst.payoffMonth,10);
  for(const rows of [a,b]) for(let m=1;m<rows.length;m++) {
    const r=rows[m];
    near(r.loanPayment+r.investmentContribution,100);
    near(r.portfolioMarketValue,rows[m-1].portfolioMarketValue*(1+input.monthlyReturns[m-1])+r.investmentContribution);
    if(r.remainingDebt>0) assert.equal(r.investmentContribution,0);
  }
  for(let m=1;m<a.length;m++) assert.equal(a[m].investmentReturn,b[m].investmentReturn);
  assert.ok(input.monthlyReturns.some(r=>r<0),'real historical drawdowns present');
});

test('historical returns have correct order and new contributions get no same-month return', () => {
  const result=simulateComparison({debt:40,cash:0,monthlyBudget:100,scheduledPayment:100,months:2,monthlyReturns:[0.1,-0.2],taxMode:'none'});
  for(const s of Object.values(result.strategies)) {
    assert.equal(s.records[1].loanPayment,40);
    assert.equal(s.records[1].investmentContribution,60);
    near(s.records[1].portfolioMarketValue,60);
    near(s.records[2].portfolioMarketValue,148);
  }
});

test('monthly fees are inside shared y and cease after payoff', () => {
  const result=simulateComparison(historicalInputs({startMonth:'2000-01',endMonth:'2000-03',monthlyPayment:100,monthlyLoanFee:5,debt:40,cash:0,taxMode:'none'}));
  for(const s of Object.values(result.strategies)) {
    assert.equal(s.records[1].investmentContribution,55);
    assert.equal(s.records[1].fees.loan,5);
    assert.equal(s.records[2].investmentContribution,100);
    assert.equal(s.records[2].fees.loan,0);
  }
});

test('reject unavailable or reversed periods and missing/invalid returns', () => {
  for(const input of [{startMonth:'1800-01',endMonth:'2000-01'},{startMonth:'2000-01',endMonth:'2000-01'},{startMonth:'2000-02',endMonth:'2000-01'}])
    assert.throws(()=>historicalInputs({...input,monthlyPayment:100}));
  for(const monthlyReturns of [[],[NaN],[-1],[Infinity]]) assert.throws(()=>simulateComparison({months:1,monthlyReturns}));
});

test('the complete available history runs without repeating or extrapolating returns', () => {
  const inputs=historicalInputs({startMonth:SP500_DATA.rows[0][0],endMonth:SP500_DATA.rows.at(-1)[0],monthlyPayment:200,debt:20000,cash:10000,annualLoanRate:0.035});
  assert.equal(inputs.months,1868);
  const result=simulateComparison(inputs);
  assert.equal(result.status,'complete');
  for(const strategy of Object.values(result.strategies)) {
    assert.equal(strategy.records.length,1869);
    assert.equal(strategy.final.date,'2026-09-01');
    assert.ok(Number.isFinite(strategy.final.netWorthAfterSale));
  }
});

test('custom effective annual return compounds correctly over a future twelve-month period', () => {
  const inputs=comparisonInputs({startMonth:'2030-01',endMonth:'2031-01',monthlyPayment:0,cash:1000,debt:0,
    returnMode:'custom',annualInvestmentReturn:0.12,taxMode:'none'});
  assert.equal(inputs.months,12);
  assert.equal(inputs.monthlyReturns,null);
  for(const s of Object.values(simulateComparison(inputs).strategies)) near(s.final.portfolioMarketValue,1120);
});

test('negative custom annual return is allowed, invalid rates/modes are rejected', () => {
  const settings={startMonth:'2026-01',endMonth:'2027-01',monthlyPayment:0,cash:1000,debt:0,returnMode:'custom',annualInvestmentReturn:-0.2,taxMode:'none'};
  for(const s of Object.values(simulateComparison(comparisonInputs(settings)).strategies)) near(s.final.portfolioMarketValue,800);
  for(const extra of [{annualInvestmentReturn:-1},{annualInvestmentReturn:NaN},{scenario:'typo'},{returnMode:'typo'},{startMonth:'2026-13'}])
    assert.throws(()=>comparisonInputs({...settings,...extra}));
});

test('invest-loan scenario credits identical loan proceeds to both sides exactly once', () => {
  const inputs=comparisonInputs({startMonth:'2026-01',endMonth:'2026-11',monthlyPayment:100,cash:600,debt:1000,
    returnMode:'custom',annualInvestmentReturn:0,scenario:'invest-loan',taxMode:'none'});
  assert.equal(inputs.cash,1600);
  const result=simulateComparison(inputs);
  const a=result.strategies.repayNow,b=result.strategies.investFirst;
  assert.equal(a.records[0].loanPayment,1000);
  assert.equal(a.records[0].portfolioMarketValue,600);
  assert.equal(a.records[0].remainingDebt,0);
  assert.equal(b.records[0].portfolioMarketValue,1600);
  assert.equal(b.records[0].remainingDebt,1000);
  assert.equal(a.records[0].netWorthAfterSale,600);
  assert.equal(b.records[0].netWorthAfterSale,600);
  for(const s of [a,b]) assert.equal(s.final.netWorthAfterSale,1600);
  assert.equal(b.records[1].investmentContribution,0);
});

test('borrowed money participates in returns without duplicating the monthly contribution', () => {
  const result=simulateComparison(comparisonInputs({startMonth:'2026-01',endMonth:'2026-02',monthlyPayment:100,cash:600,debt:1000,
    returnMode:'custom',annualInvestmentReturn:1.1**12-1,scenario:'invest-loan',taxMode:'none'}));
  near(result.strategies.repayNow.final.netWorthAfterSale,760);
  near(result.strategies.investFirst.final.netWorthAfterSale,860);
});

test('calculator rejects years before 2000 in either return mode and accepts the boundary', () => {
  assert.equal(EARLIEST_START_YEAR,2000);
  for(const returnMode of ['historical','custom']) {
    const common={endMonth:'2020-01',monthlyPayment:100,cash:600,debt:1000,returnMode};
    assert.throws(()=>calculatorInputs({...common,startMonth:'1999-12'}),/2000/);
    assert.equal(calculatorInputs({...common,startMonth:'2000-01'}).startDate,'2000-01-01');
  }
});
