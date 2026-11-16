import test from 'node:test';
import assert from 'node:assert/strict';
import {formatNumberText,formatNumberEdit} from './input-format.mjs';

test('numbers group while typing without changing precision or partial decimals',()=>{
  assert.equal(formatNumberText('1234567'),'1 234 567');
  assert.equal(formatNumberText('1234567,00500'),'1 234 567,00500');
  assert.equal(formatNumberText('1234.'),'1 234,');
  assert.equal(formatNumberText('-12345,6'),'-12 345,6');
  assert.equal(formatNumberText('−12345,6'),'−12 345,6');
  assert.equal(formatNumberText('-'),'-');
});
test('empty input becomes zero when committed, while remaining editable during typing',()=>{
  assert.equal(formatNumberText(''),'');
  assert.equal(formatNumberText('',true),'0');
  assert.equal(formatNumberText(' \u00a0 ',true),'0');
});
test('caret and selection positions survive regrouping and edits in the middle',()=>{
  assert.deepEqual(formatNumberEdit('1234',4),{text:'1 234',start:5,end:5});
  assert.deepEqual(formatNumberEdit('1234',0),{text:'1 234',start:0,end:0});
  assert.deepEqual(formatNumberEdit('12 934',4),{text:'12 934',start:4,end:4});
  assert.deepEqual(formatNumberEdit('1234567',2,5),{text:'1 234 567',start:3,end:7});
});
test('pasted grouping is normalized and malformed numeric text remains visible for validation',()=>{
  assert.equal(formatNumberText('1\u00a0234\u202f567,89'),'1 234 567,89');
  assert.equal(formatNumberText('12abc'),'12abc');
});
