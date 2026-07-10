import Joi from 'joi'
import { config } from '../config/config.js'
import { cookiesModel } from './models/cookies.js'
import { updatePolicy } from '../cookies.js'
import { getSafeRedirect } from '../common/utils/get-safe-redirect.js'
import { getRefererPath } from '../common/utils/get-referer-path.js'

export const cookies = [
  {
    method: 'GET',
    path: '/cookies',
    options: {
      validate: {
        query: {
          updated: Joi.boolean().default(false),
          referer: Joi.string().allow('').max(2000).optional()
        }
      }
    },
    handler: function (request, h) {
      return h.view(
        'cookies/policy',
        {
          pageTitle: 'Cookies',
          ...cookiesModel(
            request.query.updated,
            getRefererPath(request.query.referer ?? request.headers.referer, request.info.hostname),
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
          analytics: Joi.boolean().required(),
          async: Joi.boolean().default(false),
          referer: Joi.string().allow('').max(2000).optional(),
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

      const safeReturnUrl = getSafeRedirect(payload.returnUrl)
      if (safeReturnUrl) {
        return h.redirect(safeReturnUrl)
      }

      const safeReferer = getRefererPath(payload.referer, request.info.hostname)
      return h.redirect(`/cookies?updated=true&referer=${encodeURIComponent(safeReferer)}`)
    }
  }
]
