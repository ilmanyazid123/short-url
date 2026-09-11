import { Database } from 'bun:sqlite';

const db = new Database('/home/z/my-project/db/custom.db', { readonly: true });
const rows = db.prepare('SELECT shortCode, originalUrl, visits FROM ShortUrl ORDER BY createdAt DESC LIMIT 5').all();
console.log('SQLite has', rows.length, 'rows:');
rows.forEach(r => console.log(' -', r.shortCode, r.originalUrl, 'visits:', r.visits));
db.close();
