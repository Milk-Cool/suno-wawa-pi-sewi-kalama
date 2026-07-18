// @ts-ignore
import Database from "better-sqlite3";
import type { Database as DatabaseT } from "better-sqlite3";
import { createHash } from "crypto";
const db: DatabaseT = new Database("translation.db");
db.pragma("journal_mode = WAL");

export type Translation = {
    file: string;
    attribute: number;
    tokipona: string;
    time: number;
    author: string;
};
export type Sprite = {
    file: string;
    png: Buffer;
    time: number;
    author: string;
};
export type HistorySprite = Omit<Sprite, "png">;
export type Export = {
    file: string;
    time: number;
    author: string;
};
export type User = {
    name: string;
    hash: string;
};

export function init() {
    db.prepare(`CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY,
        file TEXT NOT NULL,
        attribute INTEGER NOT NULL,
        tokipona TEXT NOT NULL,
        time INTEGER NOT NULL,
        author TEXT NOT NULL
    )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS sprites (
        id INTEGER PRIMARY KEY,
        file TEXT NOT NULL,
        png BLOB NOT NULL,
        time INTEGER NOT NULL,
        author TEXT NOT NULL
    )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS exports (
        id INTEGER PRIMARY KEY,
        file TEXT NOT NULL,
        time INTEGER NOT NULL,
        author TEXT NOT NULL
    )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        hash TEXT NOT NULL
    )`).run();
}
export function quit() {
    db.close();
}

export function getTranslations(file: string, attribute: number) {
    return db.prepare(`SELECT * FROM translations WHERE file = ? AND attribute = ? ORDER BY time DESC`).all(file, attribute) as Translation[];
}
export function getFile(file: string) {
    return db.prepare(`SELECT * FROM translations WHERE file = ? ORDER BY time DESC`).all(file) as Translation[];
}
export function getHistory(page: number, per: number = 100) {
    return db.prepare(`SELECT * FROM translations ORDER BY time DESC LIMIT ? OFFSET ?`).all(per, per * page) as Translation[];
}
export function addTranslation(file: string, attribute: number, tokipona: string, author: string) {
    db.prepare(`INSERT INTO translations (file, attribute, tokipona, time, author) VALUES (?, ?, ?, ?, ?)`).run(file, attribute, tokipona, Date.now(), author);
}

export function getSprite(file: string) {
    return (db.prepare(`SELECT png FROM sprites WHERE file = ? ORDER BY time DESC LIMIT 1`).get(file) as Sprite)?.png;
}
export function getSpriteHistory() {
    return db.prepare(`SELECT id, file, time, author FROM sprites ORDER BY time DESC`).all() as HistorySprite[];
}
export function addSprite(file: string, png: Buffer, author: string) {
    db.prepare(`INSERT INTO sprites (file, png, time, author) VALUES (?, ?, ?, ?)`).run(file, png, Date.now(), author);
}

export function getExports() {
    return db.prepare(`SELECT * FROM exports ORDER BY time DESC`).all() as Export[];
}
export function addExport(file: string, author: string) {
    db.prepare(`INSERT INTO exports (file, time, author) VALUES (?, ?, ?)`).run(file, Date.now(), author);
}

export function userExists(name: string) {
    return !!db.prepare(`SELECT * FROM users WHERE name = ?`).get(name);
}
export function authUser(token: string) {
    const hash = createHash("sha256").update(token).update(process.env.SALT!).digest("hex");
    const user = db.prepare(`SELECT * FROM users WHERE hash = ?`).get(hash) as User;
    return user?.name || "";
}
export function addUser(name: string, token: string) {
    db.prepare(`INSERT INTO users (name, hash) VALUES (?, ?)`).run(name, createHash("sha256").update(token).update(process.env.SALT!).digest("hex"));
}