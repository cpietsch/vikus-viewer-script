import sharp from "sharp";
import path from "path";
import { glob } from 'glob';
import fs from "fs";

export default async function* cascade(input, resizeSteps, options = {}) {
  const skipExisting = options.skipExisting !== undefined ? options.skipExisting : true;
  let files = [];

  if(typeof input === "string"){
    files = glob.sync(input);
  } else if(Array.isArray(input)){
    files = input;
  }

  if (files.length === 0) {
    console.error(`\n❌ No files found matching: ${input}`);
    console.error('\nTips:');
    console.error('  • Make sure to quote the glob pattern: vikus-viewer-script "/path/to/images/*.jpg"');
    console.error('  • Check that the path exists and contains images');
    console.error('  • For multiple formats use: "/path/to/images/*.+(jpg|png)"\n');
    return;
  }

  console.log(`\n✓ Found ${files.length} files`);

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
