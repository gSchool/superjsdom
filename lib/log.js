module.exports = function log(...messages) {
  if (process.env.DEBUG) {
    console.log(...messages)
  }
}
