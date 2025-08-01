import { vi, describe, beforeAll, afterAll, test, expect } from 'vitest'
import { catchAll } from '../../../../src/common/helpers/errors.js'
import { createServer } from '../../../../src/server.js'
import { StatusCodes } from 'http-status-codes'

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
    expect(statusCode).toBe(StatusCodes.NOT_FOUND)
  })
})

describe('catchAll', () => {
  const mockErrorLogger = vi.fn()
  const mockStack = 'Mock error stack'
  const errorPage = 'error'
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
    catchAll(mockRequest(StatusCodes.NOT_FOUND), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Page not found',
      heading: StatusCodes.NOT_FOUND,
      message: 'Page not found'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
  })

  test('Should provide expected "Forbidden" page', () => {
    catchAll(mockRequest(StatusCodes.FORBIDDEN), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Forbidden',
      heading: StatusCodes.FORBIDDEN,
      message: 'Forbidden'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(StatusCodes.FORBIDDEN)
  })

  test('Should provide expected "Unauthorized" page', () => {
    catchAll(mockRequest(StatusCodes.UNAUTHORIZED), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Unauthorized',
      heading: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
  })

  test('Should provide expected "Bad Request" page', () => {
    catchAll(mockRequest(StatusCodes.BAD_REQUEST), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Bad Request',
      heading: StatusCodes.BAD_REQUEST,
      message: 'Bad Request'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
  })

  test('Should provide expected default page', () => {
    catchAll(mockRequest(StatusCodes.IM_A_TEAPOT), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Something went wrong',
      heading: StatusCodes.IM_A_TEAPOT,
      message: 'Something went wrong'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(StatusCodes.IM_A_TEAPOT)
  })

  test('Should provide expected "Something went wrong" page and log error for internalServerError', () => {
    catchAll(mockRequest(StatusCodes.INTERNAL_SERVER_ERROR), mockToolkit)

    expect(mockErrorLogger).toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Something went wrong',
      heading: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR
    )
  })
})
