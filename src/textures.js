import fs from "fs";
import path from "path";
import cascade from "./cascade.js";
import sharpsheet from "sharpsheet/src/sharpsheet.js";

// Valid formats for textures and sprites (supported by Sharp)
const VALID_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

/**
 * Validate options and return normalized values
 */
function validateOptions(options) {
  const errors = [];
  
  // Validate quality values
  if (options.textureQuality < 0 || options.textureQuality > 100) {
    errors.push(`textureQuality must be between 0-100, got: ${options.textureQuality}`);
  }
  if (options.spriteQuality < 0 || options.spriteQuality > 100) {
    errors.push(`spriteQuality must be between 0-100, got: ${options.spriteQuality}`);
  }
  
  // Validate formats
  if (!VALID_FORMATS.includes(options.textureFormat)) {
    errors.push(`textureFormat must be one of ${VALID_FORMATS.join(', ')}, got: ${options.textureFormat}`);
  }
  if (!VALID_FORMATS.includes(options.spriteFormat)) {
    errors.push(`spriteFormat must be one of ${VALID_FORMATS.join(', ')}, got: ${options.spriteFormat}`);
  }
  
  if (errors.length > 0) {
    throw new Error(`Invalid options:\n  • ${errors.join('\n  • ')}`);
  }
}

export default async function textures(inputPath, options = {}) {
  const skipTextures = options.skipTextures !== undefined ? options.skipTextures : false;
  const textureRes1 = options.largeSize || 4096;
  const textureRes2 = options.mediumSize || 1024;
  const textureRes3 = options.spriteSize || 128;
  const outputPath = options.output || "./data";
  const textureFormat = options.textureFormat || "jpg";
  const textureQuality = options.textureQuality ?? 60;
  const skipExisting = options.skip !== undefined ? options.skip : true;
  const spriteFormat = options.spriteFormat || "jpg";
  const spriteQuality = options.spriteQuality ?? 70;
  const multiple = options.multiple || false;
  const verbose = options.verbose ?? true;
  const quiet = options.quiet || false;

  // Validate options
  validateOptions({ textureQuality, spriteQuality, textureFormat, spriteFormat });

  const workPath = createPath(path.resolve(outputPath));
  const spritesPath = createPath(path.join(workPath, "sprites"));
  const tmpPath = createPath(path.join(workPath, "tmp"));
  const textureRes1Path = !skipTextures && createPath(path.join(workPath, String(textureRes1)));
  const textureRes2Path = !skipTextures && createPath(path.join(workPath, String(textureRes2)));
  const textureRes3Path = createPath(path.join(tmpPath, String(textureRes3)));

  const resizeSteps = [
    !skipTextures && {
      width: textureRes1,
      height: textureRes1,
      format: textureFormat,
      quality: textureQuality,
      path: textureRes1Path,
    },
    !skipTextures && {
      width: textureRes2,
      height: textureRes2,
      format: textureFormat,
      quality: textureQuality,
      path: textureRes2Path,
    },
    {
      width: textureRes3,
      height: textureRes3,
      format: "png",
      quality: 100,
      path: textureRes3Path,
    },
  ].filter((s) => s);

  if (!quiet) {
    console.log("Looking for images:", inputPath);
  }

  const resizer = cascade(inputPath, resizeSteps, { 
    skipExisting,
    verbose: verbose && !quiet
  });

  let spritesheetFiles = [];
  let processedCount = 0;
  let errorCount = 0;

  for await (const operation of resizer) {
    processedCount++;
    if (!quiet) {
      console.log(`[${operation.progress}] ${operation.file}`);
    }
    if (!skipTextures && operation.log[2]) {
      spritesheetFiles.push(operation.log[2]);
    } else if (skipTextures && operation.log[0]) {
      spritesheetFiles.push(operation.log[0]);
    } else {
      errorCount++;
      if (!quiet) console.error("  error:", operation.file);
    }
  }

  if (multiple) {
    // this only works if the _ is only used for multipage files
    spritesheetFiles = spritesheetFiles.filter(
      (file) => file.indexOf("_") === -1
    );
  }

  // Handle empty spritesheet array
  if (spritesheetFiles.length === 0) {
    console.log("No images to process");
    return { processed: 0, errors: errorCount };
  }

  if (!quiet) console.log(`Creating spritesheets from ${spritesheetFiles.length} images`);
  await sharpsheet(spritesheetFiles, spritesPath, {
    outputFormat: spriteFormat,
    outputQuality: spriteQuality,
    dimension: 2048,
  });

  if (!quiet) {
    console.log(`Done: ${processedCount} files${errorCount > 0 ? `, ${errorCount} errors` : ''}`);
  }
  
  return { processed: processedCount, errors: errorCount };
};

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to create
 * @returns {string} The created path
 */
function createPath(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}
