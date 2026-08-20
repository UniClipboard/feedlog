import {
  getMethod,
  getRequestIP,
  getRequestURL,
  getResponseStatus,
  getHeader,
} from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context._startTime = Date.now()
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const duration = Date.now() - (event.context._startTime || Date.now())
    const method = getMethod(event)
    const url = getRequestURL(event)
    const status = getResponseStatus(event)

    console.log(`[access] ${method} ${url.pathname + url.search} ${status} ${duration}ms`)
  })

  nitroApp.hooks.hook('error', (error, { event }) => {
    const duration = event
      ? Date.now() - (event.context?._startTime || Date.now())
      : 0
    const method = event ? getMethod(event) : '-'
    const path = event?.path || '-'
    const status = (error as any).statusCode || 500

    console.error(`[access] ${method} ${path} ${status} ${duration}ms - ${error.message}`)
  })
})
