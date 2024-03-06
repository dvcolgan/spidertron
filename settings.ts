import { load as loadEnv } from 'dotenv'
import { join, parse } from 'denopath'
await loadEnv({
  export: true,
  allowEmptyValues: false,
})

// We really just want the folder but parsing removes Desktop if it's just a path to the
export const RECURSIVE_ROOT = parse(
  join(Deno.env.get('HOME') || '/', 'Desktop/index.html'),
)

export const DISCORD_TOKEN = Deno.env.get('DISCORD_TOKEN') || ''
export const DISCORD_CLIENT_ID = Deno.env.get('DISCORD_CLIENT_ID') || ''
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''

export const MARKDOWN_FILE_TYPES = [
  '.md',
  '.markdown',
]

export const HTML_FILE_TYPES = [
  '.html',
  '.htm',
]

export const STATIC_FILE_TYPES = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.ico',
  '.webp',
  '.webm',
  '.tiff',
  '.css',
  '.js',
]
