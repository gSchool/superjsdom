const Page = require('../index')
const expect = require('chai').expect
const supertest = require('supertest')
const express = require('express')

describe("Page", () => {

  describe("#visit", () => {

    it("works", () => {
      const app = express()
      app.get('/', function (req, res) {
        res.send(`Hello World!`)
      })

      const request = supertest(app)
      const page = new Page(request)

      return page.visit("/")
        .then((result) => {
          expect(result.response.text).to.equal(`Hello World!`)
        })

    })

  })

})
