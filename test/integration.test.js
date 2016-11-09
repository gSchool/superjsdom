const Page = require('../index')
const expect = require('chai').expect
const supertest = require('supertest')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const jsdom = require('jsdom')

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
          expect(page.response.body).to.deep.equal({ first_name: 'Sue', last_name: 'Sylvester' })
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
            foobar: 'baz',
            novalue: 'on' ,
            first_name: '',
            last_name: '',
          })
        })
    })

  })

})
