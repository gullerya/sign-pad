import { ComponentBase, initComponent } from '/node_modules/rich-component/dist/rich-component.min.js';

export {
	EXPORT_FORMATS
}

const
	DRAWING = Symbol('drawing'),
	GROUPS = Symbol('groups'),
	CURRENT_GROUP = Symbol('current-group'),
	LAST_POINT = Symbol('last-point'),
	FULL_DIAG_SIZE = Symbol('full-diag-size'),
	EXPORT_FORMATS = { SVG: 'svg', PNG: 'png', JPG: 'jpg' };

class Hop {
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
		this.hops = [];
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

	clear() {
		this._obtainSurface().innerHTML = '';
		this[GROUPS].splice(0);
	}

	export(format = EXPORT_FORMATS.SVG) {
		// let result;
		switch (format) {
			case EXPORT_FORMATS.SVG:
				throw new Error('not yet supported');
			// break;
			case EXPORT_FORMATS.PNG:
				throw new Error('not yet supported');
			// break;
			case EXPORT_FORMATS.JPG:
				throw new Error('not yet supported');
			// break;
			default:
				throw new Error(`format '${format}' is not supported, use one of those: [${Object.values(EXPORT_FORMATS).join(', ')}]`);
		}
		// return result;
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

		const p = { x: e.offsetX, y: e.offsetY, w: 4 };
		const g = new Group();
		this[LAST_POINT] = p;
		this[GROUPS].push(g);
		this[CURRENT_GROUP] = g;
		this[DRAWING] = true;
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
		const hop = new Hop(fp, tp);

		//	memorize
		this[LAST_POINT] = tp;
		const cg = this[CURRENT_GROUP];
		cg.hops.push(hop);

		//	draw
		if (cg.hops.length > 1) {
			this._paintJoin(cg.hops[cg.hops.length - 2], hop);
		}
		this._paintHop(hop);
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
		const svgp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svgp.setAttribute('d', `M ${roundTo(fh.tpx1)},${roundTo(fh.tpy1)} L ${roundTo(th.fpx1)},${roundTo(th.fpy1)} L ${roundTo(fh.tpx2)},${roundTo(fh.tpy2)} L ${roundTo(th.fpx2)},${roundTo(th.fpy2)} Z`);
		this._obtainSurface().appendChild(svgp);
	}

	_paintHop(h) {
		const svgp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svgp.setAttribute('d', `M ${roundTo(h.fpx1)},${roundTo(h.fpy1)} L ${roundTo(h.tpx1)},${roundTo(h.tpy1)} L ${roundTo(h.tpx2)},${roundTo(h.tpy2)} L ${roundTo(h.fpx2)},${roundTo(h.fpy2)} Z`);
		this._obtainSurface().appendChild(svgp);
	}

	static get htmlUrl() {
		return import.meta.url.replace(/\.js$/, '.htm');
	}
}

initComponent('sign-pad', SignPad);

function roundTo(input, precision = 2) {
	const p = Math.pow(10, precision);
	return Math.floor(input * p + Number.EPSILON) / p;
}