# vikus-viewer-script

This script will generate the textures and spritesheet assets which are needed for the [vikus-viewer](https://github.com/cpietsch/vikus-viewer). 


## Requirements
- imagemagick
  - mac: brew install imagemagick
  - linux: sudo apt-get install imagemagick imagemagick-doc 
- nodejs
  - use the installer on https://nodejs.org/en/download/
  - or use nvm https://github.com/creationix/nvm


## Usage

Download or clone this repo and install the required node packages: 

``npm i`` 

All your images should be in one folder (lets say "images") and named x.jpg, where x is the id of the image.

To generate textures and sprites run the script like this:

``node script.js -i /path/to/images`` 

This will create a vv-data folder for the textures (256, 1024 and 4096) next to the original image folder as well as a sprites folder inside vv-data for the spritesheets. 

You are now finished in preparing the textures and spritesheets!

Copy the folder 1024, 4096 and sprites inside vv-data into your /data folder of your [vikus-viewer](https://github.com/cpietsch/vikus-viewer) instance.


## Improvements
- replace gm with sharp https://github.com/lovell/sharp