import { beforeAll, beforeEach, describe, test, expect, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import print from '../../../../src/client/javascripts/print.js'

describe('print', () => {
  let printLink

  beforeAll(() => {
    const dom = new JSDOM()
    global.document = dom.window.document
    global.window = dom.window
  })

  beforeEach(() => {
    document.body.innerHTML = `
      <a id="print-link" href="#">print this page</a>
    `
    printLink = document.getElementById('print-link')
  })

  test('should add click listener to print link', () => {
    const addEventListenerSpy = vi.spyOn(printLink, 'addEventListener')

    print.init()

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    )
  })

  test('should call window.print and prevent default on click', () => {
    const preventDefault = vi.fn()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => { })

    print.init()

    const event = new window.Event('click', { bubbles: true, cancelable: true })
    event.preventDefault = preventDefault

    printLink.dispatchEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(printSpy).toHaveBeenCalled()

    printSpy.mockRestore()
  })
})
