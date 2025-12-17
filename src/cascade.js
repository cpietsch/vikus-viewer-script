import sharp from "sharp";
import path from "path";
import { glob } from 'glob';
import fs from "fs/promises";

export default async function* cascade(input, resizeSteps, options = {}) {
  console.log("cascade options:", options);
  const skipExisting = options.skipExisting !== undefined ? options.skipExisting : true;
  const verbose = options.verbose !== undefined ? options.verbose : true;
  let files = [];

  console.log("skipExisting is bool:", skipExisting, typeof skipExisting);

  if (typeof input === "string") {
    files = glob.sync(input);
  } else if (Array.isArray(input)) {
    files = input;
  }

  if (files.length === 0) {
    console.error(`No files found: ${input} - have you used "/path/to/images/*.jpg" ?`);
    return;
  }

  if (verbose) {
    console.log(`Found ${files.length} files`);
  }

  const totalFiles = files.length;
  for (const [index, file] of files.entries()) {
    const basename = path.parse(file).name;
    const log = [];

    try {
      let instance = await sharp(file);
      const metadata = await instance.metadata();
      if(verbose) {
        console.log(`Processing ${file} (${metadata.width}x${metadata.height})`);
      }
      
      for (const step of resizeSteps) {
        instance = instance.resize(step.width, step.height, { fit: "inside" });
        const outFilePath = path.join(step.path, `${basename}.${step.format}`);

        const exists = await fs.access(outFilePath).then(()=>true,()=>false)
        if (skipExisting && exists) {
          if (verbose) console.log(`  skip: ${path.basename(outFilePath)}`);
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
    
    const progress = (((index + 1) / totalFiles) * 100).toFixed(1);
    yield {
      file,
      basename,
      progress: `${progress}%`,
      current: index + 1,
      total: totalFiles,
      log,
    };
  }
};
