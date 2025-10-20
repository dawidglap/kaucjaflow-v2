// lib/idb.ts
import { openDB, type IDBPDatabase } from 'idb';

export type EventType = 'PLASTIC' | 'ALU' | 'SZKLO';

export type LocalEvent = {
    id?: number;              // autoincrement per shop
    type: EventType;
    ts: number;
    synced?: boolean;
    client_event_id?: string; // id lato server
};

// DB per shop: nome diverso => isolamento totale
async function getDb(shopId: string) {
    const name = `kaucjaflow-pos-${shopId}`;
    return openDB(name, 3, {
        upgrade(db, oldVersion) {
            if (oldVersion < 1) db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
            // v2: added `synced` (no schema change)
            // v3: added `client_event_id` (no schema change)
        },
    });
}

export async function addEvent(shopId: string, type: EventType) {
    const db = await getDb(shopId);
    await db.add('events', { type, ts: Date.now(), synced: false });
}

export async function allToday(shopId: string): Promise<LocalEvent[]> {
    const db = await getDb(shopId);
    const all = await db.getAll('events');
    const today = new Date().toISOString().slice(0, 10);
    return all.filter(e => new Date(e.ts).toISOString().slice(0, 10) === today);
}

export async function markSynced(shopId: string, ids: number[]) {
    const db = await getDb(shopId);
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    for (const id of ids) {
        const e = await store.get(id);
        if (e) await store.put({ ...e, synced: true, client_event_id: e.client_event_id ?? String(id) });
    }
    await tx.done;
}

export async function clearAll(shopId: string) {
    const db = await getDb(shopId);
    await db.clear('events');
}

/** Upsert da server: aggiunge solo ciò che manca, non tocca gli unsynced locali */
export async function upsertFromServer(
    shopId: string,
    serverEvents: Array<{ client_event_id?: string; type: EventType; ts: number }>
) {
    const db = await getDb(shopId);
    const today = await allToday(shopId);
    const have = new Set(
        today.map(e => e.client_event_id).filter(Boolean) as string[]
    );

    const toInsert = serverEvents.filter(se => se.client_event_id && !have.has(String(se.client_event_id)));
    if (!toInsert.length) return { inserted: 0 };

    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    for (const se of toInsert) {
        await store.add({
            type: se.type,
            ts: se.ts,
            synced: true,                          // già sul server
            client_event_id: String(se.client_event_id),
        } as LocalEvent);
    }
    await tx.done;
    return { inserted: toInsert.length };
}
