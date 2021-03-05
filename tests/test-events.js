import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateEscapeKey } from './utils.js';
import '/dist/sign-pad.js';

const suite = getSuite({ name: 'API - events' });
const ename = 'sign-pad';

suite.runTest({ name: `'input' event fired when drawn` }, test => {
	let fires = 0;
	const e = document.createElement(ename);
	e.addEventListener('input', () => fires++);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, fires);
});

suite.runTest({ name: `'input' event fired when clear (API)` }, test => {
	let fires = 0;
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('input', () => fires++);
	e.clear();
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'input' event fired when clear (Escape key)` }, test => {
	let fires = 0;
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('input', () => fires++);
	simulateEscapeKey(e);
	test.assertEqual(1, fires);
});