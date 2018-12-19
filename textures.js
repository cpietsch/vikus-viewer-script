// christopher pietsch 2018
// cpietsch@gmail.com
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const argv = require('minimist')(process.argv.slice(2));
const execFile = require('child_process').execFile;
const localPath = i => path.relative(process.cwd(), i)

console.log('starting with', process.args);

const textureRes1 = argv.s || 256;
const textureRes2 = 1024;
const textureRes3 = 4096;
const inputPath = argv.i;
const inputFormat = argv.f || 'jpg';

const workPath = createPath(path.join(path.dirname(inputPath), 'data/'));
createPath(workPath + 'tmp');
const textureRes1Path = createPath(workPath + 'tmp/' + textureRes1);
const textureRes2Path = createPath(workPath + textureRes2);
const textureRes3Path = createPath(workPath + textureRes3);

glob(inputPath + '/*.' + inputFormat, function (er, files) {
	console.log('found these files');
	console.log(files);

	let sequence = Promise.resolve();

	files.forEach(file => {
		const basename = path.basename(file, '.' + inputFormat);

		sequence = sequence
			.then(() => {
				return buffer(file)
					.then(buffer => convert(buffer, textureRes3Path + '/' + basename + '.jpg', textureRes3))
					.then(buffer => convert(buffer, textureRes2Path + '/' + basename + '.jpg', textureRes2))
					.then(buffer => convert(buffer, textureRes1Path + '/' + basename + '.png', textureRes1))
					.then(buffer => delete buffer)
			})
			.then(() => {
				console.log('converted', file)
			})
	})

	sequence.then((s) => {
		console.log('image res generated successfully')
		console.log('please process to the spritesheet script')
	})
})

function createPath(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path)
	}
	return path;
}

function buffer(file) {
	const buffer = fs.readFileSync(file)
	return Promise.resolve(buffer)
}

function convert(buffer, path, res) {
	return new Promise(function (resolve, reject) {
		sharp(buffer)
			.resize(res, res, {
				fit: 'inside'
			})
			.jpeg({
				quality: 60
			})
			.toFile(path, err => {
				if (err) console.log(err);
				resolve(buffer)
			})
	})
}