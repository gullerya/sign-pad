import { ComponentBase, initComponent } from '/node_modules/rich-component/dist/rich-component.min.js';

export {
	EXPORT_FORMATS
}

const
	DRAWING = Symbol('drawing'),
	GROUPS = Symbol('groups'),
	CURRENT_GROUP = Symbol('current-group'),
	LAST_POINT = Symbol('last-point'),
	EXPORT_FORMATS = { SVG: 'svg', PNG: 'png', JPG: 'jpg' };

class Group {
	constructor() {
		this.points = [];
		this.rects = [];
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
		if (!e.isPrimary) {
			return;
		}

		//	TODO: normalize starting point width?
		const p = { x: e.offsetX, y: e.offsetY, w: 0 };
		const g = new Group();
		g.points.push(p);
		this[GROUPS].push(g);
		this[CURRENT_GROUP] = g;
		this[LAST_POINT] = p;
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
		//	TODO: do debounce if the distance is too small...
		if (!this[DRAWING]) {
			return;
		}

		const cg = this[CURRENT_GROUP];
		const fromPoint = this[LAST_POINT];
		const toPoint = { x: e.offsetX, y: e.offsetY };
		toPoint.w = calcWidth(fromPoint, toPoint);
		cg.points.push(toPoint);
		this[LAST_POINT] = toPoint;

		this._paint(fromPoint, toPoint);
	}

	_paint(fp, tp) {
		if (!fp.w) {
			fp.w = tp.w;
		}
		const dx = tp.x - fp.x;
		const dy = tp.y - fp.y;
		const v = Math.atan(dx / dy);
		const ov = v - Math.PI / 2;
		const n = {
			dx0: Math.sin(ov) * fp.w / 2,
			dy0: Math.cos(ov) * fp.w / 2,
			dx1: Math.sin(ov) * tp.w / 2,
			dy1: Math.cos(ov) * tp.w / 2
		};
		const svgp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svgp.setAttribute('d', `M ${roundTo(fp.x + n.dx0)},${roundTo(fp.y + n.dy0)} L ${roundTo(tp.x + n.dx1)},${roundTo(tp.y + n.dy1)} L ${roundTo(tp.x - n.dx1)},${roundTo(tp.y - n.dy1)} L ${roundTo(fp.x - n.dx0)},${roundTo(fp.y - n.dy0)} Z`);
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

const maxW = Math.sqrt(300 * 300 + 200 * 200);
function calcWidth({ x: x0, y: y0 }, { x: x1, y: y1 }) {
	const w = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
	return Math.max(2, 6 - w / maxW * 40);
}