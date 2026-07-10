import { describe, test, beforeEach, beforeAll, afterEach, expect, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import cookies from '../../../../src/client/javascripts/cookies.js'

const dom = new JSDOM('', { url: 'http://localhost' })

describe('cookies', () => {
  let xhrMock

  beforeAll(() => {
    globalThis.document = dom.window.document
    globalThis.window = dom.window
    globalThis.location = dom.window.location
    globalThis.addEventListener = (...args) => dom.window.addEventListener(...args)
  })

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="js-cookies-container">
        <button class="js-cookies-button-accept">Accept</button>
        <button class="js-cookies-button-reject">Reject</button>
        <div class="js-cookies-accepted" hidden>
          <button class="js-hide">Hide</button>
        </div>
        <div class="js-cookies-rejected" hidden>
          <button class="js-hide">Hide</button>
        </div>
        <div class="js-cookies-banner"></div>
        <div class="js-question-banner"></div>
      </div>
      <a href="/cookies">Cookies</a>
      <a href="/privacy">Privacy</a>
      <a href="/accessibility">Accessibility</a>
    `
    cookies.init()

    xhrMock = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      send: vi.fn()
    }

    global.XMLHttpRequest = vi.fn(function () { return xhrMock })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  test('should show accepted banner and send correct data on accept', () => {
    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')

    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true })
    const preventDefault = vi.spyOn(window.MouseEvent.prototype, 'preventDefault')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(acceptedBanner.hasAttribute('hidden')).toBe(false)
    expect(acceptedBanner.focus).toHaveBeenCalled()
    expect(xhrMock.open).toHaveBeenCalledWith('POST', '/cookies', true)
    expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
    expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({ analytics: true, async: true }))
  })

  test('should show rejected banner and send correct data on reject', () => {
    const rejectButton = document.querySelector('.js-cookies-button-reject')
    const rejectedBanner = document.querySelector('.js-cookies-rejected')

    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true })
    const preventDefault = vi.spyOn(window.MouseEvent.prototype, 'preventDefault')
    rejectedBanner.focus = vi.fn()

    rejectButton.dispatchEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(rejectedBanner.hasAttribute('hidden')).toBe(false)
    expect(rejectedBanner.focus).toHaveBeenCalled()
    expect(xhrMock.open).toHaveBeenCalledWith('POST', '/cookies', true)
    expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
    expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({ analytics: false, async: true }))
  })

  test('should inject GTM script into document.head on accept when gtm key is set', () => {
    document.body.innerHTML = `
      <div class="js-cookies-container" data-gtm-key="GTM-TEST123">
        <button class="js-cookies-button-accept">Accept</button>
        <button class="js-cookies-button-reject">Reject</button>
        <div class="js-cookies-accepted" hidden>
          <button class="js-hide">Hide</button>
        </div>
        <div class="js-cookies-rejected" hidden>
          <button class="js-hide">Hide</button>
        </div>
        <div class="js-cookies-banner"></div>
        <div class="js-question-banner"></div>
      </div>
    `
    cookies.init()

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))

    const scripts = Array.from(document.head.querySelectorAll('script'))
    const gtmScript = scripts.find((s) => s.src.includes('GTM-TEST123'))
    expect(gtmScript).toBeDefined()
    expect(gtmScript.async).toBe(true)
  })

  test('should not inject GTM script when key has invalid format', () => {
    document.body.innerHTML = `
      <div class="js-cookies-container" data-gtm-key="invalid-key-format">
        <button class="js-cookies-button-accept">Accept</button>
        <button class="js-cookies-button-reject">Reject</button>
        <div class="js-cookies-accepted" hidden>
          <button class="js-hide">Hide</button>
        </div>
        <div class="js-cookies-rejected" hidden>
          <button class="js-hide">Hide</button>
        </div>
        <div class="js-cookies-banner"></div>
        <div class="js-question-banner"></div>
      </div>
    `
    cookies.init()

    const scriptsBefore = document.head.querySelectorAll('script').length
    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(document.head.querySelectorAll('script').length).toBe(scriptsBefore)
  })

  test('should not inject GTM script when no gtm key is set', () => {
    const scriptsBefore = document.head.querySelectorAll('script').length

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(document.head.querySelectorAll('script').length).toBe(scriptsBefore)
  })

  test('should delete GA cookies on reject', () => {
    document.cookie = '_ga=GA1.2.123456789.1234567890'
    document.cookie = '_gid=GA1.2.123456789'

    const rejectButton = document.querySelector('.js-cookies-button-reject')
    const rejectedBanner = document.querySelector('.js-cookies-rejected')
    rejectedBanner.focus = vi.fn()

    rejectButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(document.cookie).not.toContain('_ga=GA1')
    expect(document.cookie).not.toContain('_gid=GA1')
  })

  test('should not delete non-GA cookies on reject', () => {
    document.cookie = 'fcp_mpdp_cookie_policy=test'

    const rejectButton = document.querySelector('.js-cookies-button-reject')
    const rejectedBanner = document.querySelector('.js-cookies-rejected')
    rejectedBanner.focus = vi.fn()

    rejectButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(document.cookie).toContain('fcp_mpdp_cookie_policy=test')
  })

  test('should not redirect after XHR succeeds on accept', () => {
    const assignMock = vi.fn()
    vi.stubGlobal('location', { assign: assignMock })

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
    xhrMock.status = 200
    xhrMock.onload()

    expect(assignMock).not.toHaveBeenCalled()
  })

  test('should not redirect after XHR succeeds on reject', () => {
    const assignMock = vi.fn()
    vi.stubGlobal('location', { assign: assignMock, hostname: 'localhost' })

    const rejectButton = document.querySelector('.js-cookies-button-reject')
    const rejectedBanner = document.querySelector('.js-cookies-rejected')
    rejectedBanner.focus = vi.fn()

    rejectButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
    xhrMock.status = 200
    xhrMock.onload()

    expect(assignMock).not.toHaveBeenCalled()
  })

  test('should fall back to form submit on non-2xx response', () => {
    document.body.innerHTML = `
      <form action="/cookies" method="post" novalidate>
        <div class="js-cookies-container">
          <button class="js-cookies-button-accept">Accept</button>
          <button class="js-cookies-button-reject">Reject</button>
          <div class="js-cookies-accepted" hidden>
            <button class="js-hide">Hide</button>
          </div>
          <div class="js-cookies-rejected" hidden>
            <button class="js-hide">Hide</button>
          </div>
          <div class="js-cookies-banner"></div>
          <div class="js-question-banner"></div>
        </div>
      </form>
    `
    cookies.init()

    const form = document.querySelector('form')
    form.submit = vi.fn()

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
    xhrMock.status = 500
    xhrMock.onload()

    expect(form.submit).toHaveBeenCalled()
  })

  test('should fall back to form submit on network error', () => {
    document.body.innerHTML = `
      <form action="/cookies" method="post" novalidate>
        <div class="js-cookies-container">
          <button class="js-cookies-button-accept">Accept</button>
          <button class="js-cookies-button-reject">Reject</button>
          <div class="js-cookies-accepted" hidden>
            <button class="js-hide">Hide</button>
          </div>
          <div class="js-cookies-rejected" hidden>
            <button class="js-hide">Hide</button>
          </div>
          <div class="js-cookies-banner"></div>
          <div class="js-question-banner"></div>
        </div>
      </form>
    `
    cookies.init()

    const form = document.querySelector('form')
    form.submit = vi.fn()

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    acceptedBanner.focus = vi.fn()

    acceptButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
    xhrMock.onerror()

    expect(form.submit).toHaveBeenCalled()
  })

  test('should delete stale GA cookies when banner is not shown and GTM is not loaded', () => {
    document.body.innerHTML = '<p>No cookie banner here</p>'
    document.head.innerHTML = ''

    document.cookie = '_ga=GA1.2.123456789.1234567890'
    document.cookie = '_gid=GA1.2.123456789'

    cookies.init()

    expect(document.cookie).not.toContain('_ga=GA1')
    expect(document.cookie).not.toContain('_gid=GA1')
  })

  test('should not delete GA cookies when banner is not shown but GTM script is loaded', () => {
    document.body.innerHTML = '<p>No cookie banner</p>'
    document.head.innerHTML = ''

    document.cookie = '_ga=GA1.2.123456789.1234567890'

    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TEST123'
    document.head.appendChild(script)

    cookies.init()

    expect(document.cookie).toContain('_ga=GA1')
  })
})

describe('cookies — setupBfcacheGuard', () => {
  let reloadSpy
  let pageshowHandler

  beforeEach(() => {
    reloadSpy = vi.fn()
    vi.stubGlobal('location', { hostname: 'localhost', reload: reloadSpy })

    document.cookie = '_ga=GA1.2.123456789.1234567890'

    // Spy on addEventListener so we can capture the exact handler this
    // call registers, rather than dispatching an event that would trigger
    // all accumulated pageshow listeners from earlier tests.
    const addEventListenerSpy = vi.spyOn(dom.window, 'addEventListener')
    cookies.setupBfcacheGuard()
    const pageshowCall = addEventListenerSpy.mock.calls.find(([event]) => event === 'pageshow')
    pageshowHandler = pageshowCall?.[1]
    addEventListenerSpy.mockRestore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  test('reloads on bfcache restore (persisted = true)', () => {
    pageshowHandler({ persisted: true })
    expect(reloadSpy).toHaveBeenCalledOnce()
  })

  test('does not reload on normal page load (persisted = false)', () => {
    pageshowHandler({ persisted: false })
    expect(reloadSpy).not.toHaveBeenCalled()
  })

  test('clears GA cookies before reload on bfcache restore', () => {
    pageshowHandler({ persisted: true })
    expect(document.cookie).not.toContain('_ga=GA1')
  })
})
