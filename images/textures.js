// christopher pietsch 2018
// cpietsch@gmail.com
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const argv = require('minimist')(process.argv.slice(2));
const execFile = require('child_process').execFile;
const localPath = i => path.relative(process.cwd(), i)

console.log('starting with', argv);

const textureRes1 = argv.s || 256;
const textureRes2 = 1024;
const textureRes3 = 4096;
const inputPath = argv.i;
const inputFormat = argv.f || 'jpg';
const outputFormat = argv.e || 'jpg';
const quality = argv.q || 60;

const workPath = createPath(path.join(path.dirname(inputPath), 'data/'));
const tmpPath = createPath(workPath + 'tmp');
const textureRes1Path = createPath(tmpPath + '/' + textureRes1);
const textureRes2Path = createPath(workPath + textureRes2);
const textureRes3Path = createPath(workPath + textureRes3);

async function run(){
  const files = glob.sync(inputPath + '/*.' + inputFormat)

  for(file of files){
    console.log(file)
    const basename = path.basename(file, '.' + inputFormat);

    try {
      // cascade: resize the image in sequential order from large to small dimensions
      const image1 = await sharp(file)
        .resize(textureRes3, textureRes3, { fit: 'inside' })

      const file1 = await image1
        .toFormat(outputFormat, { quality })
        .toFile(textureRes3Path + '/' + basename + '.' + outputFormat)

      const image2 = await image1
        .resize(textureRes2, textureRes2, { fit: 'inside' })
        
      const file2 = await image2
        .toFormat(outputFormat, { quality })
        .toFile(textureRes2Path + '/' + basename + '.' + outputFormat)

      const image3 = await image2
        .resize(textureRes1, textureRes1, { fit: 'inside' })
        
      const file3 = await image3
        .toFormat("png", { quality: 100 })
        .toFile(textureRes1Path + '/' + basename + '.png')

      console.log(file1, file2, file3)

    } catch (e) {
      console.log(e)
    }
    // console.log(image)
  }
  
}

run()

function createPath(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path)
	}
	return path;
}