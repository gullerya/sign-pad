import { ComponentBase, initComponent } from '/node_modules/rich-component/dist/rich-component.min.js';

const
	SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
	DRAWING = Symbol('drawing'),
	GROUPS = Symbol('groups'),
	CURRENT_GROUP = Symbol('current-group'),
	LAST_POINT = Symbol('last-point'),
	FULL_DIAG_SIZE = Symbol('full-diag-size'),
	INPUT_EVENT = 'input',
	EMPTY_CLASS = 'sign-pad-empty',
	TRIM_KEY = 'trim',
	INK_KEY = 'ink',
	FILL_KEY = 'fill',
	EXPORT_DEFAULTS = {
		[TRIM_KEY]: false,
		[INK_KEY]: '#000',
		[FILL_KEY]: 'transparent'
	},
	EXPORT_FORMATS = {
		svg: { defaultOptions: Object.assign({}, EXPORT_DEFAULTS) },
		canvas: { defaultOptions: Object.assign({}, EXPORT_DEFAULTS) },
	};

const TEMPLATE = document.createElement('template');

class Segment {
	constructor(fp, tp) {
		const dx = tp.x - fp.x;
		const dy = tp.y - fp.y;
		this.angle = Math.atan(dx / dy);
		const diffs = this._calcRect(this.angle, fp.w, tp.w);

		//	from points
		this.fpx1 = fp.x + diffs.fdx;
		this.fpy1 = fp.y + diffs.fdy;
		this.fpx2 = fp.x - diffs.fdx;
		this.fpy2 = fp.y - diffs.fdy;

		//	to points
		this.tpx1 = tp.x + diffs.tdx;
		this.tpy1 = tp.y + diffs.tdy;
		this.tpx2 = tp.x - diffs.tdx;
		this.tpy2 = tp.y - diffs.tdy;
	}

	_calcRect(angle, fs, ts) {
		const orthogAngle = angle + Math.PI / 2;
		return {
			fdx: Math.sin(orthogAngle) * fs / 2,
			fdy: Math.cos(orthogAngle) * fs / 2,
			tdx: Math.sin(orthogAngle) * ts / 2,
			tdy: Math.cos(orthogAngle) * ts / 2
		};
	}
}

class Group {
	constructor() {
		this.segments = [];
	}
}

class SignPad extends ComponentBase {
	constructor() {
		super();
		Object.defineProperties(this, {
			[DRAWING]: { value: false, writable: true },
			[GROUPS]: { value: [] },
			[CURRENT_GROUP]: { value: null, writable: true },
			[LAST_POINT]: { value: null, writable: true },
			[FULL_DIAG_SIZE]: { value: null, writable: true }
		});
		this._setupListeners();
	}

	connectedCallback() {
		this.classList.add(EMPTY_CLASS);
	}

	get isEmpty() {
		return this._obtainSurface().childElementCount === 0;
	}

	clear() {
		this._obtainSurface().innerHTML = '';
		this[GROUPS].splice(0);
		this.classList.add(EMPTY_CLASS);
		this.dispatchEvent(new Event(INPUT_EVENT));
	}

	export(format = EXPORT_FORMATS.SVG, options) {
		if (!(format in EXPORT_FORMATS)) {
			throw new Error(`unknown format '${format}'; use one of those: [${Object.keys(EXPORT_FORMATS).join(', ')}]`);
		}
		let result;
		const eo = Object.assign({}, EXPORT_FORMATS[format].defaultOptions, options);
		switch (format) {
			case 'svg':
				result = this._exportSvg(eo);
				break;
			case 'canvas':
				result = this._exportCanvas(eo);
		}
		return result;
	}

	_obtainSurface() {
		return this.shadowRoot.querySelector('.draw-surface');
	}

	_setupListeners() {
		const s = this._obtainSurface();
		s.addEventListener('pointerdown', e => this._drawStart(e));
		s.addEventListener('pointermove', e => this._drawMove(e));
		s.addEventListener('pointerup', e => this._drawEnd(e));
		s.addEventListener('pointerleave', e => this._drawEnd(e));
		s.addEventListener('keyup', e => this._keyProc(e));
	}

	_drawStart(e) {
		if (!e.isPrimary) { return; }

		this.classList.remove(EMPTY_CLASS);

		const p = { x: e.offsetX, y: e.offsetY, w: 4 };
		const g = new Group();
		this[LAST_POINT] = p;
		this[GROUPS].push(g);
		this[CURRENT_GROUP] = g;
		this[DRAWING] = true;

		this.dispatchEvent(new Event(INPUT_EVENT));
	}

	_drawEnd() {
		this[DRAWING] = false;
	}

	_keyProc(e) {
		if (e.code === 'Escape') {
			this.clear();
		}
	}

	_drawMove(e) {
		if (!this[DRAWING]) { return; }

		const tp = { x: e.offsetX, y: e.offsetY };
		const fp = this[LAST_POINT];

		//	calcs
		const d = this._calcDistance(fp, tp);
		if (d < 4) { return; }
		tp.w = this._calcWeigth(d);
		const hop = new Segment(fp, tp);

		//	memorize
		this[LAST_POINT] = tp;
		const cg = this[CURRENT_GROUP];
		cg.segments.push(hop);

		//	draw
		if (cg.segments.length > 1) {
			this._paintJoin(cg.segments[cg.segments.length - 2], hop);
		}
		this._paintHop(hop);

		//	notify
		this.dispatchEvent(new Event(INPUT_EVENT));
	}

	_calcDistance(fp, tp) {
		return Math.sqrt(Math.pow(tp.x - fp.x, 2) + Math.pow(tp.y - fp.y, 2));
	}

	_calcWeigth(ds) {
		let fds = this[FULL_DIAG_SIZE];
		if (!this[FULL_DIAG_SIZE]) {
			const r = this.getBoundingClientRect();
			fds = this[FULL_DIAG_SIZE] = Math.sqrt(Math.pow(r.width, 2) + Math.pow(r.height, 2));
		}
		return Math.max(2, 4 - ds / fds * 64);
	}

	_paintJoin(fh, th) {
		const svgp = document.createElementNS(SVG_NAMESPACE, 'path');
		svgp.setAttribute('d', `M ${roundTo(fh.tpx1)},${roundTo(fh.tpy1)} L ${roundTo(th.fpx1)},${roundTo(th.fpy1)} L ${roundTo(fh.tpx2)},${roundTo(fh.tpy2)} L ${roundTo(th.fpx2)},${roundTo(th.fpy2)} Z`);
		this._obtainSurface().appendChild(svgp);
	}

	_paintHop(h) {
		const svgp = document.createElementNS(SVG_NAMESPACE, 'path');
		svgp.setAttribute('d', `M ${roundTo(h.fpx1)},${roundTo(h.fpy1)} L ${roundTo(h.tpx1)},${roundTo(h.tpy1)} L ${roundTo(h.tpx2)},${roundTo(h.tpy2)} L ${roundTo(h.fpx2)},${roundTo(h.fpy2)} Z`);
		this._obtainSurface().appendChild(svgp);
	}

	_exportSvg(opts) {
		const source = this._obtainSurface();
		const rawData = extractDrawingRawData(source);
		const result = document.createElementNS(SVG_NAMESPACE, 'svg');
		for (const s of rawData.segments) {
			result.appendChild(s);
		}
		const vb = opts[TRIM_KEY] ? result.drawRect : result.fullRect;
		result.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
		result.setAttribute('fill', opts[INK_KEY]);
		return result.outerHTML;
	}

	_exportCanvas(opts) {
		const source = this._obtainSurface();
		const rawData = extractDrawingRawData(source);
		const result = svgToCanvas(rawData, opts);
		return result;
	}

	static get template() {
		return TEMPLATE;
	}
}

function roundTo(input, precision = 2) {
	const p = Math.pow(10, precision);
	return Math.floor(input * p + Number.EPSILON) / p;
}

function extractDrawingRawData(source) {
	const result = {
		segments: [],
		fullRect: {},
		drawRect: {}
	};
	for (const segment of source.children) {
		if (segment.localName !== 'path') { continue; }
		result.segments.push(segment.cloneNode());
	}
	const cr = source.getBoundingClientRect();
	result.fullRect.x = cr.x;
	result.fullRect.y = cr.y;
	result.fullRect.w = cr.width;
	result.fullRect.h = cr.height;
	const bb = source.getBBox();
	result.drawRect.x = Math.floor(bb.x);
	result.drawRect.y = Math.floor(bb.y);
	result.drawRect.w = Math.ceil(bb.width) + 1;
	result.drawRect.h = Math.ceil(bb.height) + 1;
	return result;
}

function svgToCanvas(rawData, opts) {
	let result = document.createElement('canvas');
	result.width = rawData.fullRect.w;
	result.height = rawData.fullRect.h;
	let ctx = result.getContext('2d');
	ctx.fillStyle = opts[FILL_KEY];
	ctx.fillRect(0, 0, rawData.fullRect.w, rawData.fullRect.h);
	ctx.fillStyle = opts[INK_KEY];
	for (const s of rawData.segments) {
		const p = new Path2D(s.getAttribute('d'));
		ctx.fill(p);
	}
	if (opts[TRIM_KEY]) {
		const iData = ctx.getImageData(rawData.drawRect.x, rawData.drawRect.y, rawData.drawRect.w, rawData.drawRect.h);
		result = document.createElement('canvas');
		result.width = rawData.drawRect.w;
		result.height = rawData.drawRect.h;
		ctx = result.getContext('2d');
		ctx.putImageData(iData, 0, 0);
	}
	return result;
}

TEMPLATE.innerHTML = `
	<style>
		:host {
			display: inline-block;
			min-width: 300px;
			min-height: 200px;
			contain: strict;
		}

		.container {
			position: relative;
			width: 100%;
			height: 100%;
		}

		.draw-surface,
		[name="background"]::slotted(*) {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			outline: none;
		}

		.draw-surface > * {
			fill: currentColor;
			z-index: 9;
		}
	</style>
	<div class="container">
		<slot name="background"></slot>
		<svg xmlns="http://www.w3.org/2000/svg" tabindex="0" class="draw-surface"></svg>
	</div>
`;

initComponent('sign-pad', SignPad);