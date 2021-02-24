import { ComponentBase, initComponent } from '/node_modules/rich-component/dist/rich-component.min.js';

class SignPad extends ComponentBase {
	constructor() {
		super();
		this._isDrawing = false;
		this._pointSets = [];
		this._points = [];
		this._paths = [];
		this.currentPointSet = -1;
		this.currentPoint = -1;

		const pad = this._obtainView();
		pad.addEventListener('pointerdown', e => this._drawStart(e));
		pad.addEventListener('pointermove', e => this._drawMove(e));
		pad.addEventListener('pointerup', e => this._drawEnd(e));
		pad.addEventListener('pointerleave', e => this._drawEnd(e));
	}

	clear() {
		this._obtainView().innerHTML = '';
	}

	toSVG() {

	}

	_obtainView() {
		return this.shadowRoot.querySelector('.sign-view');
	}

	_drawStart(e) {
		if (!e.isPrimary) {
			return;
		}
		const p = {
			x: e.offsetX,
			y: e.offsetY,
			w: 0
		};
		this._pointSets.push([p]);
		this.currentPointSet++;
		this.currentPoint = 0;
		this._isDrawing = true;
	}

	_drawMove(e) {
		//	TODO: do debounce if the distance is too small...
		if (!this._isDrawing) {
			return;
		}

		const cps = this._pointSets[this.currentPointSet];
		const fromPoint = cps[this.currentPoint];
		const toPoint = { x: e.offsetX, y: e.offsetY };
		toPoint.w = calcWidth(fromPoint, toPoint);

		this._paint(fromPoint, toPoint);

		cps.push(toPoint);
		this.currentPoint++;
	}

	_drawEnd() {
		this._isDrawing = false;
	}

	_paint(fp, tp) {
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
		svgp.setAttribute('d', `M ${f(fp.x + n.dx0)},${f(fp.y + n.dy0)} L ${f(tp.x + n.dx1)},${f(tp.y + n.dy1)} L ${f(tp.x - n.dx1)},${f(tp.y - n.dy1)} L ${f(fp.x - n.dx0)},${f(fp.y - n.dy0)} Z`);
		this._obtainView().appendChild(svgp);
	}

	static get htmlUrl() {
		return import.meta.url.replace(/\.js$/, '.htm');
	}
}

function f(i) {
	return Math.floor(i * 100 + Number.EPSILON) / 100;
}

initComponent('sign-pad', SignPad);

//	migrated code
//
// const pad = document.querySelector('.pad');
// const ctx = pad.getContext('2d');
// ctx.lineCap = 'round';
// ctx.lineJoin = 'round';
// ctx.fillStyle = 'rgb(255,255,255)';
// ctx.fillRect(0, 0, 1200, 800);
// ctx.fillStyle = 'rgb(0,0,0)';

// document.querySelector('.clear').addEventListener('click', () => {
// 	ctx.fillStyle = 'rgb(255,255,255)';
// 	ctx.fillRect(0, 0, 1200, 800);
// 	ctx.fillStyle = 'rgb(0,0,0)';
// });

// document.querySelector('.save').addEventListener('click', () => {
// 	const durl = pad.toDataURL('image/png', 1);
// 	console.log(durl.length);
// 	document.querySelector('.reflect').src = durl;
// });

const maxW = Math.sqrt(300 * 300 + 200 * 200);
function calcWidth({ x: x0, y: y0 }, { x: x1, y: y1 }) {
	const w = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
	return Math.max(2, 6 - w / maxW * 40);
}