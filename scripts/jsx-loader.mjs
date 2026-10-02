/**
 * Node module hooks that let the (JSX) source files be imported directly by
 * the offline test scripts — no dev server, no build step.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.jsx')) {
    return {
      url: new URL(specifier, context.parentURL).href,
      format: 'module',
      shortCircuit: true,
    };
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith('.jsx')) {
    const path = fileURLToPath(url);
    const { code, warnings } = transformSync(readFileSync(path, 'utf8'), {
      loader: 'jsx',
      format: 'esm',
      jsx: 'automatic',
      target: 'es2022',
      sourcefile: path,
    });
    for (const warning of warnings) {
      console.warn(`[jsx-loader] ${path}: ${warning.text}`);
    }
    return { format: 'module', source: code, shortCircuit: true };
  }
  return next(url, context);
}
