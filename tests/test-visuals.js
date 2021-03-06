import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { obtainSurface } from './utils.js';
import { LOCAL_NAME } from '/dist/sign-pad.js';

const suite = getSuite({ name: 'Visuals and behaviours' });

suite.runTest({ name: 'surface is NOT allowing pointer-action', skip: true }, test => {
	const e = document.createElement(LOCAL_NAME);
	const s = obtainSurface(e);
	test.assertEqual('none', getComputedStyle(s).touchAction);
});