class SignPad extends HTMLElement {
	constructor() {
		super();
		this._isDrawing = false;
		this._points = [];
		this._paths = [];

		this.attachShadow({ mode: 'open' }).appendChild(TEMPLATE.cloneNode(true));
		const pad = this._obtainCanvas();
		pad.addEventListener('pointerdown', this._drawStart);
		pad.addEventListener('pointermove', this._drawMove);
		pad.addEventListener('pointerup', this._drawEnd);
		pad.addEventListener('pointerleave', this._drawEnd);
	}

	clear() {
		//	TODO
	}

	toSVG() {

	}

	_obtainCanvas() {
		this.shadowRoot.querySelector('.sign-canv');
	}

	_drawStart(e) {
		if (!e.isPrimary) {
			return;
		}
		const p = {
			x: e.offsetX * 2,
			y: e.offsetY * 2
		}
		pointSets.push([p]);
		currentPointSet++;
		currentPoint = 0;
		this._isDrawing = true;
	}

	_drawMove(e) {
		//	TODO: do debounce if the distance is too small...
		if (!this._isDrawing) {
			return;
		}

		const cps = pointSets[currentPointSet];
		const fromPoint = cps[currentPoint];
		const toPoint = { x: e.offsetX * 2, y: e.offsetY * 2 };
		toPoint.w = calcWidth(fromPoint, toPoint);

		paint(ctx, fromPoint, toPoint);

		cps.push(toPoint);
		currentPoint++;
	}

	_drawEnd() {
		this._isDrawing = false;
	}
}

globalThis.customElements.define('sign-pad', SignPad);

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
	<style>

	</style>
	<canvas class="sign-canv" width="800" height="400"></canvas>
`;

//	migrated code
//
const pointSets = [];
let currentPointSet = -1;
let currentPoint = -1;
const pad = document.querySelector('.pad');
const ctx = pad.getContext('2d');
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.fillStyle = 'rgb(255,255,255)';
ctx.fillRect(0, 0, 1200, 800);
ctx.fillStyle = 'rgb(0,0,0)';

document.querySelector('.clear').addEventListener('click', () => {
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fillRect(0, 0, 1200, 800);
	ctx.fillStyle = 'rgb(0,0,0)';
});

document.querySelector('.save').addEventListener('click', () => {
	const durl = pad.toDataURL('image/png', 1);
	console.log(durl.length);
	document.querySelector('.reflect').src = durl;
});

const maxW = Math.sqrt(600 * 600 + 400 * 400);
function calcWidth({ x: x0, y: y0 }, { x: x1, y: y1 }) {
	const w = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
	return Math.max(2, 6 - w / maxW * 40);
}

function paint(_ctx, fp, tp) {
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
	const p = new Path2D(`
    M ${fp.x + n.dx0} ${fp.y + n.dy0}
    L ${tp.x + n.dx1} ${tp.y + n.dy1}
    L ${tp.x - n.dx1} ${tp.y - n.dy1}
    L ${fp.x - n.dx0} ${fp.y - n.dy0}
    Z
  `);
	_ctx.fill(p);
}