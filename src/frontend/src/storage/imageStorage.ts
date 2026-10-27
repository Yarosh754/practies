import { loadFromStorage, saveToStorage } from './storage';

const IMAGES_KEY = 'images';

export const saveImageToStorage = (base64: string): string => {
  const images = loadFromStorage<Record<string, string>>(IMAGES_KEY, {});
  const id = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  images[id] = base64;
  saveToStorage(IMAGES_KEY, images);
  return id;
};

export const getImageFromStorage = (id: string): string | null => {
  const images = loadFromStorage<Record<string, string>>(IMAGES_KEY, {});
  return images[id] || null;
};