import { Song } from '../types';

const DB_NAME = 'ipod_db';
const DB_VERSION = 1;
const STORE_NAME = 'library';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveSong = async (song: Song, blob?: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const dataToSave = { ...song };
    if (blob) {
      (dataToSave as any).fileBlob = blob;
    }
    
    const request = store.put(dataToSave);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getLibrary = async (): Promise<Song[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const results = request.result.map((item: any) => {
        const { fileBlob, ...songMetadata } = item;
        if (fileBlob) {
           songMetadata.url = URL.createObjectURL(fileBlob);
           songMetadata.source = 'local';
        }
        return songMetadata as Song;
      });
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSong = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
