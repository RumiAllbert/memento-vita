import { atom } from 'nanostores';

export const $activeToast = atom<string | null>(null);
