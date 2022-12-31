import { getSuite } from '/node_modules/just-test/dist/just-test.js';
import { simulateDrawing } from './utils.js';
import { LOCAL_NAME } from '/src/sign-pad.js';

const suite = getSuite({ name: 'Export E2E' });

//	SVG
suite.runTest({ name: 'E2E - SVG export (default options)' }, test => {
	const expectedSVG = '<svg viewBox="0 0 400 300" fill="#000"><path d="M 98.06 75.51 L 132.36 200.25 L 134.29 199.74 L 101.93 74.48 Z"></path><path d="M 132.36 200.25 L 133.93 200.8 L 134.29 199.74 L 132.73 199.2 Z"></path><path d="M 133.93 200.8 L 300.6 75.8 L 299.39 74.2 L 132.73 199.2 Z"></path></svg>';
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const svg = e.export('svg');
	test.assertEqual(expectedSVG, svg.outerHTML);
});

suite.runTest({ name: 'E2E - SVG export (trim)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const svg = e.export('svg', { trim: true });
	test.assertEqual(98, svg.viewBox.baseVal.x);
	test.assertEqual(74, svg.viewBox.baseVal.y);
	test.assertEqual(204, svg.viewBox.baseVal.width);
	test.assertEqual(128, svg.viewBox.baseVal.height);
});

suite.runTest({ name: 'E2E - SVG export (ink)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const svg = e.export('svg', { ink: 'red' });
	test.assertEqual('red', svg.getAttribute('fill'));
});

suite.runTest({ name: 'E2E - SVG export (fill)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const svg = e.export('svg', { fill: 'red' });
	test.assertEqual('red', svg.style.backgroundColor);
});

//	canvas
//
suite.runTest({ name: 'E2E - canvas (png) export (default options)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const c = e.export('canvas');
	test.assertTrue(c.toDataURL('image/png').startsWith('data:image/png;base64,'));
	test.assertTrue(c.toDataURL('image/png').length > 2600);
});

suite.runTest({ name: 'E2E - canvas (jpg) export (default options)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const c = e.export('canvas');
	test.assertTrue(c.toDataURL('image/jpeg').startsWith('data:image/jpeg;base64,'));
	test.assertTrue(c.toDataURL('image/jpeg').length > 1300);
});

suite.runTest({ name: 'E2E - canvas (png) export (trim)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const c = e.export('canvas', { trim: true });
	test.assertEqual(204, c.width);
	test.assertEqual(128, c.height);
});

suite.runTest({ name: 'E2E - canvas (png) export (ink)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const c = e.export('canvas', { trim: true, ink: 'red' });
	const ctx = c.getContext('2d');

	let idata = ctx.getImageData(3, 3, 1, 1).data;
	test.assertEqual(255, idata[0]);
	test.assertEqual(0, idata[1]);
	test.assertEqual(0, idata[2]);
	test.assertEqual(255, idata[3]);

	idata = ctx.getImageData(0, 20, 1, 1).data;
	test.assertEqual(0, idata[0]);
	test.assertEqual(0, idata[1]);
	test.assertEqual(0, idata[2]);
	test.assertEqual(0, idata[3]);
});

suite.runTest({ name: 'E2E - canvas (png) export (fill)' }, test => {
	const e = document.createElement(LOCAL_NAME);
	e.style.cssText = 'width: 400px; height: 300px';
	document.body.appendChild(e);
	simulateDrawing(e);
	const c = e.export('canvas', { fill: 'rgb(32, 36, 48)' });
	const ctx = c.getContext('2d');

	test.assertEqual(400, c.width);
	test.assertEqual(300, c.height);

	const idata = ctx.getImageData(0, 0, 1, 1).data;
	test.assertEqual(32, idata[0]);
	test.assertEqual(36, idata[1]);
	test.assertEqual(48, idata[2]);
	test.assertEqual(255, idata[3]);
});
