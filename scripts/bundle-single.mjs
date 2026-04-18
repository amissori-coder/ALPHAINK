#!/usr/bin/env node
/**
 * Inlines the Vite build output into a single self-contained HTML file
 * (`dist/alphaink.html`) so the app can be opened by double-click — no
 * web server required.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, '..', 'dist');
const idx = join(dist, 'index.html');

if (!existsSync(idx)) {
  console.error('dist/index.html non trovato. Esegui prima "npm run build".');
  process.exit(1);
}

const html = readFileSync(idx, 'utf8');

const scriptRe = /<script\s+(?:type="module"\s+)?[^>]*src="([^"]+\.js)"[^>]*><\/script>/;
const cssRe = /<link\s+rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/;

const scriptMatch = html.match(scriptRe);
const cssMatch = html.match(cssRe);
if (!scriptMatch) {
  console.error('Script tag non trovato in index.html');
  process.exit(1);
}

const resolve = (rel) => join(dist, rel.replace(/^\.\//, ''));

const js = readFileSync(resolve(scriptMatch[1]), 'utf8');
const css = cssMatch ? readFileSync(resolve(cssMatch[1]), 'utf8') : '';

// Use function replacements to avoid `$&`, `$1`, etc. being interpreted
// as back-references when JS/CSS bundle content is injected.
// The bundle is an IIFE (classic script) so we inline it as a plain <script>
// — this works even when the file is opened via file:// in every browser.
// Also escape any literal </script> in the JS so the inline block doesn't
// terminate prematurely.
const safeJs = js.replace(/<\/script/gi, '<\\/script');
let out = html.replace(scriptRe, () => `<script>${safeJs}</script>`);
if (cssMatch) out = out.replace(cssRe, () => `<style>${css}</style>`);

// Strip any <link rel="modulepreload"> pointing at the now-inlined JS.
out = out.replace(/<link\s+rel="modulepreload"[^>]*>\s*/g, '');

const target = join(dist, 'alphaink.html');
writeFileSync(target, out);

// Copy also to repo root for easy access.
const rootTarget = join(here, '..', 'alphaink.html');
writeFileSync(rootTarget, out);

console.log(
  `alphaink.html (${(out.length / 1024).toFixed(1)} KB) — apribile con doppio click.`,
);
