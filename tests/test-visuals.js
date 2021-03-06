import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, obtainSurface } from './utils.js';
import { LOCAL_NAME } from '/dist/sign-pad.js';

const suite = getSuite({ name: 'Visuals and behaviours' });

suite.runTest({ name: 'surface is NOT allowing pointer-action', skip: true }, test => {
	const e = document.createElement(LOCAL_NAME);
	const s = obtainSurface(e);
	test.assertEqual('none', getComputedStyle(s).touchAction);
});

suite.runTest({ name: 'surface is NOT reacting on multi-touch' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e, { multitouch: true });
	test.assertEqual(3, obtainSurface(e).childElementCount);
});