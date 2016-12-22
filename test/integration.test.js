const Page = require('../index')
const expect = require('chai').expect
const supertest = require('supertest')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

describe("Page", () => {

  let app

  beforeEach(() => {
    app = express()
  })

  describe("#visit", () => {

    let result

    before(() => {
      app = express()
      app.get('/', function (req, res) {
        res.sendFile('index.html', {root: path.join(__dirname, 'fixtures')})
      })

      const request = supertest(app)

      return new Page(request).visit("/")
        .promise
        .then((page) => {
          result = page
        })
    })

    it("visits the given path", () => {
      expect(result.$('h1').text()).to.equal(`This is the home page`)
    })

    it("runs JS on the page", () => {
      expect(result.$('h2').text()).to.equal(`Added via JavaScript`)
    })

    it("exposes useful properties in the final promise", () => {
      expect(result.window).to.be
      expect(result.$).to.be
      expect(result.response).to.be
    })

  })

  describe("#clickLink", () => {

    it("visits the href of the a with the given text", () => {
      app.get('/', (req, res) => {
        res.sendFile('index.html', {root: path.join(__dirname, 'fixtures')})
      })

      app.get('/about', (req, res) => {
        res.sendFile('about.html', {root: path.join(__dirname, 'fixtures')})
      })

      const request = supertest(app)
      const page = new Page(request)

      return page.visit('/')
        .clickLink('About Us')
        .promise
        .then((obj) => {
          expect(obj.$('h1').text()).to.equal(`This is the about page`)
        })

    })

  })

  describe("form submission", () => {

    beforeEach(() => {
      app.use(bodyParser.urlencoded({extended: false}))

      app.get('/', (req, res) => {
        res.sendFile('form.html', {root: path.join(__dirname, 'fixtures')})
      })

      app.post('/foo', (req, res) => {
        res.json(req.body)
      })
    })

    it("finds inputs by label text", () => {
      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .fillIn('First Name', 'Sue')
        .fillIn('Last Name', 'Sylvester')
        .clickButton('Submit Me')
        .promise
        .then((page) => {
          expect(page.response.body).to.deep.equal({
            characteristic: 'Cool',
            age: '20',
            first_name: 'Sue',
            last_name: 'Sylvester'
          })
        })

    })

    it("finds inputs by label nesting", () => {
      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .check('Check it out')
        .check('Has no value')
        .clickButton('Submit Me')
        .promise
        .then(function(page){
          expect(page.response.body).to.deep.equal({
            characteristic: 'Cool',
            age: '20',
            foobar: 'baz',
            novalue: 'on' ,
            first_name: '',
            last_name: '',
          })
        })
    })

    it("can select from dropdowns with option values, and from those without option values", () => {
      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .select('Thirty', {from: 'Age'})
        .select('Awesome', {from: 'Characteristic'})
        .clickButton('Submit Me')
        .promise
        .then(function(page){
          expect(page.response.body).to.deep.equal({
            characteristic: 'Awesome',
            age: '30',
            first_name: '',
            last_name: '',
          })
        })
    })

  })

  describe("waiting for time", function () {
    this.timeout(5000);
    beforeEach(() => {
      app.use(bodyParser.urlencoded({extended: false}))

      app.get('/', (req, res) => {
        res.sendFile('timer.html', {root: path.join(__dirname, 'fixtures')})
      })

    })

    it("can wait for some time to go by before firing a promise", () => {
      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .wait(3000)
        .promise
        .then(function(page){
          expect(page.$('#currentTime')).to.not.eq("(it's a timer page)");
        })

    })

    it("runs after the specified number of milliseconds-ish", () => {
      // ish?
      // Due to how javascript's event loop works, it would be difficult to both specify or test accuracy down to the millisecond
      // We should be able to test within 100 milliseconds fairly easily.
      const request = supertest(app)
      const page = new Page(request)
      return page.visit("/")
        .wait(1000)
        .promise
        .then(function(page){
          expect(parseInt(page.$('#currentTime').text())).to.be.at.least(5);
        })
    })
  })
})
