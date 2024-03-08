import { Context, isHttpError, Next } from 'oak'
import * as settings from './settings.ts'
import Log from './log.ts'
import { getRecursiveFilepath } from './utils.ts'
import kv from './kv.ts'
import { join } from 'denopath'
import Yaml from 'yaml'

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

export const handleStaticYamlJsonMarkdown = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const recursiveFilepath = getRecursiveFilepath(ctx)
  if (settings.DYNAMIC_FILE_TYPES.includes(recursiveFilepath.ext)) {
    const fileContents = Deno.readTextFileSync(join(
      recursiveFilepath.dir,
      recursiveFilepath.base,
    ))

    if (['.yml', '.yaml'].includes(recursiveFilepath.ext)) {
      Log.yellow(`[data] Found some YAML`)
      ctx.response.body = JSON.stringify(Yaml.parse(fileContents))
      ctx.response.type = 'json'
      ctx.response.status = 200
    } else if (recursiveFilepath.ext === '.json') {
      Log.yellow(`[data] Found some JSON`)
      ctx.response.body = fileContents
      ctx.response.type = 'json'
      ctx.response.status = 200
    } else if (['.md', '.markdown'].includes(recursiveFilepath.ext)) {
      Log.yellow(`[data] Found some Markdown`)
      ctx.response.body = fileContents
      ctx.response.type = 'markdown'
      ctx.response.status = 200
    } else {
      ctx.throw(400)
    }
  } else {
    await next()
  }
}

interface RecursiveEvent {
  eventType: string
  payload: object
}

export const handleWebsockets = async (ctx: Context, next: Next) => {
  if (ctx.isUpgradable) {
    const socket = ctx.upgrade()
    kv.listenQueue((message: RecursiveEvent) => {
      Log.yellow(`[websocket] ${JSON.stringify(message)}`)
      socket.send(JSON.stringify({
        eventType: 'chrome:refresh',
        payload: {},
      }))
    })

    socket.onmessage = (event: MessageEvent) => {
      const {
        eventType,
        payload,
      } = JSON.parse(event.data) as RecursiveEvent
      Log.yellow(`[websocket] ${eventType}: ${JSON.stringify(payload)}`)
    }
  } else {
    await next()
  }
}
