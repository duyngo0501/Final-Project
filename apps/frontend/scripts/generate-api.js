import { generateApi } from 'openapi-typescript-codegen'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

generateApi({
  input: path.resolve(__dirname, '../openapi.json'),
  output: path.resolve(__dirname, '../src/generated/api'),
  httpClient: 'fetch',
  useOptions: true,
  exportCore: true,
  exportSchemas: true,
  exportServices: true
})
