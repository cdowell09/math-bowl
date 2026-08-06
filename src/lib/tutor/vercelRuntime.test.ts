import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('tutor Vercel runtime loading', () => {
  it('loads the built Vercel tutor function in a native Node runtime without module resolution errors', async () => {
    const repositoryRoot = process.cwd();
    const projectDirectory = await mkdtemp(join(tmpdir(), 'math-bowl-vercel-project-'));
    const outputDirectory = join(projectDirectory, 'build-output');
    const fixtureInputs = [
      'api',
      'src',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'vercel.runtime-test.json',
    ];

    try {
      await Promise.all(
        fixtureInputs.map((path) =>
          cp(resolve(repositoryRoot, path), join(projectDirectory, path), { recursive: true })
        )
      );
      await symlink(
        resolve(repositoryRoot, 'node_modules'),
        join(projectDirectory, 'node_modules'),
        process.platform === 'win32' ? 'junction' : 'dir'
      );
      await mkdir(join(projectDirectory, '.vercel'), { recursive: true });
      await writeFile(
        join(projectDirectory, '.vercel/project.json'),
        `${JSON.stringify({
          projectId: 'prj_clean_checkout_fixture',
          orgId: 'team_clean_checkout_fixture',
          settings: {},
        })}\n`
      );

      await execFileAsync(
        process.execPath,
        [
          resolve(repositoryRoot, 'node_modules/vercel/dist/vc.js'),
          'build',
          '--local-config',
          'vercel.runtime-test.json',
          '--output',
          outputDirectory,
        ],
        {
          cwd: projectDirectory,
          env: {
            ...process.env,
            VERCEL_TELEMETRY_DISABLED: '1',
          },
        }
      );

      const functionUrl = pathToFileURL(
        join(outputDirectory, 'functions/api/tutor.ts.func/api/tutor.js')
      ).href;
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `import(${JSON.stringify(functionUrl)}).then(() => console.log('import ok'))`,
        ],
        {
          cwd: projectDirectory,
        }
      );

      expect(stdout).toContain('import ok');
    } finally {
      await rm(projectDirectory, { recursive: true, force: true });
    }
  }, 60_000);
});
