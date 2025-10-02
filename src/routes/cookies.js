import Joi from 'joi'
import { config } from '../config/config.js'
import { cookiesModel } from './models/cookies.js'
import { updatePolicy } from '../cookies.js'

export const cookies = [
  {
    method: 'GET',
    path: '/cookies',
    handler: function (request, h) {
      return h.view(
        'cookies/policy',
        {
          pageTitle: 'Cookies',
          crumb: request.plugins.crumb,
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
        payload: Joi.object({
          analytics: Joi.boolean(),
          async: Joi.boolean().default(false),
          referer: Joi.string().optional(),
          crumb: Joi.string().required()
        })
      },
      handler: function (request, h) {
        const payload = request.payload

        updatePolicy(request, h, payload.analytics)

        if (payload.async) {
          return h.response({ message: 'success' })
        }

        return h.view(
          'cookies/policy',
          {
            pageTitle: 'Cookies',
            crumb: request.plugins.crumb,
            ...cookiesModel(
              true,
              payload.referer,
              request.state[config.get('cookie.name')]
            )
          }
        )
      }
    }
  }
]
