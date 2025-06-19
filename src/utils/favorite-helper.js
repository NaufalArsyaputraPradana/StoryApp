export class FavoriteHelper {
  static DB_NAME = 'storyapp-save-db';
  static DB_VERSION = 1;
  static STORE_NAME = 'saves';

  static async openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Browser tidak mendukung IndexedDB'));
        return;
      }
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onerror = () => reject(new Error('Gagal membuka database saves'));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  static async addToSaves(story) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.put(story);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Gagal menambahkan story ke favorit'));
    });
  }

  static async removeFromSaves(id) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Gagal menghapus story dari favorit'));
    });
  }

  static async getSaves() {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Gagal mengambil daftar favorit'));
    });
  }

  static async isSaves(id) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(new Error('Gagal memeriksa status favorit'));
    });
  }
}