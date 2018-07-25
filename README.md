# vikus-viewer-script

This repo helps you to create the textures and spritesheet assets which are needed for the vikus-viewer. There are 2 scripts in this repo: *index.js* and *spritesheet.js*.
- index.js will create textures of your collection in 3 different resolutions
- spritesheet.js will create spritesheets of your collection



## Requirements
- imagemagick
  - mac: brew install imagemagick
  - linux: sudo apt-get install imagemagick imagemagick-doc 
- nodejs
  - use the installer on https://nodejs.org/en/download/
  - or use nvm https://github.com/creationix/nvm


## Usage
First you will need to install the required node packages via *npm i*. All your images should be in one folder (lets say "images") and named x.jpg, where x is the id of the image.


- ``node index.js -i /user/vikus/collection/images`` 

This will create a vv-data folder for the textures (256, 1024 and 4096) next to the original image folder.

- ```node spritesheets.js -i /user/vikus/collection/images```

This will create a sprites folder inside vv-data for the spritesheets.
You are now finished in preparing the textures and spritesheets.

Copy the folder 1024, 4096 and sprites inside vv-data into your /data folder of the vikus-viewer.
