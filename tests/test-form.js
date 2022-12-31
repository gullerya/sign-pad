import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import { simulateDrawing, simulateEscapeKey, obtainSurface, simulateBlur } from './utils.js';

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
});

suite.runTest({ name: 'form data submitted' }, async test => {
	const c = document.createElement('div');
	const f = document.createElement('form');
	const sp = document.createElement('sign-pad');
	sp.setAttribute('name', 'signature');
	f.appendChild(sp);
	c.appendChild(f);
	document.body.appendChild(c);

	simulateDrawing(sp);
	simulateBlur(sp);

	const testPromise = new Promise(r => {
		f.addEventListener('submit', event => {
			event.preventDefault();
			const fd = new FormData(event.target);
			r(fd);
		});
	});
	f.requestSubmit();

	const submitResult = await testPromise;
	const fdKeys = Array.from(submitResult.keys());
	test.assertEqual(1, fdKeys.length);
	test.assertEqual('signature', fdKeys[0]);
	test.assertEqual('<svg viewBox="0 0 300 200" fill="#000"><path d="M 73.08 50.57 L 99.04 133.62 L 100.95 133.04 L 76.91 49.42 Z"></path><path d="M 99.04 133.62 L 100.55 134.16 L 100.95 133.04 L 99.44 132.5 Z"></path><path d="M 100.55 134.16 L 225.55 50.83 L 224.44 49.16 L 99.44 132.5 Z"></path></svg>', submitResult.get('signature'));
});
