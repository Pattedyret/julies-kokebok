/**
 * Bilder lagres i IndexedDB (ikke localStorage) — kvoten er mange ganger
 * større, så boka tåler mange fotografier. Alle funksjoner svelger feil
 * (privat modus o.l.) og degraderer til «ingen bilder».
 */

const DB_NAME = 'julies-kokebok';
const STORE = 'images';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await request(fn(db.transaction(STORE, mode).objectStore(STORE)));
  } finally {
    db.close();
  }
}

export async function getImage(recipeId: string): Promise<string | undefined> {
  try {
    const v = await withStore<unknown>('readonly', (s) => s.get(recipeId));
    return typeof v === 'string' ? v : undefined;
  } catch {
    return undefined;
  }
}

export async function setImage(recipeId: string, dataUrl: string): Promise<boolean> {
  try {
    await withStore('readwrite', (s) => s.put(dataUrl, recipeId));
    return true;
  } catch {
    return false;
  }
}

export async function deleteImage(recipeId: string): Promise<void> {
  try {
    await withStore('readwrite', (s) => s.delete(recipeId));
  } catch {
    /* uviktig */
  }
}

export async function getAllImages(): Promise<Record<string, string>> {
  try {
    const db = await openDb();
    try {
      const store = db.transaction(STORE, 'readonly').objectStore(STORE);
      const [keys, values] = await Promise.all([
        request(store.getAllKeys()),
        request(store.getAll() as IDBRequest<unknown[]>),
      ]);
      const out: Record<string, string> = {};
      keys.forEach((k, i) => {
        const v = values[i];
        if (typeof k === 'string' && typeof v === 'string') out[k] = v;
      });
      return out;
    } finally {
      db.close();
    }
  } catch {
    return {};
  }
}
