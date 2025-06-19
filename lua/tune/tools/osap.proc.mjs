import { spawnSync } from 'node:child_process';

const osap = async (node, args, ctx) => ({
  type: 'text',
  read: async () => {
    let input = args.trim();

    if (node && node.type === 'text') {
      input = await node.read();
    } 

    let result;
    try {
      const res = spawnSync('osascript -', {
        input,
        encoding: 'utf8',
        shell: true
      });
      result = (res.stdout || '') + (res.stderr || '');
    } catch (e) {
      result = e.stderr + e.stdout;
    }
    return result.replaceAll('@', '\\@');
  }
});

export default osap;
