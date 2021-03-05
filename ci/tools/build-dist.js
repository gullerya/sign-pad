import os from 'os';
import fs from 'fs';
import path from 'path';
import uglifyES from 'uglify-es';

const
	from = 'src',
	to = 'dist';

let files;

process.stdout.write(`\x1B[32mStarting the build...\x1B[0m${os.EOL}${os.EOL}`);

//	clean
process.stdout.write(`\tcleaning "${to}"...`);
fs.rmdirSync(to, { recursive: true });
fs.mkdirSync(to);
process.stdout.write(`\t\t\x1B[32mOK\x1B[0m${os.EOL}`);

//	collect files
process.stdout.write(`\tcollecting files from "${from}"...`);
files = collectFiles(from).map(fn => {
	return {
		fileName: fn,
		fileNameMin: fn.replace(/\.js$/, '.min.js')
	};
});
process.stdout.write(`\t\x1B[32mOK\x1B[0m${os.EOL}`);

//	copy AS IS
process.stdout.write(`\tcopying from "${from}" to "${to}"...`);
for (const file of files) {
	fs.copyFileSync(path.join(from, file.fileName), path.join(to, file.fileName));
}
process.stdout.write(`\t\x1B[32mOK\x1B[0m${os.EOL}`);

//	create minified
process.stdout.write('\tminifying...');
const options = {
	toplevel: true
};
for (const file of files) {
	let fc = fs.readFileSync(path.join(to, file.fileName), { encoding: 'utf-8' });
	for (const f of files) {
		fc = fc.replace(f.fileName, f.fileNameMin);
	}
	const fmc = uglifyES.minify(fc, options).code;
	fs.writeFileSync(path.join(to, file.fileNameMin), fmc);
}
process.stdout.write(`\t\t\t\x1B[32mOK\x1B[0m${os.EOL}${os.EOL}`);

process.stdout.write(`\x1B[32mDONE\x1B[0m${os.EOL}`);

function collectFiles(sourceFolder) {
	return fs.readdirSync(sourceFolder);
}