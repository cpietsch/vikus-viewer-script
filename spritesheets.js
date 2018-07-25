const PixiPacker = require("pixi-packer");
const jpegTran = require("imagemin-jpegtran");
const argv = require('minimist')(process.argv.slice(2));
const path = require("path");

const inputPath = argv.i;
const workPath = path.join(path.dirname(inputPath), 'vv-data');
const pngPath = path.join(workPath, '256');
const outPath = path.join(workPath, 'sprites');
const cachePath = path.join(workPath, 'tmp');

var config = {
    scales: {
        "full": {"scale": 1, "resolution": 1}
    },
    variations: ["web"],
    loading_stages: [ "web" ],
    group_default: {
        max_width: 2048,          // default: 2048
        max_height: 2048,         // default: 1024
        oversized_warning: true, // default: false
        padding: 1               // default: 1
    },
    "groups": [
        {
            "id": "web",
            "loading_stage": "web",
            // "compressor": pngQuant(),
            "compressor": jpegTran(),
            "jpeg": true,
            "quality": 60,
            "sprites": ['*png']
        }
    ],
    // cleanCache: true,
    cleanOutput: true,
    trim: true
}

var pixiPacker = new PixiPacker(
    config,
    path.resolve(__dirname, pngPath),
    path.resolve(__dirname, outPath),
    cachePath
);

pixiPacker.process()
	.catch(err => {
	    console.error("Error:", err.stack);
	})
	.then(a => {
		console.log('sprites generated sucessfully')
	})