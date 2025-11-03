#!/usr/bin/env node

/**
 * normalize-text.mjs
 *
 * Recursively walks the project tree (excluding node_modules/.next/out/etc.)
 * and rewrites recognised text files to UTF-8 (no BOM) with LF endings.
 *
 * Supported extensions:
 *  - ts, tsx, js, jsx, mjs, cjs
 *  - json, yml, yaml
 *  - md, mdx, html, css, scss
 *
 * Any file already in the desired format is left untouched. If a file is
 * rewritten, the script logs its path. Binary files and unrecognised
 * extensions are skipped.
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.mdx',
  '.html',
  '.css',
  '.scss',
]);

const EXCLUDED_DIRECTORIES = new Set([
  'node_modules',
  '.next',
  'out',
  'build',
  '.git',
]);

const rewrittenFiles = [];
const skippedFiles = [];

/**
 * Determine if a file should be treated as text and normalised.
 * @param {string} filePath
 * @returns {boolean}
 */
const shouldProcessFile = (filePath) => {
  const ext = extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
};

/**
 * Remove BOM if present and normalise line endings to LF.
 * @param {Buffer} buffer
 * @returns {string}
 */
const normaliseBuffer = (buffer) => {
  let content = buffer;

  // Strip BOM if present.
  if (
    content.length >= 3 &&
    content[0] === 0xef &&
    content[1] === 0xbb &&
    content[2] === 0xbf
  ) {
    content = content.subarray(3);
  }

  let text = content.toString('utf8');
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return text;
};

/**
 * Recursively walk through directories and process files.
 * @param {string} dir
 */
const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      await walk(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!shouldProcessFile(fullPath)) {
      skippedFiles.push(fullPath);
      continue;
    }

    const originalBuffer = await readFile(fullPath);
    const normalisedText = normaliseBuffer(originalBuffer);
    const normalisedBuffer = Buffer.from(normalisedText, 'utf8');

    const buffersAreDifferent =
      originalBuffer.length !== normalisedBuffer.length ||
      !originalBuffer.equals(normalisedBuffer);

    if (buffersAreDifferent) {
      await writeFile(fullPath, normalisedBuffer);
      rewrittenFiles.push(fullPath);
    }
  }
};

const run = async () => {
  try {
    const start = Date.now();
    await walk(projectRoot);
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    if (rewrittenFiles.length === 0) {
      console.log(
        `✅ Text normalisation complete: no changes needed (checked ${duration}s).`,
      );
    } else {
      console.log('✅ Text normalisation complete. Files updated:');
      for (const file of rewrittenFiles) {
        const relativePath = file.replace(`${projectRoot}${process.platform === 'win32' ? '\\' : '/'}`, '');
        console.log(`  - ${relativePath}`);
      }
      console.log(`Processed in ${duration}s.`);
    }
  } catch (error) {
    console.error('❌ Text normalisation failed.', error);
    process.exitCode = 1;
  }
};

run();
