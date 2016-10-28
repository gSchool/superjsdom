const w3cjs = require('w3cjs')
const cheerio = require('cheerio')
const expect = require('chai').expect

global.createPage = createPage
global.cheerio = cheerio
global.expect = expect

function createPage(request) {

  return {
    visit,
    get,
    post,
    validate,
    clickLink,
    clickButton,
    fillIn,
    select,
    check,
  }

  function visit(path) {
    this.path = path
    return get(path).then(function (html) {
      return cheerio.load(html)
    })
  }

  function validate(input) {
    return new Promise((resolve, reject) => {
      w3cjs.validate({
        input,
        callback: function (validationResponse) {
          if (validationResponse.messages.length > 0 ) {
            reject({error: 'html errors have been found', results: validationResponse})
          };
          resolve(input)
        }
      })
    })
  }

  function get(path) {
    return new Promise((resolve, reject) => {
      request
      .get(path)
      .expect(200)
      .end(function(err, res) {
        if (err) reject(err);
        resolve(res.text)
      })
    })
  }

  function post(path, controls) {
    return new Promise((resolve, reject) => {
      let thisRequest = request.post(path)
      thisRequest.type('form')

      controls.forEach((control) => {
        thisRequest.send(control.name+"="+control.value)
      })

      thisRequest
        .end(function(err, res) {
          if (err) reject(err);
          resolve(res)
        })
    })
  }

  function clickLink(text) {
    return function ($) {
      let $link = $(`a:contains("${text}")`)
      return visit($link.attr('href'))
    }
  }

  function fillIn(text, options) {
    if (typeof options === 'string') options = { with: options };
    return function ($) {
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

  function check(text) {
    return function ($) {
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

  function clickButton(text) {
    return function ($) {
      let $button = $(`input[type=submit][value="${text}"]`)
      if (!$button.length) {
        $button = $(`button:contains("${text}")`)
      }
      let $form = $button.closest('form')

      let path = $form.attr('action')
      return post(path, $form.serializeArray()).then(function (res) {
        if (res.status === 302) return visit(res.headers.location)
        return cheerio.load(res.text)
      })
    }
  }

  function select(text, options) {
    return function ($) {
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

}
