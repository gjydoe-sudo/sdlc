module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authenticatorDB",
    ()=>authenticatorDB,
    "default",
    ()=>__TURBOPACK__default__export__,
    "holidayDB",
    ()=>holidayDB,
    "subtaskDB",
    ()=>subtaskDB,
    "tagDB",
    ()=>tagDB,
    "templateDB",
    ()=>templateDB,
    "todoDB",
    ()=>todoDB,
    "userDB",
    ()=>userDB
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const DB_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'todos.db');
const db = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS authenticators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    credential_id TEXT NOT NULL,
    credential_public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    transports TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    reminder_minutes INTEGER,
    last_notification_sent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS todo_tags (
    todo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    title_template TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    reminder_minutes INTEGER,
    subtasks_json TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    year INTEGER NOT NULL
  );
`);
const userDB = {
    findByUsername (username) {
        return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    },
    create (username) {
        const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(username);
        return {
            id: result.lastInsertRowid,
            username,
            created_at: new Date().toISOString()
        };
    },
    findById (id) {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
};
const authenticatorDB = {
    create (data) {
        db.prepare('INSERT INTO authenticators (user_id, credential_id, credential_public_key, counter, transports) VALUES (?, ?, ?, ?, ?)').run(data.user_id, data.credential_id, data.credential_public_key, data.counter ?? 0, data.transports ?? null);
    },
    findByUserId (userId) {
        return db.prepare('SELECT * FROM authenticators WHERE user_id = ?').all(userId);
    },
    findByCredentialId (credentialId) {
        return db.prepare('SELECT * FROM authenticators WHERE credential_id = ?').get(credentialId);
    },
    updateCounter (id, counter) {
        db.prepare('UPDATE authenticators SET counter = ? WHERE id = ?').run(counter, id);
    }
};
const todoDB = {
    findByUserId (userId) {
        return db.prepare(`
      SELECT * FROM todos WHERE user_id = ?
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
        due_date ASC,
        created_at DESC
    `).all(userId);
    },
    findById (id) {
        return db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    },
    create (data) {
        const result = db.prepare('INSERT INTO todos (user_id, title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)').run(data.user_id, data.title, data.due_date ?? null, data.priority ?? 'medium', data.is_recurring ?? 0, data.recurrence_pattern ?? null, data.reminder_minutes ?? null);
        return todoDB.findById(result.lastInsertRowid);
    },
    update (id, data) {
        const fields = [];
        const values = [];
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.completed !== undefined) {
            fields.push('completed = ?');
            values.push(data.completed);
        }
        if (data.due_date !== undefined) {
            fields.push('due_date = ?');
            values.push(data.due_date);
        }
        if (data.priority !== undefined) {
            fields.push('priority = ?');
            values.push(data.priority);
        }
        if (data.is_recurring !== undefined) {
            fields.push('is_recurring = ?');
            values.push(data.is_recurring);
        }
        if (data.recurrence_pattern !== undefined) {
            fields.push('recurrence_pattern = ?');
            values.push(data.recurrence_pattern);
        }
        if (data.reminder_minutes !== undefined) {
            fields.push('reminder_minutes = ?');
            values.push(data.reminder_minutes);
        }
        if (data.last_notification_sent !== undefined) {
            fields.push('last_notification_sent = ?');
            values.push(data.last_notification_sent);
        }
        if (fields.length === 0) return todoDB.findById(id);
        values.push(id);
        db.prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return todoDB.findById(id);
    },
    delete (id) {
        db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    },
    findDueForNotification () {
        return db.prepare(`
      SELECT * FROM todos
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND reminder_minutes IS NOT NULL
        AND (last_notification_sent IS NULL OR last_notification_sent < datetime(due_date, '-' || reminder_minutes || ' minutes', '+1 minute'))
        AND datetime('now') >= datetime(due_date, '-' || reminder_minutes || ' minutes')
        AND datetime('now') <= datetime(due_date, '+1 hour')
    `).all();
    }
};
const subtaskDB = {
    findByTodoId (todoId) {
        return db.prepare('SELECT * FROM subtasks WHERE todo_id = ? ORDER BY position, created_at').all(todoId);
    },
    findById (id) {
        return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
    },
    create (data) {
        const maxPos = db.prepare('SELECT MAX(position) as max FROM subtasks WHERE todo_id = ?').get(data.todo_id).max ?? -1;
        const result = db.prepare('INSERT INTO subtasks (todo_id, title, position) VALUES (?, ?, ?)').run(data.todo_id, data.title, data.position ?? maxPos + 1);
        return subtaskDB.findById(result.lastInsertRowid);
    },
    update (id, data) {
        const fields = [];
        const values = [];
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.completed !== undefined) {
            fields.push('completed = ?');
            values.push(data.completed);
        }
        if (fields.length === 0) return subtaskDB.findById(id);
        values.push(id);
        db.prepare(`UPDATE subtasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return subtaskDB.findById(id);
    },
    delete (id) {
        db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
    }
};
const tagDB = {
    findByUserId (userId) {
        return db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name').all(userId);
    },
    findById (id) {
        return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
    },
    findByTodoId (todoId) {
        return db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `).all(todoId);
    },
    create (data) {
        const result = db.prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)').run(data.user_id, data.name.trim(), data.color ?? '#3B82F6');
        return tagDB.findById(result.lastInsertRowid);
    },
    update (id, data) {
        const fields = [];
        const values = [];
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name.trim());
        }
        if (data.color !== undefined) {
            fields.push('color = ?');
            values.push(data.color);
        }
        if (fields.length === 0) return tagDB.findById(id);
        values.push(id);
        db.prepare(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return tagDB.findById(id);
    },
    delete (id) {
        db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    },
    addToTodo (todoId, tagId) {
        db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)').run(todoId, tagId);
    },
    removeFromTodo (todoId, tagId) {
        db.prepare('DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?').run(todoId, tagId);
    },
    setTodoTags (todoId, tagIds) {
        db.prepare('DELETE FROM todo_tags WHERE todo_id = ?').run(todoId);
        for (const tagId of tagIds){
            db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)').run(todoId, tagId);
        }
    }
};
const templateDB = {
    findByUserId (userId) {
        return db.prepare('SELECT * FROM templates WHERE user_id = ? ORDER BY name').all(userId);
    },
    findById (id) {
        return db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    },
    create (data) {
        const result = db.prepare('INSERT INTO templates (user_id, name, description, category, title_template, priority, is_recurring, recurrence_pattern, reminder_minutes, subtasks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(data.user_id, data.name, data.description ?? null, data.category ?? null, data.title_template, data.priority ?? 'medium', data.is_recurring ?? 0, data.recurrence_pattern ?? null, data.reminder_minutes ?? null, data.subtasks_json ?? null);
        return templateDB.findById(result.lastInsertRowid);
    },
    update (id, data) {
        const fields = [];
        const values = [];
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.category !== undefined) {
            fields.push('category = ?');
            values.push(data.category);
        }
        if (data.title_template !== undefined) {
            fields.push('title_template = ?');
            values.push(data.title_template);
        }
        if (data.priority !== undefined) {
            fields.push('priority = ?');
            values.push(data.priority);
        }
        if (data.is_recurring !== undefined) {
            fields.push('is_recurring = ?');
            values.push(data.is_recurring);
        }
        if (data.recurrence_pattern !== undefined) {
            fields.push('recurrence_pattern = ?');
            values.push(data.recurrence_pattern);
        }
        if (data.reminder_minutes !== undefined) {
            fields.push('reminder_minutes = ?');
            values.push(data.reminder_minutes);
        }
        if (data.subtasks_json !== undefined) {
            fields.push('subtasks_json = ?');
            values.push(data.subtasks_json);
        }
        if (fields.length === 0) return templateDB.findById(id);
        values.push(id);
        db.prepare(`UPDATE templates SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return templateDB.findById(id);
    },
    delete (id) {
        db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    }
};
const holidayDB = {
    findByYear (year) {
        return db.prepare('SELECT * FROM holidays WHERE year = ? ORDER BY date').all(year);
    },
    findByYearRange (startYear, endYear) {
        return db.prepare('SELECT * FROM holidays WHERE year >= ? AND year <= ? ORDER BY date').all(startYear, endYear);
    },
    seed (holidays) {
        const insert = db.prepare('INSERT OR IGNORE INTO holidays (name, date, year) VALUES (?, ?, ?)');
        const insertMany = db.transaction((items)=>{
            for (const item of items){
                insert.run(item.name, item.date, item.year);
            }
        });
        insertMany(holidays);
    },
    count () {
        return db.prepare('SELECT COUNT(*) as count FROM holidays').get().count;
    }
};
const __TURBOPACK__default__export__ = db;
}),
"[project]/app/api/holidays/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
const SG_HOLIDAYS = [
    // 2024
    {
        name: "New Year's Day",
        date: '2024-01-01',
        year: 2024
    },
    {
        name: 'Chinese New Year',
        date: '2024-02-10',
        year: 2024
    },
    {
        name: 'Chinese New Year',
        date: '2024-02-11',
        year: 2024
    },
    {
        name: 'Good Friday',
        date: '2024-03-29',
        year: 2024
    },
    {
        name: 'Hari Raya Puasa',
        date: '2024-04-10',
        year: 2024
    },
    {
        name: 'Labour Day',
        date: '2024-05-01',
        year: 2024
    },
    {
        name: 'Vesak Day',
        date: '2024-05-22',
        year: 2024
    },
    {
        name: 'Hari Raya Haji',
        date: '2024-06-17',
        year: 2024
    },
    {
        name: 'National Day',
        date: '2024-08-09',
        year: 2024
    },
    {
        name: 'Deepavali',
        date: '2024-10-31',
        year: 2024
    },
    {
        name: 'Christmas Day',
        date: '2024-12-25',
        year: 2024
    },
    // 2025
    {
        name: "New Year's Day",
        date: '2025-01-01',
        year: 2025
    },
    {
        name: 'Chinese New Year',
        date: '2025-01-29',
        year: 2025
    },
    {
        name: 'Chinese New Year',
        date: '2025-01-30',
        year: 2025
    },
    {
        name: 'Hari Raya Puasa',
        date: '2025-03-31',
        year: 2025
    },
    {
        name: 'Good Friday',
        date: '2025-04-18',
        year: 2025
    },
    {
        name: 'Labour Day',
        date: '2025-05-01',
        year: 2025
    },
    {
        name: 'Vesak Day',
        date: '2025-05-12',
        year: 2025
    },
    {
        name: 'Hari Raya Haji',
        date: '2025-06-07',
        year: 2025
    },
    {
        name: 'National Day',
        date: '2025-08-09',
        year: 2025
    },
    {
        name: 'Deepavali',
        date: '2025-10-20',
        year: 2025
    },
    {
        name: 'Christmas Day',
        date: '2025-12-25',
        year: 2025
    },
    // 2026
    {
        name: "New Year's Day",
        date: '2026-01-01',
        year: 2026
    },
    {
        name: 'Chinese New Year',
        date: '2026-02-17',
        year: 2026
    },
    {
        name: 'Chinese New Year',
        date: '2026-02-18',
        year: 2026
    },
    {
        name: 'Hari Raya Puasa',
        date: '2026-03-20',
        year: 2026
    },
    {
        name: 'Good Friday',
        date: '2026-04-03',
        year: 2026
    },
    {
        name: 'Labour Day',
        date: '2026-05-01',
        year: 2026
    },
    {
        name: 'Vesak Day',
        date: '2026-05-31',
        year: 2026
    },
    {
        name: 'Hari Raya Haji',
        date: '2026-05-27',
        year: 2026
    },
    {
        name: 'National Day',
        date: '2026-08-10',
        year: 2026
    },
    {
        name: 'Deepavali',
        date: '2026-11-08',
        year: 2026
    },
    {
        name: 'Christmas Day',
        date: '2026-12-25',
        year: 2026
    }
];
// Seed once
if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["holidayDB"].count() === 0) {
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["holidayDB"].seed(SG_HOLIDAYS);
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const holidays = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["holidayDB"].findByYear(year);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(holidays);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0tnf3t~._.js.map