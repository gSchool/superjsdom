const w3cjs = require('w3cjs')
const jsdom = require('jsdom')

const Promise = require("bluebird");
Promise.promisifyAll(jsdom);

global.Page = Page
global.jsdom = jsdom


/**
 * Represents a Page.
 * @constructor
 * @param {express} request - an instance of the app wrapped in supertest
 */
function Page(request) {
  this.request = request;
}


/**
 * Page.prototype.visit - get a jsdom instance with jquery returned as a promise
 *
 * @param  {string} path the relative path
 * @return {Promise}      a promise containing a jsdom object
 */
Page.prototype.visit = function(path) {
  this.path = path
  return this.get(path).then((res) => {
    return jsdom.envAsync(res.text, ["http://code.jquery.com/jquery.js"]).then((window) => {
      this.window = window;
      return window.$
    })
  })
}

/**
 * Page.prototype.validate - A promise that validates the page against w3c standards
 *
 * @param  {jsdom} $          an instance of jsdom
 * @return {Promise} resolves the promise with the jsdom instance if there are no errors found, otherwise rejects with an object containing the errors
 */
Page.prototype.validate = function($) {
  return new Promise((resolve, reject) => {
    w3cjs.validate({
      input: this.response.text,
      callback: (validationResponse) => {
        if (validationResponse.messages.length > 0 ) {
          reject({error: 'html errors have been found', results: validationResponse})
        };
        resolve($)
      }
    })
  })
}

/**
 * Page.prototype.get - Sends a GET request to the path and resolves a promise with that object
 *
 * @param  {string} path      the path
 * @return {Promise} resolves the promise with the response object, otherwise rejects it with an error
 */
Page.prototype.get = function(path) {
  return new Promise((resolve, reject) => {
    this.request
    .get(path)
    .expect(200)
    .end((err, res) => {
      if (err) reject(err);
      this.response = res;
      resolve(res);
    })
  })
}

/**
 * Page.prototype.post - Sends a post request with the data provided. This is typically used in conjunction with the clickButton method.
 *
 * @param  {string} path     The path to send
 * @param  {object} controls an object formatted as an array of objects controls containing a name and value. jQuery's .serializeArray function will format controls properly.
 * @return {Promise}          Resolves with a request object
 */
Page.prototype.post = function(path, controls) {
  return new Promise((resolve, reject) => {
    let thisRequest = this.request.post(path)
    thisRequest.type('form')

    controls.forEach((control) => {
      thisRequest.send(control.name+"="+control.value)
    })

    thisRequest
      .end((err, res) => {
        if (err) reject(err);
        this.response = res;
        resolve(res)
      })
  })
}

/**
 * Page.prototype.clickLink - A thenable that visits a link by loading the href gotten by the text of the link.
 *
 * @param  {string} text The text of the link to be clicked
 * @return {Promise}      Returns the resolve or reject value of the promise returned by the visit method
 */
Page.prototype.clickLink = function(text) {
  return ($) => {
    let $link = $(`a:contains("${text}")`)
    return this.visit($link.attr('href'))
  }
}

/**
 * Page.prototype.fillIn - Fills in an input or textarea that is attached to a label
 *
 * @param  {string} text   the visible content of the label attached to the input via a `for`
 * @param  {object} options the content - a string will be converted to an object with the format: { 'with': str }
 * @return {Function} returns a function usable in a promise chain
 */
Page.prototype.fillIn = function(text, options) {
  if (typeof options === 'string') options = { with: options };
  return ($) => {
    let $label = $(`label:contains("${text}")`)
    let $input = $(`input#${$label.attr('for')}`)
    $input.val(options.with)
    if ($input.length == 0) {
      let $input = $(`textarea#${$label.attr('for')}`)
      $input.html(options.with)
    }
    return $
  }
}

/**
 * Page.prototype.check - Checks a checkbox given the text of the checkbox
 *
 * @param  {string} text The visible content of the label associated with the checkbox
 * @return {function}      A function usable in a promise chain
 */
Page.prototype.check = function(text) {
  return ($) => {
    let $label = $(`label:contains("${text}")`)
    let $control
    if ($label.attr('for')) {
      $control = $(`input#${$label.attr('for')}`)
    } else {
      $control = $label.find(`input`)
    }
    if (!$control.val()) $control.val('on')
    $control.prop('checked', true).attr('checked', 'checked')
    return $
  }
}

/**
 * Page.prototype.clickButton - Submits a form by gathering form values and creating a post request
 *
 * @param  {string} text The visible text of the submit button
 * @return {Promise}      Returns a promise from the Post method
 */
Page.prototype.clickButton = function(text) {
  return ($) => {
    let $button = $(`input[type=submit][value="${text}"]`)
    if (!$button.length) {
      $button = $(`button:contains("${text}")`)
    }
    let $form = $button.closest('form')

    let path = $form.attr('action')
    return this.post(path, $form.serializeArray()).then(function (res) {
      if (res.status === 302) return visit(res.headers.location)
      this.response = res;
      return jsdom.envAsync(res.text, ["http://code.jquery.com/jquery.js"]).then((window) => {
        this.window = window;
        return window.$;
      })
    })
  }
}

/**
 * Page.prototype.select - Selects an option from a select box based on the text of the option
 *
 * @param  {string} text  The visible text of the label associated with the select box
 * @param  {object} options  an object to configure the selection -  - a string will be converted to an object with the format: { 'from': str }
 * @return {function}         a function usable in a promise chain
 */
Page.prototype.select = function(text, options) {
  return ($) => {
    if (typeof options === 'string') options = {'from' : options};
    let $label = $(`label:contains("${options.from}")`)
    let $select
    if ($label.attr('for')) {
      $select = $(`select#${$label.attr('for')}`)
    } else {
      $select = $label.find(`select`)
    }
    $select.find('option').removeAttr('selected')
    $select.find(`option:contains(${text})`).attr('selected', 'selected');
    return $
  }
}
