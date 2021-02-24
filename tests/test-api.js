import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import '/src/sign-pad.js';

const suite = getSuite({ name: 'Testing sign-pad API' });

suite.runTest({ name: 'API present basic' }, async test => {
	await test.waitMillis(50);
	const ie = globalThis.customElements.get('sign-pad');
	test.assertTrue(Boolean(ie));
});

suite.runTest({ name: 'API live playground' }, () => {
	const sp = document.createElement('sign-pad');
	sp.innerHTML = '<div slot="background" style="background-color: red; opacity: 0.5"></div>';
	document.body.appendChild(sp);
});