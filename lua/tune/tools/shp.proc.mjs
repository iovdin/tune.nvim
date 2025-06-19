import { execSync, spawnSync } from 'node:child_process';

const shp = async (node, args, ctx) => ({
  type: 'text',
  read: async () => {
    let input = null;

    if (node && node.type === 'text') {
      input = await node.read();
    }

    let result;
    try {
      if (input !== null) {
        const res = spawnSync(args.trim(), {
          input,
          encoding: 'utf8',
          shell: true
        });
        result = (res.stdout || '') + (res.stderr || '');
      } else {
        result = execSync(args.trim(), { encoding: 'utf8' });
      }
    } catch (e) {
      result = e.stderr + e.stdout;
    }
    return result.replaceAll('@', '\\@');
  }
});

export default shp;