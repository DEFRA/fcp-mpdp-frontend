import Joi from 'joi'
import { config } from '../config/config.js'
import { cookiesModel } from './models/cookies.js'
import { updatePolicy } from '../cookies.js'
import { isSafeRedirect } from '../common/utils/is-safe-redirect.js'

export const cookies = [
  {
    method: 'GET',
    path: '/cookies',
    handler: function (request, h) {
      return h.view(
        'cookies/policy',
        {
          pageTitle: 'Cookies',
          ...cookiesModel(
            false,
            request.headers.referer,
            request.state[config.get('cookie.name')]
          )
        }
      )
    }
  },
  {
    method: 'POST',
    path: '/cookies',
    options: {
      validate: {
        payload: {
          analytics: Joi.boolean(),
          async: Joi.boolean().default(false),
          referer: Joi.string().allow(''),
          returnUrl: Joi.string().allow('').max(2000).optional()
        }
      }
    },
    handler: function (request, h) {
      const payload = request.payload

      updatePolicy(request, h, payload.analytics)

      if (payload.async) {
        return h.response({ message: 'success' })
      }

      if (isSafeRedirect(payload.returnUrl)) {
        return h.redirect(payload.returnUrl)
      }

      return h.view(
        'cookies/policy',
        {
          pageTitle: 'Cookies',
          ...cookiesModel(
            true,
            payload.referer,
            request.state[config.get('cookie.name')]
          )
        }
      )
    }
  }
]
