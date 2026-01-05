/**
 * IndexedDB storage for file data
 * Solves localStorage 5MB limit by using IndexedDB
 */

const DB_NAME = 'logbook-files';
const STORE_NAME = 'entries';
const DB_VERSION = 1;

interface StoredEntry {
    id: string;
    fileData?: string;
    fileName?: string;
    timestamp: number;
}

class FileStorage {
    private dbPromise: Promise<IDBDatabase> | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });

        return this.dbPromise;
    }

    async saveEntry(entryId: string, fileData?: string, fileName?: string): Promise<void> {
        if (!fileData && !fileName) return;

        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const entry: StoredEntry = {
                id: entryId,
                fileData,
                fileName,
                timestamp: Date.now()
            };

            await new Promise((resolve, reject) => {
                const request = store.put(entry);
                request.onsuccess = () => resolve(null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to save entry to IndexedDB:', error);
        }
    }

    async getEntry(entryId: string): Promise<StoredEntry | null> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.get(entryId);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to get entry from IndexedDB:', error);
            return null;
        }
    }

    async deleteEntry(entryId: string): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            await new Promise((resolve, reject) => {
                const request = store.delete(entryId);
                request.onsuccess = () => resolve(null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to delete entry from IndexedDB:', error);
        }
    }

    async clearAll(): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve(null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to clear IndexedDB:', error);
        }
    }
}

export const fileStorage = new FileStorage();
