export {
	roundTo,
	extractSvgRawData,
	svgToCanvas
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