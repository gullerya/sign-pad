import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateEscapeKey, obtainSurface } from './utils.js';

const suite = getSuite({ name: 'form association' });

suite.runTest({ name: 'no form - form is null' }, test => {
	const c = document.createElement('div');
	const sp = document.createElement('sign-pad');
	c.appendChild(sp);
	test.assertTrue(sp.form === null);
});

suite.runTest({ name: 'within form - form is associated' }, test => {
	const c = document.createElement('div');
	const f = document.createElement('form');
	f.id = 'form-0';
	const sp = document.createElement('sign-pad');
	f.appendChild(sp);
	c.appendChild(f);
	test.assertEqual(f, sp.form);
});

suite.runTest({ name: 'form associated by id' }, test => {
	const c = document.createElement('div');
	const f = document.createElement('form');
	f.id = 'form-1';
	const sp = document.createElement('sign-pad');
	sp.setAttribute('form', 'form-1');
	sp.setAttribute('name', 'signature');
	c.appendChild(f);
	c.appendChild(sp);
	document.body.appendChild(c);
	test.assertEqual(f, sp.form);

	f.addEventListener('submit', event => {
		event.preventDefault();
		const fd = new FormData(event.target);
		console.log(Array.from(fd.keys()));
	});
});
