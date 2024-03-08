import * as settings from './settings.ts'
import { Application } from 'oak'
import Log from './log.ts'
import * as Middleware from './middleware.ts'
import renderHtmlMiddleware from './html.ts'
import kv from './kv.ts'
import { debounce } from 'https://deno.land/std@0.218.2/async/debounce.ts'

const app = new Application()

app.use(Middleware.handleGlobalErrors)
app.use(Middleware.removeTrailingSlash)
app.use(Middleware.handleStaticFiles)
app.use(Middleware.handleStaticYamlJsonMarkdown)
app.use(Middleware.handleWebsockets)
app.use(renderHtmlMiddleware)

//client.login(settings.DISCORD_TOKEN)
Log.black(`[system] Recursive Root: ${settings.RECURSIVE_ROOT.dir}`)
app.listen({ port: 8888 })

const watcher = Deno.watchFs(settings.RECURSIVE_ROOT.dir, { recursive: true })
const watchFiles = debounce((event: Deno.FsEvent) => {
  console.log('[%s] %s', event.kind, event.paths[0])
  Log.purple('[queue] chrome:refresh')
  kv.enqueue({ eventType: 'chrome:refresh', payload: {} })
}, 200)

for await (const event of watcher) {
  watchFiles(event)
}
