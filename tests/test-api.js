import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateEscapeKey, obtainSurface } from './utils.js';
import { LOCAL_NAME as DEFAULT_LOCAL_NAME } from '/src/sign-pad.js';
import { LOCAL_NAME } from '/src/sign-pad.js?local-name=sign-pad-x';

const suite = getSuite({ name: 'API - base, attributes, properties, methods' });

suite.runTest({ name: 'component defined' }, test => {
	const ie = globalThis.customElements.get(LOCAL_NAME);
	test.assertTrue(Boolean(ie));
});

suite.runTest({ name: 'component local names defined correctly' }, test => {
	test.assertEqual('sign-pad', DEFAULT_LOCAL_NAME);
	test.assertEqual('sign-pad-x', LOCAL_NAME);
});

suite.runTest({ name: 'has content when drawn' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	test.assertEqual(0, obtainSurface(e).childElementCount);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'has no content when clear (API)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
	e.clear();
	test.assertEqual(0, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'has no content when clear (Escape simulation)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
	simulateEscapeKey(e);
	test.assertEqual(0, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'empty state true (present) when created' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	obtainSurface(e);
	test.assertTrue(e.empty);
	test.assertTrue(e.hasAttribute('empty'));
});

suite.runTest({ name: 'empty state false (absent) when drawn' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertFalse(e.empty);
	test.assertFalse(e.hasAttribute('empty'));
});

suite.runTest({ name: 'empty state true (present) when clear' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertFalse(e.empty);
	test.assertFalse(e.hasAttribute('empty'));
});

suite.runTest({ name: 'export to SVG produces SVG' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	const expSVG = e.export('svg');
	test.assertEqual('svg', expSVG.localName);
});

suite.runTest({ name: 'export to canvas produces canvas' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	const expCanvas = e.export('canvas');
	test.assertEqual('canvas', expCanvas.localName);
});