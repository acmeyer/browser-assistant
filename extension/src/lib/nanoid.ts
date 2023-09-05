import { customAlphabet } from 'nanoid';
export const nanoid = customAlphabet(
  '01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  10
);
