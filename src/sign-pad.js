import { roundTo as r, extractSvgRawData, svgToCanvas } from './sign-pad-utils.js';

export {
	LOCAL_NAME
}

const
	LOCAL_NAME = new URL(import.meta.url).searchParams.get('local-name') || 'sign-pad',
	SURFACE_CLASS = 'surface',
	SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
	SURFACE = Symbol('surface'),
	ACTIVE_POINTER = Symbol('active-pointer'),
	EMPTY_STATE = Symbol('empty-state'),
	CURRENT_GROUP = Symbol('current-group'),
	CURRENT_POINT = Symbol('current-point'),
	CURRENT_HOP = Symbol('current-hop'),
	FULL_DIAG_SIZE = Symbol('full-diag-size'),
	CHANGED_SINCE_ACTIVE = Symbol('changed-since-active'),
	INERTION_POWER = 0.4,
	INPUT_EVENT = 'input',
	CHANGE_EVENT = 'change',
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

class Hop {
	constructor(fp, tp) {
		const dx = tp.x - fp.x;
		const dy = tp.y - fp.y;
		this.angle = Math.atan(dy / dx);
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
		const c = Math.cos(orthogAngle);
		const s = Math.sin(orthogAngle);
		return {
			fdx: c * fs / 2,
			fdy: s * fs / 2,
			tdx: c * ts / 2,
			tdy: s * ts / 2
		};
	}
}

class SignPad extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).appendChild(TEMPLATE.content.cloneNode(true));
		Object.defineProperties(this, {
			[SURFACE]: { value: this.shadowRoot.querySelector(`.${SURFACE_CLASS}`) },
			[ACTIVE_POINTER]: { value: null, writable: true },
			[EMPTY_STATE]: { value: true, writable: true },
			[CURRENT_GROUP]: { value: null, writable: true },
			[CURRENT_POINT]: { value: null, writable: true },
			[CURRENT_HOP]: { value: null, writable: true },
			[FULL_DIAG_SIZE]: { value: null, writable: true },
			[CHANGED_SINCE_ACTIVE]: { value: false, writable: true }
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
		this[SURFACE].innerHTML = '';
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

	_setupListeners() {
		const s = this[SURFACE];
		s.addEventListener('focus', e => this._onFocus(e));
		s.addEventListener('blur', e => this._onBlur(e));

		s.addEventListener('pointerdown', e => this._drawStart(e));
		s.addEventListener('pointermove', e => this._drawMove(e));
		s.addEventListener('pointerup', e => this._drawEnd(e));
		s.addEventListener('pointerleave', e => this._drawEnd(e));
		s.addEventListener('pointercancel', e => this._drawEnd(e));

		s.addEventListener('keyup', e => this._keyProc(e));
	}

	_onFocus() {
		this[CHANGED_SINCE_ACTIVE] = false;
	}

	_onBlur(e) {
		if (this[CHANGED_SINCE_ACTIVE]) {
			this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
			this[CHANGED_SINCE_ACTIVE] = false;
		}
	}

	_drawStart(e) {
		if (!e.isPrimary) { return; }
		const pid = e.pointerId;
		if (this[ACTIVE_POINTER] && pid !== this[ACTIVE_POINTER]) {
			return;
		}

		this[ACTIVE_POINTER] = pid;
		this[CURRENT_GROUP] = [];
		this[CURRENT_POINT] = { x: e.offsetX, y: e.offsetY, w: 4 };
		this[CURRENT_HOP] = null;
	}

	_drawEnd(e) {
		if (e.pointerId === this[ACTIVE_POINTER]) {
			this[ACTIVE_POINTER] = null;
		}
	}

	_keyProc(e) {
		if (e.code === 'Escape') {
			this.clear();
		}
	}

	_drawMove(e) {
		if (e.pointerId !== this[ACTIVE_POINTER]) { return; }

		const tp = { x: e.offsetX, y: e.offsetY };
		const fp = this[CURRENT_POINT];

		//	calcs
		const d = this._calcDistance(fp, tp);
		if (d < 4) { return; }
		tp.w = this._calcWeigth(d);
		const hop = new Hop(fp, tp);
		let adj = null;
		let adj_to = null;
		if (this[CURRENT_HOP]) {
			let diff = hop.angle - this[CURRENT_HOP].angle;
			if (Math.abs(diff) < Math.PI / 4) {
				if (diff > Math.PI / 2) { diff -= Math.PI; }
				if (diff < -Math.PI / 2) { diff += Math.PI; }
				adj = diff * INERTION_POWER;
				adj_to = hop.angle - adj;
			}
		}

		//	memorize
		this[CURRENT_HOP] = hop;
		this[CURRENT_POINT] = tp;
		const cg = this[CURRENT_GROUP];
		cg.push(hop);

		//	draw
		if (cg.length > 1) {
			this._paintJoin(cg[cg.length - 2], hop);
		}
		this._paintHop(hop, adj, adj_to, d);

		//	manage state & notify
		this[CHANGED_SINCE_ACTIVE] = true;
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
			const br = this.getBoundingClientRect();
			fds = this[FULL_DIAG_SIZE] = Math.sqrt(Math.pow(br.width, 2) + Math.pow(br.height, 2));
		}
		return Math.max(2, 4 - ds / fds * 64);
	}

	_paintJoin(fh, th) {
		const svgp = document.createElementNS(SVG_NAMESPACE, 'path');
		svgp.setAttribute('d', `M ${r(fh.tpx1)} ${r(fh.tpy1)} L ${r(th.fpx1)} ${r(th.fpy1)} L ${r(fh.tpx2)} ${r(fh.tpy2)} L ${r(th.fpx2)} ${r(th.fpy2)} Z`);
		this[SURFACE].appendChild(svgp);
	}

	_paintHop(h, ad, at, d) {
		const svgp = document.createElementNS(SVG_NAMESPACE, 'path');
		if (ad) {
			const hd = (d / 2) / Math.cos(ad);
			const dm = h.tpx1 >= h.fpx1 ? 1 : -1;
			const dx = Math.cos(at) * hd * dm;
			const dy = Math.sin(at) * hd * dm;
			svgp.setAttribute('d', `M ${r(h.fpx1)} ${r(h.fpy1)} Q ${r(h.fpx1 + dx)} ${r(h.fpy1 + dy)} , ${r(h.tpx1)} ${r(h.tpy1)} L ${r(h.tpx2)} ${r(h.tpy2)} Q ${r(h.fpx2 + dx)} ${r(h.fpy2 + dy)} , ${r(h.fpx2)} ${r(h.fpy2)} Z`);
		} else {
			svgp.setAttribute('d', `M ${r(h.fpx1)} ${r(h.fpy1)} L ${r(h.tpx1)} ${r(h.tpy1)} L ${r(h.tpx2)} ${r(h.tpy2)} L ${r(h.fpx2)} ${r(h.fpy2)} Z`);
		}
		this[SURFACE].appendChild(svgp);
	}

	_exportSvg(opts) {
		const rawData = extractSvgRawData(this[SURFACE]);
		const result = document.createElementNS(SVG_NAMESPACE, 'svg');
		for (const s of rawData.hops) {
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
		const rawData = extractSvgRawData(this[SURFACE]);
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
		<svg xmlns="http://www.w3.org/2000/svg" class="${SURFACE_CLASS}" aria-label="signature" tabindex="0"></svg>
	</div>
`;

customElements.define(LOCAL_NAME, SignPad);