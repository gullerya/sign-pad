import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateEscapeKey, simulateFocus, simulateBlur } from './utils.js';
import { LOCAL_NAME } from '/dist/sign-pad.js';

const suite = getSuite({ name: 'API - events' });

//	input event
//
suite.runTest({ name: `'input' event fired when drawn` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	e.addEventListener('input', () => fires++);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(2, fires);
});

suite.runTest({ name: `'input' event fired when clear (API)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('input', () => fires++);
	e.clear();
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'input' event fired when clear (Escape key)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('input', () => fires++);
	simulateEscapeKey(e);
	test.assertEqual(1, fires);
});

//	change event
//
suite.runTest({ name: `'change' event fired when focus > draw > blur` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	simulateDrawing(e);
	simulateBlur(e);
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'change' event fired when (drawn) and then focus > clear > blur` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	simulateEscapeKey(e);
	simulateBlur(e);
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'change' event fired when focus > blur (no change)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	simulateBlur(e);
	test.assertEqual(0, fires);
});
