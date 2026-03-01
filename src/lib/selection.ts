export const normalizeSelection = (input: string): string => input.replace(/\s+/g, ' ').trim();

export const getSelectedText = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return normalizeSelection(window.getSelection()?.toString() ?? '');
};
