import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildPage } from './build-local.mjs';
import { simulateComparison } from './simulation.mjs';

const read = name => readFile(new URL(name, import.meta.url), 'utf8');

test('offline page is up to date and contains no remote runtime dependencies', async () => {
  const html = await read('index.html');
  assert.equal(html, await buildPage());
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+(?:stylesheet|preload)|\bfetch\s*\(|XMLHttpRequest|https?:\/\/[^\s"']+\.(?:js|css)/i);
  assert.doesNotMatch(html, /BUILD:CSS|BUILD:JS/);
  new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
});

test('engine embedded in the offline page matches the tested module across scenarios', async () => {
  const html = await read('index.html');
  const app = await read('app.js');
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.ok(script.includes(app));
  const context = vm.createContext({});
  vm.runInContext(script.replace(app, 'globalThis.compare = simulateComparison;'), context);
  const scenarios = [
    { debt: 1000, cash: 600, monthlyBudget: 100, scheduledPayment: 100, months: 10, taxMode: 'none' },
    { debt: 1000, cash: 600, monthlyBudget: 100, scheduledPayment: 100, months: 10, annualLoanRate: 0.12 },
    { debt: 40, cash: 0, monthlyBudget: 100, scheduledPayment: 100, months: 1 },
    { debt: 40, cash: 600, monthlyBudget: 100, scheduledPayment: 100, months: 3, monthlyReturns:[0.1,-0.2,0.03] },
    { debt: 2000, cash: 1000, monthlyBudget: 600, scheduledPayment: 500, annualLoanRate: 0.12, annualInvestmentReturn: 1.01 ** 12 - 1, months: 6 },
    { debt: 20000, cash: 10000, monthlyBudget: 400, scheduledPayment: 200, annualLoanRate: 0.035, annualInvestmentReturn: -0.05 },
    { debt: 1000, cash: 0, monthlyBudget: 99, scheduledPayment: 100 },
    { debt: 0, cash: 10000, monthlyBudget: 100, purchaseFeeRate: 0.01, saleFeeRate: 0.02, annualInvestmentReturn: 0.2, months: 121 },
  ];
  for (const input of scenarios) {
    assert.deepEqual(JSON.parse(JSON.stringify(context.compare(input))), JSON.parse(JSON.stringify(simulateComparison(input))));
  }
});

test('browser fields cover every editable engine input and have labels', async () => {
  const html = await read('index.template.html');
  const names = [...html.matchAll(/<input[^>]+name="([^"]+)"/g)].map(match => match[1]);
  const keys = ['debt','cash','monthlyPayment','annualLoanRate','annualInvestmentReturn','monthlyLoanFee','initialRepaymentFee','purchaseFeeRate','saleFeeRate','otherCapitalIncome'];
  assert.deepEqual(names.sort(), keys.sort());
  for (const name of names) assert.ok(html.includes(`for="${name}"`), `${name} missing label`);
  for (const id of ['startMonth','startYear','endMonth','endYear','scenario','returnMode']) assert.ok(html.includes(`for="${id}"`) && html.includes(`<select id="${id}"`));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate element IDs');
});
