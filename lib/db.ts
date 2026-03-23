/**
 * IndexedDB data layer for StickAINote.
 * Stores notes, versions, and settings offline-first.
 */

// --- DATA TYPES ---

export interface NoteTableCell {
  value: string;
  type: "text" | "checkbox";
  checked?: boolean;
}

export interface NoteTableRow {
  id: string;
  cells: NoteTableCell[];
}

export interface NoteTableData {
  id: string;
  columns: string[];
  rows: NoteTableRow[];
}

export type NotePriority = "none" | "low" | "medium" | "high";

export interface NoteRecord {
  id: string;
  title: string;
  content: string; // HTML from rich editor
  color: string;
  pinned: boolean;
  priority: NotePriority;
  deleted: boolean;
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
  tables: NoteTableData[];
}

export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  tables: NoteTableData[];
  createdAt: number;
}

export interface AppSettings {
  id: string;
  autoCorrect: boolean;
  trashRetentionDays: number;
  maxVersionsPerNote: number;
  darkMode: boolean;
}

// --- CONSTANTS ---

const DB_NAME = "stickanote-db";
const DB_VERSION = 1;
const STORE_NOTES = "notes";
const STORE_VERSIONS = "versions";
const STORE_SETTINGS = "settings";

const DEFAULT_SETTINGS: AppSettings = {
  id: "default",
  autoCorrect: true,
  trashRetentionDays: 30,
  maxVersionsPerNote: 10,
  darkMode: false,
};

// --- PERSISTENT STORAGE ---

const LS_BACKUP_KEY = "stickanote-notes-backup";

/**
 * Request persistent storage so the browser won't evict IndexedDB data
 * when the PWA is installed on desktop. This is the primary fix for
 * notes disappearing after PC restart.
 */
async function requestPersistentStorage(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return;
  try {
    const persisted = await navigator.storage.persisted();
    if (!persisted) {
      await navigator.storage.persist();
    }
  } catch {
    /* Best-effort – ignore errors on unsupported browsers */
  }
}

// --- LOCAL-STORAGE BACKUP ---

/**
 * Write a compact snapshot of all notes to localStorage.
 * This acts as a safety-net: if IndexedDB is somehow cleared
 * (e.g. by the OS reclaiming storage), we can restore from here.
 */
function backupNotesToLocalStorage(notes: NoteRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(notes));
  } catch {
    /* localStorage may be full – silently ignore */
  }
}

/**
 * Debounced helper to re-read all notes from IndexedDB and write them
 * to the localStorage backup. Called after every write operation.
 */
let _backupTimer: ReturnType<typeof setTimeout> | null = null;
function refreshBackup(): void {
  if (_backupTimer) clearTimeout(_backupTimer);
  _backupTimer = setTimeout(async () => {
    try {
      const { store } = await tx(STORE_NOTES, "readonly");
      const all: NoteRecord[] = await reqToPromise(store.getAll());
      backupNotesToLocalStorage(all);
    } catch {
      /* best-effort */
    }
  }, 500);
}

/**
 * Read the backup from localStorage (returns [] if none exists).
 */
function readBackupFromLocalStorage(): NoteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_BACKUP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --- DB INIT ---

let dbInstance: IDBDatabase | null = null;
let persistentStorageRequested = false;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        const notesStore = db.createObjectStore(STORE_NOTES, { keyPath: "id" });
        notesStore.createIndex("deleted", "deleted", { unique: false });
        notesStore.createIndex("pinned", "pinned", { unique: false });
        notesStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_VERSIONS)) {
        const versionsStore = db.createObjectStore(STORE_VERSIONS, { keyPath: "id" });
        versionsStore.createIndex("noteId", "noteId", { unique: false });
        versionsStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      // Clear cached instance if connection is closed externally
      dbInstance.onclose = () => { dbInstance = null; };
      // Handle version change from another tab
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      // Request persistent storage once per session
      if (!persistentStorageRequested) {
        persistentStorageRequested = true;
        requestPersistentStorage();
      }

      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

function tx(
  storeName: string,
  mode: IDBTransactionMode
): Promise<{ store: IDBObjectStore; tx: IDBTransaction }> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, mode);
    return { store: transaction.objectStore(storeName), tx: transaction };
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- HELPERS ---

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// --- NOTES CRUD ---

export async function createNote(
  partial?: Partial<NoteRecord>
): Promise<NoteRecord> {
  const now = Date.now();
  const note: NoteRecord = {
    id: makeId(),
    title: partial?.title ?? "Untitled Note",
    content: partial?.content ?? "",
    color: partial?.color ?? "#fef3c7",
    pinned: partial?.pinned ?? false,
    priority: partial?.priority ?? "none",
    deleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    tables: partial?.tables ?? [],
  };

  const { store } = await tx(STORE_NOTES, "readwrite");
  await reqToPromise(store.put(note));
  // Keep localStorage backup in sync
  refreshBackup();
  return note;
}

/** Upsert a full NoteRecord (used by cloud sync to write pulled notes) */
export async function putNote(note: NoteRecord): Promise<void> {
  const { store } = await tx(STORE_NOTES, "readwrite");
  await reqToPromise(store.put(note));
  // Keep localStorage backup in sync
  refreshBackup();
}

export async function getNote(id: string): Promise<NoteRecord | undefined> {
  const { store } = await tx(STORE_NOTES, "readonly");
  return reqToPromise(store.get(id));
}

export async function getAllNotes(): Promise<NoteRecord[]> {
  const { store } = await tx(STORE_NOTES, "readonly");
  let all: NoteRecord[] = await reqToPromise(store.getAll());

  // --- RECOVERY: if IndexedDB is empty, try restoring from localStorage backup ---
  if (all.length === 0) {
    const backup = readBackupFromLocalStorage();
    if (backup.length > 0) {
      // Restore all backed-up notes into IndexedDB
      for (const note of backup) {
        const { store: wStore } = await tx(STORE_NOTES, "readwrite");
        await reqToPromise(wStore.put(note));
      }
      // Re-read after recovery
      const { store: freshStore } = await tx(STORE_NOTES, "readonly");
      all = await reqToPromise(freshStore.getAll());
    }
  }

  const active = all
    .filter((n) => !n.deleted)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });

  // Keep localStorage backup in sync (includes deleted notes for full recovery)
  backupNotesToLocalStorage(all);

  return active;
}

export async function getTrashNotes(): Promise<NoteRecord[]> {
  const { store } = await tx(STORE_NOTES, "readonly");
  const all: NoteRecord[] = await reqToPromise(store.getAll());
  return all.filter((n) => n.deleted).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateNote(
  id: string,
  patch: Partial<NoteRecord>
): Promise<NoteRecord | undefined> {
  const { store } = await tx(STORE_NOTES, "readwrite");
  const existing: NoteRecord | undefined = await reqToPromise(store.get(id));
  if (!existing) return undefined;

  const updated = { ...existing, ...patch, updatedAt: Date.now() };
  await reqToPromise(store.put(updated));
  // Keep localStorage backup in sync
  refreshBackup();
  return updated;
}

export async function softDeleteNote(id: string): Promise<void> {
  await updateNote(id, { deleted: true, deletedAt: Date.now() });
}

export async function restoreNote(id: string): Promise<void> {
  await updateNote(id, { deleted: false, deletedAt: null });
}

export async function permanentDeleteNote(id: string): Promise<void> {
  const { store } = await tx(STORE_NOTES, "readwrite");
  await reqToPromise(store.delete(id));
  // Also delete versions
  await deleteVersionsForNote(id);
  // Keep localStorage backup in sync
  refreshBackup();
}

export async function purgeOldTrash(retentionDays: number): Promise<void> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const trashed = await getTrashNotes();
  for (const note of trashed) {
    if (note.deletedAt && note.deletedAt < cutoff) {
      await permanentDeleteNote(note.id);
    }
  }
}

// --- VERSIONS ---

export async function saveVersion(note: NoteRecord): Promise<NoteVersion> {
  const version: NoteVersion = {
    id: makeId(),
    noteId: note.id,
    title: note.title,
    content: note.content,
    tables: note.tables,
    createdAt: Date.now(),
  };

  const { store } = await tx(STORE_VERSIONS, "readwrite");
  await reqToPromise(store.put(version));

  // Enforce max versions
  const settings = await getSettings();
  const versions = await getVersionsForNote(note.id);
  if (versions.length > settings.maxVersionsPerNote) {
    const toDelete = versions.slice(settings.maxVersionsPerNote);
    const { store: vStore } = await tx(STORE_VERSIONS, "readwrite");
    for (const v of toDelete) {
      await reqToPromise(vStore.delete(v.id));
    }
  }

  return version;
}

export async function getVersionsForNote(
  noteId: string
): Promise<NoteVersion[]> {
  const { store } = await tx(STORE_VERSIONS, "readonly");
  const all: NoteVersion[] = await reqToPromise(store.getAll());
  return all
    .filter((v) => v.noteId === noteId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

async function deleteVersionsForNote(noteId: string): Promise<void> {
  const versions = await getVersionsForNote(noteId);
  if (versions.length === 0) return;
  const { store } = await tx(STORE_VERSIONS, "readwrite");
  for (const v of versions) {
    await reqToPromise(store.delete(v.id));
  }
}

// --- SETTINGS ---

export async function getSettings(): Promise<AppSettings> {
  try {
    const { store } = await tx(STORE_SETTINGS, "readonly");
    const result = await reqToPromise(store.get("default"));
    return result || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  patch: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...patch, id: "default" };
  const { store } = await tx(STORE_SETTINGS, "readwrite");
  await reqToPromise(store.put(updated));
  return updated;
}

// --- MIGRATION: Import from old localStorage ---

export async function migrateFromLocalStorage(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const migrated = window.localStorage.getItem("stickanote-migrated-v2");
  if (migrated === "1") return false;

  let imported = false;

  // Migrate basic note
  const basicRaw = window.localStorage.getItem("stickanote-basic-v1");
  if (basicRaw) {
    try {
      const parsed = JSON.parse(basicRaw);
      if (parsed.text && parsed.text.trim()) {
        await createNote({
          title: parsed.title || "My Basic Note",
          content: parsed.text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>"),
          color: parsed.color || "#fef3c7",
        });
        imported = true;
      }
    } catch {
      /* ignore */
    }
  }

  // Migrate pro note
  const proRaw = window.localStorage.getItem("stickanote-note-svg-v2");
  if (proRaw) {
    try {
      const parsed = JSON.parse(proRaw);
      if (parsed.text && parsed.text.trim()) {
        await createNote({
          title: parsed.title || "Pro Note",
          content: parsed.text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>"),
          color: parsed.color || "#e0f2fe",
        });
        imported = true;
      }
    } catch {
      /* ignore */
    }
  }

  window.localStorage.setItem("stickanote-migrated-v2", "1");
  return imported;
}

// --- EXPORT / IMPORT ---

export async function exportAllNotes(): Promise<string> {
  const notes = await getAllNotes();
  const trash = await getTrashNotes();
  const allVersions: NoteVersion[] = [];
  for (const note of [...notes, ...trash]) {
    const versions = await getVersionsForNote(note.id);
    allVersions.push(...versions);
  }
  const settings = await getSettings();

  return JSON.stringify(
    { notes, trash, versions: allVersions, settings, exportedAt: Date.now() },
    null,
    2
  );
}

export async function importNotes(json: string): Promise<number> {
  const data = JSON.parse(json);
  let count = 0;
  const notes = data.notes || data;

  const arr = Array.isArray(notes) ? notes : [];
  for (const note of arr) {
    if (note.id && typeof note.id === "string" && note.title !== undefined) {
      const sanitized: NoteRecord = {
        id: note.id,
        title: String(note.title ?? ""),
        content: String(note.content ?? ""),
        color: String(note.color ?? "#fef3c7"),
        pinned: Boolean(note.pinned),
        priority: ["none", "low", "medium", "high"].includes(note.priority) ? note.priority : "none",
        deleted: Boolean(note.deleted),
        deletedAt: typeof note.deletedAt === "number" ? note.deletedAt : null,
        createdAt: typeof note.createdAt === "number" ? note.createdAt : Date.now(),
        updatedAt: typeof note.updatedAt === "number" ? note.updatedAt : Date.now(),
        tables: Array.isArray(note.tables) ? note.tables : [],
      };
      const { store } = await tx(STORE_NOTES, "readwrite");
      await reqToPromise(store.put(sanitized));
      count++;
    }
  }

  if (data.versions && Array.isArray(data.versions)) {
    for (const v of data.versions) {
      const { store } = await tx(STORE_VERSIONS, "readwrite");
      await reqToPromise(store.put(v));
    }
  }

  return count;
}
