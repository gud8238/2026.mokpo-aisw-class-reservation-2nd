import test from 'node:test';
import assert from 'node:assert/strict';
import {AVAILABLE,calendarCells,normalizeDate,status} from '../src/model.js';

test('exactly the requested twenty dates are available',()=>{
  assert.equal(AVAILABLE.length,20);
  assert.equal(status('2026-10-14',[]),'open');
  assert.equal(status('2026-10-15',[]),'closed');
  assert.equal(status('2026-10-14',['2026-10-14']),'booked');
});
test('calendar aligns with Sunday and date normalization accepts sheet dates',()=>{
  assert.equal(calendarCells(2026,10).indexOf('2026-10-01'),4);
  assert.equal(normalizeDate('2026. 10. 14.'),'2026-10-14');
  assert.equal(normalizeDate('10/14'),'2026-10-14');
});
