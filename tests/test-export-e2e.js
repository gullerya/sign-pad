import { getSuite } from '/node_modules/just-test/dist/just-test.js'
import '/src/sign-pad.js';

const suite = getSuite({ name: 'Export E2E' });

suite.runTest({ name: 'E2E - sign and export to SVG' }, () => {
	const sp = document.createElement('sign-pad');
	sp.style.cssText = 'width: 600px; height: 400px';
	sp.innerHTML = '<div slot="background" style="background-color: lightblue; opacity: 0.5"></div>';
	document.body.appendChild(sp);

	sp.addEventListener('keypress', e => {
		if (e.code === 'KeyS') {
			sp.export('svg', { trim: true, background: '#eee', color: '#f00' });
		}
	});
});

suite.runTest({ name: 'E2E - sign and export to canvas' }, () => {
	const sp = document.createElement('sign-pad');
	sp.style.cssText = 'width: 600px; height: 400px';
	sp.innerHTML = '<div slot="background" style="background-color: lightblue; opacity: 0.5"></div>';
	document.body.appendChild(sp);

	sp.addEventListener('keypress', e => {
		if (e.code === 'KeyS') {
			sp.export('canvas', { trim: true, background: '#eee', color: '#f00' });
		}
	});
});

// function exportPng(canvas) {
// 	canvas.toBlob(processBlob, 'image/png');
// 	downloadURI(result.toDataURL('image/png'), 'test.png');
// 	return result;
// }

// function exportJpg(canvas) {
// 	canvas.toBlob(processBlob, 'image/jpeg');
// 	downloadURI(result.toDataURL('image/jpeg'), 'test.jpg');
// 	return result;
// }

// function downloadURI(uri, name) {
// 	let link = document.createElement('a');
// 	link.download = name;
// 	link.href = uri;
// 	document.body.appendChild(link);
// 	link.click();
// 	document.body.removeChild(link);
// }

// function processBlob(blob) {
// 	var newImg = document.createElement('img'),
// 		url = URL.createObjectURL(blob);

// 	newImg.onload = function () {
// 		URL.revokeObjectURL(url);
// 	};

// 	newImg.src = url;
// 	document.body.appendChild(newImg);
// }