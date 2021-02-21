import { getSuite } from '../../node_modules/just-test/dist/just-test.js'
import '../../dist/sign-pad.js';

const suite = getSuite({ name: 'Testing sign-pad API' });

suite.runTest({ name: 'API present basic' }, test => {
	const ie = globalThis.customElements.get('sign-pad');
	test.assertTrue(Boolean(ie));
});