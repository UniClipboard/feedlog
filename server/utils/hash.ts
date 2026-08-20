import { createHash } from 'node:crypto'

export function computeContentHash(title: string, content: string): string {
  return createHash('sha256').update(title + '\n' + content).digest('hex')
}
