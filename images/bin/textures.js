#!/usr/bin/env node

// https://github.com/cpietsch/vikus-viewer-script
// by Christopher Pietsch 2020

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const cascade = require("../src/cascade");
const sharpsheet = require("sharpsheet");

var argv = require("yargs")
  .usage("Usage: $0 /path/to/large/images [options]")
  .command("/path/to/large/images", "Path to input images")
  .example("$0 /path/to/large/images", "create textures from source images")
  .demandCommand(1)
  .describe("format", 'Input image format (can be multiple "jpg|png")')
  .describe("spriteResolution", "Resolution of images for spritesheets")
  .describe("outputPath", "Path to output folder")
  .describe("outputFormat", "Output image format")
  .describe("outputQuality", "Output image quality (0-100)")
  .default("format", "jpg")
  .default("outputFormat", "jpg")
  .default("outputQuality", 60)
  .default("outputPath", "./data")
  .default("spriteResolution", 256)
  .help("h")
  .alias("h", "help").argv;

// console.log('starting with', argv);

const textureRes1 = argv.spriteResolution;
const textureRes2 = 1024;
const textureRes3 = 4096;

// const workPath = createPath(path.join(path.dirname(imagePath), 'data/'));
const inputPath = argv._;
const workPath = createPath(path.resolve(argv.outputPath));
const tmpPath = createPath(workPath + "/tmp");
const textureRes1Path = createPath(tmpPath + "/" + textureRes1);
const textureRes2Path = createPath(workPath + "/" + textureRes2);
const textureRes3Path = createPath(workPath + "/" + textureRes3);
const spritesPath = createPath(workPath + "/sprites");


const resizeSteps = [
  {
    width: textureRes3,
    height: textureRes3,
    format: argv.outputFormat,
    quality: argv.outputQuality,
    path: textureRes3Path,
  },
  {
    width: textureRes2,
    height: textureRes2,
    format: argv.outputFormat,
    quality: argv.outputQuality,
    path: textureRes2Path,
  },
  {
    width: textureRes1,
    height: textureRes1,
    format: "png",
    quality: 100,
    path: textureRes1Path,
  },
];

function createPath(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  return path;
}

(async function main() {
  console.log("\nlooking for images at ", inputPath + "/*." + argv.format);

  const resizer = cascade.run(inputPath, argv.format, resizeSteps);

  for await (const operation of resizer) {
    console.log(operation.progress, operation.file);
  }

  const spriter = await sharpsheet(textureRes1Path + "/*.png", spritesPath, {
    outputFormat: "jpg",
    outputQuality: 60,
    sheetDimension: 2048
  });

  console.log("done")
})();
