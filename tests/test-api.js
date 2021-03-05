import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateEscapeKey, obtainSurface } from './utils.js';
import '/dist/sign-pad.js?cname=sign-pad-x';

const suite = getSuite({ name: 'API' });
const ename = 'sign-pad-x';

suite.runTest({ name: 'component defined' }, async test => {
	const ie = globalThis.customElements.get(ename);
	test.assertTrue(Boolean(ie));
});

suite.runTest({ name: 'has content when drawn' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	test.assertEqual(0, obtainSurface(e).childElementCount);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'has no content when clear (API)' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
	e.clear();
	test.assertEqual(0, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'has no content when clear (Escape simulation)' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
	simulateEscapeKey(e);
	test.assertEqual(0, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'empty state true (present) when created' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	obtainSurface(e);
	test.assertTrue(e.empty);
	test.assertTrue(e.hasAttribute('empty'));
});

suite.runTest({ name: 'empty state false (absent) when drawn' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertFalse(e.empty);
	test.assertFalse(e.hasAttribute('empty'));
});

suite.runTest({ name: 'empty state true (present) when clear' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertFalse(e.empty);
	test.assertFalse(e.hasAttribute('empty'));
});

suite.runTest({ name: `'input' event fired when drawn` }, async test => {
	let fires = 0;
	const e = document.createElement(ename);
	e.addEventListener('input', () => fires++);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, fires);
});

suite.runTest({ name: `'input' event fired when clear` }, async test => {
	let fires = 0;
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	e.addEventListener('input', () => fires++);
	e.clear();
	test.assertEqual(1, fires);
});

suite.runTest({ name: 'export to SVG produces SVG' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	const expSVG = e.export('svg');
	test.assertEqual('svg', expSVG.localName);
});

suite.runTest({ name: 'export to canvas produces canvas' }, async test => {
	const e = document.createElement(ename);
	document.body.appendChild(e);
	simulateDrawing(e);
	const expCanvas = e.export('canvas');
	test.assertEqual('canvas', expCanvas.localName);
});