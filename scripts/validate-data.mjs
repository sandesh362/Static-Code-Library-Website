#!/usr/bin/env node
/**
 * Offline sanity check for the data file — run with `npm run validate`.
 *
 * It verifies the invariants the UI relies on and, most importantly, that the
 * highlighter is a pure partition of the source: joining every token back
 * together must reproduce each program's code byte-for-byte, which is what
 * guarantees the Copy Code button returns the original file.
 */
import { programs, subjects, programsBySubject } from '../src/data/programs.js';
import { highlightLines, plainText, normalizeLanguage } from '../src/lib/highlight.js';

const problems = [];
const fail = (message) => problems.push(message);

const URL_SAFE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// --- subjects --------------------------------------------------------------
const subjectIds = new Set();
for (const subject of subjects) {
  if (!subject.id) fail(`a subject is missing an id`);
  else if (subjectIds.has(subject.id)) fail(`duplicate subject id "${subject.id}"`);
  else subjectIds.add(subject.id);

  if (!URL_SAFE.test(subject.id || '')) {
    fail(`subject id "${subject.id}" should be lower-case and hyphenated`);
  }
  if (!subject.name) fail(`subject "${subject.id}" has no name`);
}

// --- programs --------------------------------------------------------------
const programIds = new Set();
const seenTitles = new Set();

for (const program of programs) {
  const label = program.id || program.title || '(unnamed program)';

  if (!program.id) fail(`${label}: missing id`);
  else if (programIds.has(program.id)) fail(`duplicate program id "${program.id}"`);
  else programIds.add(program.id);

  if (!URL_SAFE.test(program.id || '')) {
    fail(`program id "${program.id}" should be lower-case and hyphenated`);
  }
  if (!program.title) fail(`${label}: missing title`);
  if (!program.language) fail(`${label}: missing language`);
  if (!program.subjectId) fail(`${label}: missing subjectId`);
  else if (!subjectIds.has(program.subjectId)) {
    fail(`${label}: subjectId "${program.subjectId}" is not declared in subjects`);
  }

  if (typeof program.code !== 'string' || program.code.trim() === '') {
    fail(`${label}: code is empty`);
    continue;
  }

  const titleKey = `${program.subjectId}::${String(program.title).toLowerCase()}`;
  if (seenTitles.has(titleKey)) {
    fail(`${label}: duplicate title "${program.title}" inside ${program.subjectId}`);
  }
  seenTitles.add(titleKey);

  // The critical check: highlighting must never change the source text.
  const lines = highlightLines(program.code, normalizeLanguage(program.language));
  if (plainText(lines) !== program.code) {
    fail(`${label}: highlighted output does not match the original source`);
  }
  if (lines.length !== program.code.split('\n').length) {
    fail(`${label}: line count changed while highlighting`);
  }
}

// --- no empty categories ---------------------------------------------------
for (const { subject, programs: subjectPrograms } of programsBySubject) {
  if (subjectPrograms.length === 0) {
    fail(`subject "${subject.id}" has no programs and would render as an empty category`);
  }
}
for (const id of subjectIds) {
  if (!programs.some((program) => program.subjectId === id)) {
    fail(`subject "${id}" is not referenced by any program`);
  }
}

// --- report ----------------------------------------------------------------
if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} problem(s) in src/data/programs.js:\n`);
  for (const problem of problems) console.error(`  • ${problem}`);
  console.error('');
  process.exit(1);
}

console.log('\n✓ src/data/programs.js is valid\n');
for (const { subject, programs: subjectPrograms } of programsBySubject) {
  console.log(`  ${subject.name}  (${subjectPrograms.length})`);
  for (const program of subjectPrograms) {
    console.log(
      `    - ${program.title}  [${program.language}]  ` +
        `${program.code.split('\n').length} lines, ${program.code.length} chars`
    );
  }
}
console.log(
  `\n  ${programs.length} program(s) across ${programsBySubject.length} subject(s); ` +
    `every program round-trips through the highlighter unchanged.\n`
);
