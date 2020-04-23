// https://github.com/cpietsch/vikus-viewer-script
// by Christopher Pietsch 2020

const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const glob = require("glob");
const ShelfPack = require("@mapbox/shelf-pack");

// sharp.cache(false)
// sharp.queue.on('change', function(queueLength) {
//   console.log('Queue contains ' + queueLength + ' task(s)');
// });

exports.run = async function spriter(inputPath, outputPath, options) {
  const border = options.border || 1;
  const sheetDimension = options.sheetDimension || 1024;
  const outputFormat = options.outputFormat || "png";
  const outputQuality = options.outputQuality || 100;
  const inputFormat = options.inputFormat || "png";
  const compositeChunkSize = 100;
  // const spriteDimension = options.spriteDimension || 1

  const files = glob.sync(inputPath + "/*." + inputFormat); //.slice(0,100)

  let sizes = [];
  let images = [];
  let names = [];

  console.log("found", files.length, "files");

  for (i in files) {
    const file = files[i];
    const basename = path.parse(file).name;

    try {
      // const image = sharp(file)
      const metadata = await sharp(file).metadata();

      // const scaledDimension = scaleTo(metadata.width, metadata.height, 128)
      // sizes.push({ id: +i, w: scaledDimension.width +2*border, h: scaledDimension.height +2*border })
      // images.push(image)

      sizes.push({
        id: +i,
        w: metadata.width + 2 * border,
        h: metadata.height + 2 * border,
      });
      images.push(file);

      names.push(basename);
    } catch (e) {
      console.error(e, file);
    }
  }

  console.log("bin packing");

  //sizes.sort((a,b)=> Math.max(b.w,b.h) - Math.max(a.w,a.h))

  let queue = sizes.map((d) => d);
  let packs = [];

  while (queue.length !== 0) {
    let sprite = new ShelfPack(sheetDimension, sheetDimension);
    let results = sprite.pack(queue);
    packs.push(results);
    queue = queue.filter((d) => !results.find((i) => i.id === d.id));
  }

  console.log("creating spritesheets", packs.length);

  let index = 0;

  for (let pack of packs) {
    // const composite = []
    // for(let bin of pack){
    //   console.log(bin.id)
    //   const scaledImage = await images[bin.id].resize(128, 128, { fit: 'inside' }).toBuffer()
    //   const elem = {
    //     input: scaledImage,
    //     left: bin.x+border,
    //     top: bin.y+border
    //   }
    //   composite.push(elem)
    // }

    // const composite = await Promise.all(pack.map(async bin => {
    //   console.log(bin.id)
    //   const scaledImage = await images[bin.id].resize(128, 128, { fit: 'inside' }).toBuffer()

    //   return {
    //     //input: images[bin.id],
    //     input: scaledImage,
    //     left: bin.x+border,
    //     top: bin.y+border
    //   }
    // }))

    const composite = pack.map((bin) => {
      return {
        input: images[bin.id],
        left: bin.x + border,
        top: bin.y + border,
      };
    });

    console.log("composing spitesheet of", composite.length);

    const options = {
      width: sheetDimension,
      height: sheetDimension,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    };

    let compositeSheetBuffer = await sharp({ create: options })
      .raw()
      .toBuffer();

    const compositeChunks = chunk(composite, compositeChunkSize);
    for (let compositeChunk of compositeChunks) {
      console.log("composing ", compositeChunk.length);
      compositeSheetBuffer = await sharp(compositeSheetBuffer, { raw: options })
        .composite(compositeChunk)
        .raw()
        .toBuffer();
    }

    const file =
      outputPath +
      "/" +
      "sprite" +
      sheetDimension +
      "-" +
      index +
      "." +
      outputFormat;
    index++;
    await sharp(compositeSheetBuffer, { raw: options })
      .toFormat(outputFormat, { quality: outputQuality })
      .toFile(file);

    console.log(file);
  }

  const jsonOut = {
    scaleName: "full",
    variation: "web",
    loadingStage: "web",
    id: "web_web_full",
    resolution: 1,
    meta: {
      type: "pixi-packer", // TODO to "vikus-viewer"
      version: "1",
      app: "https://github.com/cpietsch/vikus-viewer-script",
    },
    spritesheets: packs.map((pack, i) => {
      return {
        image: "sprite" + sheetDimension + "-" + i + "." + outputFormat,
        filesize: 417202,
        sprites: pack.map((bin) => {
          return {
            name: names[bin.id],
            position: { x: bin.x + border, y: bin.y + border },
            dimension: { w: bin.w - 2 * border, h: bin.h - 2 * border },
          };
        }),
      };
    }),
  };
  const jsonFile = outputPath + "/web_web_full.json";
  fs.writeFileSync(jsonFile, JSON.stringify(jsonOut));
};

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

function scaleTo(_width, _height, max) {
  let aspect = _width < _height;
  let width = aspect ? Math.floor((max / _height) * _width) : max;
  let height = aspect ? max : Math.floor((max / _width) * _height);
  return { width, height };
}
