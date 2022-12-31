import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateFocusThenEscapeKey, obtainSurface } from './utils.js';
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

suite.runTest({ name: 'has no content when value set to null (API)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
	e.value = null;
	test.assertEqual(0, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'has no content when value set to null (Escape simulation)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual(3, obtainSurface(e).childElementCount);
	simulateFocusThenEscapeKey(e);
	test.assertEqual(0, obtainSurface(e).childElementCount);
});

suite.runTest({ name: 'empty state true (present) when created' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	obtainSurface(e);
	test.assertTrue(e.isEmpty);
	test.assertTrue(e.hasAttribute('empty'));
});

suite.runTest({ name: 'empty state false (absent) when drawn' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertFalse(e.isEmpty);
	test.assertFalse(e.hasAttribute('empty'));
});

suite.runTest({ name: 'empty state true (present) when no value' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	test.assertTrue(e.isEmpty);
	test.assertTrue(e.hasAttribute('empty'));
});

suite.runTest({ name: 'unknown export produces error' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	try {
		const expSVG = e.export('wrong-format');
		test.assertEqual('svg', expSVG.localName);
	} catch (error) {
		test.assertEqual(`unknown format 'wrong-format'; use one of those: [svg, canvas]`, error.message);
	}
});

suite.runTest({ name: 'default export produces SVG' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	const expSVG = e.export();
	test.assertEqual('svg', expSVG.localName);
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

suite.runTest({ name: 'value is null when no data' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	test.assertEqual(null, e.value);
});

suite.runTest({ name: 'value is svg text when data is present' }, test => {
	const e = document.createElement(LOCAL_NAME);
	document.body.appendChild(e);
	simulateDrawing(e);
	test.assertEqual('<svg viewBox="0 0 300 200" fill="#000"><path d="M 73.08 50.57 L 99.04 133.62 L 100.95 133.04 L 76.91 49.42 Z"></path><path d="M 99.04 133.62 L 100.55 134.16 L 100.95 133.04 L 99.44 132.5 Z"></path><path d="M 100.55 134.16 L 225.55 50.83 L 224.44 49.16 L 99.44 132.5 Z"></path></svg>', e.value);
});