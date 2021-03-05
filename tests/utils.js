export {
	simulateDrawing,
	simulateEscapeKey,
	obtainSurface
}

function simulateDrawing(signPad) {
	if (!signPad) {
		throw new Error(`signPad is invalid: ${signPad}`);
	}

	const s = obtainSurface(signPad);
	const { width: w, height: h } = s.getBoundingClientRect();
	let e;
	e = new Event('pointerdown');
	e.isPrimary = true;
	e.offsetX = w / 4;
	e.offsetY = h / 4;
	s.dispatchEvent(e);

	e = new Event('pointermove');
	e.isPrimary = true;
	e.offsetX = w / 3 * 1;
	e.offsetY = h / 3 * 2;
	s.dispatchEvent(e);

	e = new Event('pointermove');
	e.isPrimary = true;
	e.offsetX = w / 4 * 3;
	e.offsetY = h / 4 * 1;
	s.dispatchEvent(e);

	e = new Event('pointerup');
	s.dispatchEvent(e);
}

function simulateEscapeKey(signPad) {
	if (!signPad) {
		throw new Error(`signPad is invalid: ${signPad}`);
	}

	const s = obtainSurface(signPad);
	const e = new Event('keyup');
	e.code = 'Escape';
	s.dispatchEvent(e);
}

function obtainSurface(p) {
	return p.shadowRoot.querySelector('svg');
}