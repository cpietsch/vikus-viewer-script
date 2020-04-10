const sharp = require('sharp');
const path = require('path');
const glob = require('glob');
const ShelfPack = require('@mapbox/shelf-pack');

sharp.cache(false)

exports.run = async function spriter(inputPath, outputPath, options){

  const border = options.border || 1
  const sheetDimension = options.sheetDimension || 1024
  const outputFormat = options.outputFormat || "png"
  const outputQuality = options.outputQuality || 80
  const inputFormat = options.inputFormat || "png"
  // const spriteDimension = options.spriteDimension || 1

  const files = glob.sync(inputPath + '/*.' + inputFormat)//.slice(0,40)

  let sizes = []
  let images = []
  let names = []

  console.log("found", files.length, "files")

  for(i in files){
    const file = files[i]
    const basename = path.parse(file).name;

    console.log(basename)
    
    try {
      const image = sharp(file)
      const metadata = await image.metadata()

      // const scaledDimension = scaleTo(metadata.width, metadata.height, 128)
      // sizes.push({ id: +i, w: scaledDimension.width +2*border, h: scaledDimension.height +2*border })
      // images.push(image)

      sizes.push({ id: +i, w: metadata.width+ 2*border, h: metadata.height+ 2*border })
      images.push(file)

      names.push(basename)

    } catch (e) {
      console.error(e, file)
    }
  }

  console.log("packing")

  //sizes.sort((a,b)=> Math.max(b.w,b.h) - Math.max(a.w,a.h))

  let queue = sizes.map(d => d)
  let packs = []
  
  while(queue.length !== 0){
    let sprite = new ShelfPack(sheetDimension, sheetDimension);
    let results = sprite.pack(queue);
    packs.push(results);
    queue = queue.filter(d => !results.find(i => i.id === d.id))
  }

  console.log("creating spritesheets", packs.length)

  let index = 0
  
  for(let pack of packs){

    const canvas = sharp({
      create: {
        width: sheetDimension,
        height: sheetDimension,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    
    
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

    const composite = pack.map(bin => {
      return {
        input: images[bin.id],
        left: bin.x+border,
        top: bin.y+border
      }
    })

    console.log("composite", composite.length)
    
    const file = outputPath + "/" + (index++) + "." + outputFormat
    const saved = await canvas
      .composite(composite)
      .toFormat(outputFormat, { quality: outputQuality })
      .toFile(file)
    
    console.log(file, saved)
  }
}


function scaleTo(_width, _height, max){
  let aspect = _width < _height
  let width = aspect ? Math.floor(max/_height*_width) : max
  let height = aspect ? max : Math.floor(max/_width*_height)
  return { width, height }
}
