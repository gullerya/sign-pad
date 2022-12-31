export {
	simulateDrawing,
	simulateCurvingDrawing,
	simulateFocusThenEscapeKey,
	simulateEnterKey,
	simulateFocus,
	simulateBlur,
	obtainSurface
}

function simulateDrawing(signPad, { multitouch = false } = {}) {
	const s = obtainSurface(signPad);
	const { width: w, height: h } = s.getBoundingClientRect();
	let e;
	e = new Event('pointerdown');
	e.isPrimary = true;
	e.pointerId = 1;
	e.offsetX = w / 4;
	e.offsetY = h / 4;
	s.dispatchEvent(e);

	e = new Event('pointermove');
	e.isPrimary = true;
	e.pointerId = 1;
	e.offsetX = w / 3 * 1;
	e.offsetY = h / 3 * 2;
	s.dispatchEvent(e);

	if (multitouch) {
		e = new Event('pointerdown');
		e.isPrimary = true;
		e.pointerId = 2;
		e.offsetX = w / 4;
		e.offsetY = h / 4;
		s.dispatchEvent(e);

		e = new Event('pointermove');
		e.isPrimary = true;
		e.pointerId = 2;
		e.offsetX = w / 3 * 1;
		e.offsetY = h / 3 * 2;
		s.dispatchEvent(e);
	}

	e = new Event('pointermove');
	e.isPrimary = true;
	e.pointerId = 1;
	e.offsetX = w / 4 * 3;
	e.offsetY = h / 4 * 1;
	s.dispatchEvent(e);

	if (multitouch) {
		e = new Event('pointermove');
		e.isPrimary = true;
		e.pointerId = 2;
		e.offsetX = w / 3 * 1;
		e.offsetY = h / 3 * 2;
		s.dispatchEvent(e);
	}

	e = new Event('pointerup');
	e.pointerId = 1;
	s.dispatchEvent(e);

	if (multitouch) {
		e = new Event('pointerup');
		e.pointerId = 2;
		s.dispatchEvent(e);
	}
}

function simulateCurvingDrawing(signPad) {
	const s = obtainSurface(signPad);
	const { width: w, height: h } = s.getBoundingClientRect();
	const startPoint = [0, h / 2];
	const points = new Array(16).fill(0).map((v, i) => {
		return [Math.abs(Math.sin(i * 30 * Math.PI / 180)) * w / 10, Math.cos(i * 30 * Math.PI / 180) * h / 10 * -1];
	});
	let e;
	e = new Event('pointerdown');
	e.isPrimary = true;
	e.pointerId = 1;
	e.offsetX = startPoint[0];
	e.offsetY = startPoint[1];
	s.dispatchEvent(e);

	e = new Event('pointermove');
	e.isPrimary = true;
	e.pointerId = 1;
	e.offsetX = startPoint[0];
	e.offsetY = startPoint[1];

	for (const p of points) {
		e.offsetX += p[0];
		e.offsetY += p[1];
		s.dispatchEvent(e);
	}

	e = new Event('pointerup');
	e.pointerId = 1;
	s.dispatchEvent(e);
}

function simulateFocusThenEscapeKey(signPad) {
	const s = obtainSurface(signPad);
	const e = new Event('keyup');
	e.code = 'Escape';
	s.focus();
	s.dispatchEvent(e);
}

function simulateEnterKey(signPad) {
	const s = obtainSurface(signPad);
	const e = new Event('keyup');
	e.code = 'Enter';
	s.dispatchEvent(e);
}

function simulateFocus(signPad) {
	const s = obtainSurface(signPad);
	s.focus();
	s.dispatchEvent(new FocusEvent('focus'));
}

function simulateBlur(signPad) {
	const s = obtainSurface(signPad);
	s.blur();
	s.dispatchEvent(new FocusEvent('blur'));
}

function obtainSurface(signPad) {
	if (!signPad) {
		throw new Error(`signPad is invalid: ${signPad}`);
	}

	return signPad.shadowRoot.querySelector('svg');
}