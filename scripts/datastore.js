"use strict";

import Dexie from "./vendor/dexie.js";

function getDb() {
    const db = new Dexie("LibraryDb");
    db.version(1).stores({
        books: "&isbn,title,author,subtitle,description,cover",
        users: "&id,profileimg,name,borrowed",
    });
    return db;
}

export function add(item, ob) {
    const db = getDb();
    db[item]
        .add(ob)
        .then((e) => console.log("Added item with id: " + e))
        .catch((e) => console.error("Error adding item with id: " + e));
}

export async function get(item, id, idField = "id") {
    const db = getDb();
    return (await db[item].where(idField).equals(id).toArray())[0];
}

export async function count(item) {
    const db = getDb();
    return await db[item].count();
}

export function update(item, updated) {
    const db = getDb();
    db[item]
        .put(updated)
        .then((e) => console.log("Updated item with id: " + e))
        .catch((e) => console.error("Error updating item with id: " + e));
}

export function remove(item, id) {
    const db = getDb();
    db[item]
        .delete(id)
        .then((e) => console.log("Deleted item with id: " + e))
        .catch((e) => console.error("Error deleting item with id: " + e));
}

export async function search(item, term) {
    const db = getDb();
    return await db[item]
        .filter((it) => new RegExp(term, "i").test(it["title"]))
        .toArray();
}
