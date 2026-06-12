import * as SecureStore from 'expo-secure-store';

async function getItemAsync(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function setItemAsync(key: string, value: string): Promise<void> {
  return SecureStore.setItemAsync(key, value);
}

async function deleteItemAsync(key: string): Promise<void> {
  return SecureStore.deleteItemAsync(key);
}

export const secureStorage = { getItemAsync, setItemAsync, deleteItemAsync };
