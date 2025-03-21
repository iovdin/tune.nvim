import { promises as fs } from 'fs';

export default async function writeFile({ filename, text }, ctx) {
  await fs.writeFile(filename, text, 'utf8');
  return `written`;
}
