export {
	Hop,
	calcDistance,
	roundTo,
	extractSvgRawData,
	svgToCanvas
}

class Hop {
	constructor(fp, tp) {
		const dx = tp.x - fp.x;
		const dy = tp.y - fp.y;
		this.angle = Math.atan(dy / dx);
		const diffs = this.#calcRect(this.angle, fp.w, tp.w);

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

	#calcRect(angle, fs, ts) {
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

function calcDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function roundTo(input, precision = 2) {
	const p = Math.pow(10, precision);
	return Math.floor(input * p + Number.EPSILON) / p;
}

function extractSvgRawData(source) {
	const result = {
		hops: [],
		fullRect: {},
		drawRect: {}
	};
	for (const hop of source.children) {
		if (hop.localName !== 'path') { continue; }
		result.hops.push(hop.cloneNode());
	}
	const cr = source.getBoundingClientRect();
	result.fullRect.x = 0;
	result.fullRect.y = 0;
	result.fullRect.w = cr.width;
	result.fullRect.h = cr.height;
	const bb = source.getBBox();
	result.drawRect.x = Math.floor(bb.x);
	result.drawRect.y = Math.floor(bb.y);
	result.drawRect.w = Math.ceil(bb.width) + 1;
	result.drawRect.h = Math.ceil(bb.height) + 1;
	return result;
}

function svgToCanvas(rawData, ink, fill, trim) {
	let result = document.createElement('canvas');
	result.width = rawData.fullRect.w;
	result.height = rawData.fullRect.h;
	let ctx = result.getContext('2d');
	ctx.fillStyle = fill;
	ctx.fillRect(0, 0, rawData.fullRect.w, rawData.fullRect.h);
	ctx.fillStyle = ink;
	for (const s of rawData.hops) {
		const p = new Path2D(s.getAttribute('d'));
		ctx.fill(p);
	}
	if (trim) {
		const iData = ctx.getImageData(rawData.drawRect.x, rawData.drawRect.y, rawData.drawRect.w, rawData.drawRect.h);
		result = document.createElement('canvas');
		result.width = rawData.drawRect.w;
		result.height = rawData.drawRect.h;
		ctx = result.getContext('2d');
		ctx.putImageData(iData, 0, 0);
	}
	return result;
}