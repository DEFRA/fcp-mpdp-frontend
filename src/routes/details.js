import Joi from 'joi'
import http2 from 'node:http2'
import { detailsModel } from './models/details.js'

const { constants: httpConstants } = http2

export const details = {
  method: 'GET',
  path: '/details',
  options: {
    validate: {
      query: Joi.object({
        payeeName: Joi.string().trim().min(1).required(),
        partPostcode: Joi.string().trim().min(1).required(),
        searchString: Joi.string().trim().min(1).required(),
        page: Joi.number().default(1)
      }),
      failAction: async (request, h, error) => {
        return h.view('search/index', { ...request.query, errorList: [{ text: error.details[0].message }] }).code(httpConstants.HTTP_STATUS_BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      request.query.searchString = encodeURIComponent(request.query.searchString)
      return h.view('details', await detailsModel(request.query))
    }
  }
}
