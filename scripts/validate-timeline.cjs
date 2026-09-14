// Meaningful numerical checks for the scenario's units, scope and valid period.
const assert = require('node:assert/strict');
require('../dist/timeline-model.js');
const m = globalThis.PowerTimelineMath;
const close = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-8, `${actual} != ${expected}`);
const settings = { labs:2, load:.8, pue:1.2, boundary:'it' };
close(m.iea(2025),155); close(m.iea(2030),465);
close(m.lab(2026,settings),100.9152);
close(m.lab(2027,settings),302.7456);
close(m.lab(2028,settings),908.2368);
close(m.lab(2027.5,settings)**2,m.lab(2027,settings)*m.lab(2028,settings));
assert.equal(m.lab(2025,settings),null);
assert.equal(m.lab(2030,settings),null);
close(m.lab(2028,{...settings,labs:1}),454.1184);
close(m.lab(2028,{...settings,boundary:'facility'}),756.864);
close(m.lab(2028,{...settings,boundary:'facility',pue:1.6}),756.864);
close(m.lab(2028,{...settings,load:1,pue:1.6}),1513.728);
close(m.lab(2028,settings)/50,18.164736);
console.log('Timeline validated: source anchors, geometric interpolation, no extrapolation, lab counts, facility boundaries, and annualised unit conversion.');
