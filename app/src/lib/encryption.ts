// ============================================================
// SYSTEM — Encryption for .system File Export/Import
// ============================================================

import CryptoJS from 'crypto-js';

const DEFAULT_KEY = 'SYSTEM-Player-Encryption-Key-2024';

export function encryptData(data: Record<string, unknown>, password?: string): string {
  const jsonStr = JSON.stringify(data);
  const key = password || DEFAULT_KEY;
  const encrypted = CryptoJS.AES.encrypt(jsonStr, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: CryptoJS.lib.WordArray.random(16),
  });
  return encrypted.toString();
}

export function decryptData(encryptedStr: string, password?: string): Record<string, unknown> | null {
  try {
    const key = password || DEFAULT_KEY;
    const decrypted = CryptoJS.AES.decrypt(encryptedStr, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function downloadSystemFile(encryptedData: string, filename?: string): void {
  const blob = new Blob([encryptedData], { type: 'application/system' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `SYSTEM-Save-${new Date().toISOString().split('T')[0]}.system`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function readSystemFile(file: File): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const encrypted = e.target?.result as string;
        resolve(decryptData(encrypted));
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
