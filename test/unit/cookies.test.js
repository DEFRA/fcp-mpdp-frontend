import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import { config } from '../../src/config/config.js'
import { getCurrentPolicy, updatePolicy } from '../../src/cookies.js'

describe('cookies', () => {
  const cookieNamePolicy = config.get('cookie.name')

  const defaultCookie = {
    confirmed: false,
    essential: true,
    analytics: false
  }

  let request
  let h

  beforeEach(() => {
    request = {
      state: {
        [cookieNamePolicy]: undefined,
        _ga: '123',
        _gid: '123'
      }
    }

    h = {
      state: vi.fn(),
      unstate: vi.fn()
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('getCurrentPolicy returns default cookie if policy does not exist', () => {
    const result = getCurrentPolicy(request, h)

    expect(result).toStrictEqual(defaultCookie)
  })

  test('getCurrentPolicy sets default cookie if policy does not exist', () => {
    getCurrentPolicy(request, h)

    expect(h.state).toHaveBeenCalledWith(
      cookieNamePolicy,
      defaultCookie,
      {
        ...config.get('cookie.policy'),
        ...config.get('cookie.config')
      }
    )
  })

  test('getCurrentPolicy returns cookie if policy exists', () => {
    request.state[cookieNamePolicy] = {
      confirmed: true,
      essential: false,
      analytics: true
    }

    const result = getCurrentPolicy(request, h)

    expect(result).toStrictEqual({
      confirmed: true,
      essential: false,
      analytics: true
    })
  })

  test('getCurrentPolicy does set default cookie if policy exists', () => {
    request.state[cookieNamePolicy] = {
      confirmed: true,
      essential: false,
      analytics: true
    }

    getCurrentPolicy(request, h)

    expect(h.state).not.toHaveBeenCalled()
  })

  test('updatePolicy sets cookie twice if policy does not exist', () => {
    updatePolicy(request, h, true)

    expect(h.state).toHaveBeenCalledTimes(2)
  })

  test('updatePolicy sets confirmed cookie second if policy does not exist', () => {
    updatePolicy(request, h, true)

    expect(h.state).toHaveBeenNthCalledWith(
      2,
      cookieNamePolicy,
      {
        confirmed: true,
        essential: true,
        analytics: true
      },
      {
        ...config.get('cookie.policy'),
        ...config.get('cookie.config')
      }
    )
  })

  test('updatePolicy sets cookie to accepted', () => {
    request.state[cookieNamePolicy] = {
      confirmed: false,
      essential: true,
      analytics: false
    }

    updatePolicy(request, h, true)

    expect(h.state).toHaveBeenCalledWith(
      cookieNamePolicy,
      {
        confirmed: true,
        essential: true,
        analytics: true
      },
      {
        ...config.get('cookie.policy'),
        ...config.get('cookie.config')
      }
    )
  })

  test('updatePolicy sets cookie to rejected', () => {
    request.state[cookieNamePolicy] = {
      confirmed: false,
      essential: true,
      analytics: false
    }

    updatePolicy(request, h, false)

    expect(h.state).toHaveBeenCalledWith(
      cookieNamePolicy,
      {
        confirmed: true,
        essential: true,
        analytics: false
      },
      {
        ...config.get('cookie.policy'),
        ...config.get('cookie.config')
      }
    )
  })

  test('updatePolicy denying analytics removes Google cookies', () => {
    request.state.cookies_policy = {
      confirmed: false,
      essential: true,
      analytics: false
    }

    updatePolicy(request, h, false)

    expect(h.unstate).toHaveBeenCalledWith('_ga')
    expect(h.unstate).toHaveBeenCalledWith('_gid')
  })

  test('updatePolicy approving analytics does not remove Google cookies', () => {
    request.state.cookies_policy = {
      confirmed: false,
      essential: true,
      analytics: false
    }

    updatePolicy(request, h, true)

    expect(h.unstate).not.toHaveBeenCalled()
  })
})
