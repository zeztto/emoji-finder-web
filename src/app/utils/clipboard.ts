/** Copy within the user click; keep iframe-compatible fallback and restore focus. */
export async function copyToClipboard(text: string): Promise<boolean> {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  let textArea: HTMLTextAreaElement | null = null;
  try {
    textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    if (document.execCommand('copy')) return true;
  } catch {
    /* Try the modern API below. */
  } finally {
    textArea?.remove();
    previous?.focus({ preventScroll: true });
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* The caller shows a copy failure without recording recent usage. */
  }
  return false;
}
