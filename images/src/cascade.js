const sharp = require('sharp');
const path = require('path');
const glob = require('glob');

exports.run = async function* cascade(inputPath, inputFormat, resizeSteps){

  const files = glob.sync(inputPath + '/*.' + inputFormat)

  for(i in files){
    const file = files[i]
    const basename = path.parse(file).name;
    const log = []

    try {
      let instance = await sharp(file)
      for(step of resizeSteps){
        instance = instance.resize(step.width, step.height, { fit: 'inside' })

        const saved = await instance
          .toFormat(step.format, { quality: step.quality })
          .toFile(step.path + '/' + basename + '.' + step.format)

        log.push(saved)
      }
    } catch (e) {
      console.error("there is a problem with ", file)
      console.error(e)
    }
    yield {
      file,
      basename,
      progress: (i/files.length*100).toFixed(2) + "%",
      log
    }
  }

  return "done"
}