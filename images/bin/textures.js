#!/usr/bin/env node

// https://github.com/cpietsch/vikus-viewer-script
// by Christopher Pietsch 2020

const fs = require("fs");
const path = require("path");
const cascade = require("../src/cascade");
const sharpsheet = require("sharpsheet");

var argv = require("yargs")
  .usage("Usage: textures.js \"/path/to/large/images/*.jpg\" [options]")
  .command("\"/path/to/large/images/*.jpg\"", "Glob to input images")
  .example("textures.js \"/path/to/large/images/*.jpg\"", "create VV textures from jpgs")
  .demandCommand(1)
  .describe("output", "Path to output folder")
  .default("output", "./data")
  .describe("skip", "Don't regenerate existing textures")
  .default("skip", true)
  .describe("textureFormat", "Texture image format")
  .default("textureFormat", "jpg")
  .describe("textureQuality", "Texture image quality (0-100)")
  .default("textureQuality", 60)
  .describe("spriteSize", "Resolution of images for spritesheets")
  .default("spriteSize", 256)
  .describe("spriteQuality", "Quality of jpg compression for spritesheets (0-100)")
  .default("spriteQuality", 60)
  .describe("spriteFormat", "spritesheets format (jpg or png)")
  .default("spriteFormat", "jpg")
  .help("h")
  .alias("h", "help").argv;

// console.log('starting with', argv);

const textureRes1 = 4096;
const textureRes2 = 1024;
const textureRes3 = argv.spriteSize;

// const workPath = createPath(path.join(path.dirname(imagePath), 'data/'));
const input = argv._[0];
const workPath = createPath(path.resolve(argv.output));
const spritesPath = createPath(workPath + "/sprites");
const tmpPath = createPath(workPath + "/tmp");
const textureRes1Path = createPath(workPath + "/" + textureRes1);
const textureRes2Path = createPath(workPath + "/" + textureRes2);
const textureRes3Path = createPath(tmpPath + "/" + textureRes3);


const resizeSteps = [
  {
    width: textureRes1,
    height: textureRes1,
    format: argv.textureFormat,
    quality: argv.textureQuality,
    path: textureRes1Path,
  },
  {
    width: textureRes2,
    height: textureRes2,
    format: argv.textureFormat,
    quality: argv.textureQuality,
    path: textureRes2Path,
  },
  {
    width: textureRes3,
    height: textureRes3,
    format: "png",
    quality: 100,
    path: textureRes3Path,
  },
];

function createPath(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  return path;
}

(async function main() {
  console.log("\nlooking for images at ", input);

  const resizer = cascade.run(input, resizeSteps, { skipExisting: argv.skip });

  const spritesheetFiles = []
  for await (const operation of resizer) {
    console.log(operation.progress, operation.file);
    spritesheetFiles.push(operation.log[2])
  }

  const spriter = await sharpsheet(spritesheetFiles, spritesPath, {
    format: argv.spriteFormat,
    quality: argv.spriteQuality,
    dimension: 2048
  });

  console.log("done")
  // console.log(files)
})();
