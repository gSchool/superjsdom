const log = require('../log')
const jsdom = require('jsdom')

module.exports = class JsDomStrategy {

  visit(path, request) {
    log("visit:register", path)
    return this.get(path, request).then((response) => {
      log("visit:get:complete", path)
      return this.jQueryify(response.text).then((doc) => {
        log("visit:jquery:complete", path)
        return Object.assign({}, doc, {response})
      })
    })
  }

  clickButton(text, $, request) {
    log("clickButton:resolve", text)
    let $button = $(`input[type=submit][value="${text}"]`)
    if (!$button.length) {
      $button = $(`button:contains("${text}")`)
    }
    let $form = $button.closest('form')

    let path = $form.attr('action')

    return this.post(path, $form.serializeArray(), request).then((response) => {
      if (response.status === 302) return this.visit(response.headers.location)
      return this.jQueryify(response.text).then((doc) => {
        return Object.assign({}, doc, {response})
      })
    })
  }

  clickLink($, text, request) {
    let $link = $(`a:contains("${text}")`)
    return this.visit($link.attr('href'), request)
  }

  get(path, request) {
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

  post(path, controls, request) {
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

  fillIn(text, options, $) {
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

  check(text, $) {
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

  select(text, options, $) {
    if (typeof options === 'string') options = {from: options};
    let $label = $(`label:contains("${options.from}")`)
    let $select
    if ($label.attr('for')) {
      $select = $(`select#${$label.attr('for')}`)
    } else {
      $select = $label.find(`select`)
    }
    $select.find('option').removeAttr('selected')
    const $option = $select.find(`option:contains(${text})`)
    $select.val($option.val())
  }

  jQueryify(text) {
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

}
