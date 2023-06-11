# vikus-viewer-script v2.0

The script in /images will generate textures and spritesheet assets which are needed for the [vikus-viewer](https://github.com/cpietsch/vikus-viewer) (repo). The script in /tsne will generate a TSNE layout which can be used as an alternative to the timeline-view in VIKUS Viewer.

## Requirements

- nodejs
  - use the installer on https://nodejs.org/en/download/
  - or use nvm https://github.com/creationix/nvm

## Usage image script

Install the script as a command line tool without the need of cloning / downloading:

```sh
npm install -g vikus-viewer-script
```

Alternatively you can download or clone this repo and install the required node packages:

```sh
git clone https://github.com/cpietsch/vikus-viewer-script
cd vikus-viewer-script
npm install
```

Note: You can run the script via `node bin/textures` instead of `vikus-viewer-script` if you have cloned it.

All your images should be in one folder (lets say "images") and named x.jpg where x is the id of the image corresponding to the id field in data.csv

To generate textures and sprites run the script like this:

```sh
vikus-viewer-script "/path/to/your/images/*.jpg"
```

This will create a data folder for the textures (1024 and 4096) as well as a sprites folder for the spritesheets inside the current folder. You can also define an output folder via the output flag: `--output /path/to/output`

If your source images are in multiple formats or have multiple file extensions you can use a [glob primer](https://www.npmjs.com/package/glob#glob-primer) like this: `vikus-viewer-script "/path/to/your/images/*.+(jpg|jpeg|png)"`

You are now finished in preparing the textures and spritesheets!

Copy the folder 1024, 4096 and sprites inside data into your /data folder of your [vikus-viewer](https://github.com/cpietsch/vikus-viewer) instance. After a successful run you can delete the tmp folder.

_A note for collections of 5000+ items_: In the default configuration the script will generate sprites at the maximum dimensions of 256x256px. For faster loading time and collections with a lot of items, you should adjust the resolution of the sprites by running changing the `--spriteSize` flag to e.g. 90.

### Examples:

#### Create textures

```sh
vikus-viewer-script "/path/to/your/images/*.jpg" # on jpg's
vikus-viewer-script "/path/to/your/images/*.+(jpg|jpeg|png)" # on multiple formats
vikus-viewer-script "/path/to/your/images/**/*.jpg" # on all jpg's in subfolders
```

### CLI commands

```sh
Usage: vikus-viewer-script "/path/to/large/images/*.jpg" [options]

Commands:
  vikus-viewer-script "/path/to/large/images/*.jpg"  Glob to input images

Options:
  --version         Show version number                                [boolean]
  --output          Path to output folder                    [default: "./data"]
  --skip            Don't regenerate existing textures           [default: true]
  --textureFormat   Texture image format                        [default: "jpg"]
  --textureQuality  Texture image quality (0-100)                  [default: 60]
  --spriteSize      Resolution of images for spritesheets         [default: 128]
  --spriteQuality   Quality of jpg compression for spritesheets (0-100)
                                                                   [default: 70]
  --spriteFormat    spritesheets format (jpg or png)            [default: "jpg"]
  --largeSize       resolution of full sized images              [default: 4096]
  --mediumSize      resolution of images loaded on the fly       [default: 1024]
  --skipTextures    skip texture generation, only make spritesheets
                                                                [default: false]
  -h, --help        Show help                                          [boolean]

Examples:
  vikus-viewer-script "/path/to/large/images/*.jpg"  create VV textures from jpgs
```

## Usage t-SNE/UMAP script

As an alternative to the temporal view, you can create a t-SNE layout based on image similarity. The script creates a tsne.csv which can be put next to the data.csv in the /data folder. Image similarity is calculated via the [mobilenet activation logit](https://beta.observablehq.com/@cpietsch/imagenet-activation-logit) and then run throught t-SNE or UMAP. An additional spacing step ensures no overlaying images in the distribution.

Download or clone this repo, navigate to /similarity and install the required node packages:

```sh
cd /similarity
npm i
```

Add the `-t` flag to the script to use the much faster tfjs-node implementation instead of the default tfjs.

Run the t-SNE script:

```sh
node tsne.js -i /path/to/images
```

Alternatively Run the UMAP script UMAP is an experimental new version of way to do something similar to the T-SNE projection:

```sh
node umap.js -i /path/to/images
```

`/path/to/images` should be pointed low res images (made with the texture script) in the 1024px resolution. After you run the script a `tsne.csv` will be generated. Copy the csv into the data folder of your VIKUS Viewer instance. Then you can add layouts or remove the lime layout in the [loader.layout](https://github.com/cpietsch/vikus-viewer-data/blob/master/vangogh/config.json#L10) section of the config.json.
To add yout custom layout add this entry: `{"title": "Similarity", "url": "tsne.csv" }`
