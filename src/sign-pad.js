import {
	Hop,
	calcDistance,
	roundTo as r,
	extractSvgRawData,
	svgToCanvas
} from './sign-pad-utils.js';

export {
	LOCAL_NAME
}

const
	LOCAL_NAME = new URL(import.meta.url).searchParams.get('local-name') || 'sign-pad',
	SURFACE_CLASS = 'surface',
	SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
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

class SignPad extends HTMLElement {
	#surface;
	#changedSinceActive = false;
	#activePointer = null;
	#currentGroup = null;
	#currentPoint = null;
	#currentHop = null;
	#fullDiagSize = null;
	#internals;

	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
		this.#surface = shadowRoot.querySelector(`.${SURFACE_CLASS}`);
		this.#internals = this.attachInternals();
		this.#setupListeners();
	}

	connectedCallback() {
		this.setAttribute(ATTRIBUTE_EMPTY, '');
	}

	get isEmpty() {
		return !this.#surface.innerHTML.length;
	}

	clear() {
		if (this.isEmpty) { return; }
		this.#surface.innerHTML = '';
		this.#changedSinceActive = true;
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
				return this.#exportSvg(eo);
			case 'canvas':
				return this.#exportCanvas(eo);
		}
	}

	#setupListeners() {
		const s = this.#surface;
		s.addEventListener('focus', e => this.#onFocus(e));
		s.addEventListener('blur', e => this.#onBlur(e));

		s.addEventListener('pointerdown', e => this.#drawStart(e));
		s.addEventListener('pointermove', e => this.#drawMove(e));
		s.addEventListener('pointerup', e => this.#drawEnd(e));
		s.addEventListener('pointerleave', e => this.#drawEnd(e));
		s.addEventListener('pointercancel', e => this.#drawEnd(e));

		s.addEventListener('keyup', e => this.#keyProc(e));
	}

	#onFocus() {
		this.#changedSinceActive = false;
	}

	#onBlur() {
		if (this.#changedSinceActive) {
			this.dispatchEvent(new Event(CHANGE_EVENT, { bubbles: true, composed: true }));
			this.#changedSinceActive = false;
		}
	}

	#drawStart(e) {
		if (!e.isPrimary) { return; }
		const pid = e.pointerId;
		if (this.#activePointer && pid !== this.#activePointer) {
			return;
		}

		e.target.setPointerCapture(pid);
		this.#activePointer = pid;
		this.#currentGroup = [];
		this.#currentPoint = { x: e.offsetX, y: e.offsetY, w: 4 };
		this.#currentHop = null;
	}

	#drawEnd(e) {
		if (e.pointerId !== this.#activePointer) { return; }

		e.target.releasePointerCapture(this.#activePointer);
		this.#activePointer = null;
	}

	#keyProc(e) {
		switch (e.code) {
			case 'Escape':
				this.clear();
				break;
			case 'Enter':
				this.blur();
				break;
		}
	}

	#drawMove(e) {
		if (e.pointerId !== this.#activePointer) { return; }

		const tp = { x: e.offsetX, y: e.offsetY };
		const fp = this.#currentPoint;

		//	calcs
		const d = calcDistance(fp.x, fp.y, tp.x, tp.y);
		if (d < 4) { return; }
		tp.w = this.#calcWeigth(d);
		const hop = new Hop(fp, tp);
		let adj = null;
		let adj_to = null;
		if (this.#currentHop) {
			let diff = hop.angle - this.#currentHop.angle;
			if (Math.abs(diff) < Math.PI / 4) {
				if (diff > Math.PI / 2) { diff -= Math.PI; }
				if (diff < -Math.PI / 2) { diff += Math.PI; }
				adj = diff * INERTION_POWER;
				adj_to = hop.angle - adj;
			}
		}

		//	memorize
		this.#currentHop = hop;
		this.#currentPoint = tp;
		const cg = this.#currentGroup;
		cg.push(hop);

		//	draw
		if (cg.length > 1) {
			this.#paintJoin(cg[cg.length - 2], hop);
		}
		this.#paintHop(hop, adj, adj_to, d);

		//	manage state & notify
		this.#changedSinceActive = true;
		this.removeAttribute(ATTRIBUTE_EMPTY);
		this.dispatchEvent(new Event(INPUT_EVENT));
	}

	#calcWeigth(ds) {
		if (!this.#fullDiagSize) {
			const br = this.getBoundingClientRect();
			this.#fullDiagSize = Math.sqrt(Math.pow(br.width, 2) + Math.pow(br.height, 2));
		}
		return Math.max(2, 4 - ds / this.#fullDiagSize * 64);
	}

	#paintJoin(fh, th) {
		const svgp = document.createElementNS(SVG_NAMESPACE, 'path');
		svgp.setAttribute('d', `M ${r(fh.tpx1)} ${r(fh.tpy1)} L ${r(th.fpx1)} ${r(th.fpy1)} L ${r(fh.tpx2)} ${r(fh.tpy2)} L ${r(th.fpx2)} ${r(th.fpy2)} Z`);
		this.#surface.appendChild(svgp);
	}

	#paintHop(h, ad, at, d) {
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
		this.#surface.appendChild(svgp);
	}

	#exportSvg(opts) {
		const rawData = extractSvgRawData(this.#surface);
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

	#exportCanvas(opts) {
		const rawData = extractSvgRawData(this.#surface);
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