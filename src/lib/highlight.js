/**
 * Minimal, dependency-free syntax highlighter for C and C++.
 * ===========================================================================
 *
 * Why hand-rolled instead of Prism/highlight.js:
 *   - zero dependencies and zero network requests;
 *   - the tokenizer is a pure *partition* of the source string, so joining
 *     every token value back together always reproduces the original code
 *     byte-for-byte (see `plainText()` and `npm run validate`). Highlighting
 *     can therefore never change, drop or reorder a single character of the
 *     program that gets copied to the clipboard.
 *
 * It is deliberately small: it understands comments, strings, character
 * literals, preprocessor lines, numbers, keywords, known type names and
 * call-sites. Everything else is emitted as plain text.
 */

const KEYWORDS = new Set([
  'auto', 'break', 'case', 'const', 'continue', 'default', 'do', 'else',
  'enum', 'extern', 'for', 'goto', 'if', 'inline', 'register', 'restrict',
  'return', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
  'volatile', 'while',
  '_Alignas', '_Alignof', '_Atomic', '_Bool', '_Complex', '_Generic',
  '_Imaginary', '_Noreturn', '_Static_assert', '_Thread_local',
  // C++ only — harmless in C, they simply never appear.
  'alignas', 'alignof', 'and', 'asm', 'bool', 'catch', 'class', 'concept',
  'constexpr', 'const_cast', 'decltype', 'delete', 'dynamic_cast',
  'explicit', 'export', 'false', 'friend', 'mutable', 'namespace', 'new',
  'noexcept', 'not', 'operator', 'or', 'private', 'protected', 'public',
  'reinterpret_cast', 'requires', 'static_assert', 'static_cast', 'template',
  'this', 'thread_local', 'throw', 'true', 'try', 'typeid', 'typename',
  'using', 'virtual', 'wchar_t', 'xor',
]);

const TYPE_NAMES = new Set([
  'char', 'double', 'float', 'int', 'long', 'short', 'signed', 'unsigned',
  'void', 'size_t', 'ssize_t', 'ptrdiff_t', 'int8_t', 'int16_t', 'int32_t',
  'int64_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'bool',
  'FILE', 'string', 'vector', 'map', 'set', 'pair', 'cout', 'cin', 'endl',
  'std', 'NULL', 'nullptr',
]);

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const OPERATOR_CHARS = /[+\-*/%=<>!&|^~?:.]/;

function isWhitespace(ch) {
  return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\f' || ch === '\v';
}

/**
 * Split `code` into an ordered array of `{ type, value }` tokens.
 * `Array.prototype.join` of all values is guaranteed to equal `code`.
 *
 * @param {string} code
 * @param {'c'|'cpp'} [language]
 * @returns {{type: string, value: string}[]}
 */
export function tokenize(code, language = 'c') {
  const tokens = [];
  const len = code.length;
  let i = 0;
  let atLineStart = true;

  const push = (type, value) => {
    if (value) tokens.push({ type, value });
  };

  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : '';

    // --- line comment -----------------------------------------------------
    if (ch === '/' && next === '/') {
      let j = i + 2;
      while (j < len && code[j] !== '\n') j += 1;
      push('comment', code.slice(i, j));
      i = j;
      continue;
    }

    // --- block comment (may span several lines) ---------------------------
    if (ch === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      const j = end === -1 ? len : end + 2;
      push('comment', code.slice(i, j));
      i = j;
      atLineStart = false;
      continue;
    }

    // --- string literal ---------------------------------------------------
    if (ch === '"') {
      let j = i + 1;
      while (j < len) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === '"' || code[j] === '\n') break;
        j += 1;
      }
      if (j < len && code[j] === '"') j += 1;
      push('string', code.slice(i, j));
      i = j;
      atLineStart = false;
      continue;
    }

    // --- character literal ------------------------------------------------
    if (ch === "'") {
      let j = i + 1;
      while (j < len) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === "'" || code[j] === '\n') break;
        j += 1;
      }
      if (j < len && code[j] === "'") j += 1;
      push('string', code.slice(i, j));
      i = j;
      atLineStart = false;
      continue;
    }

    // --- preprocessor directive -------------------------------------------
    if (ch === '#' && atLineStart) {
      let j = i + 1;
      // A directive runs to the end of the (logical) line; line continuations
      // are respected so that `#define X \` + newline stays one token.
      while (j < len) {
        if (code[j] === '\\' && code[j + 1] === '\n') {
          j += 2;
          continue;
        }
        if (code[j] === '\n') break;
        j += 1;
      }
      const raw = code.slice(i, j);
      push('preprocessor', raw);
      i = j;
      atLineStart = true;
      continue;
    }

    // --- number -----------------------------------------------------------
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(next))) {
      let j = i;
      if (ch === '0' && (next === 'x' || next === 'X')) {
        j = i + 2;
        while (j < len && /[0-9a-fA-F]/.test(code[j])) j += 1;
      } else if (ch === '0' && (next === 'b' || next === 'B')) {
        j = i + 2;
        while (j < len && /[01]/.test(code[j])) j += 1;
      } else {
        while (j < len && /[0-9]/.test(code[j])) j += 1;
        if (code[j] === '.' && /[0-9]/.test(code[j + 1] || '')) {
          j += 1;
          while (j < len && /[0-9]/.test(code[j])) j += 1;
        }
        if (code[j] === 'e' || code[j] === 'E') {
          let k = j + 1;
          if (code[k] === '+' || code[k] === '-') k += 1;
          if (/[0-9]/.test(code[k] || '')) {
            j = k;
            while (j < len && /[0-9]/.test(code[j])) j += 1;
          }
        }
      }
      while (j < len && /[uUlLfF]/.test(code[j])) j += 1;
      push('number', code.slice(i, j));
      i = j;
      atLineStart = false;
      continue;
    }

    // --- identifier / keyword / call-site ---------------------------------
    if (IDENT_START.test(ch)) {
      let j = i + 1;
      while (j < len && IDENT_PART.test(code[j])) j += 1;
      const word = code.slice(i, j);
      let k = j;
      while (k < len && isWhitespace(code[k])) k += 1;
      let type = 'identifier';
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (TYPE_NAMES.has(word)) type = 'type';
      else if (code[k] === '(') type = 'function';
      push(type, word);
      i = j;
      atLineStart = false;
      continue;
    }

    // --- operator ---------------------------------------------------------
    if (OPERATOR_CHARS.test(ch)) {
      let j = i;
      while (j < len && OPERATOR_CHARS.test(code[j])) j += 1;
      push('operator', code.slice(i, j));
      i = j;
      atLineStart = false;
      continue;
    }

    // --- punctuation, whitespace, everything else -------------------------
    if (ch === '\n') {
      push('plain', '\n');
      i += 1;
      atLineStart = true;
      continue;
    }
    push('plain', ch);
    i += 1;
    if (!isWhitespace(ch)) atLineStart = false;
  }

  // Merge neighbouring tokens of the same type: identical colours, far fewer
  // DOM nodes (a run of spaces or punctuation becomes one span).
  const merged = [];
  for (const token of tokens) {
    const previous = merged[merged.length - 1];
    if (previous && previous.type === token.type) previous.value += token.value;
    else merged.push({ type: token.type, value: token.value });
  }
  return merged;
}

/**
 * Turn tokens into one entry per source line, preserving the token type across
 * line breaks so that multi-line comments and strings keep their colour.
 *
 * @param {{type: string, value: string}[]} tokens
 * @returns {{type: string, value: string}[][]}
 */
export function tokensToLines(tokens) {
  const lines = [[]];
  for (const token of tokens) {
    if (token.value.indexOf('\n') === -1) {
      lines[lines.length - 1].push(token);
      continue;
    }
    const parts = token.value.split('\n');
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, value: part });
    });
  }
  return lines;
}

/** Rebuild the original source from tokenized lines (used by validation). */
export function plainText(lines) {
  return lines
    .map((line) => line.map((token) => token.value).join(''))
    .join('\n');
}

/**
 * Convenience helper: `code` -> per-line tokens.
 * @param {string} code
 * @param {'c'|'cpp'} [language]
 */
export function highlightLines(code, language = 'c') {
  return tokensToLines(tokenize(code, language));
}

/** Normalise the free-form `language` field from the data file. */
export function normalizeLanguage(language) {
  const value = String(language || '').toLowerCase().replace(/\s+/g, '');
  if (value === 'c++' || value === 'cpp' || value === 'cplusplus') return 'cpp';
  return 'c';
}
