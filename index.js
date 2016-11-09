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

  // fillIn(text, options) {
  //   log("fillIn:register", text)
  //
  //   this.promises.push(() => {
  //     log("fillIn:complete", text)
  //     if (typeof options === 'string') options = { with: options };
  //     let $label = this.$(`label:contains("${text}")`)
  //     let $input = this.$(`input#${$label.attr('for')}`)
  //     $input.val(options.with)
  //     if ($input.length == 0) {
  //       let $input = this.$(`textarea#${$label.attr('for')}`)
  //       $input.html(options.with)
  //     }
  //
  //     return this
  //   })
  //
  //   return this
  // }

  // check(text) {
  //   log("check:register", text)
  //
  //   this.promises.push(() => {
  //     log("check:resolving", text)
  //     let $label = this.$(`label:contains("${text}")`)
  //     let $control
  //     if ($label.attr('for')) {
  //       $control = this.$(`input#${$label.attr('for')}`)
  //     } else {
  //       $control = $label.find(`input`)
  //     }
  //     if (!$control.val()) $control.val('on')
  //     $control.prop('checked', true).attr('checked', 'checked')
  //
  //     return this
  //   })
  //
  //   return this
  // }

  // clickButton(text) {
  //   log("clickButton:register", text)
  //
  //   this.promises.push(() => {
  //     log("clickButton:resolve", text)
  //     let $button = this.$(`input[type=submit][value="${text}"]`)
  //     if (!$button.length) {
  //       $button = this.$(`button:contains("${text}")`)
  //     }
  //     let $form = $button.closest('form')
  //
  //     let path = $form.attr('action')
  //     return this.post(path, $form.serializeArray()).then(() => {
  //       if (this.response.status === 302) return this.visit(this.response.headers.location)
  //       return this.jQueryify(this.response.text)
  //     })
  //   })
  //
  //   return this
  // }

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

  post(path, controls) {
    log("post:register", path)
    return new Promise((resolve, reject) => {
      let thisRequest = this.request.post(path)
      thisRequest.type('form')

      controls.forEach((control) => {
        thisRequest.send(control.name+"="+control.value)
      })

      thisRequest
        .end((err, res) => {
          if (err) reject(err);
          log("post:resolve", path)
          this.response = res;
          resolve(this)
        })
    })
  }

}

function visit(path, request) {
  return get(path, request).then((response) => {
    return jQueryify(response.text)
  })
}

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

function clickLink($, text, request) {
  let $link = $(`a:contains("${text}")`)
  return visit($link.attr('href'), request)
}


module.exports = Page;
