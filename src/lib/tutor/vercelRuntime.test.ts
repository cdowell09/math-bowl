import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('tutor Vercel runtime loading', () => {
  it('loads the built Vercel tutor function in a native Node runtime without module resolution errors', async () => {
    await execFileAsync('npx', ['vercel', 'build'], {
      cwd: process.cwd(),
    });

    const { stdout } = await execFileAsync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import('./.vercel/output/functions/api/tutor.func/api/tutor.js').then(() => console.log('import ok'))",
      ],
      {
        cwd: process.cwd(),
      }
    );

    expect(stdout).toContain('import ok');
  }, 60_000);
});
