/**
 * Copy text to the clipboard.
 *
 * Uses the async Clipboard API when it is available (secure contexts), and
 * falls back to the legacy `execCommand('copy')` trick with a hidden
 * textarea so the button still works on `http://` origins, in older browsers
 * and inside some in-app webviews.
 *
 * @param {string} text exact text to place on the clipboard
 * @returns {Promise<{ok: boolean, method: 'clipboard'|'fallback'|'none'}>}
 */
export async function copyText(text) {
  const value = String(text);

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(value);
      return { ok: true, method: 'clipboard' };
    } catch {
      // Permission denied or blocked — try the fallback below.
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    textarea.setSelectionRange(0, value.length);

    const ok = document.execCommand('copy');

    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
    document.body.removeChild(textarea);

    return { ok: Boolean(ok), method: 'fallback' };
  } catch {
    return { ok: false, method: 'none' };
  }
}
