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
  const mockRequest = (statusCode) => ({
    response: {
      isBoom: true,
      stack: mockStack,
      output: {
        statusCode,
        headers: {}
      }
    },
    logger: { error: mockErrorLogger }
  })
  const mockToolkitView = vi.fn()
  const mockToolkitCode = vi.fn()
  const mockToolkitContinue = vi.fn()
  const mockToolkit = {
    view: mockToolkitView.mockReturnThis(),
    code: mockToolkitCode.mockReturnThis(),
    continue: mockToolkitContinue
  }

  test('Should provide expected "Not Found" page', () => {
    const request = mockRequest(httpConstants.HTTP_STATUS_NOT_FOUND)
    const result = catchAll(request, mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).not.toHaveBeenCalled()
    expect(mockToolkitCode).not.toHaveBeenCalled()
    expect(result).toBe(mockToolkitContinue)
    expect(request.response.output.statusCode).toBe(httpConstants.HTTP_STATUS_NOT_FOUND)
    expect(request.response.output.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(request.response.output.payload).toContain('Page not found')
  })

  test('Should provide expected "Forbidden" page', () => {
    const request = mockRequest(httpConstants.HTTP_STATUS_FORBIDDEN)
    const result = catchAll(request, mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).not.toHaveBeenCalled()
    expect(mockToolkitCode).not.toHaveBeenCalled()
    expect(result).toBe(mockToolkitContinue)
    expect(request.response.output.statusCode).toBe(httpConstants.HTTP_STATUS_FORBIDDEN)
    expect(request.response.output.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(request.response.output.payload).toContain('Sorry, there is a problem with the service')
  })

  test('Should provide expected "Unauthorized" page', () => {
    const request = mockRequest(httpConstants.HTTP_STATUS_UNAUTHORIZED)
    const result = catchAll(request, mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).not.toHaveBeenCalled()
    expect(mockToolkitCode).not.toHaveBeenCalled()
    expect(result).toBe(mockToolkitContinue)
    expect(request.response.output.statusCode).toBe(httpConstants.HTTP_STATUS_UNAUTHORIZED)
    expect(request.response.output.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(request.response.output.payload).toContain('Sorry, there is a problem with the service')
  })

  test('Should provide expected "Bad Request" page', () => {
    const request = mockRequest(httpConstants.HTTP_STATUS_BAD_REQUEST)
    const result = catchAll(request, mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).not.toHaveBeenCalled()
    expect(mockToolkitCode).not.toHaveBeenCalled()
    expect(result).toBe(mockToolkitContinue)
    expect(request.response.output.statusCode).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
    expect(request.response.output.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(request.response.output.payload).toContain('Sorry, there is a problem with the service')
  })

  test('Should provide expected default page', () => {
    const request = mockRequest(httpConstants.HTTP_STATUS_IM_A_TEAPOT)
    const result = catchAll(request, mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).not.toHaveBeenCalled()
    expect(mockToolkitCode).not.toHaveBeenCalled()
    expect(result).toBe(mockToolkitContinue)
    expect(request.response.output.statusCode).toBe(httpConstants.HTTP_STATUS_IM_A_TEAPOT)
    expect(request.response.output.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(request.response.output.payload).toContain('Sorry, there is a problem with the service')
  })

  test('Should provide expected "Sorry, there is a problem with the service" page and log error for internalServerError', () => {
    const request = mockRequest(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    const result = catchAll(request, mockToolkit)

    expect(mockErrorLogger).toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).not.toHaveBeenCalled()
    expect(mockToolkitCode).not.toHaveBeenCalled()
    expect(result).toBe(mockToolkitContinue)
    expect(request.response.output.statusCode).toBe(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    expect(request.response.output.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(request.response.output.payload).toContain('Sorry, there is a problem with the service')
  })
})
