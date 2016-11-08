const Page = require('../index')
const expect = require('chai').expect
const supertest = require('supertest')
const express = require('express')
const path = require('path')

describe("Page", () => {

  describe("#visit", () => {

    it("visits the given path", () => {
      const app = express()
      app.get('/', function (req, res) {
        res.send(`Hello World!`)
      })

      const request = supertest(app)

      return new Page(request).visit("/")
        .then((page) => {
          expect(page.response.text).to.equal(`Hello World!`)
        })

    })

  })

  describe("#clickLink", () => {

    it("visits the href of the a with the given text", () => {
      const app = express()
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

})
