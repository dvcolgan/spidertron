import Yaml from 'yaml'
import { Context } from 'oak'
import { join, type ParsedPath } from 'denopath'
import MarkdownIt from 'markdown-it'
import ejs from 'ejs'
import Log from './log.ts'
import { getRecursiveFilepath } from './utils.ts'

const _Markdown = MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: false,
  linkify: true,
  typographer: false,
})

// TODO preprocess the templates if needed here
ejs.fileLoader = (filePath: string) => {
  const fileContents = Deno.readFileSync(filePath)
  return fileContents
}

const getEjsTemplateFilename = (recursiveFilepath: ParsedPath): string => {
  const pathParts = [recursiveFilepath.dir, recursiveFilepath.base]
  if (!recursiveFilepath.ext) {
    pathParts.push('index.html')
  }
  return join(...pathParts)
}

const renderHtmlMiddleware = async (ctx: Context) => {
  Log.green(`[http] ${ctx.request.method} ${ctx.request.url.pathname}`)
  const recursiveFilepath = getRecursiveFilepath(ctx)
  Log.blue(`[debug] ${recursiveFilepath.base}`)
  Log.blue(`[debug] ${recursiveFilepath.dir}`)

  try {
    const ejsTemplate = await Deno.readTextFile(
      getEjsTemplateFilename(recursiveFilepath),
    )

    const renderedHtml = await ejs.render(ejsTemplate, {
      dataFile: (filepath: string) => {
        Log.blue(`[debug] ${filepath}`)

        const absoluteFilePath = join(
          recursiveFilepath.dir,
          recursiveFilepath.base,
          filepath,
        )
        Log.blue(`[debug] ${absoluteFilePath}`)

        const fileContents = Deno.readTextFileSync(absoluteFilePath)

        if (filepath.endsWith('.yml') || filepath.endsWith('.yaml')) {
          return Yaml.parse(fileContents)
        }
        if (filepath.endsWith('.json')) {
          return JSON.parse(fileContents)
        }
      },
    }, {
      async: true,
    })
    ctx.response.body = renderedHtml
    ctx.response.status = 200
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      ctx.throw(404)
    } else {
      throw e
    }
  }
}
export default renderHtmlMiddleware
