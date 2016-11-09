const w3cjs = require('w3cjs')
const jsdom = require('jsdom')

const Promise = require("bluebird");
Promise.promisifyAll(jsdom);

// Utility method to log only in debug mode
function log(...messages) {
  if (process.env.DEBUG) {
    console.log(...messages)
  }
}

class Page {

  constructor(request) {
    this.request = request
    this.promise = Promise.resolve()
  }

  visit(path) {
    this.promise = this.promise.then( () => visit(path, this.request) )
    return this
  }

  clickLink(text) {
    this.promise = this.promise.then( (obj) => clickLink(obj.$, text, this.request) )
    return this
  }

  fillIn(text, options) {
    this.promise = this.promise.then( (obj) => {
      fillIn(text, options, obj.$)
      return obj
    })
    return this
  }

  check(text) {
    this.promise = this.promise.then( (obj) => {
      check(text, obj.$)
      return obj
    })
    return this
  }

  clickButton(text) {
    this.promise = this.promise.then( (obj) => {
      return clickButton(text, obj.$, this.request)
    })
    return this
  }

  // select(text, options) {
  //   let $ = this.$
  //   return () => {
  //     if (typeof options === 'string') options = {'from' : options};
  //     let $label = this.$(`label:contains("${options.from}")`)
  //     let $select
  //     if ($label.attr('for')) {
  //       $select = this.$(`select#${$label.attr('for')}`)
  //     } else {
  //       $select = $label.find(`select`)
  //     }
  //     $select.find('option').removeAttr('selected')
  //     $select.find(`option:contains(${text})`).attr('selected', 'selected');
  //     return this
  //   }
  // }

  // validate() {
  //   return new Promise((resolve, reject) => {
  //     w3cjs.validate({
  //       input: this.response.text,
  //       callback: (validationResponse) => {
  //         if (validationResponse.messages.length > 0 ) {
  //           reject({error: 'html errors have been found', results: validationResponse})
  //         };
  //         resolve(this)
  //       }
  //     })
  //   })
  // }

}

function visit(path, request) {
  return get(path, request).then((response) => {
    return jQueryify(response.text).then((obj) => {
      return Object.assign({}, obj, {response})
    })
  })
}

function clickButton(text, $, request) {
  log("clickButton:resolve", text)
  let $button = $(`input[type=submit][value="${text}"]`)
  if (!$button.length) {
    $button = $(`button:contains("${text}")`)
  }
  let $form = $button.closest('form')

  let path = $form.attr('action')
  return post(path, $form.serializeArray(), request).then((response) => {
    if (response.status === 302) return visit(response.headers.location)
    return jQueryify(response.text).then((obj) => {
      return Object.assign({}, obj, {response})
    })
  })
}

function clickLink($, text, request) {
  let $link = $(`a:contains("${text}")`)
  return visit($link.attr('href'), request)
}

// CORE REQUEST

function get(path, request) {
  log("get:register", path)
  return new Promise((resolve, reject) => {
    request
      .get(path)
      .expect(200)
      .end((err, res) => {
        if (err) reject(err);
        log("get:resolve", path)
        resolve(res);
      })
  })
}

function post(path, controls, request) {
  log("post:register", path)
  return new Promise((resolve, reject) => {
    let thisRequest = request.post(path)
    thisRequest.type('form')

    controls.forEach((control) => {
      thisRequest.send(control.name+"="+control.value)
    })

    thisRequest
      .end((err, res) => {
        if (err) reject(err);
        log("post:resolve", path)
        resolve(res)
      })
  })
}

// NOT PROMISES

function fillIn(text, options, $) {
  log("fillIn:complete", text)
  if (typeof options === 'string') options = { with: options };
  let $label = $(`label:contains("${text}")`)
  let $input = $(`input#${$label.attr('for')}`)
  $input.val(options.with)
  if ($input.length == 0) {
    let $input = $(`textarea#${$label.attr('for')}`)
    $input.html(options.with)
  }
}

function check(text, $) {
  log("check:resolving", text)
  let $label = $(`label:contains("${text}")`)
  let $control
  if ($label.attr('for')) {
    $control = $(`input#${$label.attr('for')}`)
  } else {
    $control = $label.find(`input`)
  }
  if (!$control.val()) $control.val('on')
  $control.prop('checked', true).attr('checked', 'checked')
}

// UTILITY

function jQueryify(text) {
  log("jquerify:register")
  const window = jsdom.jsdom(text, {  }).defaultView;
  return new Promise((resolve, reject) => {
    jsdom.jQueryify(window, "http://code.jquery.com/jquery.js", () => {
      log("jquerify:resolve")
      resolve({
        window,
        $: window.$
      })
    });
  })
}

module.exports = Page;
