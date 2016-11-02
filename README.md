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

<a name="Page"></a>

## Page
**Kind**: global class  

* [Page](#Page)
    * [new Page(request)](#new_Page_new)
    * [.visit(path)](#Page+visit) ⇒ <code>Promise</code>
    * [.validate($)](#Page+validate) ⇒ <code>Promise</code>
    * [.get(path)](#Page+get) ⇒ <code>Promise</code>
    * [.post(path, controls)](#Page+post) ⇒ <code>type</code>
    * [.clickLink(text)](#Page+clickLink) ⇒ <code>Promise</code>
    * [.fillIn(text, options)](#Page+fillIn) ⇒ <code>function</code>
    * [.check(text)](#Page+check) ⇒ <code>function</code>
    * [.clickButton(text)](#Page+clickButton) ⇒ <code>Promise</code>
    * [.select(text, options)](#Page+select) ⇒ <code>function</code>

<a name="new_Page_new"></a>

### new Page(request)
Represents a Page.


| Param | Type | Description |
| --- | --- | --- |
| request | <code>express</code> | an instance of the app wrapped in supertest |

<a name="Page+visit"></a>

### page.visit(path) ⇒ <code>Promise</code>
Page.prototype.visit - get a jsdom instance with jquery returned as a promise

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - a promise containing a jsdom object  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | the relative path |

<a name="Page+validate"></a>

### page.validate($) ⇒ <code>Promise</code>
Page.prototype.validate - A promise that validates the page against w3c standards

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - resolves the promise with the jsdom instance if there are no errors found, otherwise rejects with an object containing the errors  

| Param | Type | Description |
| --- | --- | --- |
| $ | <code>jsdom</code> | an instance of jsdom |

<a name="Page+get"></a>

### page.get(path) ⇒ <code>Promise</code>
Page.prototype.get - Sends a GET request to the path and resolves a promise with that object

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - resolves the promise with the response object, otherwise rejects it with an error  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | the path |

<a name="Page+post"></a>

### page.post(path, controls) ⇒ <code>type</code>
Page.prototype.post - Sends a post request with the data provided. This is typically used in conjunction with the clickButton method.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>type</code> - Resolves with a request object  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>type</code> | The path to send |
| controls | <code>type</code> | an object formatted as an array of objects controls containing a name and value. jQuery's .serializeArray function will format controls properly. |

<a name="Page+clickLink"></a>

### page.clickLink(text) ⇒ <code>Promise</code>
Page.prototype.clickLink - A thenable that visits a link by loading the href gotten by the text of the link.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - Returns the resolve or reject value of the promise returned by the visit method  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text of the link to be clicked |

<a name="Page+fillIn"></a>

### page.fillIn(text, options) ⇒ <code>function</code>
Page.prototype.fillIn - Fills in an input or textarea that is attached to a label

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - returns a function usable in a promise chain  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | the visible content of the label attached to the input via a `for` |
| options | <code>object</code> | the content - a string will be converted to an object with the format: { 'with': str } |

<a name="Page+check"></a>

### page.check(text) ⇒ <code>function</code>
Page.prototype.check - Checks a checkbox given the text of the checkbox

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - A function usable in a promise chain  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The visible content of the label associated with the checkbox |

<a name="Page+clickButton"></a>

### page.clickButton(text) ⇒ <code>Promise</code>
Page.prototype.clickButton - Submits a form by gathering form values and creating a post request

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - Returns a promise from the Post method  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The visible text of the submit button |

<a name="Page+select"></a>

### page.select(text, options) ⇒ <code>function</code>
Page.prototype.select - Selects an option from a select box based on the text of the option

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - a function usable in a promise chain  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The visible text of the label associated with the select box |
| options | <code>object</code> | an object to configure the selection -  - a string will be converted to an object with the format: { 'from': str } |


## Example

Here's an example of an exercise with some tests that check the DOM for the correct content.

```javascript
'use strict'
const expect = require('chai').expect;
const server = require('../mailMerge/app');
const request = require('supertest')(server);

describe("POST /", () => {
  it("When a user fills in the form and submits it, Then the values they filled in the form fields should remain filled-in", (done) => {
    let page = new Page(request)

    let recipTestVal = "Jean Luc,Picard,jeanluc.picard@federation.gov \r\n James,Riker,james.riker@federation.gov";
    let subjectTestVal = "Email Activation for #{first} #{last}";
    let bodyTestVal = "Hello Officer #{last}, your email: #{email} has been activated";

    return page.visit('/')
    .then(page.validate)
    .then(page.fillIn('Contacts', recipTestVal))
    .then(page.fillIn('Subject', subjectTestVal))
    .then(page.fillIn('Body', bodyTestVal))
    .then(page.clickButton('Preview'))
    .then(function ($) {

      expect($('[name=subject]').val()).to.contain(subjectTestVal)
      expect($('[name=recipients]').html()).to.contain(recipTestVal)
      expect($('[name=messageBody]').html()).to.contain(bodyTestVal)

      done();

    }).catch(function (err) {
      throw new Error(err);
    });
  });

```
