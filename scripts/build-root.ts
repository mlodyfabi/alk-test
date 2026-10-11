// Builds the web app and copies it to the repo root so GitHub Pages
// ("Deploy from a branch" -> main / root) finds index.html.
import { execSync } from 'node:child_process';
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
execSync('npm run build', { cwd: root, stdio: 'inherit' });
rmSync(join(root, 'assets'), { recursive: true, force: true });
rmSync(join(root, 'index.html'), { force: true });
cpSync(join(root, 'apps/web/dist'), root, { recursive: true });
writeFileSync(join(root, '.nojekyll'), '');
console.log('Root build updated: index.html, assets/, .nojekyll');
