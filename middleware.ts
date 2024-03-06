import { Context, isHttpError, Next } from 'oak'
import * as settings from './settings.ts'
import Log from './log.ts'
import { getRecursiveFilepath } from './utils.ts'
import kv from './kv.ts'

export const handleGlobalErrors = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    await next()
  } catch (err) {
    // TODO: This could be made so nice and easy to read.
    ctx.response.type = 'html'
    ctx.response.status = 500
    ctx.response.body = `
      <h1>500 Internal Server Error</h1>
      <pre>${err.stack}</pre>
    `
    if (isHttpError(err)) {
      if (err.status === 404) {
        ctx.response.status = 404
        ctx.response.body = `
          <h1>404 Not Found</h1>
        `
      }
    }
    Log.red(`[error] ${err}`)
  }
}

export const removeTrailingSlash = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  if (
    ctx.request.url.pathname.endsWith('/') && ctx.request.url.pathname !== '/'
  ) {
    ctx.response.redirect(ctx.request.url.pathname.slice(0, -1))
  } else {
    await next()
  }
}

export const handleStaticFiles = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const recursiveFilepath = getRecursiveFilepath(ctx)

  if (settings.STATIC_FILE_TYPES.includes(recursiveFilepath.ext)) {
    Log.orange(`[static] ${recursiveFilepath.base}`)

    await ctx.send({
      path: recursiveFilepath.base,
      root: recursiveFilepath.dir,
    })
  } else {
    await next()
  }
}

export const handleWebsockets = async (ctx: Context, next: Next) => {
  if (ctx.isUpgradable) {
    const socket = ctx.upgrade()
    kv.listenQueue((message: unknown) => {
      Log.yellow(`[websocket] ${JSON.stringify(message)}`)
      socket.send('chrome:refresh')
    })

    // socket.onmessage = (event) => {
    //   Log.yellow(`[websocket] ${event.data}`)
    // }
  } else {
    await next()
  }
}
