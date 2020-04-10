#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const spritesheets = require('../src/spritesheets')

var argv = require('yargs')
    .usage('Usage: $0 /path/to/images [options]')
    .command('/path/to/images', 'Path to input images')
    .example('$0 /path/to/images', 'create spritesheets from source images')
    .demandCommand(1)
    // .demandOption(['images'])
    .describe('format', 'Input image format (can be multiple "jpg|png")')
    .describe('spritesheetDimension', 'Dimension for generated spritesheets')
    .describe('outputPath', 'Path to output folder')
    .describe('outputFormat', 'Output image format')
    .describe('outputQuality', 'Output image quality (0-100)')
    .default('format', "png")
    .default('outputFormat', "png")
    .default('outputQuality', 80)
    .default('outputPath', "../sprites")
    .default('spritesheetDimension', 2048)
    .help('h')
    .alias('h', 'help')
    .argv;


;(async function main() {

  const options = {
  	inputFormat: argv.inputFormat,
  	outputFormat: argv.outputFormat,
  	sheetDimension: argv.spritesheetDimension,
  	outputQuality: argv.outputQuality
  }

  const inputPath = argv._[0]
  const outputPath = createPath(path.resolve(inputPath, argv.outputPath));

  console.log("\nlooking for images at ", inputPath + '/*.' + argv.format)

  const spriter = await spritesheets.run(inputPath, outputPath, options)

  console.log("done")
})()



function createPath(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path)
  return path;
}