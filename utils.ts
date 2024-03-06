import { parse } from 'denopath'
import { Context } from 'oak'
import * as settings from './settings.ts'

export const getRecursiveFilepath = (
  ctx: Context,
): ReturnType<typeof parse> => {
  return parse(`${settings.RECURSIVE_ROOT.dir}${ctx.request.url.pathname}`)
}