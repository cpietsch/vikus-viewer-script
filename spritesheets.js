const spritesheet = require('spritesheet-js');
const argv = require('minimist')(process.argv.slice(2));

const inputPath = argv.i;
const options = {
	format: 'json',
	width: 2048,
	height: 2048
}

spritesheet(inputPath + '/*.png', options, function(err) {
    if (err) console.log(err)

    console.log('spritesheet successfully generated');
});