import { promises as fs } from 'fs';
import { relative } from 'path' 

export default async function readFile({ filename }, ctx) {
  const resolved = await ctx.resolve(filename)
  if (!resolved) {
    return "File not found"
  }
  //TODO relative to executing file
  const relFile = relative(process.cwd(), filename)
  return `@${relFile}`;
}
