export interface AlarmScheduleEntry {
  key: string
  triggerId: string
  date: string
  fireAt: number
  title: string
  body: string
  kind: string
  slot?: string
  hint?: string
  fired: boolean
}

const DB_NAME = 'yungdrungAlarms'
const STORE = 'schedule'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE)) {
        const objectStore = database.createObjectStore(STORE, { keyPath: 'key' })
        objectStore.createIndex('fireAt', 'fireAt', { unique: false })
        objectStore.createIndex('fired', 'fired', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDb().then(
    (database) =>
      new Promise<T | void>((resolve, reject) => {
        const transaction = database.transaction(STORE, mode)
        const store = transaction.objectStore(STORE)
        const request = fn(store)

        transaction.oncomplete = () => {
          database.close()
          if (request) {
            resolve((request as IDBRequest<T>).result)
          } else {
            resolve()
          }
        }
        transaction.onerror = () => {
          database.close()
          reject(transaction.error)
        }
        if (request) {
          request.onerror = () => reject(request.error)
        }
      }),
  )
}

export async function replaceAlarmSchedule(entries: AlarmScheduleEntry[]): Promise<void> {
  const database = await openDb()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite')
    const store = transaction.objectStore(STORE)
    store.clear()
    for (const entry of entries) {
      store.put(entry)
    }
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

export async function getAllAlarmEntries(): Promise<AlarmScheduleEntry[]> {
  const result = await withStore<AlarmScheduleEntry[]>('readonly', (store) => store.getAll())
  return (result as AlarmScheduleEntry[] | void) ?? []
}

export async function getOverdueAlarmEntries(now = Date.now()): Promise<AlarmScheduleEntry[]> {
  const entries = await getAllAlarmEntries()
  return entries
    .filter((entry) => !entry.fired && entry.fireAt <= now)
    .sort((a, b) => a.fireAt - b.fireAt)
}

export async function getNextAlarmEntry(now = Date.now()): Promise<AlarmScheduleEntry | null> {
  const entries = await getAllAlarmEntries()
  return (
    entries
      .filter((entry) => !entry.fired && entry.fireAt > now)
      .sort((a, b) => a.fireAt - b.fireAt)[0] ?? null
  )
}

export async function markAlarmEntryFired(key: string): Promise<void> {
  const database = await openDb()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite')
    const store = transaction.objectStore(STORE)
    const request = store.get(key)
    request.onsuccess = () => {
      const entry = request.result as AlarmScheduleEntry | undefined
      if (entry) {
        store.put({ ...entry, fired: true })
      }
    }
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

export async function clearAlarmEntryFiredForTrigger(triggerId: string): Promise<void> {
  const entries = await getAllAlarmEntries()
  const database = await openDb()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite')
    const store = transaction.objectStore(STORE)
    for (const entry of entries) {
      if (entry.triggerId === triggerId) {
        store.put({ ...entry, fired: false })
      }
    }
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

export async function syncTodayFiredFromStore(
  markFired: (triggerId: string) => void,
  today = new Date(),
): Promise<void> {
  const todayKey = today.toISOString().slice(0, 10)
  const entries = await getAllAlarmEntries()
  for (const entry of entries) {
    if (entry.date === todayKey && entry.fired) {
      markFired(entry.triggerId)
    }
  }
}
