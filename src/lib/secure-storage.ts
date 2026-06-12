import { Platform } from 'react-native';

// expo-secure-store không hỗ trợ web — dùng localStorage làm fallback
const isWeb = Platform.OS === 'web';

async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  const { getItemAsync } = await import('expo-secure-store');
  return getItemAsync(key);
}

async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
    return;
  }
  const { setItemAsync } = await import('expo-secure-store');
  return setItemAsync(key, value);
}

async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return;
  }
  const { deleteItemAsync } = await import('expo-secure-store');
  return deleteItemAsync(key);
}

export const secureStorage = { getItemAsync, setItemAsync, deleteItemAsync };
