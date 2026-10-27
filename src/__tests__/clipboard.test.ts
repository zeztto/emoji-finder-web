import { afterEach, expect, it, vi } from 'vitest';
import { copyToClipboard } from '@/app/utils/clipboard';
afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});
it('removes fallback textarea when execCommand throws and restores focus', async () => {
  const button = document.createElement('button');
  document.body.append(button);
  button.focus();
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: vi.fn(() => {
      throw new Error('blocked');
    }),
  });
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
  });
  await copyToClipboard('❤️');
  expect(document.querySelector('textarea')).toBeNull();
  expect(document.activeElement).toBe(button);
});
