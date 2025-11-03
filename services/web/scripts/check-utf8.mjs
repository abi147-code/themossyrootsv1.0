import { readdir, stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextDecoder } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md', '.svg']);
const decoder = new TextDecoder('utf-8', { fatal: true });

const offenders = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.next')) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      await checkFile(fullPath);
    }
  }
}

async function checkFile(filePath) {
  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (error) {
    offenders.push({ filePath, reason: `unable to read file (${error.message})` });
    return;
  }

  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    offenders.push({ filePath, reason: 'contains UTF-8 BOM' });
  }

  try {
    decoder.decode(buffer);
  } catch {
    offenders.push({ filePath, reason: 'invalid UTF-8 sequence detected' });
    return;
  }

  const content = buffer.toString('utf8');
  if (content.includes('\r')) {
    offenders.push({ filePath, reason: 'contains CR line endings (expected LF only)' });
  }
}

async function main() {
  try {
    const srcExists = await stat(srcDir).then(() => true).catch(() => false);
    if (!srcExists) {
      console.error('Warning: source directory missing:', srcDir);
      process.exit(1);
    }

    await walk(srcDir);

    if (offenders.length > 0) {
      console.error('ERROR: UTF-8 / LF check failed. Normalise the following files and retry.');
      for (const offender of offenders) {
        console.error(` - ${path.relative(rootDir, offender.filePath)} -> ${offender.reason}`);
      }
      process.exit(1);
    }

    console.log('UTF-8 / LF check passed.');
  } catch (error) {
    console.error('Unexpected error while checking UTF-8 encodings:', error);
    process.exit(1);
  }
}

await main();
