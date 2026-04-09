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
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSession",
    ()=>createSession,
    "destroySession",
    ()=>destroySession,
    "getSession",
    ()=>getSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const COOKIE_NAME = 'session';
const EXPIRY_DAYS = 7;
async function createSession(userId, username) {
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign({
        userId,
        username
    }, JWT_SECRET, {
        expiresIn: `${EXPIRY_DAYS}d`
    });
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === 'production',
        sameSite: 'lax',
        maxAge: EXPIRY_DAYS * 24 * 60 * 60,
        path: '/'
    });
    return token;
}
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    try {
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
        return {
            userId: decoded.userId,
            username: decoded.username
        };
    } catch  {
        return null;
    }
}
async function destroySession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete(COOKIE_NAME);
}
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
"[project]/app/api/todos/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Not authenticated'
        }, {
            status: 401
        });
    }
    const todos = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["todoDB"].findByUserId(session.userId);
    const result = todos.map((todo)=>({
            ...todo,
            subtasks: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["subtaskDB"].findByTodoId(todo.id),
            tags: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tagDB"].findByTodoId(todo.id)
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
}
async function POST(request) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Not authenticated'
        }, {
            status: 401
        });
    }
    try {
        const body = await request.json();
        const { title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes } = body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Title is required'
            }, {
                status: 400
            });
        }
        const validPriorities = [
            'high',
            'medium',
            'low'
        ];
        if (priority && !validPriorities.includes(priority)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid priority'
            }, {
                status: 400
            });
        }
        const validPatterns = [
            'daily',
            'weekly',
            'monthly',
            'yearly'
        ];
        if (recurrence_pattern && !validPatterns.includes(recurrence_pattern)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid recurrence pattern'
            }, {
                status: 400
            });
        }
        if (is_recurring && !due_date) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Recurring todos require a due date'
            }, {
                status: 400
            });
        }
        const todo = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["todoDB"].create({
            user_id: session.userId,
            title: title.trim(),
            due_date: due_date ?? null,
            priority: priority ?? 'medium',
            is_recurring: is_recurring ? 1 : 0,
            recurrence_pattern: recurrence_pattern ?? null,
            reminder_minutes: reminder_minutes ?? null
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...todo,
            subtasks: [],
            tags: []
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Create todo error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create todo'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ub4tpm._.js.map