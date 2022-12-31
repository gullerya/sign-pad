import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateCurvingDrawing, obtainSurface } from './utils.js';
import { LOCAL_NAME } from '/src/sign-pad.js';

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

suite.runTest({ name: 'curving the segments' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateCurvingDrawing(e);
	test.assertEqual(31, obtainSurface(e).childElementCount);
	test.assertTrue(obtainSurface(e).innerHTML.includes(' Q '));
});