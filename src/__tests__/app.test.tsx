import React, { StrictMode } from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/app/App';
import { toast } from 'sonner';
vi.mock('@/app/data/emojis', () => ({
  emojiCategories: [
    { name: '스마일 & 감정', emojis: ['😀'] },
    { name: '동물', emojis: ['🐶'] },
    { name: '심볼', emojis: ['❤️'] },
  ],
}));
vi.mock('sonner', () => ({ Toaster: () => null, toast: { success: vi.fn(), error: vi.fn() } }));
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => true) });
});
afterEach(() => vi.restoreAllMocks());
describe('emoji user journeys and persisted state boundaries', () => {
  it('keeps valid favorites and recent values through StrictMode mount', () => {
    localStorage.setItem('emojiFavorites', '["🐶"]');
    localStorage.setItem('emojiHistory', '["😀"]');
    render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    expect(JSON.parse(localStorage.getItem('emojiFavorites')!)).toEqual(['🐶']);
    expect(JSON.parse(localStorage.getItem('emojiHistory')!)).toEqual(['😀']);
  });
  it.each(['null', '{}', '42', '"text"'])('recovers JSON with wrong shape %s', (value) => {
    localStorage.setItem('emojiFavorites', value);
    localStorage.setItem('emojiHistory', value);
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByRole('heading', { name: '이모지 모음' })).toBeInTheDocument();
  });
  it('survives storage read and write denial with visible warning', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByRole('alert')).toHaveTextContent('저장');
  });
  it('searches English category aliases case-insensitively', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ANIMAL' } });
    expect(screen.getByRole('button', { name: /^🐶(?: 복사)?$/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^😀(?: 복사)?$/ })).not.toBeInTheDocument();
  });
  it('searches Korean normalized text and variation-selector emoji', () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '동물'.normalize('NFD') } });
    expect(screen.getByRole('button', { name: /^🐶(?: 복사)?$/ })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '❤︎' } });
    expect(screen.getByRole('button', { name: /^❤️(?: 복사)?$/ })).toBeInTheDocument();
  });
  it('persists favorite and successful copy; clear recent persists', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /즐겨찾기 추가/ })[0]);
    expect(JSON.parse(localStorage.getItem('emojiFavorites')!)).toEqual(['😀']);
    fireEvent.click(screen.getByRole('button', { name: /^😀(?: 복사)?$/ }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('emojiHistory')!)).toEqual(['😀']));
    fireEvent.mouseDown(screen.getByRole('tab', { name: /최근 사용/ }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(screen.getByRole('button', { name: '기록 지우기' }));
    expect(JSON.parse(localStorage.getItem('emojiHistory')!)).toEqual([]);
  });
  it('does not record recent usage when both clipboard paths fail', async () => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => false),
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^😀(?: 복사)?$/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(JSON.parse(localStorage.getItem('emojiHistory')!)).toEqual([]);
  });
});
it('preserves corrupt raw history through mount, edits and clear without blocking a valid favorite key', async () => {
  const raw = '["😀",{"unrecognized":true}]';
  localStorage.setItem('emojiHistory', raw);
  localStorage.setItem('emojiFavorites', '["🐶"]');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^❤️(?: 복사)?$/ }));
  await waitFor(() => expect(toast.success).toHaveBeenCalled());
  expect(localStorage.getItem('emojiHistory')).toBe(raw);
  fireEvent.mouseDown(screen.getByRole('tab', { name: /최근 사용/ }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.click(screen.getByRole('button', { name: '기록 지우기' }));
  expect(localStorage.getItem('emojiHistory')).toBe(raw);
  expect(JSON.parse(localStorage.getItem('emojiFavorites')!)).toEqual(['🐶']);
});
it('does not write either key when reads fail even if writes would succeed', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('read denied', 'SecurityError');
  });
  const write = vi.spyOn(Storage.prototype, 'setItem');
  render(<App />);
  fireEvent.click(screen.getAllByRole('button', { name: /즐겨찾기 추가/ })[0]);
  expect(write).not.toHaveBeenCalled();
});
it('preserves a key corrupted after a healthy mount', () => {
  render(<App />);
  const raw = '{"late":"corrupt"}';
  localStorage.setItem('emojiFavorites', raw);
  fireEvent.click(screen.getAllByRole('button', { name: /즐겨찾기 추가/ })[0]);
  expect(localStorage.getItem('emojiFavorites')).toBe(raw);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
it('does not overwrite when a previously healthy key becomes unreadable', () => {
  render(<App />);
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('late denied', 'SecurityError');
  });
  const write = vi.spyOn(Storage.prototype, 'setItem');
  fireEvent.click(screen.getAllByRole('button', { name: /즐겨찾기 추가/ })[0]);
  expect(write).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
