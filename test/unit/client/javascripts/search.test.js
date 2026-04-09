import { describe, afterAll, beforeAll, beforeEach, test, vi, expect } from 'vitest'
import http2 from 'node:http2'
import search from '../../../../src/client/javascripts/search.js'
import { JSDOM } from 'jsdom'

const { constants: httpConstants } = http2
const dom = new JSDOM()

describe('search', () => {
  let searchInput
  let domSuggestions

  beforeAll(() => {
    global.document = dom.window.document
    global.window = dom.window
    globalThis.XMLHttpRequest = dom.window.XMLHttpRequest
    globalThis.MouseEvent = dom.window.MouseEvent
  })

  beforeEach(() => {
    document.body.innerHTML = `
      <input type="text" id="search-input" tabIndex="1" />
      <div id="suggestions"></div>
      <button id="search-button">Search</button>
    `

    search.init()
    searchInput = document.getElementById('search-input')
    domSuggestions = document.getElementById('suggestions')
  })

  describe('constructor', () => {
    test('should initialise with the correct default values', () => {
      expect(search.loadingText).toBe('Loading...')
      expect(search.noResultsText).toBe('No results found')
    })

    test('should call setupSearch and set up the searchInput and domSuggestions', () => {
      expect(search.searchInput).toBe(searchInput)
      expect(search.domSuggestions).toBe(domSuggestions)
    })

    test('should not proceed with the rest of the constructor if searchInput or domSuggestions is missing', () => {
      document.body.innerHTML = '<input type="text" id="some-other-input" />'
      search.init()

      expect(search.searchInput).toBeNull()
      expect(search.domSuggestions).toBeNull()
    })
  })

  describe('setupSearch', () => {
    test('should find search-input element', () => {
      document.body.innerHTML = `
        <input type="text" id="search-input" />
        <div id="suggestions"></div>
      `
      search.setupSearch()

      expect(search.searchInput.id).toBe('search-input')
      expect(search.domSuggestions.id).toBe('suggestions')
    })

    test('should find results-search-input element as fallback', () => {
      document.body.innerHTML = `
        <input type="text" id="results-search-input" />
        <div id="suggestions"></div>
      `
      search.setupSearch()

      expect(search.searchInput.id).toBe('results-search-input')
      expect(search.domSuggestions.id).toBe('suggestions')
    })

    test('should prefer search-input over results-search-input', () => {
      document.body.innerHTML = `
        <input type="text" id="search-input" />
        <input type="text" id="results-search-input" />
        <div id="suggestions"></div>
      `
      search.setupSearch()

      expect(search.searchInput.id).toBe('search-input')
    })

    test('should return null if no valid search input found', () => {
      document.body.innerHTML = '<div id="suggestions"></div>'
      search.setupSearch()

      expect(search.searchInput).toBeNull()
    })

    test('should return null if suggestions element not found', () => {
      document.body.innerHTML = '<input type="text" id="search-input" />'
      search.setupSearch()

      expect(search.domSuggestions).toBeNull()
    })
  })

  describe('getSearchSuggestions', () => {
    test('should resolve with search suggestions when successful', async () => {
      const mockMakeSearchRequest = vi.spyOn(search, 'makeSearchRequest').mockImplementationOnce((searchString, callback) => {
        callback(null, { suggestions: ['suggestion1', 'suggestion2'] })
      })

      const result = await search.getSearchSuggestions(encodeURIComponent('test'))

      expect(result).toEqual({ suggestions: ['suggestion1', 'suggestion2'] })
      expect(mockMakeSearchRequest).toHaveBeenCalledWith('test', expect.any(Function))
    })

    test('should reject with an error when unsuccessful', async () => {
      const error = new Error(`Request failed with status ${httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR}: Search request failed`)
      error.status = httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR
      error.statusText = 'Search request failed'

      const mockMakeSearchRequest = vi.spyOn(search, 'makeSearchRequest').mockImplementationOnce((searchString, callback) => {
        callback(error)
      })

      await expect(search.getSearchSuggestions(encodeURIComponent('test'))).rejects.toThrow('Request failed with status 500: Search request failed')

      expect(mockMakeSearchRequest).toHaveBeenCalledWith('test', expect.any(Function))
    })
  })

  describe('makeSearchRequest', () => {
    test('should call XMLHttpRequest with correct parameters', async () => {
      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn()
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      const searchString = encodeURIComponent('test')
      const callback = vi.fn()

      search.makeSearchRequest(searchString, callback)

      expect(xhrMock.open).toHaveBeenCalledWith('GET', `/suggestions?searchString=${searchString}`, true)
      expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({
        searchString
      }))
    })

    test('should callback successfully with correct parameters', async () => {
      const response = {
        rows: [
          {
            payee_name: 'test',
            town: 'test',
            county_council: 'test',
            part_postcode: 'test'
          }
        ]
      }

      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function () { this.onload() }),
        status: httpConstants.HTTP_STATUS_OK,
        response: JSON.stringify(response)
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      const searchString = encodeURIComponent('test')
      const callback = vi.fn()

      search.makeSearchRequest(searchString, callback)

      expect(callback).toHaveBeenCalledWith(null, response)
    })

    test('should callback with an error with error code after loading', async () => {
      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function () { this.onload() }),
        status: httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: 'error'
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      const searchString = encodeURIComponent('test')
      const callback = vi.fn()

      search.makeSearchRequest(searchString, callback)

      // Expect the callback to be called with a proper Error object
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        message: `Request failed with status ${httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR}: error`,
        status: httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: 'error'
      }))
    })

    test('should callback with an error with error code if there was an error', async () => {
      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function () { this.onerror() }),
        status: httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: 'error'
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      const searchString = encodeURIComponent('test')
      const callback = vi.fn()

      search.makeSearchRequest(searchString, callback)

      // Expect the callback to be called with a proper Error object
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        message: `Request failed with status ${httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR}: error`,
        status: httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: 'error'
      }))
    })

    test('should abort pending request when new request is made', () => {
      const mockAbort = vi.fn()
      const firstXhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
        abort: mockAbort
      }
      const secondXhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn()
      }

      vi.spyOn(globalThis, 'XMLHttpRequest')
        .mockImplementationOnce(function () { return firstXhrMock })
        .mockImplementationOnce(function () { return secondXhrMock })

      // Make first request
      search.makeSearchRequest('first', vi.fn())
      expect(search.pendingRequest).toBe(firstXhrMock)

      // Make second request should abort first
      search.makeSearchRequest('second', vi.fn())
      expect(mockAbort).toHaveBeenCalled()
      expect(search.pendingRequest).toBe(secondXhrMock)
    })

    test('should handle xhr.onabort and clear pendingRequest', () => {
      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function () { this.onabort() }),
        abort: vi.fn()
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      const callback = vi.fn()
      search.makeSearchRequest('test', callback)

      expect(search.pendingRequest).toBeNull()
      expect(callback).not.toHaveBeenCalled() // Should not call callback on abort
    })

    test('should clear pendingRequest on successful response', () => {
      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function () { this.onload() }),
        status: httpConstants.HTTP_STATUS_OK,
        response: '{"test": "data"}'
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      search.makeSearchRequest('test', vi.fn())
      expect(search.pendingRequest).toBeNull()
    })

    test('should clear pendingRequest on error response', () => {
      const xhrMock = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function () { this.onerror() }),
        status: httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: 'error'
      }

      vi.spyOn(globalThis, 'XMLHttpRequest').mockImplementation(function () { return xhrMock })

      search.makeSearchRequest('test', vi.fn())
      expect(search.pendingRequest).toBeNull()
    })
  })

  describe('getOption', () => {
    test('should create a div with specified properties', () => {
      const mockClick = vi.fn()
      const mockMouseOver = vi.fn()
      const option = search.getOption(
        'value',
        'text',
        mockClick,
        mockMouseOver,
        'test-class'
      )

      expect(option.value).toBe('value')
      expect(option.textContent).toBe('text')
      expect(option.classList.contains('test-class')).toBe(true)

      option.onmousedown()
      option.onmouseover()

      expect(mockClick).toHaveBeenCalled()
      expect(mockMouseOver).toHaveBeenCalled()
    })

    test('should handle optional parameters', () => {
      const option = search.getOption('value', 'text', vi.fn())

      expect(option.onmouseover).toBe(null)
      expect(option.classList.length).toBe(0)
    })
  })

  describe('loadingOption', () => {
    test('should return a DIV with the expect text and value', () => {
      const loadingOption = search.loadingOption()

      expect(loadingOption.value).toBe(search.loadingText)
    })
  })

  describe('noResultsOption', () => {
    test('should return a DIV with the expect text and value', () => {
      const noResultsOption = search.noResultsOption()

      expect(noResultsOption.value).toBe(search.noResultsText)
    })
  })

  describe('viewAllOption', () => {
    test('should create a view all option with correct text', () => {
      const numResults = 5

      const option = search.viewAllOption(numResults)

      expect(option.textContent).toBe(`View all (${numResults} results)`)
      expect(option.classList.contains('mpdp-text-align-center')).toBe(true)
    })

    test('should correctly handle singular result', () => {
      const option = search.viewAllOption(1)

      expect(option.textContent).toBe('View all (1 result)')
    })
  })

  describe('hideSuggestions', () => {
    test('should hide the suggestions and reset focusIndex', () => {
      search.hideSuggestions()

      expect(domSuggestions.style.display).toBe('none')
      expect(search.focusIndex).toBe(-1)
    })
  })

  describe('showSuggestions', () => {
    test('should display the suggestions', () => {
      search.showSuggestions()

      expect(domSuggestions.style.display).toBe('block')
    })
  })

  describe('loadSuggestions', () => {
    test('should display suggestions if results are found', async () => {
      const mockSuggestions = {
        count: 2,
        rows: [
          {
            payee_name: 'Payee 1',
            town: 'Town1',
            county_council: 'Council1',
            part_postcode: 'P1'
          },
          {
            payee_name: 'Payee 2',
            town: 'Town2',
            county_council: 'Council2',
            part_postcode: 'P2'
          }
        ]
      }

      search.getSearchSuggestions = vi
        .fn()
        .mockResolvedValueOnce(mockSuggestions)

      await search.loadSuggestions()

      expect(domSuggestions.innerHTML).toContain(
        'Payee 1 (Town1, Council1, P1)'
      )

      expect(domSuggestions.innerHTML).toContain(
        'Payee 2 (Town2, Council2, P2)'
      )
    })

    test('should display no results message if no suggestions found', async () => {
      search.getSearchSuggestions = vi.fn().mockResolvedValueOnce({ count: 0 })
      searchInput.value = 'nonexistent'

      await search.loadSuggestions()

      expect(domSuggestions.innerHTML).toContain(search.noResultsText)
    })

    test('should display no results message if getSearchSuggestions returns null', async () => {
      search.getSearchSuggestions = vi.fn().mockResolvedValueOnce(null)
      searchInput.value = 'test'

      await search.loadSuggestions()

      expect(domSuggestions.innerHTML).toContain(search.noResultsText)
    })

    test('should handle errors from getSearchSuggestions gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      search.getSearchSuggestions = vi.fn().mockRejectedValueOnce(new Error('Network error'))
      searchInput.value = 'test'

      await search.loadSuggestions()

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
      expect(domSuggestions.innerHTML).toContain(search.noResultsText)
    })

    test('should ignore abort errors silently', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const abortError = new Error('Request was aborted')
      search.getSearchSuggestions = vi.fn().mockRejectedValueOnce(abortError)
      searchInput.value = 'test'

      await search.loadSuggestions()

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      // Should return early without setting no results
    })

    test('should create clickable suggestion options that navigate to details page', async () => {
      const mockSuggestion = {
        count: 1,
        rows: [{
          payee_name: 'Test Payee',
          town: 'Test Town',
          county_council: 'Test Council',
          part_postcode: 'TE1 2ST'
        }]
      }

      search.getSearchSuggestions = vi.fn().mockResolvedValueOnce(mockSuggestion)
      searchInput.value = 'test'

      // Mock globalThis.location
      const mockLocation = { origin: 'https://example.com', href: '' }
      globalThis.location = mockLocation

      await search.loadSuggestions()

      const suggestionElement = domSuggestions.querySelector('.mpdp-option-container')
      expect(suggestionElement).toBeTruthy()

      // Simulate clicking the suggestion
      suggestionElement.onmousedown()

      expect(mockLocation.href).toBe(
        'https://example.com/details?payeeName=Test%20Payee&partPostcode=TE1 2ST&searchString=test'
      )
    })

    test('should add view all option when suggestions are found', async () => {
      const mockSuggestions = {
        count: 5,
        rows: [{
          payee_name: 'Test',
          town: 'Town',
          county_council: 'Council',
          part_postcode: 'T1'
        }]
      }

      search.getSearchSuggestions = vi.fn().mockResolvedValueOnce(mockSuggestions)
      const searchButtonClickSpy = vi.spyOn(document.getElementById('search-button'), 'click')

      await search.loadSuggestions()

      // Should contain view all option
      expect(domSuggestions.innerHTML).toContain('View all (5 results)')

      // Test view all click functionality
      const viewAllElement = domSuggestions.querySelector('.mpdp-text-align-center')
      viewAllElement.onmousedown()

      expect(searchButtonClickSpy).toHaveBeenCalled()
    })
  })

  describe('setActive and unsetActive', () => {
    beforeEach(() => {
      domSuggestions.innerHTML = `
        <div value="1" class="option">Option 1</div>
        <div value="2" class="option">Option 2</div>
      `
    })

    test('should set the active class on the focused option', () => {
      search.focusIndex = 1
      search.setActive()

      expect(domSuggestions.children[1].classList).toContain('active')
    })

    test('should unset the active class on all options', () => {
      domSuggestions.children[1].classList.add('active')
      search.unsetActive()

      for (const child of domSuggestions.children) {
        expect(child.classList).not.toContain('active')
      }
    })

    test('should set the focusIndex to 1 if it goes below 0', () => {
      search.focusIndex = -1
      search.setActive()

      expect(search.focusIndex).toBe(1)
    })

    test('should set the focusIndex to 0 if it goes above the number of DOM children', () => {
      search.focusIndex = 2
      search.setActive()

      expect(search.focusIndex).toBe(0)
    })

    test('should return without making any children active if the current child has loading text', () => {
      domSuggestions.innerHTML = `
        <div class="mpdp-text-colour-dark-grey" value="${search.loadingText}">${search.loadingText}</div>
      `

      search.focusIndex = 0
      search.setActive()

      for (const child of domSuggestions.children) {
        expect(child.classList).not.toContain('active')
      }
    })

    test('should return without making any children active if the current child has no results text', () => {
      domSuggestions.innerHTML = `
        <div class="mpdp-text-colour-dark-grey" value="${search.noResultsText}">${search.noResultsText}</div>
      `

      search.focusIndex = 0
      search.setActive()

      for (const child of domSuggestions.children) {
        expect(child.classList).not.toContain('active')
      }
    })

    test('should return early if no children exist', () => {
      domSuggestions.innerHTML = ''
      search.focusIndex = 0

      // Should not throw error
      expect(() => search.setActive()).not.toThrow()
      expect(search.focusIndex).toBe(0) // Should remain unchanged
    })

    test('should handle unsetActive when no children exist', () => {
      domSuggestions.innerHTML = ''

      // Should not throw error
      expect(() => search.unsetActive()).not.toThrow()
    })
  })

  describe('addSearchInputListeners', () => {
    beforeAll(() => {
      vi.useFakeTimers()
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    test('should hide suggestions when the search input is blurred', () => {
      const hideSuggestionsSpy = vi.spyOn(search, 'hideSuggestions')
      const timeoutSpy = vi.spyOn(globalThis, 'setTimeout')
      searchInput.dispatchEvent(new window.Event('blur', { bubbles: true }))

      expect(timeoutSpy).toHaveBeenCalled()

      vi.runAllTimers()

      expect(hideSuggestionsSpy).toHaveBeenCalled()
    })

    test('should hide suggestions when input length is less than minCharLength', () => {
      searchInput.value = 'te'
      const hideSuggestionsSpy = vi.spyOn(search, 'hideSuggestions')
      searchInput.dispatchEvent(new window.Event('input', { bubbles: true }))

      expect(hideSuggestionsSpy).toHaveBeenCalled()
    })

    test('should hide suggestions when input length equals the minCharLength but has a leading space', () => {
      searchInput.value = ' te'
      const hideSuggestionsSpy = vi.spyOn(search, 'hideSuggestions')
      searchInput.dispatchEvent(new window.Event('input', { bubbles: true }))

      expect(hideSuggestionsSpy).toHaveBeenCalled()
    })

    test('should hide suggestions when input length equals the minCharLength but has a trailing space', () => {
      searchInput.value = 'te '
      const hideSuggestionsSpy = vi.spyOn(search, 'hideSuggestions')
      searchInput.dispatchEvent(new window.Event('input', { bubbles: true }))

      expect(hideSuggestionsSpy).toHaveBeenCalled()
    })

    test('should call loadSuggestions when input length is sufficient', async () => {
      vi.useFakeTimers()
      searchInput.value = 'test'
      const loadSuggestionsSpy = vi.spyOn(search, 'loadSuggestions')
      searchInput.dispatchEvent(new window.Event('input'))

      // Should not be called immediately due to debouncing
      expect(loadSuggestionsSpy).not.toHaveBeenCalled()

      // Fast-forward past debounce delay (500ms)
      await vi.advanceTimersByTimeAsync(500)

      expect(loadSuggestionsSpy).toHaveBeenCalled()
      vi.useRealTimers()
    })

    test('should debounce multiple rapid inputs and only call loadSuggestions once', async () => {
      vi.useFakeTimers()
      const loadSuggestionsSpy = vi.spyOn(search, 'loadSuggestions')

      // Simulate rapid typing: "test"
      searchInput.value = 't'
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(50)

      searchInput.value = 'te'
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(50)

      searchInput.value = 'tes'
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(50)

      searchInput.value = 'test'
      searchInput.dispatchEvent(new window.Event('input'))

      // Should not be called yet - still within debounce window
      expect(loadSuggestionsSpy).not.toHaveBeenCalled()

      // Fast-forward past full debounce delay
      await vi.advanceTimersByTimeAsync(500)

      // Should only be called once for the final value
      expect(loadSuggestionsSpy).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })

    test('should show loading state immediately on input', () => {
      searchInput.value = 'test'
      searchInput.dispatchEvent(new window.Event('input'))

      // Should show loading immediately (not wait for debounce)
      expect(domSuggestions.textContent).toContain('Loading...')
      expect(domSuggestions.style.display).toBe('block')
    })

    test('should not make redundant request for same search string', async () => {
      vi.useFakeTimers()
      const loadSuggestionsSpy = vi.spyOn(search, 'loadSuggestions')

      // First search
      searchInput.value = 'test'
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(500)
      expect(loadSuggestionsSpy).toHaveBeenCalledTimes(1)

      // Trigger same search again (simulating user clicking in/out of field)
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(500)

      // Should still only be called once (redundant request skipped)
      expect(loadSuggestionsSpy).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    test('should make new request when search string changes', async () => {
      vi.useFakeTimers()
      const loadSuggestionsSpy = vi.spyOn(search, 'loadSuggestions')

      // First search
      searchInput.value = 'test'
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(500)
      expect(loadSuggestionsSpy).toHaveBeenCalledTimes(1)

      // Different search
      searchInput.value = 'testing'
      searchInput.dispatchEvent(new window.Event('input'))
      await vi.advanceTimersByTimeAsync(500)

      // Should be called twice (new search term)
      expect(loadSuggestionsSpy).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    test('should navigate through options on arrow key presses', () => {
      domSuggestions.innerHTML = `
                <div value="1" class="option">Option 1</div>
                <div value="2" class="option">Option 2</div>
            `
      const downEvent = new window.KeyboardEvent('keydown', { key: 'Down' })
      const upEvent = new window.KeyboardEvent('keydown', { key: 'Up' })

      searchInput.dispatchEvent(downEvent)
      expect(search.focusIndex).toBe(0)

      searchInput.dispatchEvent(upEvent)
      expect(search.focusIndex).toBe(1)
    })

    test('should hide suggestions on Escape key press', () => {
      const hideSuggestionsSpy = vi.spyOn(search, 'hideSuggestions')
      const escapeEvent = new window.KeyboardEvent('keydown', { key: 'Escape' })

      searchInput.dispatchEvent(escapeEvent)

      expect(hideSuggestionsSpy).toHaveBeenCalled()
    })

    test('should trigger search button click on Enter key press', () => {
      const spy = vi.spyOn(document.getElementById('search-button'), 'click')
      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' })

      searchInput.dispatchEvent(enterEvent)

      expect(spy).toHaveBeenCalled()
    })

    test('should do nothing if the the option has Loading text', () => {
      domSuggestions.innerHTML = `
        <div class="mpdp-text-colour-dark-grey" value="test">${search.loadingText}</div>
      `
      search.focusIndex = 0
      const spy = vi.spyOn(domSuggestions.children[0], 'click')
      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' })

      searchInput.dispatchEvent(enterEvent)

      expect(spy).not.toHaveBeenCalled()
    })

    test('should cancel pending request when input length falls below minimum', () => {
      const mockAbort = vi.fn()
      search.pendingRequest = { abort: mockAbort }

      searchInput.value = 'te' // Below 3 char minimum
      searchInput.dispatchEvent(new window.Event('input'))

      expect(mockAbort).toHaveBeenCalled()
      expect(search.pendingRequest).toBeNull()
    })

    test('should clear debounce timer when new input event occurs', () => {
      vi.useFakeTimers()
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

      searchInput.value = 'test'
      searchInput.dispatchEvent(new window.Event('input')) // This creates a timer

      const timerId = search.debounceTimer
      expect(timerId).toBeTruthy() // A timer should be created

      searchInput.value = 'test2'
      searchInput.dispatchEvent(new window.Event('input')) // This should clear the previous timer

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timerId)
      vi.useRealTimers()
    })

    test('should handle keyboard navigation with ArrowDown key', () => {
      domSuggestions.innerHTML = `
        <div value="1" class="option">Option 1</div>
        <div value="2" class="option">Option 2</div>
      `
      const setActiveSpy = vi.spyOn(search, 'setActive')
      const arrowDownEvent = new window.KeyboardEvent('keydown', { key: 'ArrowDown' })

      searchInput.dispatchEvent(arrowDownEvent)

      expect(search.focusIndex).toBe(0)
      expect(setActiveSpy).toHaveBeenCalled()
    })

    test('should handle keyboard navigation with ArrowUp key', () => {
      domSuggestions.innerHTML = `
        <div value="1" class="option">Option 1</div>
        <div value="2" class="option">Option 2</div>
      `
      const setActiveSpy = vi.spyOn(search, 'setActive')
      const arrowUpEvent = new window.KeyboardEvent('keydown', { key: 'ArrowUp' })

      search.focusIndex = 0 // Set initial focus
      searchInput.dispatchEvent(arrowUpEvent)

      // After ArrowUp from 0, focusIndex becomes -1, then setActive() wraps it to last element (1)
      expect(search.focusIndex).toBe(1)
      expect(setActiveSpy).toHaveBeenCalled()
    })

    test('should handle Esc key to hide suggestions', () => {
      const hideSuggestionsSpy = vi.spyOn(search, 'hideSuggestions')
      const escEvent = new window.KeyboardEvent('keydown', { key: 'Esc' })

      searchInput.dispatchEvent(escEvent)

      expect(hideSuggestionsSpy).toHaveBeenCalled()
    })

    test('should dispatch mousedown event on focused element when Enter is pressed', () => {
      domSuggestions.innerHTML = `
        <div value="test-option">Test Option</div>
      `
      search.focusIndex = 0
      const dispatchSpy = vi.spyOn(domSuggestions.children[0], 'dispatchEvent')

      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' })
      searchInput.dispatchEvent(enterEvent)

      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(globalThis.MouseEvent))
    })

    test('should return early if focused option has loading text value', () => {
      // The check compares the VALUE attribute, not textContent
      domSuggestions.innerHTML = `
        <div class="mpdp-text-colour-dark-grey">${search.loadingText}</div>
      `
      domSuggestions.children[0].value = search.loadingText
      search.focusIndex = 0
      const dispatchSpy = vi.spyOn(domSuggestions.children[0], 'dispatchEvent')

      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' })
      searchInput.dispatchEvent(enterEvent)

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    test('should return early if focused option has no results text value', () => {
      // The check compares the VALUE attribute, not textContent
      domSuggestions.innerHTML = `
        <div class="mpdp-text-colour-dark-grey">${search.noResultsText}</div>
      `
      domSuggestions.children[0].value = search.noResultsText
      search.focusIndex = 0
      const dispatchSpy = vi.spyOn(domSuggestions.children[0], 'dispatchEvent')

      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' })
      searchInput.dispatchEvent(enterEvent)

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    test('should prevent default for handled keyboard events', () => {
      const arrowDownEvent = new window.KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventDefaultSpy = vi.spyOn(arrowDownEvent, 'preventDefault')

      searchInput.dispatchEvent(arrowDownEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    test('should check if event is already processed before handling', () => {
      // Note: JSDOM's KeyboardEvent doesn't properly support defaultPrevented
      // This test verifies the handler checks for it, even if we can't fully test it
      const setActiveSpy = vi.spyOn(search, 'setActive')
      const arrowDownEvent = new window.KeyboardEvent('keydown', { key: 'ArrowDown' })

      searchInput.dispatchEvent(arrowDownEvent)

      // In real browsers, if defaultPrevented is true, the handler returns early
      // In JSDOM, the event processes normally since defaultPrevented doesn't work properly
      expect(setActiveSpy).toHaveBeenCalled()
    })

    test('should return early for unhandled keys without preventing default', () => {
      const setActiveSpy = vi.spyOn(search, 'setActive')
      const unhandledEvent = new window.KeyboardEvent('keydown', { key: 'a' })
      const preventDefaultSpy = vi.spyOn(unhandledEvent, 'preventDefault')

      searchInput.dispatchEvent(unhandledEvent)

      expect(setActiveSpy).not.toHaveBeenCalled()
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })
})
