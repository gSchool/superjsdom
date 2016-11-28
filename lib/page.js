const JsDomStrategy = require('./strategies/jsdom')

module.exports = class Page {

  /**
   * Page constructor
   * @param {request} - a supertest request
   * @param {strategy} - the unerlying implementation of the methods here.  Defaults to JsDomStrategy
   */
  constructor(request, strategy = new JsDomStrategy(request)) {
    this.request = request
    this.promise = Promise.resolve()
    this.strategy = strategy
  }

  /**
   * Page constructor
   * @param {path} - a root-relative path in your app (such as `/pages/about`)
   * @returns {Page} - returns the page instance
   */
  visit(path) {
    this.promise = this.promise.then( () => {
      return this.strategy.visit(path, this.request)
    })
    return this
  }

  clickLink(text) {
    this.promise = this.promise.then( (doc) => {
      return this.strategy.clickLink(doc.$, text, this.request)
    })
    return this
  }

  fillIn(text, options) {
    this.promise = this.promise.then( (doc) => {
      this.strategy.fillIn(text, options, doc.$)
      return doc
    })
    return this
  }

  check(text) {
    this.promise = this.promise.then( (doc) => {
      this.strategy.check(text, doc.$)
      return doc
    })
    return this
  }

  select(text, options) {
    this.promise = this.promise.then( (doc) => {
      this.strategy.select(text, options, doc.$)
      return doc
    })
    return this
  }

  clickButton(text) {
    this.promise = this.promise.then( (doc) => {
      return this.strategy.clickButton(text, doc.$, this.request)
    })
    return this
  }

}
