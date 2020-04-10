exports.createPath = function createPath(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path)
  return path;
}