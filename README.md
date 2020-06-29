# vikus-viewer-script

The script in /images will generate textures and spritesheet assets which are needed for the [vikus-viewer](https://github.com/cpietsch/vikus-viewer). The script in /tsne will generate a TSNE layout which can be used as an alternative to the timeline-view in VIKUS Viewer.


## Requirements
- nodejs
  - use the installer on https://nodejs.org/en/download/
  - or use nvm https://github.com/creationix/nvm


## Usage image script

Download or clone this repo, navigate to /images and install the required node packages: 

```sh
cd /images
npm i
``` 

All your images should be in one folder (lets say "images") and named x.jpg where x is the id of the image corresponding to the id field in data.csv

To generate textures and sprites run the script like this:

```sh
node bin/textures.js "/path/to/your/images/*.jpg"
``` 

This will create a data folder for the textures (1024 and 4096) as well as a sprites folder for the spritesheets inside the current folder. You can also define an output folder via the output flag: `--output /path/to/output`

You are now finished in preparing the textures and spritesheets!

Copy the folder 1024, 4096 and sprites inside data into your /data folder of your [vikus-viewer](https://github.com/cpietsch/vikus-viewer) instance. After a successful run you can delete the tmp folder.

*A note for collections of 5000+ items*: In the default configuration the script will generate sprites at the maximum dimensions of 256x256px. For faster loading time and collections with a lot of items, you should adjust the resolution of the sprites by running changing the ``--spriteSize`` flag to e.g.  90.

### Examples:

```sh
node bin/textures.js "/path/to/your/images/*.jpg" # on jpg's
node bin/textures.js "/path/to/your/images/*.(jpg|jpeg|png)" # on multiple formats
node bin/textures.js "/path/to/your/images/**/*.jpg" # on all jpg's in subfolders
```

### CLI commands
```
node .\bin\textures.js
Usage: textures.js "/path/to/large/images/*.jpg" [options]

Commands:
  textures.js "/path/to/large/images/*.jpg"  Glob to input images

Options:
  --version         Show version number                                [boolean]
  --output          Path to output folder                    [default: "./data"]
  --skip            Don't regenerate existing textures           [default: true]
  --textureFormat   Texture image format                        [default: "jpg"]
  --textureQuality  Texture image quality (0-100)                  [default: 60]
  --spriteSize      Resolution of images for spritesheets         [default: 256]
  --spriteQuality   Quality of jpg compression for spritesheets (0-100)
                                                                   [default: 60]
  --spriteFormat    spritesheets format (jpg or png)            [default: "jpg"]
  -h, --help        Show help                                          [boolean]

Examples:
  textures.js "/path/to/large/images/*.jpg"  create VV textures from jpgs
``` 

## Usage TSNE script

Download or clone this repo, navigate to /tsne and install the required node packages: 

```sh
npm i
```

Run the TSNE script:
```sh
node tsne.js -i /path/to/images
```

`/path/to/images` should be pointed low res images (made with the texture script) in the 1024px resolution. After you run the script a `tsne.csv` will be generated. Copy the csv into the data folder of your VIKUS Viewer instance and add an "tsne" entry to the loader section in the config.json file pointing to the tsne.csv file. Have a look at the [Van Gogh Example config](https://github.com/cpietsch/vikus-viewer-data/blob/master/vangogh/config.json#L10)
