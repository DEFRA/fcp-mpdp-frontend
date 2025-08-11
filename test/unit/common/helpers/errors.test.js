import { vi, describe, beforeAll, afterAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import { catchAll } from '../../../../src/common/helpers/errors.js'
import { createServer } from '../../../../src/server.js'

const { constants: httpConstants } = http2

describe('errors', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected Not Found page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/non-existent-path'
    })

    expect(result).toEqual(expect.stringContaining('Page not found'))
    expect(statusCode).toBe(httpConstants.HTTP_STATUS_NOT_FOUND)
  })
})

describe('catchAll', () => {
  const mockErrorLogger = vi.fn()
  const mockStack = 'Mock error stack'
  const errorPage500 = 'errors/500'
  const errorPage404 = 'errors/404'
  const mockRequest = (statusCode) => ({
    response: {
      isBoom: true,
      stack: mockStack,
      output: {
        statusCode
      }
    },
    logger: { error: mockErrorLogger }
  })
  const mockToolkitView = vi.fn()
  const mockToolkitCode = vi.fn()
  const mockToolkit = {
    view: mockToolkitView.mockReturnThis(),
    code: mockToolkitCode.mockReturnThis()
  }

  test('Should provide expected "Not Found" page', () => {
    catchAll(mockRequest(httpConstants.HTTP_STATUS_NOT_FOUND), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage404, {
      pageTitle: 'Page not found'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_NOT_FOUND)
  })

  test('Should provide expected "Forbidden" page', () => {
    catchAll(mockRequest(httpConstants.HTTP_STATUS_FORBIDDEN), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage500, {
      pageTitle: 'Sorry, there is a problem with the service'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_FORBIDDEN)
  })

  test('Should provide expected "Unauthorized" page', () => {
    catchAll(mockRequest(httpConstants.HTTP_STATUS_UNAUTHORIZED), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage500, {
      pageTitle: 'Sorry, there is a problem with the service'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_UNAUTHORIZED)
  })

  test('Should provide expected "Bad Request" page', () => {
    catchAll(mockRequest(httpConstants.HTTP_STATUS_BAD_REQUEST), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage500, {
      pageTitle: 'Sorry, there is a problem with the service'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_BAD_REQUEST)
  })

  test('Should provide expected default page', () => {
    catchAll(mockRequest(httpConstants.HTTP_STATUS_IM_A_TEAPOT), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage500, {
      pageTitle: 'Sorry, there is a problem with the service'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_IM_A_TEAPOT)
  })

  test('Should provide expected "Sorry, there is a problem with the service" page and log error for internalServerError', () => {
    catchAll(mockRequest(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR), mockToolkit)

    expect(mockErrorLogger).toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage500, {
      pageTitle: 'Sorry, there is a problem with the service'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(
      httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    )
  })
})
