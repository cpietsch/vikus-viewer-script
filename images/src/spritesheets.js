const sharp = require('sharp');
const path = require('path');
const glob = require('glob');
const ShelfPack = require('@mapbox/shelf-pack');

const run = async function(inputPath, inputFormat, outputPath){

  const border = 1
  const sheetDimension = 1024*2
  const spriteDimension = 128

  const files = glob.sync(inputPath + '/*.' + inputFormat)

  let sizes = []
  let images = []
  let names = []

  for(i in files){
    const file = files[i]
    const basename = path.parse(file).name;
    
    try {
      let image = await sharp(file)
        .metadata()

      // let size = calculateSize(image.width, image.height, spriteDimension)
      // sizes.push({ id: +i, w: size[0] +2*border, h: size[1] +2*border })

      sizes.push({ id: +i, w: image.width +2*border, h: image.height +2*border })
      images.push(file)
      names.push(basename)

    } catch (e) {
      console.error(e, file)
    }
    
  }

  sizes.sort((a,b)=> Math.max(b.w,b.h) - Math.max(a.w,a.h))

  let queue = sizes.map(d => d)
  let packs = []
  
  while(queue.length !== 0){
    let sprite = new ShelfPack(sheetDimension, sheetDimension);
    let results = sprite.pack(queue);
    packs.push(results);
    queue = queue.filter(d => !results.find(i => i.id === d.id))
  }

  // console.log(packs)

  let index = 0
  let sheets = []
  
  for(let pack of packs){
    const canvas = sharp({
      create: {
        width: sheetDimension,
        height: sheetDimension,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    
    // sheets.push(canvas)
    const composite = pack.map(bin => {
      return {
        input: images[bin.id],
        left: bin.x+border,
        top: bin.y+border
      }
    })

    // console.log(composite)
    const file = outputPath + "/" + (index++) + ".png"
    const saved = await canvas
      .composite(composite)
      .toFile(file)
    
    console.log(file, saved)

    // for(let bin of pack){
    //   //ctx.drawImage(files.images[bin.id], bin.x+border,bin.y+border, bin.w-2*border, bin.h-2*border)

    //   yield index++ + "/"+ files.images.length;
    // }
  }
}


function calculateSize(width, height, max){
  let aspect = width < height
  let width1 = aspect ? Math.floor(max/height*width) : max
  let height1 = aspect ? max : Math.floor(max/width*height)
  return [width1, height1]
}

;(async function main() {
  await run("/Users/assdrive/Documents/projekte/vikus-viewer/vikus-viewer-script/images/data/tmp/256", "png", "/Users/assdrive/Documents/projekte/vikus-viewer/vikus-viewer-script/images/data/sprites")
})()
