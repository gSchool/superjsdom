# galvanize-superJSDOM

A simple, opinionated library for writing integration tests with Superagent and JSDOM.


### Description

This library is maintained for use by Galvanize instructors and curriculum developers to test student exercise code. It's designed to test simple applications written by junior developers by automating user actions, such as filling in a form and clicking a submit button.

## Installation

```
npm install galvanize-superjsdom
```

## Usage

Here's an example of an exercise with some tests that check the DOM for the correct content.

```javascript
'use strict'
const expect = require('chai').expect
const server = require('../app')
const request = require('supertest')(server)
const Page = require('galvanize-superjsdom')

describe("POST /", () => {
  it("can fill in forms", () => {
    const request = supertest(app)
    const page = new Page(request)

    return page.visit("/")
      .clickLink('New Person')
      .fillIn('First Name', 'Sue')
      .fillIn('Last Name', 'Sylvester')
      .check('Check it out')
      .select('Thirty', {from: 'Age'})
      .clickButton('Submit Me')
      .promise
      .then(function(page){

        // page.$ is a jQuery object representing the document
        expect(page.$("h1").text()).to.equal("It worked")

        // you can also access
        //
        //  - page.window
        //  - page.response.body
      })
  })

});
```

## Page
**Kind**: global class  

* [Page](#Page)
    * [new Page(request)](#new_Page_new)
    * [.visit(path)](#Page+visit) ⇒ <code>Page</code>
    * [.clickLink(text)](#Page+clickLink) ⇒ <code>Page</code>
    * [.fillIn(text, options)](#Page+fillIn) ⇒ <code>Page</code>
    * [.check(text)](#Page+check) ⇒ <code>Page</code>
    * [.clickButton(text)](#Page+clickButton) ⇒ <code>Page</code>
    * [.select(text, options)](#Page+select) ⇒ <code>Page</code>
    * [.wait(timeInMilliseconds)](#Page+wait) ⇒ <code>Page</code>
    * [.promise](#Page+promise) ⇒ <code>Promise</code>

<a name="new_Page_new"></a>

### new Page(request)
Represents a Page.

Requires an instance of an express server wrapped in supertest:
```
const server = require('../myApp/app');
const request = require('supertest')(server);
```

| Param   | Type                 | Description                                 |
|:--------|:---------------------|:--------------------------------------------|
| request | <code>express</code> | an instance of the app wrapped in supertest |

<a name="Page+visit"></a>

### page.visit(path) ⇒ <code>Promise</code>
Page.prototype.visit - get a jsdom instance with jquery returned as a promise

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - a promise containing a jsdom object  

| Param | Type                | Description       |
|:------|:--------------------|:------------------|
| path  | <code>string</code> | the relative path |

<a name="Page+validate"></a>

### page.validate($) ⇒ <code>Promise</code>
Page.prototype.validate - A promise that validates the page against w3c standards

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - resolves the promise with the jsdom instance if there are no errors found, otherwise rejects with an object containing the errors  

| Param | Type               | Description          |
|:------|:-------------------|:---------------------|
| $     | <code>jsdom</code> | an instance of jsdom |

<a name="Page+get"></a>

### page.get(path) ⇒ <code>Promise</code>
Page.prototype.get - Sends a GET request to the path and resolves a promise with that object

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - resolves the promise with the response object, otherwise rejects it with an error  

| Param | Type                | Description |
|:------|:--------------------|:------------|
| path  | <code>string</code> | the path    |

<a name="Page+post"></a>

### page.post(path, controls) ⇒ <code>Promise</code>
Page.prototype.post - Sends a post request with the data provided. This is typically used in conjunction with the clickButton method.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - Resolves with a request object  

| Param    | Type                | Description                                                                                                                                       |
|:---------|:--------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------|
| path     | <code>string</code> | The path to send                                                                                                                                  |
| controls | <code>object</code> | an object formatted as an array of objects controls containing a name and value. jQuery's .serializeArray function will format controls properly. |

<a name="Page+clickLink"></a>

### page.clickLink(text) ⇒ <code>Promise</code>
Page.prototype.clickLink - A thenable that visits a link by loading the href gotten by the text of the link.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - Returns the resolve or reject value of the promise returned by the visit method  

| Param | Type                | Description                        |
|:------|:--------------------|:-----------------------------------|
| text  | <code>string</code> | The text of the link to be clicked |

<a name="Page+fillIn"></a>

### page.fillIn(text, options) ⇒ <code>function</code>
Page.prototype.fillIn - Fills in an input or textarea that is attached to a label

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - returns a function usable in a promise chain  

| Param   | Type                | Description                                                                            |
|:--------|:--------------------|:---------------------------------------------------------------------------------------|
| text    | <code>string</code> | the visible content of the label attached to the input via a `for`                     |
| options | <code>object</code> | the content - a string will be converted to an object with the format: { 'with': str } |

<a name="Page+check"></a>

### page.check(text) ⇒ <code>function</code>
Page.prototype.check - Checks a checkbox given the text of the checkbox

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - A function usable in a promise chain  

| Param | Type                | Description                                                   |
|:------|:--------------------|:--------------------------------------------------------------|
| text  | <code>string</code> | The visible content of the label associated with the checkbox |

<a name="Page+clickButton"></a>

### page.clickButton(text) ⇒ <code>Promise</code>
Page.prototype.clickButton - Submits a form by gathering form values and creating a post request

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>Promise</code> - Returns a promise from the Post method  

| Param | Type                | Description                           |
|:------|:--------------------|:--------------------------------------|
| text  | <code>string</code> | The visible text of the submit button |

<a name="Page+select"></a>

### page.select(text, options) ⇒ <code>function</code>
Page.prototype.select - Selects an option from a select box based on the text of the option

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - a function usable in a promise chain  

| Param   | Type                | Description                                                                                                        |
|:--------|:--------------------|:-------------------------------------------------------------------------------------------------------------------|
| text    | <code>string</code> | The visible text of the label associated with the select box                                                       |
| options | <code>object</code> | an object to configure the selection -  - a string will be converted to an object with the format: { 'from': str } |


### page.wait(timeInMilliseconds) ⇒ <code>function</code>
Page.prototype.time - waits for roughly the amount of milliseconds to pass before resolving the next promise

It's important to note that the time the promise actually executes after may be a bit longer than the amount of time specified, due to javascript's event loop not actually interrupting currently executing code. For instance, this method won't interrupt an infinite loop.

**Kind**: instance method of <code>[Page](#Page)</code>  
**Returns**: <code>function</code> - a function usable in a promise chain  

| Param   | Type                | Description                                                                                                        |
|:--------|:--------------------|:-------------------------------------------------------------------------------------------------------------------|
| text    | <code>string</code> | The visible text of the label associated with the select box                                                       |
| options | <code>object</code> | an object to configure the selection -  - a string will be converted to an object with the format: { 'from': str } |

## Contributing

- Clone this repo
- Run `yarn` to install dependencies
- Run `npm test` to run tests
- Run `DEBUG=true npm test` to run tests
