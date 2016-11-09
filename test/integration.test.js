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

    it("visits the given path", () => {
      app.get('/', function (req, res) {
        res.send(`Hello World!`)
      })

      const request = supertest(app)

      return new Page(request).visit("/")
        .then((page) => {
          expect(page.response.text).to.equal(`Hello World!`)
        })

    })

    it("runs JS on the page", () => {
      app.get('/', function (req, res) {
        res.sendFile('index.html', {root: path.join(__dirname, 'fixtures')})
      })

      const request = supertest(app)

      return new Page(request).visit("/")
        .then((page) => {
          expect(page.$('h2').text()).to.equal(`Added via JavaScript`)
        })

    })

  })

  describe("#clickLink", () => {

    it("visits the href of the a with the given text", () => {
      app.get('/', (req, res) => res.sendFile('index.html', {root: path.join(__dirname, 'fixtures')}))
      app.get('/about', (req, res) => res.sendFile('about.html', {root: path.join(__dirname, 'fixtures')}))

      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .then(page.clickLink('About Us'))
        .then((page) => {
          expect(page.$('h1').text()).to.equal(`This is the about page`)
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
        .then(page.fillIn('First Name', 'Sue'))
        .then(page.fillIn('Last Name', 'Sylvester'))
        .then(page.clickButton('Submit Me'))
        .then((page) => {
          expect(page.response.body).to.deep.equal({ first_name: 'Sue', last_name: 'Sylvester' })
        })

    })

    it("finds inputs by label nesting", () => {
      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .then(page.check('Check it out'))
        .then(page.check('Has no value'))
        .then(page.clickButton('Submit Me'))
        .then((page) => {
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
