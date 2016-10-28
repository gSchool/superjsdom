# galvanize-superJSDOM

A simple, opinionated library for writing integration tests with Superagent and JSDOM.


### Description

This library is maintained for use by Galvanize instructors and curriculum developers to test student exercise code. It's designed to test simple applications written by junior developers by automating user actions, such as filling in a form and clicking a submit button. 

## Installation

```
npm install galvanize-superjsdom
```

## Usage

Include it in your test script, and it will attach itself to the global scope.

* `createPage(request)` - Takes a superagent request object, and returns a chainable promise interface

### Chainable methods on createPage

- `.visit(path)` - Sends an initial `GET` request to a page
- `.validate(input)` - Validates the page is W3C standards compliant
- `.get(path)` - sends a `GET` request
- `.post(path, controls)` - sends a `POST` request
- `.fillIn(text, options)` - Fills in an `input` or `textarea` with text, based on the content of it's `label` element
- `.check(text)` - Checks a checkbox based on the content of it's `label` element
- `.select(text, options)` - Selects a specific `option` from a `select` based on it's text
- `.clickLink(text)` - Finds a `<a>` based on the text inside the tag (case sensitive)
- `.clickButton(text)` - Clicks a `input[type=submit]` button (only) with the specified text, then gathers the nearest form values into a `POST` and sends it.


## Example

Here's an example of an exercise with some tests that check the DOM for the correct content.

```javascript
'use strict'
const expect = require('chai').expect;
const server = require('../mailMerge/app');
const request = require('supertest')(server);

describe("POST /", () => {
  it("When a user fills in the form and submits it, the values they filled in the form fields should remain filled in.", (done) => {
    let page = createPage(request);

    let recipTestVal = "Jean Luc,Picard,jeanluc.picard@federation.gov \r\n William,Riker,william.riker@federation.gov";
    let subjectTestVal = "Email Activation for #{first} #{last}";
    let bodyTestVal = "Hello Officer #{last}, your email: #{email} has been activated. Welcome to the federation!";

    return page.visit('/')
    .then(page.validate())
    .then(page.fillIn('Contacts', recipTestVal))
    .then(page.fillIn('Subject', subjectTestVal))
    .then(page.fillIn('Body', bodyTestVal))
    .then(page.clickButton('Preview'))
    .then(function ($) {

      expect($('[name=subject]').val()).to.contain(subjectTestVal)
      expect($('[name=recipients]').html()).to.contain(recipTestVal)
      expect($('[name=messageBody]').html()).to.contain(bodyTestVal)

      done();

    });
  });
});

```
