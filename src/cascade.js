import sharp from "sharp";
import path from "path";
import { glob } from 'glob';
import fs from "fs";

export default async function* cascade(input, resizeSteps, options) {
  const skipExisting = options.skipExisting || true;
  let files = [];

  if(typeof input === "string"){
    files = glob.sync(input);
  }  else if(Array.isArray(input)){
    files = input
  }

  console.log("found ", files);

  for (let i in files) {
    const file = files[i];
    const basename = path.parse(file).name;
    const log = [];

    try {
      let instance = await sharp(file);
      for (let step of resizeSteps) {
        instance = instance.resize(step.width, step.height, { fit: "inside" });
        const outFilePath = step.path + "/" + basename + "." + step.format

        if(skipExisting && fs.existsSync(outFilePath)) {
          console.log("skipping file")
        } else {
          await instance
            .toFormat(step.format, { quality: step.quality })
            .toFile(outFilePath);
        }

        log.push(outFilePath);
      }
    } catch (e) {
      console.error("there is a problem with ", file);
      console.error(e);
    }
    yield {
      file,
      basename,
      progress: ((i / files.length) * 100).toFixed(2) + "%",
      log,
    };
  }

  return
};
