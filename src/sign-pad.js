import { roundTo, extractSvgRawData, svgToCanvas } from './sign-pad-utils.js';

export {
	LOCAL_NAME
}

const
	LOCAL_NAME = new URL(import.meta.url).searchParams.get('local-name') || 'sign-pad',
	SURFACE_CLASS = 'surface',
	SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
	DRAWING = Symbol('drawing'),
	GROUPS = Symbol('groups'),
	EMPTY_STATE = Symbol('empty-state'),
	CURRENT_GROUP = Symbol('current-group'),
	LAST_POINT = Symbol('last-point'),
	FULL_DIAG_SIZE = Symbol('full-diag-size'),
	INPUT_EVENT = 'input',
	ATTRIBUTE_EMPTY = 'empty',
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

class SignPad extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).appendChild(TEMPLATE.content.cloneNode(true));
		Object.defineProperties(this, {
			[DRAWING]: { value: false, writable: true },
			[GROUPS]: { value: [] },
			[EMPTY_STATE]: { value: true, writable: true },
			[CURRENT_GROUP]: { value: null, writable: true },
			[LAST_POINT]: { value: null, writable: true },
			[FULL_DIAG_SIZE]: { value: null, writable: true }
		});
		this._setupListeners();
	}

	connectedCallback() {
		this.setAttribute(ATTRIBUTE_EMPTY, '');
	}

	get empty() {
		return this[EMPTY_STATE];
	}

	clear() {
		this._obtainSurface().innerHTML = '';
		this[GROUPS].splice(0);
		this[EMPTY_STATE] = true;
		this.setAttribute(ATTRIBUTE_EMPTY, '');
		this.dispatchEvent(new Event(INPUT_EVENT));
	}

	export(format = EXPORT_FORMATS.SVG, options) {
		if (!(format in EXPORT_FORMATS)) {
			throw new Error(`unknown format '${format}'; use one of those: [${Object.keys(EXPORT_FORMATS).join(', ')}]`);
		}
		const eo = Object.assign({}, EXPORT_FORMATS[format].defaultOptions, options);
		switch (format) {
			case 'svg':
				return this._exportSvg(eo);
			case 'canvas':
				return this._exportCanvas(eo);
		}
	}

	_obtainSurface() {
		return this.shadowRoot.querySelector(`.${SURFACE_CLASS}`);
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
		if (this[EMPTY_STATE]) {
			this[EMPTY_STATE] = false;
			this.removeAttribute(ATTRIBUTE_EMPTY);
		}
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
		const rawData = extractSvgRawData(source);
		const result = document.createElementNS(SVG_NAMESPACE, 'svg');
		for (const s of rawData.segments) {
			result.appendChild(s);
		}
		const vb = opts[TRIM_KEY] ? rawData.drawRect : rawData.fullRect;
		result.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
		result.setAttribute('fill', opts[INK_KEY]);
		if (opts[FILL_KEY] !== EXPORT_DEFAULTS[FILL_KEY]) {
			result.setAttribute('style', `background:${opts[FILL_KEY]}`);
		}
		return result;
	}

	_exportCanvas(opts) {
		const source = this._obtainSurface();
		const rawData = extractSvgRawData(source);
		const result = svgToCanvas(rawData, opts[INK_KEY], opts[FILL_KEY], opts[TRIM_KEY]);
		return result;
	}
}

TEMPLATE.innerHTML = `
	<style>
		:host {
			display: inline-block;
			min-width: 300px;
			min-height: 200px;
			width: 300px;
			height: 200px;
		}

		.container {
			position: relative;
			width: 100%;
			height: 100%;
		}

		.${SURFACE_CLASS},
		[name="background"]::slotted(*) {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			outline: none;
		}

		.${SURFACE_CLASS} {
			fill: currentColor;
			touch-action: none;
		}

		[name="background"]::slotted(*) {
			pointer-events: none;
		}
	</style>
	<div class="container">
		<slot name="background"></slot>
		<svg xmlns="http://www.w3.org/2000/svg" tabindex="0" class="${SURFACE_CLASS}"></svg>
	</div>
`;

customElements.define(LOCAL_NAME, SignPad);