#!/usr/bin/env node

// https://github.com/cpietsch/vikus-viewer-script
// by Christopher Pietsch 2020
import textures from "../src/textures.js";

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: vikus-viewer-script "/path/to/large/images/*.jpg" [options]')
  .command('"/path/to/large/images/*.jpg"', "Glob to input images")
  .example(
    'vikus-viewer-script "/path/to/large/images/*.jpg"',
    "create VV textures from jpgs"
  )
  .example(
    'vikus-viewer-script "/images/*.jpg" --quiet',
    "minimal output"
  )
  .demandCommand(1)
  .describe("output", "Path to output folder")
  .default("output", "./data")
  .describe("skip", "Don't regenerate existing textures")
  .default("skip", true)
  .boolean("skip")
  .describe("textureFormat", "Texture image format")
  .default("textureFormat", "jpg")
  .choices("textureFormat", ["jpg", "jpeg", "png", "webp", "gif", "avif"])
  .describe("textureQuality", "Texture image quality (0-100)")
  .default("textureQuality", 60)
  .coerce("textureQuality", (val) => {
    if (val < 0 || val > 100) throw new Error("textureQuality must be between 0-100");
    return val;
  })
  .describe("spriteSize", "Resolution of images for spritesheets")
  .default("spriteSize", 128)
  .describe("spriteQuality", "Quality of jpg compression for spritesheets (0-100)")
  .default("spriteQuality", 70)
  .coerce("spriteQuality", (val) => {
    if (val < 0 || val > 100) throw new Error("spriteQuality must be between 0-100");
    return val;
  })
  .describe("spriteFormat", "Spritesheets format")
  .default("spriteFormat", "jpg")
  .choices("spriteFormat", ["jpg", "jpeg", "png", "webp", "gif", "avif"])
  .describe("largeSize", "Resolution of full sized images")
  .default("largeSize", 4096)
  .describe("mediumSize", "Resolution of images loaded on the fly")
  .default("mediumSize", 1024)
  .describe("skipTextures", "Skip texture generation, only make spritesheets")
  .default("skipTextures", false)
  .boolean("skipTextures")
  .describe("verbose", "Show detailed output")
  .boolean("verbose")
  .describe("quiet", "Minimal output")
  .boolean("quiet")
  .default("quiet", false)
  .alias("q", "quiet")
  .help("h")
  .alias("h", "help")
  .epilogue('For more info, visit https://github.com/cpietsch/vikus-viewer-script')
  .argv;

const inputPath = argv._[0];

(async function main() {
  try {
    const result = await textures(inputPath, argv);
    process.exit(result?.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
