import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateFocusThenEscapeKey, simulateEnterKey, simulateFocus, simulateBlur } from './utils.js';
import { LOCAL_NAME } from '/src/sign-pad.js';

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

suite.runTest({ name: `'change' event fired when value set to null (API)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('change', () => fires++);
	e.value = null;
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'input' event fired when value set to null (Escape key)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('input', () => fires++);
	simulateFocusThenEscapeKey(e);
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'input' event NOT fired when value set to null on empty element` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	e.addEventListener('input', () => fires++);
	e.value = null;
	test.assertEqual(0, fires);
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
	let inputFires = 0;
	let changeFires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);

	e.addEventListener('input', () => inputFires++);
	e.addEventListener('change', () => changeFires++);
	simulateFocusThenEscapeKey(e);
	simulateBlur(e);
	test.assertEqual(1, inputFires);
	test.assertEqual(1, changeFires);
});

suite.runTest({ name: `'change' event NOT fired when (drawn) focus > blur (no change)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	simulateBlur(e);
	test.assertEqual(0, fires);
});

suite.runTest({ name: `'change' event NOT fired when (empty) focus > clear > blur (no change)` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	e.value = null;
	simulateBlur(e);
	test.assertEqual(0, fires);
});

suite.runTest({ name: `'change' event fired on 'Enter' when content changed` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	simulateDrawing(e);
	simulateEnterKey(e);
	test.assertEqual(1, fires);
});

suite.runTest({ name: `'change' event NOT fired on 'Enter' when content not changed` }, test => {
	let fires = 0;
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);

	e.addEventListener('change', () => fires++);
	simulateFocus(e);
	simulateEnterKey(e);
	test.assertEqual(0, fires);
});
