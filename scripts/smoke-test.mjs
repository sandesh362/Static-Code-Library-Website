#!/usr/bin/env node
/**
 * Functional smoke test — run with `npm test`.
 *
 * Mounts the real React app in jsdom and walks the whole flow
 * (home → subject → program → copy → back), asserting that:
 *   • only the programs from src/data/programs.js are rendered;
 *   • the code shown on screen is byte-for-byte the string in the data file;
 *   • Copy Code puts exactly that string on the clipboard;
 *   • search, routing and the not-found states work without a backend.
 *
 * Layout/overflow is verified by hand at 320/375/768/1440px (see README).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

// jsdom has no layout engine, so a few DOM APIs are "not implemented" and only
// log noise — keep them out of the test output.
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', () => {});
virtualConsole.on('error', (...args) => console.error(...args));

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://codeshelf.test/',
  pretendToBeVisual: true,
  virtualConsole,
});

for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event', 'MouseEvent', 'KeyboardEvent', 'HashChangeEvent', 'getSelection', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, {
    value: dom.window[key],
    configurable: true,
    writable: true,
  });
}
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { programs, subjects } = await import('../src/data/programs.js');
const { default: App } = await import('../src/App.jsx');

const { act } = React;
const container = document.getElementById('root');
const root = createRoot(container);

await act(async () => {
  root.render(React.createElement(App));
});

const $ = (selector) => container.querySelector(selector);
const $$ = (selector) => Array.from(container.querySelectorAll(selector));
const text = (selector) => ($(selector)?.textContent || '').trim();

/** Rendered source text of the code block (line numbers excluded). */
function renderedCode() {
  const lines = $$('.code-line').map((node) => node.textContent);
  return lines.join('\n');
}

async function go(hash) {
  await act(async () => {
    if (window.location.hash !== hash) window.location.hash = hash;
    window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'));
  });
}

async function click(element) {
  assert.ok(element, 'expected an element to click');
  const href = element.getAttribute && element.getAttribute('href');
  await act(async () => {
    element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  // jsdom does not perform fragment navigation, so emulate what a browser does.
  if (href && href.startsWith('#')) await go(href);
}

async function type(input, value) {
  const setter = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    'value'
  ).set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
}

async function key(target, keyName) {
  await act(async () => {
    target.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }));
  });
}

let clipboard = [];
const installClipboard = () => {
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (value) => void clipboard.push(value) },
  });
};
const removeClipboard = () => {
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
};

const checks = [];
const check = (name, fn) => checks.push([name, fn]);

/* ------------------------------------------------------------------ home -- */
check('home renders the hero and only the declared subjects', () => {
  assert.equal(text('.hero-title'), 'Your Practical Code Library');
  assert.match(text('.hero-subtitle'), /copy/i);
  const cards = $$('.subject-card');
  assert.equal(cards.length, subjects.length, 'one card per subject in the data file');
  assert.equal(text('.subject-card-title'), 'Operating System');
  assert.equal(text('.subject-card-meta'), '2 programs');
  assert.equal($$('.program-card').length, 0, 'home lists subjects, not programs');
});

check('home shows no statistics, counters or fabricated content', () => {
  const body = container.textContent;
  for (const forbidden of ['download', 'users', 'views', 'Lorem', 'TODO', 'placeholder', 'example.com']) {
    assert.ok(!body.toLowerCase().includes(forbidden.toLowerCase()), `unexpected "${forbidden}"`);
  }
});

/* --------------------------------------------------------------- subject -- */
check('clicking a subject opens its program list', async () => {
  await click($('.subject-card-link'));
  assert.equal(window.location.hash, '#/subject/operating-system');
  const titles = $$('.program-card-title').map((node) => node.textContent.trim());
  assert.deepEqual(titles, programs.map((program) => program.title));
  assert.equal(text('.subject-title'), 'Operating System');
  assert.equal(text('.subject-meta'), '2 programs');
  assert.deepEqual(
    $$('.program-card .badge--lang').map((node) => node.textContent.trim()),
    programs.map((program) => program.language)
  );
  assert.equal($$('.program-card-desc').length, 0, 'no description was supplied, so none is shown');
});

/* ----------------------------------------------------------- code viewer -- */
for (const program of programs) {
  check(`${program.title}: shows the exact source code`, async () => {
    await go(`#/subject/${program.subjectId}/program/${program.id}`);
    assert.equal(text('.code-title'), program.title);
    assert.equal(text('.code-filename'), program.filename);
    assert.equal(text('.code-panel-name'), program.filename);
    assert.equal(text('.code-header .badge--lang'), program.language);

    const lineNumbers = $$('.code-ln').map((node) => node.textContent.trim());
    assert.equal(lineNumbers.length, program.code.split('\n').length);
    assert.equal(lineNumbers[0], '1');
    assert.equal(lineNumbers.at(-1), String(program.code.split('\n').length));

    // The single most important assertion: what is displayed is what is stored.
    assert.equal(renderedCode(), program.code);
    assert.ok($('.code-pre').getAttribute('aria-label').includes(program.title));
  });

  check(`${program.title}: Copy Code copies the original source exactly`, async () => {
    await go(`#/subject/${program.subjectId}/program/${program.id}`);
    clipboard = [];
    installClipboard();
    const button = $$('.copy-button')[0];
    await click(button);
    await act(async () => {
      await Promise.resolve();
    });
    assert.equal(clipboard.length, 1, 'exactly one clipboard write');
    assert.equal(clipboard[0], program.code, 'clipboard content must equal the source');
    assert.equal(text('.copy-button-label'), 'Copied!');
    assert.match(text('[role="status"]'), /copied to clipboard/i);
    removeClipboard();
  });
}

check('copy falls back and reports an error when the clipboard is unavailable', async () => {
  // Round-trip through the home page so the viewer mounts with a fresh state.
  await go('#/');
  await go('#/subject/operating-system/program/fifo-page-replacement');
  removeClipboard();
  assert.equal(text('.copy-button-label'), 'Copy Code');
  const before = text('.copy-button-label');
  await click($$('.copy-button')[0]);
  await act(async () => {
    await Promise.resolve();
  });
  assert.equal(text('.copy-button-label'), before, 'label stays "Copy Code" on failure');
  assert.match(text('[role="status"]'), /could not copy/i);
  installClipboard();
});

check('the code block scrolls horizontally instead of stretching the page', () => {
  const css = readFileSync(new URL('../src/styles/code.css', import.meta.url), 'utf8');
  assert.match(css, /\.code-pre\s*\{[^}]*overflow-x:\s*auto/s, 'code area scrolls horizontally');
  assert.match(css, /\.code-rows\s*\{[^}]*width:\s*max-content/s, 'rows size to the longest line');
  assert.match(css, /\.code-ln\s*\{[^}]*position:\s*sticky/s, 'line numbers stay pinned while scrolling');
  const base = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8');
  assert.match(base, /body\s*\{[^}]*overflow-x:\s*clip/s, 'page cannot scroll sideways');
  assert.equal($('.code-rows').style.getPropertyValue('--gutter'), '2');
});

/* ------------------------------------------------------- navigation/back -- */
check('back button returns to the subject program list', async () => {
  await go('#/subject/operating-system/program/lru-page-replacement');
  await click($('.code-toolbar .btn--ghost'));
  assert.equal(window.location.hash, '#/subject/operating-system');
  assert.equal($$('.program-card').length, programs.length);
});

check('breadcrumb links navigate correctly', async () => {
  await go('#/subject/operating-system/program/fifo-page-replacement');
  const crumbs = $$('.breadcrumb-list a');
  assert.equal(crumbs[0].getAttribute('href'), '#/');
  assert.equal(crumbs[1].getAttribute('href'), '#/subject/operating-system');
  await click(crumbs[0]);
  assert.equal(window.location.hash, '#/');
  assert.ok($('.hero-title'));
});

/* ---------------------------------------------------------------- search -- */
check('search filters local programs only', async () => {
  await go('#/');
  const input = $('#home-search');
  await type(input, 'lru');
  assert.equal($$('.program-card').length, 1);
  assert.equal(text('.program-card-title'), 'LRU Page Replacement');
  assert.match(text('.section-count'), /1 match/);

  await type(input, 'fifo');
  assert.equal(text('.program-card-title'), 'FIFO Page Replacement');

  await type(input, 'page');
  assert.equal($$('.program-card').length, 2);

  await type(input, 'zzzz');
  assert.equal($$('.program-card').length, 0);
  assert.match(text('.section-count'), /No programs match/);

  await type(input, '');
  assert.equal($$('.subject-card').length, subjects.length, 'clearing restores the subject grid');
});

check('search is case-insensitive and matches partial titles', async () => {
  await go('#/');
  await type($('#home-search'), 'FIFO');
  assert.equal(text('.program-card-title'), 'FIFO Page Replacement');
});

check('"/" focuses the search field and Escape clears it', async () => {
  await go('#/');
  const input = $('#home-search');
  await key(document.body, '/');
  assert.equal(document.activeElement, input);
  await type(input, 'lru');
  await key(input, 'Escape');
  assert.equal(input.value, '');
  assert.equal($$('.subject-card').length, subjects.length);
});

/* ------------------------------------------------------------ not found -- */
check('unknown routes show a helpful empty state', async () => {
  await go('#/subject/does-not-exist');
  assert.match(text('.empty-state-title'), /not found/i);
  await go('#/subject/operating-system/program/nope');
  assert.match(text('.empty-state-title'), /not found/i);
  await go('#/totally/unknown');
  assert.match(text('.empty-state-title'), /not found/i);
});

check('the built site has no runtime dependencies beyond the bundle', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['react', 'react-dom']);
  assert.ok(!pkg.dependencies['react-router-dom']);
});

/* ------------------------------------------------------------------ run -- */
let failures = 0;
for (const [name, fn] of checks) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`  ✗ ${name}`);
    console.log(`      ${String(error.message).split('\n').join('\n      ')}`);
  }
}

await act(async () => {
  root.unmount();
});

console.log('');
if (failures > 0) {
  console.error(`✗ ${failures} of ${checks.length} checks failed\n`);
  process.exit(1);
}
console.log(`✓ all ${checks.length} checks passed\n`);
