// christopher pietsch 2018
// cpietsch@gmail.com

const d3 = require("d3")
const fs = require('fs');
// const fsPromises = require('fs').promises
var path = require("path");
const glob = require('glob-promise');
const localPath = i => path.relative(process.cwd(), i)
const argv = require('minimist')(process.argv.slice(2));
const tf = require('@tensorflow/tfjs-node');
const UMAP = require("umap-js").UMAP
const {
  createCanvas,
  loadImage
} = require('canvas')
var ndjson = require('ndjson')

const canvas = createCanvas(224, 224)
const ctx = canvas.getContext('2d')
let mobilenet = null
console.log('starting with', process.argv);

const inputPath = argv.i;
const inputFormat = argv.f || 'jpg';


const loadActivation = () => {
  return new Promise(function(resolve){
    console.log("start")
    const out = []
    let i = 0
    const r = fs.createReadStream('activations.ndjson')
      .pipe(ndjson.parse())
      .on('data', function(obj) {
        // console.log(obj)
        // const o = { id: obj.id, activation: obj.activation.filter((d,i) => i % 10 == 0) }
        out.push(obj)
        i++;
        console.log(i)
        if(i >= 30000) {
          r.destroy()
          resolve(out)
        } 
      })
      .on('end', function(obj) {
        console.log("end")
        resolve(out)
      })
  })
}



const saveCsv = async (data, filename) => {
  const csv = d3.csvFormat(data)
  fs.writeFileSync(filename, csv);
}

async function run() {
  // todo load via tf
  // const MOBILENET_MODEL_PATH ='https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
  // mobilenet = await tf.loadLayersModel(MOBILENET_MODEL_PATH);
  // mobilenet = await require('@tensorflow-models/mobilenet').load()

  // const files = await glob(inputPath + '/*.' + inputFormat)
  // console.log(files)
  // console.log("found files", files.length)
  // const subset = files.filter((d, i) => i < 100)

  // const activations = await getActivations(files)
  // console.log("done activations", activations.length)
  // saveJson(activations)
  // let activations = require("./activations.json")
  const activations = await loadActivation()

  const tsne = makeUMAP(activations)
  saveCsv(tsne, "umapRaw.csv")
  const tsneSpaced = giveSpace(tsne)
  // console.log(tsneSpaced)
  saveCsv(tsneSpaced, "umap.csv")
  console.log("done")
}

function saveJson(data) {
  fs.writeFileSync("activations.json", JSON.stringify(data), "utf8")
}

function giveSpace(nodes) {
  console.log("running space distribution")
  const simulation = d3.forceSimulation(nodes)
    // .force("charge", d3.forceManyBody().strength(-0.0000002).distanceMin(0.001))
    .force("charge", d3.forceManyBody().strength(-0.0000001).distanceMin(0.0001))
    .force("center", d3.forceCenter(0.5, 0.5))
    //.on("tick", ()=> {  });
    .stop()

  //for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
  for (var i = 0; i < 100; ++i) {
    console.log("space tick", i)
    simulation.tick();
  }

  return nodes.map(d => {
    return {
      id: d.id,
      x: d.x,
      y: d.y
    }
  })
}


function makeUMAP(activations) {
  console.log("makeUMAP")
  const umap = new UMAP({
    nComponents: 2,
    nEpochs: 1000,
    nNeighbors: 20,
  });
  const nEpochs = umap.initializeFit(activations);
  for (var k = 0; k < nEpochs; k++) {
    console.log("Umap tick", k)
    umap.step();
  }

  const output = umap.getEmbedding();

  var xExtent = d3.extent(output, function (d) {
    return d[0]
  })
  var yExtent = d3.extent(output, function (d) {
    return d[1]
  })

  var x = d3.scaleLinear().range([0, 1]).domain(xExtent)
  var y = d3.scaleLinear().range([0, 1]).domain(yExtent)

  const outputScaled = output.map(function (d) {
    return [x(d[0]), y(d[1])]
  })

  const merged = activations.map((d, i) => {
    const coordinate = outputScaled[i]
    return {
      id: d.id,
      x: coordinate[0],
      y: coordinate[1]
    }
  })

  return merged
}


async function getActivations(files) {
  const pool = []
  for (let file of files) {
    const activation = await getActivation(file)
    const id = path.basename(file, '.' + inputFormat);
    if (activation) {
      pool.push({
        id,
        activation
      })
      console.log(file)
    } else {
      console.log("error with", file)
    }
  }
  return pool
}

async function getActivation(file) {
  try {
    const image = await loadImage(file)
    ctx.drawImage(image, 0, 0, 224, 224)
    const tensor = tf.browser.fromPixels(canvas);
    const preds = mobilenet.infer(tensor, "conv_preds");
    tensor.dispose();
    const result = Array.from(await preds.data());
    preds.dispose();

    return result
  } catch (e) {
    console.log(e)
    return null
  }
}

run()


