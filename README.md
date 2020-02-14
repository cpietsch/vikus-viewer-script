# vikus-viewer-script

The script in /images will generate textures and spritesheet assets which are needed for the [vikus-viewer](https://github.com/cpietsch/vikus-viewer) (repo). The script in /tsne will generate a TSNE layout which can be used as an alternative to the timeline-view in VIKUS Viewer.


## Requirements
- nodejs
  - use the installer on https://nodejs.org/en/download/
  - or use nvm https://github.com/creationix/nvm


## Usage image script

Download or clone this repo, navigate to /images and install the required node packages: 

```sh
npm i
``` 

All your images should be in one folder (lets say "images") and named x.jpg, where x is the id of the image.

To generate textures and sprites run the script like this:

```sh
IMAGEPATH=/path/to/images npm run build
``` 

This will create a data folder for the textures (1024 and 4096) next to the original image folder as well as a sprites folder for the spritesheets.

You are now finished in preparing the textures and spritesheets!

Copy the folder 1024, 4096 and sprites inside data into your /data folder of your [vikus-viewer](https://github.com/cpietsch/vikus-viewer) instance. After a successfull run you can delete the tmp folder.

*A note for collections of 5000+ items*: In the default configuration the script will generate sprites at the maximum dimensions of 256x256px. For faster loading time and collections with a lot of items, you should adjust the resolution of the sprites by running the scripts individually.

```sh
node textures.js -i /path/to/images -s 128 -f jpg
node spritesheets.js -s 256 -i /path/to/images

-i: input path
-s: sprite dimension
-f: input image format, can handle [multiple filetypes](https://github.com/isaacs/node-glob#glob-primer) like this -f "*(jpg|jpeg)"
```

## Usage t-SNE/UMAP script

As an alternative to the temporal view, you can create a t-SNE layout based on image similarity. The script creates a tsne.csv which can be put next to the data.csv in the /data folder. Image similarity is calculated via the [imagenet activation logit](https://beta.observablehq.com/@cpietsch/imagenet-activation-logit) and then run throught t-SNE or UMAP. An additional spacing step ensures no overlaying images in the distribution.

Download or clone this repo, navigate to /similarity and install the required node packages: 

```sh
npm i
```

Run the t-SNE script:
```sh
node tsne.js -i /path/to/images
```

Alternatively Run the UMAP script UMAP is an experimental new version of way to do something similar to the T-SNE projection:

```sh
node umap.js -i /path/to/images
```

`/path/to/images` should be pointed low res images (made with the texture script) in the 1024px resolution. After you run the script a `tsne.csv` will be generated. Copy the csv into the data folder of your VIKUS Viewer instance and add an "tsne" entry to the loader section in the config.json file pointing to the tsne.csv file. Have a look at the [Van Gogh Example config](https://github.com/cpietsch/vikus-viewer-data/blob/master/vangogh/config.json#L10)
