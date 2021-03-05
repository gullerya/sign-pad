import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import '/dist/sign-pad.js';

const suite = getSuite({ name: 'Events' });

suite.runTest({ name: 'component defined' }, async test => {
	const ie = globalThis.customElements.get('sign-pad');
	test.assertTrue(Boolean(ie));
});